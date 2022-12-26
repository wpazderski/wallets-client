import * as KvapiTypes from "@wpazderski/kvapi-types";

import { Api } from "./Api";
import {
    externalDataSlice,
    investmentsSlice,
    investmentTypesSlice,
    store,
    userSettingsSlice,
    userSlice,
    walletsSlice,
} from "./store";
import { resetExternalData } from "./store/ExternalDataSlice";
import { getAllTickers, resetInvestments } from "./store/InvestmentsSlice";
import { resetInvestmentTypes } from "./store/InvestmentTypesSlice";
import { resetUserSettings } from "./store/UserSettingsSlice";
import { resetUser, setUserIsFullyLoaded } from "./store/UserSlice";
import { resetUsers } from "./store/UsersSlice";
import { resetWallets } from "./store/WalletsSlice";





export class UserSessionManager {
    
    private static readonly SESSION_HEARTBEAT_INTERVAL_MS: number = 5 * 60 * 1000;
    private static sessionHeartbeatInterval: number | null = null;
    private static userPassword: KvapiTypes.data.user.PlainPassword | null = null;
    
    static checkUserPassword(userPassword: KvapiTypes.data.user.PlainPassword): boolean {
        return userPassword === this.userPassword;
    }
    
    static async changeUserPassword(api: Api, userPassword: KvapiTypes.data.user.PlainPassword): Promise<void> {
        const storeState = store.getState();
        const userId = storeState.user.id;
        if (userId === null) {
            throw new Error("Not signed in");
        }
        const result = await api.users.update(userId, { password: userPassword });
        if (!result) {
            throw new Error("Changing password failed");
        }
        this.userPassword = userPassword;
    }
    
    static async signIn(
        api: Api,
        userLogin: KvapiTypes.data.user.Login,
        userPassword: KvapiTypes.data.user.PlainPassword,
    ): Promise<void> {
        const dispatch = store.dispatch;
        try {
            dispatch(setUserIsFullyLoaded(false));
            
            // Sign in
            const signInResult = await dispatch(userSlice.signInAsync({
                api,
                userLogin,
                userPassword,
            }));
            if (signInResult.meta.requestStatus === "rejected") {
                throw "error" in signInResult ? signInResult.error : new Error();
            }
            
            // Load user settings
            const loadUserSettingsResult = await dispatch(userSettingsSlice.loadUserSettingsAsync(api));
            if (loadUserSettingsResult.meta.requestStatus === "rejected") {
                if (!("error" in loadUserSettingsResult)) {
                    throw new Error();
                }
                if (!loadUserSettingsResult.error.message?.toLowerCase().includes("404 not found")) {
                    throw new Error();
                }
            }
            
            // Load investment types
            const loadInvestmentTypesResult = await dispatch(investmentTypesSlice.loadInvestmentTypesAsync(api));
            if (loadInvestmentTypesResult.meta.requestStatus === "rejected") {
                if (!("error" in loadInvestmentTypesResult)) {
                    throw new Error();
                }
                if (!loadInvestmentTypesResult.error.message?.toLowerCase().includes("404 not found")) {
                    throw new Error();
                }
            }
            
            // Load investments
            const loadInvestmentsResult = await dispatch(investmentsSlice.loadInvestmentsAsync(api));
            if (loadInvestmentsResult.meta.requestStatus === "rejected") {
                if (!("error" in loadInvestmentsResult)) {
                    throw new Error();
                }
                if (!loadInvestmentsResult.error.message?.toLowerCase().includes("404 not found")) {
                    throw new Error();
                }
            }
            
            // Load wallets
            const loadWalletsResult = await dispatch(walletsSlice.loadWalletsAsync(api));
            if (loadWalletsResult.meta.requestStatus === "rejected") {
                if (!("error" in loadWalletsResult)) {
                    throw new Error();
                }
                if (!loadWalletsResult.error.message?.toLowerCase().includes("404 not found")) {
                    throw new Error();
                }
            }
            
            // Load external data
            let storeState = store.getState();
            const externalDataCacheLifetime = storeState.userSettings.externalDataCacheLifetime;
            const loadExternalDataResult = await dispatch(externalDataSlice.loadExternalDataAsync({
                tickers: getAllTickers(storeState.investments.investmentsList),
                cacheMaxLifetime: externalDataCacheLifetime,
                api,
            }));
            if (loadExternalDataResult.meta.requestStatus === "rejected") {
                throw "error" in loadExternalDataResult ? loadExternalDataResult.error : new Error();
            }
            
            this.userPassword = userPassword;
            this.startSessionHeartbeat(api);
            dispatch(setUserIsFullyLoaded(true));
        }
        catch (err) {
            console.error(err);
            await dispatch(userSlice.signOutAsync(api));
            this.resetUserDependantStores();
            throw err;
        }
    }
    
    static async signOut(api: Api): Promise<void> {
        const dispatch = store.dispatch;
        try {
            await dispatch(userSlice.signOutAsync(api));
            this.resetUserDependantStores();
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    
    static resetUserDependantStores(): void {
        this.stopSessionHeartbeat();
        const dispatch = store.dispatch;
        dispatch(resetExternalData());
        dispatch(resetInvestments());
        dispatch(resetInvestmentTypes());
        dispatch(resetUserSettings());
        dispatch(resetUser());
        dispatch(resetUsers());
        dispatch(resetWallets());
        this.userPassword = null;
    }
    
    private static startSessionHeartbeat(api: Api): void {
        this.stopSessionHeartbeat();
        this.sessionHeartbeatInterval = window.setInterval(() => { this.onSessionHeartbeatInterval(api); }, this.SESSION_HEARTBEAT_INTERVAL_MS);
    }
    
    private static stopSessionHeartbeat(): void {
        if (this.sessionHeartbeatInterval !== null) {
            clearInterval(this.sessionHeartbeatInterval);
        }
    }
    
    private static onSessionHeartbeatInterval(api: Api): void {
        api.sessions.update();
    }
    
}
