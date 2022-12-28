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
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [value, setValue] = useState(props.value);
    
    const handleFieldChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.checked);
    }, []);
    
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
                    onChange={handleFieldChange}
                />
            </FormControl>
        </FormField>
    );
}
