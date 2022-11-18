import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";

import { InvestmentCancellationPolicy, InvestmentInterestPeriodCancellationPolicy } from "../../../../../../../app/store/InvestmentsSlice";
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
    const { t } = useTranslation();
    const [fixedPenalty, setFixedPenalty] = useState(props.value.fixedPenalty);
    const [percentOfTotalInterest, setPercentOfTotalInterest] = useState(props.value.percentOfTotalInterest);
    const [percentOfInterestPeriodInterest, setPercentOfInterestPeriodInterest] = useState("percentOfInterestPeriodInterest" in props.value ? props.value.percentOfInterestPeriodInterest : 0);
    const [limitedToTotalInterest, setLimitedToTotalInterest] = useState(props.value.limitedToTotalInterest);
    const [limitedToInterestPeriodInterest, setLimitedToInterestPeriodInterest] = useState("limitedToInterestPeriodInterest" in props.value ? props.value.limitedToInterestPeriodInterest : false);
    
    const onChange = props.onChange;
    const cancellationPolicyType = "percentOfInterestPeriodInterest" in props.value ? "interestPeriod" : "total";
    
    const handleFixedPenaltyChange = (fixedPenalty: number) => {
        setFixedPenalty(fixedPenalty);
    };
    
    const handlePercentOfTotalInterestChange = (percentOfTotalInterest: number) => {
        setPercentOfTotalInterest(percentOfTotalInterest);
    };
    
    const handlePercentOfInterestPeriodInterestChange = (percentOfInterestPeriodInterest: number) => {
        setPercentOfInterestPeriodInterest(percentOfInterestPeriodInterest);
    };
    
    const handleLimitedToTotalInterestChange = (limitedToTotalInterest: boolean) => {
        setLimitedToTotalInterest(limitedToTotalInterest);
    };
    
    const handleLimitedToInterestPeriodInterestChange = (limitedToInterestPeriodInterest: boolean) => {
        setLimitedToInterestPeriodInterest(limitedToInterestPeriodInterest);
    };
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        props.createValidator(validateField, "cancellationPolicy");
    }, [props, validateField]);
    
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
                    isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.00 && values.floatValue <= 9999999999)}
                    decimalScale={2}
                    customInput={TextField}
                    allowNegative={false}
                    value={fixedPenalty}
                    onValueChange={value => handleFixedPenaltyChange(value.floatValue ?? 0.00)}
                />
            </FormControl>
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("common.investments.fields.cancellationPolicy.percentOfTotalInterest")}
                    isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.00 && values.floatValue <= 1000)}
                    decimalScale={5}
                    customInput={TextField}
                    allowNegative={false}
                    value={percentOfTotalInterest}
                    onValueChange={value => handlePercentOfTotalInterestChange(value.floatValue ?? 0.00)}
                />
            </FormControl>
            {cancellationPolicyType === "interestPeriod" && (
                <FormControl>
                    <NumericFormat
                        thousandSeparator=" "
                        decimalSeparator="."
                        suffix={"%"}
                        label={t("common.investments.fields.cancellationPolicy.percentOfInterestPeriodInterest")}
                        isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.00 && values.floatValue <= 1000)}
                        decimalScale={5}
                        customInput={TextField}
                        allowNegative={false}
                        value={percentOfInterestPeriodInterest}
                        onValueChange={value => handlePercentOfInterestPeriodInterestChange(value.floatValue ?? 0.00)}
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
                            onChange={event => handleLimitedToTotalInterestChange(event.target.checked)}
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
                                onChange={event => handleLimitedToInterestPeriodInterestChange(event.target.checked)}
                            />
                        }
                    />
                </FormControl>
            )}
        </FormField>
    );
}
