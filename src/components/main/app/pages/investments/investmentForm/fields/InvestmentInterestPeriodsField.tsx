import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import { DurationUnit } from "../../../../../../../app/store";
import {
    InvestmentInterestPeriod,
    InvestmentInterestPeriodCancellationPolicy,
} from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";
import { InvestmentCancellationPolicyField } from "./InvestmentCancellationPolicyField";





export interface InvestmentInterestPeriodsFieldProps {
    value: InvestmentInterestPeriod[];
    onChange: (value: InvestmentInterestPeriod[]) => void;
    createValidator: (validate: () => boolean, validatorName: "interestPeriods") => void;
    currency: WalletsTypes.data.currency.Id;
    purchasingUnits: boolean;
    enableCancellationPolicy: boolean;
}

export function InvestmentInterestPeriodsField(props: InvestmentInterestPeriodsFieldProps) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [interestPeriods, setInterestPeriods] = useState(props.value);
    
    const validators = useMemo<{ [key: string]: (() => boolean)}>(() => ({}), []);
    
    const handleAddInterestPeriod = useCallback(() => {
        const arr = [...interestPeriods];
        arr.push({
            id: Date.now().toString(),
            repeats: 1,
            duration: { num: 1, unit: "y" },
            interestRate: { additivePercent: 5, additiveInflation: false, additiveReferenceRate: false },
            cancellationPolicy: {
                fixedPenalty: 0,
                percentOfTotalInterest: 0,
                limitedToTotalInterest: false,
                percentOfInterestPeriodInterest: 0,
                limitedToInterestPeriodInterest: false,
            },
        });
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleDeleteInterestPeriod = useCallback((interestPeriodIdx: number) => {
        const arr = [...interestPeriods];
        arr.splice(interestPeriodIdx, 1);
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleRepeatsChange = useCallback((interestPeriodIdx: number, repeats: number) => {
        const arr = [...interestPeriods];
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], repeats };
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleDurationUnitChange = useCallback((interestPeriodIdx: number, durationUnit: DurationUnit) => {
        const arr = [...interestPeriods];
        const duration = { ...arr[interestPeriodIdx].duration, unit: durationUnit };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], duration };
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleDurationNumChange = useCallback((interestPeriodIdx: number, durationNum: number) => {
        const arr = [...interestPeriods];
        const duration = { ...arr[interestPeriodIdx].duration, num: durationNum };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], duration };
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleInterestRateAdditivePercentChange = useCallback((interestPeriodIdx: number, additivePercent: number) => {
        const arr = [...interestPeriods];
        const interestRate = { ...arr[interestPeriodIdx].interestRate, additivePercent };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], interestRate };
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleInterestRateAdditiveInflationChange = useCallback((interestPeriodIdx: number, additiveInflation: boolean) => {
        const arr = [...interestPeriods];
        const interestRate = { ...arr[interestPeriodIdx].interestRate, additiveInflation };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], interestRate };
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleInterestRateAdditiveReferenceRateChange = useCallback((interestPeriodIdx: number, additiveReferenceRate: boolean) => {
        const arr = [...interestPeriods];
        const interestRate = { ...arr[interestPeriodIdx].interestRate, additiveReferenceRate };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], interestRate };
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const handleCancellationPolicyChange = useCallback((interestPeriodIdx: number, cancellationPolicy: InvestmentInterestPeriodCancellationPolicy) => {
        if (JSON.stringify(interestPeriods[interestPeriodIdx].cancellationPolicy) === JSON.stringify(cancellationPolicy)) {
            return;
        }
        const arr = [...interestPeriods];
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], cancellationPolicy };
        setInterestPeriods(arr);
    }, [interestPeriods]);
    
    const validateField = useCallback(() => {
        let isOk: boolean = true;
        for (const validator of Object.values(validators)) {
            isOk = validator() && isOk;
        }
        return isOk;
    }, [validators]);
    
    const createCancellationPolicyValidator = useCallback((validator: () => boolean, validatorName: string) => {
        validators[validatorName] = validator;
    }, [validators]);
    
    useEffect(() => {
        createValidator(validateField, "interestPeriods");
    }, [createValidator, validateField]); 
    
    useEffect(() => {
        onChange(interestPeriods);
    }, [onChange, interestPeriods]);
    
    return (
        <FormField title={t("common.investments.fields.interestPeriods")}>
            {interestPeriods.map((interestPeriod, idx) => (
                <InvestmentInterestPeriodsFieldBox
                    key={interestPeriod.id}
                    idx={idx}
                    interestPeriod={interestPeriod}
                    currency={props.currency}
                    purchasingUnits={props.purchasingUnits}
                    enableCancellationPolicy={props.enableCancellationPolicy}
                    onRepeatsChange={handleRepeatsChange}
                    onDurationNumChange={handleDurationNumChange}
                    onDurationUnitChange={handleDurationUnitChange}
                    onInterestRateAdditivePercentChange={handleInterestRateAdditivePercentChange}
                    onInterestRateAdditiveInflationChange={handleInterestRateAdditiveInflationChange}
                    onInterestRateAdditiveReferenceRateChange={handleInterestRateAdditiveReferenceRateChange}
                    onCancellationPolicyChange={handleCancellationPolicyChange}
                    onDeleteInterestPeriod={handleDeleteInterestPeriod}
                    createCancellationPolicyValidator={createCancellationPolicyValidator}
                />
            ))}
            <Button
                variant="contained"
                onClick={handleAddInterestPeriod}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.interestPeriods.addButton.label")}
            </Button>
        </FormField>
    );
}

interface InvestmentInterestPeriodsFieldBoxProps {
    idx: number;
    interestPeriod: InvestmentInterestPeriod;
    currency: WalletsTypes.data.currency.Id;
    purchasingUnits: boolean;
    enableCancellationPolicy: boolean;
    onRepeatsChange: (idx: number, numRepeats: number) => void;
    onDurationNumChange: (idx: number, durationNum: number) => void;
    onDurationUnitChange: (idx: number, durationUnit: DurationUnit) => void;
    onInterestRateAdditivePercentChange: (idx: number, percent: number) => void;
    onInterestRateAdditiveInflationChange: (idx: number, additiveInflation: boolean) => void;
    onInterestRateAdditiveReferenceRateChange: (idx: number, additiveReferenceRate: boolean) => void;
    onCancellationPolicyChange: (idx: number, cancellationPolicy: InvestmentInterestPeriodCancellationPolicy) => void;
    onDeleteInterestPeriod: (idx: number) => void;
    createCancellationPolicyValidator: (validator: () => boolean, validatorName: string) => void;
}

function InvestmentInterestPeriodsFieldBox(props: InvestmentInterestPeriodsFieldBoxProps) {
    const onRepeatsChange = props.onRepeatsChange;
    const onDurationNumChange = props.onDurationNumChange;
    const onDurationUnitChange = props.onDurationUnitChange;
    const onInterestRateAdditivePercentChange = props.onInterestRateAdditivePercentChange;
    const onInterestRateAdditiveInflationChange = props.onInterestRateAdditiveInflationChange;
    const onInterestRateAdditiveReferenceRateChange = props.onInterestRateAdditiveReferenceRateChange;
    const onCancellationPolicyChange = props.onCancellationPolicyChange;
    const onDeleteInterestPeriod = props.onDeleteInterestPeriod;
    const createCancellationPolicyValidator =  props.createCancellationPolicyValidator;
    
    const { t } = useTranslation();
    
    const handleRepeatsChange = useCallback((values: NumberFormatValues) => {
        onRepeatsChange(props.idx, values.floatValue ?? 1);
    }, [onRepeatsChange, props.idx]);
    
    const handleDurationNumChange = useCallback((values: NumberFormatValues) => {
        onDurationNumChange(props.idx, values.floatValue ?? 1);
    }, [onDurationNumChange, props.idx]);
    
    const handleDurationUnitChange = useCallback((event: SelectChangeEvent<DurationUnit>) => {
        onDurationUnitChange(props.idx, event.target.value as DurationUnit);
    }, [onDurationUnitChange, props.idx]);
    
    const handleInterestRateAdditivePercentChange = useCallback((values: NumberFormatValues) => {
        onInterestRateAdditivePercentChange(props.idx, values.floatValue ?? 0.000000001);
    }, [onInterestRateAdditivePercentChange, props.idx]);
    
    const handleInterestRateAdditiveInflationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onInterestRateAdditiveInflationChange(props.idx, event.target.checked);
    }, [onInterestRateAdditiveInflationChange, props.idx]);
    
    const handleInterestRateAdditiveReferenceRateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onInterestRateAdditiveReferenceRateChange(props.idx, event.target.checked);
    }, [onInterestRateAdditiveReferenceRateChange, props.idx]);
    
    const handleCancellationPolicyChange = useCallback((cancellationPolicy: InvestmentInterestPeriodCancellationPolicy) => {
        onCancellationPolicyChange(props.idx, cancellationPolicy);
    }, [onCancellationPolicyChange, props.idx]);
    
    const handleDeleteInterestPeriod = useCallback(() => {
        onDeleteInterestPeriod(props.idx);
    }, [onDeleteInterestPeriod, props.idx]);
    
    const handleCreateCancellationPolicyValidator = useCallback((validator: () => boolean, validatorName: string) => {
        createCancellationPolicyValidator(validator, validatorName);
    }, [createCancellationPolicyValidator]);
    
    const isRepeatsAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 1 && values.floatValue <= 1000000);
    }, []);
    
    const isDurationNumAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 1 && values.floatValue <= 1000000);
    }, []);
    
    const isAdditivePercentAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.000000001 && values.floatValue <= 1000000);
    }, []);
    
    return (
        <div key={props.interestPeriod.id} className="InvestmentForm__box">
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    label={t("common.investments.fields.interestPeriods.repeats")}
                    isAllowed={isRepeatsAllowed}
                    decimalScale={0}
                    customInput={TextField}
                    allowNegative={false}
                    value={props.interestPeriod.repeats}
                    onValueChange={handleRepeatsChange}
                />
            </FormControl>
            <div className="InvestmentForm__box__duration">
                <FormControl>
                    <NumericFormat
                        thousandSeparator=" "
                        label={t("common.investments.fields.interestPeriods.duration.num")}
                        isAllowed={isDurationNumAllowed}
                        decimalScale={0}
                        customInput={TextField}
                        allowNegative={false}
                        value={props.interestPeriod.duration.num}
                        onValueChange={handleDurationNumChange}
                    />
                </FormControl>
                <FormControl>
                    <InputLabel id={`investment-interestPeriodDurationUnit-type-label-${props.idx}`}>{t("common.investments.fields.interestPeriods.duration.unit")}</InputLabel>
                    <Select
                        label={t("common.investments.fields.interestPeriods.duration.unit")}
                        labelId={`investment-interestPeriodDurationUnit-type-label-${props.idx}`}
                        value={props.interestPeriod.duration.unit}
                        onChange={handleDurationUnitChange}
                        sx={{ width: "100%" }}
                    >
                        {(["m", "y"] as DurationUnit[]).map(unit => <MenuItem key={unit} value={unit}>{t(`common.duration.unit.${unit}`)}</MenuItem>)}
                    </Select>
                </FormControl>
            </div>
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("common.investments.fields.interestPeriods.interestRate.additivePercent")}
                    isAllowed={isAdditivePercentAllowed}
                    decimalScale={9}
                    customInput={TextField}
                    allowNegative={false}
                    value={props.interestPeriod.interestRate.additivePercent}
                    onValueChange={handleInterestRateAdditivePercentChange}
                />
            </FormControl>
            <FormControl>
                <FormControlLabel
                    label={t("common.investments.fields.interestPeriods.interestRate.additiveInflation")}
                    labelPlacement="end"
                    control={
                        <Switch
                            checked={props.interestPeriod.interestRate.additiveInflation}
                            onChange={handleInterestRateAdditiveInflationChange}
                        />
                    }
                />
            </FormControl>
            <FormControl>
                <FormControlLabel
                    label={t("common.investments.fields.interestPeriods.interestRate.additiveReferenceRate")}
                    labelPlacement="end"
                    control={
                        <Switch
                            checked={props.interestPeriod.interestRate.additiveReferenceRate}
                            onChange={handleInterestRateAdditiveReferenceRateChange}
                        />
                    }
                />
            </FormControl>
            {props.enableCancellationPolicy && <FormControl>
                <InvestmentCancellationPolicyField
                    value={props.interestPeriod.cancellationPolicy}
                    onChange={handleCancellationPolicyChange}
                    createValidator={handleCreateCancellationPolicyValidator}
                    currency={props.currency}
                    purchasingUnits={props.purchasingUnits}
                />
            </FormControl>}
            <Button
                variant="contained"
                color="warning"
                onClick={handleDeleteInterestPeriod}
                sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                className="InvestmentForm__box__delete-button"
            >
                <FontAwesomeIcon icon={faSolid.faTrash} />
            </Button>
        </div>
    );
}
