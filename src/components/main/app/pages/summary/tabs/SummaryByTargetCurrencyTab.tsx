import * as WalletsTypes from "@wpazderski/wallets-types";
import { useMemo } from "react";

import { useAppSelector } from "../../../../../../app/store";
import { selectExternalData } from "../../../../../../app/store/ExternalDataSlice";
import { selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import { selectUserMainCurrencyId, selectUserSettings } from "../../../../../../app/store/UserSettingsSlice";
import { WalletId } from "../../../../../../app/store/WalletsSlice";
import { Calculator } from "../../../../../../app/valueCalculation";
import { CurrencyConverter } from "../../../../../../app/valueCalculation/CurrencyConverter";
import { InvestmentEx } from "../Summary";
import { Entry, SummaryTableWithChart } from "../summaryTableWithChart/SummaryTableWithChart";





export interface SummaryByTargetCurrencyTabProps {
    includedWallets: WalletId[];
    investmentsEx: InvestmentEx[];
}

export function SummaryByTargetCurrencyTab(props: SummaryByTargetCurrencyTabProps) {
    const mainCurrencyId = useAppSelector(selectUserMainCurrencyId);
    const investments = useAppSelector(selectInvestmentsList);
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    
    const currencyIds = useMemo(() => {
        const currencyIds = new Set();
        currencyIds.add(mainCurrencyId);
        for (const investment of investments) {
            for (const targetCurrency of investment.targetCurrencies) {
                currencyIds.add(targetCurrency.id);
            }
        }
        return [...currencyIds] as WalletsTypes.data.currency.Id[];
    }, [mainCurrencyId, investments]);
    
    const entries: Entry[] = useMemo(() => {
        return currencyIds.map(currencyId => {
            const value = investments
                .map(investment => {
                    if (!props.includedWallets.includes(investment.walletId)) {
                        return 0;
                    }
                    const target = investment.targetCurrencies.find(targetCurrency => targetCurrency.id === currencyId);
                    if (!target) {
                        return 0;
                    }
                    const targetShare = target.percentage / 100;
                    const value = new Calculator(investment, externalData, userSettings).calculate() * targetShare;
                    return CurrencyConverter.convert(value, investment.purchase.currency, userSettings.mainCurrencyId, externalData);
                })
                .reduce((sum, value) => sum + value, 0);
            const currencyName = externalData.currencies.find(currency => currency.id === currencyId)?.name ?? currencyId;
            return {
                id: currencyId,
                title: `${currencyName} (${currencyId})`,
                value,
            };
        }).filter(entry => !!entry) as Entry[];
    }, [investments, externalData, userSettings, props.includedWallets, currencyIds]);
    
    return (
        <div className="SummaryByTargetCurrencyTab">
            <SummaryTableWithChart
                includedWallets={props.includedWallets}
                investmentsEx={props.investmentsEx}
                entries={entries}
                mainCurrencyId={mainCurrencyId}
            />
        </div>
    );
}
