import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentCapitalizationFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    createValidator: (validate: () => boolean, validatorName: "capitalization") => void;
}

export function InvestmentCapitalizationField(props: InvestmentCapitalizationFieldProps) {
    const { t } = useTranslation();
    const [value, setValue] = useState(props.value);
    
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const handleFieldChange = (value: boolean) => {
        setValue(value);
    };
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "capitalization");
    }, [createValidator, validateField]);
    
    useEffect(() => {
        onChange(value);
    }, [onChange, value]);
    
    return (
        <FormField title={t("common.investments.fields.capitalization")}>
            <FormControl>
                <Switch
                    checked={value}
                    onChange={event => handleFieldChange(event.target.checked)}
                />
            </FormControl>
        </FormField>
    );
}
