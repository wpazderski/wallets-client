import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import { useAppSelector } from "../../../../../../../app/store";
import {
    InvestmentTarget,
    InvestmentTargetIndustryId,
    selectInvestmentTargetIndustryIds,
} from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentTargetIndustriesFieldProps {
    value: InvestmentTarget<InvestmentTargetIndustryId>[];
    onChange: (value: InvestmentTarget<InvestmentTargetIndustryId>[]) => void;
    createValidator: (validate: () => boolean, validatorName: "targetIndustries") => void;
}

export function InvestmentTargetIndustriesField(props: InvestmentTargetIndustriesFieldProps) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const availableIndustries = useAppSelector(selectInvestmentTargetIndustryIds);
    const [targetIndustries, setTargetIndustries] = useState(props.value);
    
    const handleAddTargetIndustry = useCallback(() => {
        const arr = [...targetIndustries];
        arr.push({
            id: "" as InvestmentTargetIndustryId,
            percentage: 100,
        });
        setTargetIndustries(arr);
    }, [targetIndustries]);
    
    const handleDeleteTargetIndustry = useCallback((targetIndustryIdx: number) => {
        const arr = [...targetIndustries];
        arr.splice(targetIndustryIdx, 1);
        setTargetIndustries(arr);
    }, [targetIndustries]);
    
    const handleIndustryIdChange = useCallback((targetIndustryIdx: number, industryId: InvestmentTargetIndustryId) => {
        const arr = [...targetIndustries];
        arr[targetIndustryIdx] = { ...arr[targetIndustryIdx], id: industryId };
        setTargetIndustries(arr);
    }, [targetIndustries]);
    
    const handleIndustryPercentageChange = useCallback((targetIndustryIdx: number, percentage: number) => {
        const arr = [...targetIndustries];
        arr[targetIndustryIdx] = { ...arr[targetIndustryIdx], percentage };
        setTargetIndustries(arr);
    }, [targetIndustries]);
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "targetIndustries");
    }, [createValidator, validateField]); 
    
    useEffect(() => {
        onChange(targetIndustries);
    }, [onChange, targetIndustries]);
    
    return (
        <FormField title={t("common.investments.fields.targetIndustries")}>
            {targetIndustries.map((targetIndustry, idx) => (
                <InvestmentTargetIndustriesFieldBox
                    key={targetIndustry.id}
                    idx={idx}
                    targetIndustry={targetIndustry}
                    availableIndustries={availableIndustries}
                    targetIndustries={targetIndustries}
                    onDeleteTargetIndustry={handleDeleteTargetIndustry}
                    onIndustryIdChange={handleIndustryIdChange}
                    onIndustryPercentageChange={handleIndustryPercentageChange}
                />
            ))}
            <Button
                variant="contained"
                onClick={handleAddTargetIndustry}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.targetIndustries.addButton.label")}
            </Button>
        </FormField>
    );
}

interface InvestmentTargetIndustriesFieldBoxProps {
    idx: number;
    targetIndustry: InvestmentTarget<InvestmentTargetIndustryId>;
    availableIndustries: InvestmentTargetIndustryId[];
    targetIndustries: Array<InvestmentTarget<InvestmentTargetIndustryId>>;
    onIndustryIdChange: (idx: number, industry: InvestmentTargetIndustryId) => void;
    onIndustryPercentageChange: (idx: number, percentage: number) => void;
    onDeleteTargetIndustry: (idx: number) => void;
}

function InvestmentTargetIndustriesFieldBox(props: InvestmentTargetIndustriesFieldBoxProps) {
    const onIndustryIdChange = props.onIndustryIdChange;
    const onIndustryPercentageChange = props.onIndustryPercentageChange;
    const onDeleteTargetIndustry = props.onDeleteTargetIndustry;
    
    const { t } = useTranslation();
    
    const availableIndustryIds = useMemo(() => {
        const currentIndustryId = props.targetIndustry.id;
        return props.availableIndustries
            .filter(industry => industry === currentIndustryId || !props.targetIndustries.find(targetIndustry => targetIndustry.id === industry))
            .map(industry => industry);
    }, [props.availableIndustries, props.targetIndustries, props.targetIndustry.id]);
    
    const handleIndustryIdChange = useCallback((_event: React.SyntheticEvent, industry: string | null) => {
        onIndustryIdChange(props.idx, (industry ?? "") as InvestmentTargetIndustryId);
    }, [onIndustryIdChange, props.idx]);
    
    const handleIndustryPercentageChange = useCallback((values: NumberFormatValues) => {
        onIndustryPercentageChange(props.idx, values.floatValue ?? 0);
    }, [onIndustryPercentageChange, props.idx]);
    
    const handleDeleteTargetIndustry = useCallback(() => {
        onDeleteTargetIndustry(props.idx);
    }, [onDeleteTargetIndustry, props.idx]);
    
    const getIndustryOptionLabel = useCallback((industryId: string) => {
        return `${industryId ?? ""}`;
    }, []);
    
    const renderIndustryOption = useCallback((optionProps: React.HTMLAttributes<HTMLLIElement>, industryId: InvestmentTargetIndustryId) => {
        return (
            <Box component="li" {...optionProps} key={industryId}>
                {industryId ?? ""}
            </Box>
        );
    }, []);
    
    const renderIndustryInput = useCallback((params: AutocompleteRenderInputParams) => {
        return (
            <TextField
                {...params}
                inputProps={{
                    ...params.inputProps,
                    autoComplete: "new-password",
                }}
            />
        );
    }, []);
    
    const isPercentageAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 100);
    }, []);
    
    return (
        <div key={props.targetIndustry.id} className="InvestmentForm__box">
            <FormControl>
                <Autocomplete
                    options={availableIndustryIds}
                    value={props.targetIndustry.id}
                    onChange={handleIndustryIdChange}
                    autoHighlight
                    autoSelect
                    freeSolo
                    getOptionLabel={getIndustryOptionLabel}
                    renderOption={renderIndustryOption}
                    renderInput={renderIndustryInput}
                />
            </FormControl>
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("common.investments.fields.targetIndustries.percentage")}
                    isAllowed={isPercentageAllowed}
                    decimalScale={9}
                    customInput={TextField}
                    allowNegative={false}
                    value={props.targetIndustry.percentage}
                    onValueChange={handleIndustryPercentageChange}
                />
            </FormControl>
            <Button
                variant="contained"
                color="warning"
                onClick={handleDeleteTargetIndustry}
                sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                className="InvestmentForm__box__delete-button"
            >
                <FontAwesomeIcon icon={faSolid.faTrash} />
            </Button>
        </div>
    );
}
