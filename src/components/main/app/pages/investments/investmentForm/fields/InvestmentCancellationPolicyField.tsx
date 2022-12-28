import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import {
    InvestmentCancellationPolicy,
    InvestmentInterestPeriodCancellationPolicy,
} from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";





type CancellationPolicy = InvestmentCancellationPolicy | InvestmentInterestPeriodCancellationPolicy;

export interface InvestmentCancellationPolicyProps<T extends CancellationPolicy> {
    value: T;
    onChange: (value: T) => void;
    createValidator: (validate: () => boolean, validatorName: "cancellationPolicy") => void;
    currency: WalletsTypes.data.currency.Id;
    purchasingUnits: boolean;
}

export function InvestmentCancellationPolicyField<T extends CancellationPolicy>(props: InvestmentCancellationPolicyProps<T>) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [fixedPenalty, setFixedPenalty] = useState(props.value.fixedPenalty);
    const [percentOfTotalInterest, setPercentOfTotalInterest] = useState(props.value.percentOfTotalInterest);
    const [percentOfInterestPeriodInterest, setPercentOfInterestPeriodInterest] = useState("percentOfInterestPeriodInterest" in props.value ? props.value.percentOfInterestPeriodInterest : 0);
    const [limitedToTotalInterest, setLimitedToTotalInterest] = useState(props.value.limitedToTotalInterest);
    const [limitedToInterestPeriodInterest, setLimitedToInterestPeriodInterest] = useState("limitedToInterestPeriodInterest" in props.value ? props.value.limitedToInterestPeriodInterest : false);
    
    const cancellationPolicyType = "percentOfInterestPeriodInterest" in props.value ? "interestPeriod" : "total";
    
    const handleFixedPenaltyChange = useCallback((values: NumberFormatValues) => {
        setFixedPenalty(values.floatValue ?? 0.00);
    }, []);
    
    const handlePercentOfTotalInterestChange = useCallback((values: NumberFormatValues) => {
        setPercentOfTotalInterest(values.floatValue ?? 0.);
    }, []);
    
    const handlePercentOfInterestPeriodInterestChange = useCallback((values: NumberFormatValues) => {
        setPercentOfInterestPeriodInterest(values.floatValue ?? 0.00);
    }, []);
    
    const handleLimitedToTotalInterestChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLimitedToTotalInterest(event.target.checked);
    }, []);
    
    const handleLimitedToInterestPeriodInterestChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setLimitedToInterestPeriodInterest(event.target.checked);
    }, []);
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    const isFixedPenaltyAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.00 && values.floatValue <= 9999999999);
    }, []);
    
    const isPercentOfTotalInterestAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.00 && values.floatValue <= 1000);
    }, []);
    
    const isPercentOfInterestPeriodInterestAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.00 && values.floatValue <= 1000);
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "cancellationPolicy");
    }, [createValidator, validateField]);
    
    useEffect(() => {
        if (cancellationPolicyType === "total") {
            onChange({
                fixedPenalty,
                percentOfTotalInterest,
                limitedToTotalInterest,
            } as T);
        }
        else if (cancellationPolicyType === "interestPeriod") {
            onChange({
                fixedPenalty,
                percentOfTotalInterest,
                percentOfInterestPeriodInterest,
                limitedToTotalInterest,
                limitedToInterestPeriodInterest,
            } as T);
        }
    }, [onChange, cancellationPolicyType, fixedPenalty, percentOfTotalInterest, percentOfInterestPeriodInterest, limitedToTotalInterest, limitedToInterestPeriodInterest]);
    
    return (
        <FormField title={t("common.investments.fields.cancellationPolicy")} description={props.purchasingUnits ? t("common.investments.fields.cancellationPolicy.perUnitInfo") : ""}>
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={" " + props.currency}
                    label={t("common.investments.fields.cancellationPolicy.fixedPenalty")}
                    isAllowed={isFixedPenaltyAllowed}
                    decimalScale={2}
                    customInput={TextField}
                    allowNegative={false}
                    value={fixedPenalty}
                    onValueChange={handleFixedPenaltyChange}
                />
            </FormControl>
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("common.investments.fields.cancellationPolicy.percentOfTotalInterest")}
                    isAllowed={isPercentOfTotalInterestAllowed}
                    decimalScale={5}
                    customInput={TextField}
                    allowNegative={false}
                    value={percentOfTotalInterest}
                    onValueChange={handlePercentOfTotalInterestChange}
                />
            </FormControl>
            {cancellationPolicyType === "interestPeriod" && (
                <FormControl>
                    <NumericFormat
                        thousandSeparator=" "
                        decimalSeparator="."
                        suffix={"%"}
                        label={t("common.investments.fields.cancellationPolicy.percentOfInterestPeriodInterest")}
                        isAllowed={isPercentOfInterestPeriodInterestAllowed}
                        decimalScale={5}
                        customInput={TextField}
                        allowNegative={false}
                        value={percentOfInterestPeriodInterest}
                        onValueChange={handlePercentOfInterestPeriodInterestChange}
                    />
                </FormControl>
            )}
            <FormControl>
                <FormControlLabel
                    label={t("common.investments.fields.cancellationPolicy.limitedToTotalInterest")}
                    labelPlacement="end"
                    control={
                        <Switch
                            checked={limitedToTotalInterest}
                            onChange={handleLimitedToTotalInterestChange}
                        />
                    }
                />
            </FormControl>
            {cancellationPolicyType === "interestPeriod" && (
                <FormControl>
                    <FormControlLabel
                        label={t("common.investments.fields.cancellationPolicy.limitedToInterestPeriodInterest")}
                        labelPlacement="end"
                        control={
                            <Switch
                                checked={limitedToInterestPeriodInterest}
                                onChange={handleLimitedToInterestPeriodInterestChange}
                            />
                        }
                    />
                </FormControl>
            )}
        </FormField>
    );
}
