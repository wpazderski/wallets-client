import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import { IncomeTaxRate, UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";





export interface UserIncomeTaxRateProps {
    incomeTaxRate: IncomeTaxRate;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncomeTaxRate(props: UserIncomeTaxRateProps) {
    const updateSettings = props.updateSettings;
    
    const { t } = useTranslation();
    const [incomeTaxRate, setIncomeTaxRate] = useState(props.incomeTaxRate);
    
    const isIncomeTaxRateAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 100);
    }, []);
    
    const handleIncomeTaxRateChange = useCallback((values: NumberFormatValues) => {
        const value = (values.floatValue ?? 0) as IncomeTaxRate;
        setIncomeTaxRate(value);
    }, []);
    
    const handleIncomeTaxRateBlur = useCallback(() => {
        if (props.incomeTaxRate !== incomeTaxRate) {
            updateSettings(settings => {
                settings.incomeTaxRate = incomeTaxRate;
            });
        }
    }, [incomeTaxRate, props.incomeTaxRate, updateSettings]);
    
    return (
        <FormField className="UserSettings__IncomeTaxRate" title={t("page.userSettings.form.incomeTaxRate.name")}>
            <FormControl size="small">
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("page.userSettings.form.incomeTaxRate.name")}
                    isAllowed={isIncomeTaxRateAllowed}
                    decimalScale={9}
                    customInput={TextField}
                    allowNegative={false}
                    value={incomeTaxRate}
                    onValueChange={handleIncomeTaxRateChange}
                    onBlur={handleIncomeTaxRateBlur}
                />
            </FormControl>
        </FormField>
    );
}
