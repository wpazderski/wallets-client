import { useMemo } from "react";

import { useAppSelector } from "../../../../../../app/store";
import { selectExternalData } from "../../../../../../app/store/ExternalDataSlice";
import { InvestmentTargetIndustryId, selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import { selectUserMainCurrencyId, selectUserSettings } from "../../../../../../app/store/UserSettingsSlice";
import { WalletId } from "../../../../../../app/store/WalletsSlice";
import { Calculator } from "../../../../../../app/valueCalculation";
import { CurrencyConverter } from "../../../../../../app/valueCalculation/CurrencyConverter";
import { InvestmentEx } from "../Summary";
import { Entry, SummaryTableWithChart } from "../summaryTableWithChart/SummaryTableWithChart";





export interface SummaryByTargetIndustryTabProps {
    includedWallets: WalletId[];
    investmentsEx: InvestmentEx[];
}

export function SummaryByTargetIndustryTab(props: SummaryByTargetIndustryTabProps) {
    const mainCurrencyId = useAppSelector(selectUserMainCurrencyId);
    const investments = useAppSelector(selectInvestmentsList);
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    
    const includedWallets = props.includedWallets;
    
    const industryIds = useMemo(() => {
        const industryIds = new Set();
        for (const investment of investments) {
            for (const targetIndustry of investment.targetIndustries) {
                industryIds.add(targetIndustry.id);
            }
        }
        return [...industryIds] as InvestmentTargetIndustryId[];
    }, [investments]);
    
    const entries: Entry[] = useMemo(() => {
        return industryIds.map(industryId => {
            const value = investments
                .map(investment => {
                    if (!includedWallets.includes(investment.walletId)) {
                        return 0;
                    }
                    const target = investment.targetIndustries.find(targetIndustry => targetIndustry.id === industryId);
                    if (!target) {
                        return 0;
                    }
                    const targetShare = target.percentage / 100;
                    const value = new Calculator(investment, externalData, userSettings).calculate() * targetShare;
                    return CurrencyConverter.convert(value, investment.purchase.currency, userSettings.mainCurrencyId, externalData);
                })
                .reduce((sum, value) => sum + value, 0);
            return {
                id: industryId,
                title: `${industryId}`,
                value,
            };
        }).filter(entry => !!entry) as Entry[];
    }, [investments, externalData, userSettings, includedWallets, industryIds]);
    
    return (
        <div className="SummaryByTargetIndustryTab">
            <SummaryTableWithChart
                includedWallets={props.includedWallets}
                investmentsEx={props.investmentsEx}
                entries={entries}
                mainCurrencyId={mainCurrencyId}
            />
        </div>
    );
}
