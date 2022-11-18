import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";

import { IncomeTaxAllowance, UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";

export interface UserIncomeTaxAllowanceProps {
    incomeTaxAllowance: IncomeTaxAllowance;
    currency: WalletsTypes.data.currency.Id;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncomeTaxAllowance(props: UserIncomeTaxAllowanceProps) {
    const { t } = useTranslation();
    const [incomeTaxAllowance, setIncomeTaxAllowance] = useState(props.incomeTaxAllowance);
    
    const handleIncomeTaxAllowanceChange = (value: IncomeTaxAllowance) => {
        setIncomeTaxAllowance(value);
    };
    
    const handleIncomeTaxAllowanceBlur = () => {
        if (props.incomeTaxAllowance !== incomeTaxAllowance) {
            props.updateSettings(settings => {
                settings.incomeTaxAllowance = incomeTaxAllowance;
            });
        }
    };
    
    return (
        <FormField className="UserSettings__IncomeTaxAllowance" title={t("page.userSettings.form.incomeTaxAllowance.name")}>
            <FormControl size="small">
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={" " + props.currency}
                    label={t("page.userSettings.form.incomeTaxAllowance.name")}
                    isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 9999999999)}
                    decimalScale={2}
                    customInput={TextField}
                    allowNegative={false}
                    value={incomeTaxAllowance}
                    onValueChange={value => handleIncomeTaxAllowanceChange((value.floatValue ?? 0) as IncomeTaxAllowance)}
                    onBlur={() => handleIncomeTaxAllowanceBlur()}
                />
            </FormControl>
        </FormField>
    );
}
