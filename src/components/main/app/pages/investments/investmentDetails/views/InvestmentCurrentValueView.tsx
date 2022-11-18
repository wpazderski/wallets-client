import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../../../../../../app/store";
import { selectExternalData } from "../../../../../../../app/store/ExternalDataSlice";
import { Investment } from "../../../../../../../app/store/InvestmentsSlice";
import { selectUserSettings } from "../../../../../../../app/store/UserSettingsSlice";
import { Calculator } from "../../../../../../../app/valueCalculation";
import { FormField } from "../../../../../common/formField/FormField";
import { NumberView } from "../../../../../common/numberView/NumberView";

export interface InvestmentCurrentValueViewProps {
    investment: Investment;
}

export function InvestmentCurrentValueView(props: InvestmentCurrentValueViewProps) {
    const { t } = useTranslation();
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    
    const investment = props.investment;
    const currentValue = useMemo(() => {
        return new Calculator(investment, externalData, userSettings).calculate();
    }, [investment, externalData, userSettings]);
    
    return (
        <FormField title={t("common.investments.fields.currentValue")} className="FormField--full-width">
            <NumberView num={currentValue} currency={props.investment.purchase.currency} />
        </FormField>
    );
}
