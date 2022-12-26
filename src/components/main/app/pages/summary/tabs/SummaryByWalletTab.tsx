import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../../../../../app/store";
import { selectExternalData } from "../../../../../../app/store/ExternalDataSlice";
import { selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import { selectUserMainCurrencyId, selectUserSettings } from "../../../../../../app/store/UserSettingsSlice";
import { selectWalletsList, WalletId } from "../../../../../../app/store/WalletsSlice";
import { Calculator } from "../../../../../../app/valueCalculation";
import { CurrencyConverter } from "../../../../../../app/valueCalculation/CurrencyConverter";
import { InvestmentEx } from "../Summary";
import { Entry, SummaryTableWithChart } from "../summaryTableWithChart/SummaryTableWithChart";





export interface SummaryByWalletTabProps {
    includedWallets: WalletId[];
    investmentsEx: InvestmentEx[];
}

export function SummaryByWalletTab(props: SummaryByWalletTabProps) {
    const { t } = useTranslation();
    const mainCurrencyId = useAppSelector(selectUserMainCurrencyId);
    const wallets = useAppSelector(selectWalletsList);
    const investments = useAppSelector(selectInvestmentsList);
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    
    const entries: Entry[] = useMemo(() => {
        return wallets.map(wallet => {
            const value = investments
                .filter(investment => investment.walletId === wallet.id)
                .map(investment => {
                    const value = new Calculator(investment, externalData, userSettings).calculate();
                    return CurrencyConverter.convert(value, investment.purchase.currency, userSettings.mainCurrencyId, externalData);
                })
                .reduce((sum, value) => sum + value, 0);
            return {
                id: wallet.id,
                title: wallet.isPredefined ? t(wallet.name as any) : wallet.name,
                value,
            };
        });
    }, [wallets, investments, t, externalData, userSettings]);
    
    return (
        <div className="SummaryByWalletTab">
            <SummaryTableWithChart
                includedWallets={props.includedWallets}
                investmentsEx={props.investmentsEx}
                entries={entries}
                mainCurrencyId={mainCurrencyId}
            />
        </div>
    );
}
