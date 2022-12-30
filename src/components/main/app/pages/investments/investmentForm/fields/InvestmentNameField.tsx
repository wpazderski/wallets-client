import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { InvestmentName } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentNameFieldProps {
    value: InvestmentName;
    onChange: (value: InvestmentName) => void;
    createValidator: (validate: () => boolean, validatorName: "name") => void;
}

export function InvestmentNameField(props: InvestmentNameFieldProps) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [value, setValue] = useState(props.value);
    const [fieldError, setFieldError] = useState("");
    const [touchedField, setTouchedField] = useState(false);
    
    const handleFieldChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value as InvestmentName;
        setValue(value);
        setTouchedField(true);
    }, []);
    
    const validateField = useCallback(() => {
        if (value.length === 0) {
            setFieldError(t("page.investmentForm.errors.nameRequired"));
            return false;
        }
        else {
            setFieldError("");
            return true;
        }
    }, [value, setFieldError, t]);
    
    useEffect(() => {
        if (touchedField) {
            validateField();
        }
    }, [value, touchedField, validateField]);
    
    const handleFieldBlur = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value as InvestmentName;
        setValue(value.trim() as InvestmentName);
        setTouchedField(true);
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "name");
    }, [createValidator, validateField]);
    
    useEffect(() => {
        onChange(value);
    }, [onChange, value]);
    
    return (
        <FormField title={t("common.investments.fields.name")}>
            <TextField
                value={value}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={!!fieldError}
                helperText={fieldError || " "}
                data-testid="Investments__add__name"
            />
        </FormField>
    );
}
