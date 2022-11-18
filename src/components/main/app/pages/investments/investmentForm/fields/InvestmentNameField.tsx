import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import TextField from "@mui/material/TextField";

import { InvestmentName } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";

export interface InvestmentNameFieldProps {
    value: InvestmentName;
    onChange: (value: InvestmentName) => void;
    createValidator: (validate: () => boolean, validatorName: "name") => void;
}

export function InvestmentNameField(props: InvestmentNameFieldProps) {
    const { t } = useTranslation();
    const [value, setValue] = useState(props.value);
    const [fieldError, setFieldError] = useState("");
    const [touchedField, setTouchedField] = useState(false);
    
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const handleFieldChange = (value: InvestmentName) => {
        setValue(value);
        setTouchedField(true);
    };
    
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
    
    const handleFieldBlur = (value: InvestmentName) => {
        setValue(value.trim() as InvestmentName);
        setTouchedField(true);
    };
    
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
                onChange={e => handleFieldChange(e.target.value as InvestmentName)}
                onBlur={e => handleFieldBlur(e.target.value as InvestmentName)}
                error={!!fieldError}
                helperText={fieldError || " "}
            />
        </FormField>
    );
}
