import Switch from "@mui/material/Switch";
import { useTranslation } from "react-i18next";

import { Investment } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentIncomeTaxApplicableViewProps {
    investment: Investment;
}

export function InvestmentIncomeTaxApplicableView(props: InvestmentIncomeTaxApplicableViewProps) {
    const { t } = useTranslation();
    
    return (
        <FormField title={t("common.investments.fields.incomeTaxApplicable")} className="FormField--full-width">
            <Switch checked={props.investment.incomeTaxApplicable} disabled className="switch--readonly" />
        </FormField>
    );
}
