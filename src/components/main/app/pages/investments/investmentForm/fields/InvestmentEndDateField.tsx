import TextField, { TextFieldProps } from "@mui/material/TextField";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import * as moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentEndDateFieldProps {
    value: KvapiTypes.Timestamp | null;
    onChange: (value: KvapiTypes.Timestamp | null) => void;
    createValidator: (validate: () => boolean, validatorName: "endDate") => void;
    required: boolean;
}

export function InvestmentEndDateField(props: InvestmentEndDateFieldProps) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [value, setValue] = useState(props.value);
    const [fieldError, setFieldError] = useState("");
    const [touchedField, setTouchedField] = useState(false);
    
    const handleFieldChange = useCallback((momentValue: moment.Moment | null) => {
        let value = (momentValue?.unix().valueOf() ?? null) as KvapiTypes.Timestamp | null;
        if (typeof(value) === "number") {
            value = value * 1000 as KvapiTypes.Timestamp;
        }
        setValue(value);
        setTouchedField(true);
    }, []);
    
    const validateField = useCallback(() => {
        if (props.required && value === null) {
            setFieldError(t("page.investmentForm.errors.endDateRequired"));
            return false;
        }
        else {
            setFieldError("");
            return true;
        }
    }, [props.required, value, setFieldError, t]);
    
    const handleFieldBlur = useCallback(() => {
        setTouchedField(true);
    }, []);
    
    useEffect(() => {
        if (touchedField) {
            validateField();
        }
    }, [value, touchedField, validateField]);
    
    useEffect(() => {
        createValidator(validateField, "endDate");
    }, [createValidator, validateField]);
    
    useEffect(() => {
        onChange(value);
    }, [onChange, value]);
    
    const renderInput = useCallback((params: TextFieldProps) => {
        return <TextField {...params} error={!!fieldError} helperText={fieldError || " "} onBlur={handleFieldBlur} />;
    }, [fieldError, handleFieldBlur]);
    
    return (
        <FormField title={t("common.investments.fields.endDate")}>
            <DesktopDatePicker
                inputFormat="DD.MM.YYYY"
                value={value ? moment.unix(value / 1000) : null}
                onChange={handleFieldChange}
                renderInput={renderInput}
            />
        </FormField>
    );
}
