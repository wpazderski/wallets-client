import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

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
    const { t } = useTranslation();
    const [interestPeriods, setInterestPeriods] = useState(props.value);
    
    const validators = useMemo<{ [key: string]: (() => boolean)}>(() => ({}), []);
    
    const onChange = props.onChange;
    
    const handleAddInterestPeriod = () => {
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
    };
    
    const handleDeleteInterestPeriod = (interestPeriodIdx: number) => {
        const arr = [...interestPeriods];
        arr.splice(interestPeriodIdx, 1);
        setInterestPeriods(arr);
    };
    
    const handleRepeatsChange = (interestPeriodIdx: number, repeats: number) => {
        const arr = [...interestPeriods];
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], repeats };
        setInterestPeriods(arr);
    };
    
    const handleDurationUnitChange = (interestPeriodIdx: number, durationUnit: DurationUnit) => {
        const arr = [...interestPeriods];
        const duration = { ...arr[interestPeriodIdx].duration, unit: durationUnit };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], duration };
        setInterestPeriods(arr);
    };
    
    const handleDurationNumChange = (interestPeriodIdx: number, durationNum: number) => {
        const arr = [...interestPeriods];
        const duration = { ...arr[interestPeriodIdx].duration, num: durationNum };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], duration };
        setInterestPeriods(arr);
    };
    
    const handleInterestRateAdditivePercentChange = (interestPeriodIdx: number, additivePercent: number) => {
        const arr = [...interestPeriods];
        const interestRate = { ...arr[interestPeriodIdx].interestRate, additivePercent };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], interestRate };
        setInterestPeriods(arr);
    };
    
    const handleInterestRateAdditiveInflationChange = (interestPeriodIdx: number, additiveInflation: boolean) => {
        const arr = [...interestPeriods];
        const interestRate = { ...arr[interestPeriodIdx].interestRate, additiveInflation };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], interestRate };
        setInterestPeriods(arr);
    };
    
    const handleInterestRateAdditiveReferenceRateChange = (interestPeriodIdx: number, additiveReferenceRate: boolean) => {
        const arr = [...interestPeriods];
        const interestRate = { ...arr[interestPeriodIdx].interestRate, additiveReferenceRate };
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], interestRate };
        setInterestPeriods(arr);
    };
    
    const handleCancellationPolicyChange = (interestPeriodIdx: number, cancellationPolicy: InvestmentInterestPeriodCancellationPolicy) => {
        if (JSON.stringify(interestPeriods[interestPeriodIdx].cancellationPolicy) === JSON.stringify(cancellationPolicy)) {
            return;
        }
        const arr = [...interestPeriods];
        arr[interestPeriodIdx] = { ...arr[interestPeriodIdx], cancellationPolicy };
        setInterestPeriods(arr);
    };
    
    const validateField = useCallback(() => {
        let isOk: boolean = true;
        for (const validator of Object.values(validators)) {
            isOk = validator() && isOk;
        }
        return isOk;
    }, [validators]);
    
    useEffect(() => {
        props.createValidator(validateField, "interestPeriods");
    }, [props, validateField]); 
    
    useEffect(() => {
        onChange(interestPeriods);
    }, [onChange, interestPeriods]);
    
    return (
        <FormField title={t("common.investments.fields.interestPeriods")}>
            {interestPeriods.map((interestPeriod, idx) => (
                <div key={interestPeriod.id} className="InvestmentForm__box">
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            label={t("common.investments.fields.interestPeriods.repeats")}
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 1 && values.floatValue <= 1000000)}
                            decimalScale={0}
                            customInput={TextField}
                            allowNegative={false}
                            value={interestPeriod.repeats}
                            onValueChange={value => handleRepeatsChange(idx, value.floatValue ?? 1)}
                        />
                    </FormControl>
                    <div className="InvestmentForm__box__duration">
                        <FormControl>
                            <NumericFormat
                                thousandSeparator=" "
                                label={t("common.investments.fields.interestPeriods.duration.num")}
                                isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 1 && values.floatValue <= 1000000)}
                                decimalScale={0}
                                customInput={TextField}
                                allowNegative={false}
                                value={interestPeriod.duration.num}
                                onValueChange={value => handleDurationNumChange(idx, value.floatValue ?? 1)}
                            />
                        </FormControl>
                        <FormControl>
                            <InputLabel id={`investment-interestPeriodDurationUnit-type-label-${idx}`}>{t("common.investments.fields.interestPeriods.duration.unit")}</InputLabel>
                            <Select
                                label={t("common.investments.fields.interestPeriods.duration.unit")}
                                labelId={`investment-interestPeriodDurationUnit-type-label-${idx}`}
                                value={interestPeriod.duration.unit}
                                onChange={event => handleDurationUnitChange(idx, event.target.value as DurationUnit)}
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
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.000000001 && values.floatValue <= 1000000)}
                            decimalScale={9}
                            customInput={TextField}
                            allowNegative={false}
                            value={interestPeriod.interestRate.additivePercent}
                            onValueChange={value => handleInterestRateAdditivePercentChange(idx, value.floatValue ?? 0.000000001)}
                        />
                    </FormControl>
                    <FormControl>
                        <FormControlLabel
                            label={t("common.investments.fields.interestPeriods.interestRate.additiveInflation")}
                            labelPlacement="end"
                            control={
                                <Switch
                                    checked={interestPeriod.interestRate.additiveInflation}
                                    onChange={event => handleInterestRateAdditiveInflationChange(idx, event.target.checked)}
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
                                    checked={interestPeriod.interestRate.additiveReferenceRate}
                                    onChange={event => handleInterestRateAdditiveReferenceRateChange(idx, event.target.checked)}
                                />
                            }
                        />
                    </FormControl>
                    {props.enableCancellationPolicy && <FormControl>
                        <InvestmentCancellationPolicyField
                            value={interestPeriod.cancellationPolicy}
                            onChange={cancellationPolicy => handleCancellationPolicyChange(idx, cancellationPolicy)}
                            createValidator={(validator, validatorName) => validators[validatorName] = validator}
                            currency={props.currency}
                            purchasingUnits={props.purchasingUnits}
                        />
                    </FormControl>}
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleDeleteInterestPeriod(idx)}
                        sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                        className="InvestmentForm__box__delete-button"
                    >
                        <FontAwesomeIcon icon={faSolid.faTrash} />
                    </Button>
                </div>
            ))}
            <Button
                variant="contained"
                onClick={() => handleAddInterestPeriod()}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.interestPeriods.addButton.label")}
            </Button>
        </FormField>
    );
}
