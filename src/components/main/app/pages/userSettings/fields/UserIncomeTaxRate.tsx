import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

import { IncomeTaxRate, UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";

export interface UserIncomeTaxRateProps {
    incomeTaxRate: IncomeTaxRate;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncomeTaxRate(props: UserIncomeTaxRateProps) {
    const { t } = useTranslation();
    const [incomeTaxRate, setIncomeTaxRate] = useState(props.incomeTaxRate);
    
    const handleIncomeTaxRateChange = (value: IncomeTaxRate) => {
        setIncomeTaxRate(value);
    };
    
    const handleIncomeTaxRateBlur = () => {
        if (props.incomeTaxRate !== incomeTaxRate) {
            props.updateSettings(settings => {
                settings.incomeTaxRate = incomeTaxRate;
            });
        }
    };
    
    return (
        <FormField className="UserSettings__IncomeTaxRate" title={t("page.userSettings.form.incomeTaxRate.name")}>
            <FormControl size="small">
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("page.userSettings.form.incomeTaxRate.name")}
                    isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 100)}
                    decimalScale={9}
                    customInput={TextField}
                    allowNegative={false}
                    value={incomeTaxRate}
                    onValueChange={value => handleIncomeTaxRateChange((value.floatValue ?? 0) as IncomeTaxRate)}
                    onBlur={() => handleIncomeTaxRateBlur()}
                />
            </FormControl>
        </FormField>
    );
}
