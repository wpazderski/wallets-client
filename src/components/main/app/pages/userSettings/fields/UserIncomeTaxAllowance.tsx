import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import { IncomeTaxAllowance, UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";





export interface UserIncomeTaxAllowanceProps {
    incomeTaxAllowance: IncomeTaxAllowance;
    currency: WalletsTypes.data.currency.Id;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncomeTaxAllowance(props: UserIncomeTaxAllowanceProps) {
    const updateSettings = props.updateSettings;
    
    const { t } = useTranslation();
    const [incomeTaxAllowance, setIncomeTaxAllowance] = useState(props.incomeTaxAllowance);
    
    const isIncomeTaxAllowanceAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 9999999999);
    }, []);
    
    const handleIncomeTaxAllowanceChange = useCallback((values: NumberFormatValues) => {
        const value = (values.floatValue ?? 0) as IncomeTaxAllowance;
        setIncomeTaxAllowance(value);
    }, []);
    
    const handleIncomeTaxAllowanceBlur = useCallback(() => {
        if (props.incomeTaxAllowance !== incomeTaxAllowance) {
            updateSettings(settings => {
                settings.incomeTaxAllowance = incomeTaxAllowance;
            });
        }
    }, [incomeTaxAllowance, props.incomeTaxAllowance, updateSettings]);
    
    return (
        <FormField className="UserSettings__IncomeTaxAllowance" title={t("page.userSettings.form.incomeTaxAllowance.name")}>
            <FormControl size="small">
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={" " + props.currency}
                    label={t("page.userSettings.form.incomeTaxAllowance.name")}
                    isAllowed={isIncomeTaxAllowanceAllowed}
                    decimalScale={2}
                    customInput={TextField}
                    allowNegative={false}
                    value={incomeTaxAllowance}
                    onValueChange={handleIncomeTaxAllowanceChange}
                    onBlur={handleIncomeTaxAllowanceBlur}
                />
            </FormControl>
        </FormField>
    );
}
