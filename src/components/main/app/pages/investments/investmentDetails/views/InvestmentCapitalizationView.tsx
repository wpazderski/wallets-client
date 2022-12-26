import Switch from "@mui/material/Switch";
import { useTranslation } from "react-i18next";

import { Investment } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentCapitalizationViewProps {
    investment: Investment;
}

export function InvestmentCapitalizationView(props: InvestmentCapitalizationViewProps) {
    const { t } = useTranslation();
    
    return (
        <FormField title={t("common.investments.fields.capitalization")} className="FormField--full-width">
            <Switch checked={props.investment.capitalization} disabled className="switch--readonly" />
        </FormField>
    );
}
