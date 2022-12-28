import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentIncomeTaxApplicableFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    createValidator: (validate: () => boolean, validatorName: "incomeTaxApplicable") => void;
}

export function InvestmentIncomeTaxApplicableField(props: InvestmentIncomeTaxApplicableFieldProps) {
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
        createValidator(validateField, "incomeTaxApplicable");
    }, [createValidator, validateField]);
    
    useEffect(() => {
        onChange(value);
    }, [onChange, value]);
    
    return (
        <FormField title={t("common.investments.fields.incomeTaxApplicable")}>
            <FormControl>
                <Switch
                    checked={value}
                    onChange={handleFieldChange}
                />
            </FormControl>
        </FormField>
    );
}
