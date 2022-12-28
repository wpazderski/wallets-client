import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../../../../../app/store";
import { selectExternalData } from "../../../../../../app/store/ExternalDataSlice";
import { selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import { selectInvestmentTypesList } from "../../../../../../app/store/InvestmentTypesSlice";
import { selectUserMainCurrencyId, selectUserSettings } from "../../../../../../app/store/UserSettingsSlice";
import { WalletId } from "../../../../../../app/store/WalletsSlice";
import { Calculator } from "../../../../../../app/valueCalculation";
import { CurrencyConverter } from "../../../../../../app/valueCalculation/CurrencyConverter";
import { InvestmentEx } from "../Summary";
import { Entry, SummaryTableWithChart } from "../summaryTableWithChart/SummaryTableWithChart";





export interface SummaryByInvestmentTypeTabProps {
    includedWallets: WalletId[];
    investmentsEx: InvestmentEx[];
}

export function SummaryByInvestmentTypeTab(props: SummaryByInvestmentTypeTabProps) {
    const { t } = useTranslation();
    const mainCurrencyId = useAppSelector(selectUserMainCurrencyId);
    const investments = useAppSelector(selectInvestmentsList);
    const investmentTypes = useAppSelector(selectInvestmentTypesList);
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    
    const entries: Entry[] = useMemo(() => {
        return investmentTypes.map(investmentType => {
            const value = investments
                .map(investment => {
                    if (!props.includedWallets.includes(investment.walletId) || investment.type !== investmentType.id) {
                        return 0;
                    }
                    const value = new Calculator(investment, externalData, userSettings).calculate();
                    return CurrencyConverter.convert(value, investment.purchase.currency, userSettings.mainCurrencyId, externalData);
                })
                .reduce((sum, value) => sum + value, 0);
            return {
                id: investmentType.id,
                title: investmentType.isPredefined ? t(`common.investmentTypes.${investmentType.name}` as any) : investmentType.name,
                value,
            };
        }).filter(entry => !!entry) as Entry[];
    }, [investments, investmentTypes, t, externalData, userSettings, props.includedWallets]);
    
    return (
        <div className="SummaryByInvestmentTypeTab">
            <SummaryTableWithChart
                includedWallets={props.includedWallets}
                investmentsEx={props.investmentsEx}
                entries={entries}
                mainCurrencyId={mainCurrencyId}
            />
        </div>
    );
}
