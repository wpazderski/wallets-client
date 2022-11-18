import * as KvapiClient from "@wpazderski/kvapi-client";

import { Api } from "./Api";
import { store, useAppDispatch } from "./store";
import { InvestmentsState, saveInvestmentsAsync, setInvestments } from "./store/InvestmentsSlice";
import { InvestmentTypesState, saveInvestmentTypesAsync, setInvestmentsTypes } from "./store/InvestmentTypesSlice";
import { saveUserSettingsAsync, setUserSettings, UserSettingsState } from "./store/UserSettingsSlice";
import { saveWalletsAsync, setWallets, WalletsState } from "./store/WalletsSlice";

interface ExportedData {
    userSettings: UserSettingsState;
    wallets: WalletsState;
    investmentTypes: InvestmentTypesState;
    investments: InvestmentsState;
}

export class ExportImport {
    
    export(): void {
        const state = store.getState();
        const data: ExportedData = {
            userSettings: state.userSettings,
            wallets: state.wallets,
            investmentTypes: state.investmentTypes,
            investments: state.investments,
        };
        const dataStr = JSON.stringify(data);
        this.downloadTextAsFile(dataStr, "wallets.json");
    }
    
    import(dataStr: string, dispatch: ReturnType<typeof useAppDispatch>, api: Api): Promise<boolean> {
        try {
            const state = store.getState();
            const data: ExportedData = JSON.parse(dataStr);
            if (!data.userSettings || !data.wallets || !data.investmentTypes || !data.investments) {
                throw new Error("Wrong file format");
            }
            
            const newUserSettings: UserSettingsState = { ...state.userSettings, ...data.userSettings };
            const newWallets: WalletsState = { ...state.wallets, ...data.wallets };
            const newInvestmentTypes: InvestmentTypesState = { ...state.investmentTypes, ...data.investmentTypes };
            const newInvestments: InvestmentsState = { ...state.investments, ...data.investments };
            
            const userSettingsDeferred = new KvapiClient.utils.Deferred<void>();
            const walletsDeferred = new KvapiClient.utils.Deferred<void>();
            const investmentTypesDeferred = new KvapiClient.utils.Deferred<void>();
            const investmentsDeferred = new KvapiClient.utils.Deferred<void>();
            
            dispatch(setUserSettings(newUserSettings));
            dispatch(setWallets(newWallets));
            dispatch(setInvestmentsTypes(newInvestmentTypes));
            dispatch(setInvestments(newInvestments));
            
            dispatch(saveUserSettingsAsync({ userSettings: newUserSettings, api })).then(() => userSettingsDeferred.resolve()).catch(err => userSettingsDeferred.reject(err));
            dispatch(saveWalletsAsync({ wallets: newWallets, api })).then(() => walletsDeferred.resolve()).catch(err => walletsDeferred.reject(err));
            dispatch(saveInvestmentTypesAsync({ investmentTypes: newInvestmentTypes, api })).then(() => investmentTypesDeferred.resolve()).catch(err => investmentTypesDeferred.reject(err));
            dispatch(saveInvestmentsAsync({ investments: newInvestments, api })).then(() => investmentsDeferred.resolve()).catch(err => investmentsDeferred.reject(err));
            
            const resultDeferred = new KvapiClient.utils.Deferred<boolean>();
            setTimeout(() => {
                resultDeferred.resolve(false);
            }, 60 * 1000);
            Promise.all([
                userSettingsDeferred.getPromise(),
                walletsDeferred.getPromise(),
                investmentTypesDeferred.getPromise(),
                investmentsDeferred.getPromise(),
            ])
            .then(() => { resultDeferred.resolve(true); });
            
            return resultDeferred.getPromise();
        }
        catch (err) {
            console.error("Import error:", err);
        }
        return Promise.resolve(false);
    }
    
    private downloadTextAsFile(text: string, fileName: string): void {
        const element = document.createElement("a");
        element.style.display = "none";
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
        element.setAttribute("download", fileName);
        
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    
}
