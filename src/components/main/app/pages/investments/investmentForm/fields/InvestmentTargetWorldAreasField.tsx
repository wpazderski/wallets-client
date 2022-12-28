import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import { WorldAreaData, WorldAreas, worldAreasArray } from "../../../../../../../app/store";
import { InvestmentTarget, InvestmentTargetWorldAreaId } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentTargetWorldAreasFieldProps {
    value: InvestmentTarget<InvestmentTargetWorldAreaId>[];
    onChange: (value: InvestmentTarget<InvestmentTargetWorldAreaId>[]) => void;
    createValidator: (validate: () => boolean, validatorName: "targetWorldAreas") => void;
}

export function InvestmentTargetWorldAreaField(props: InvestmentTargetWorldAreasFieldProps) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [targetWorldAreas, setTargetWorldAreas] = useState(props.value);
    
    const availableWorldAreas = useMemo(() => JSON.parse(JSON.stringify(worldAreasArray)) as typeof worldAreasArray, []);
    
    const unusedWorldAreas = availableWorldAreas.filter(worldArea => !targetWorldAreas.find(targetWorldArea => targetWorldArea.id === worldArea.key));
    
    const worldAreaNames = useMemo(() => {
        const names: { [id: string]: string } = {};
        for (const worldArea of availableWorldAreas) {
            names[worldArea.key] = worldArea.name;
        }
        return names;
    }, [availableWorldAreas]);
    
    const handleAddTargetWorldArea = useCallback(() => {
        const arr = [...targetWorldAreas];
        arr.push({
            id: (unusedWorldAreas[0]?.key ?? "") as InvestmentTargetWorldAreaId,
            percentage: 100,
        });
        setTargetWorldAreas(arr);
    }, [targetWorldAreas, unusedWorldAreas]);
    
    const handleDeleteTargetWorldArea = useCallback((targetWorldAreaIdx: number) => {
        const arr = [...targetWorldAreas];
        arr.splice(targetWorldAreaIdx, 1);
        setTargetWorldAreas(arr);
    }, [targetWorldAreas]);
    
    const handleWorldAreaIdChange = useCallback((targetWorldAreaIdx: number, worldAreaId: InvestmentTargetWorldAreaId) => {
        const arr = [...targetWorldAreas];
        arr[targetWorldAreaIdx] = { ...arr[targetWorldAreaIdx], id: worldAreaId };
        setTargetWorldAreas(arr);
    }, [targetWorldAreas]);
    
    const handleWorldAreaPercentageChange = useCallback((targetWorldAreaIdx: number, percentage: number) => {
        const arr = [...targetWorldAreas];
        arr[targetWorldAreaIdx] = { ...arr[targetWorldAreaIdx], percentage };
        setTargetWorldAreas(arr);
    }, [targetWorldAreas]);
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "targetWorldAreas");
    }, [createValidator, validateField]); 
    
    useEffect(() => {
        onChange(targetWorldAreas);
    }, [onChange, targetWorldAreas]);
    
    return (
        <FormField title={t("common.investments.fields.targetWorldAreas")}>
            {targetWorldAreas.map((targetWorldArea, idx) => (
                <InvestmentTargetWorldAreaFieldBox
                    key={targetWorldArea.id}
                    idx={idx}
                    targetWorldArea={targetWorldArea}
                    availableWorldAreas={availableWorldAreas}
                    targetWorldAreas={targetWorldAreas}
                    unusedWorldAreas={unusedWorldAreas}
                    worldAreaNames={worldAreaNames}
                    onDeleteTargetWorldArea={handleDeleteTargetWorldArea}
                    onWorldAreaIdChange={handleWorldAreaIdChange}
                    onWorldAreaPercentageChange={handleWorldAreaPercentageChange}
                />
            ))}
            <Button
                variant="contained"
                onClick={handleAddTargetWorldArea}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.targetWorldAreas.addButton.label")}
            </Button>
        </FormField>
    );
}

interface InvestmentTargetWorldAreaFieldBoxProps {
    idx: number;
    targetWorldArea: InvestmentTarget<InvestmentTargetWorldAreaId>;
    worldAreaNames: { [id: string]: string };
    targetWorldAreas: Array<InvestmentTarget<InvestmentTargetWorldAreaId>>;
    availableWorldAreas: WorldAreas;
    unusedWorldAreas: WorldAreaData[];
    onWorldAreaIdChange: (idx: number, worldAreaId: InvestmentTargetWorldAreaId) => void;
    onWorldAreaPercentageChange: (idx: number, percentage: number) => void;
    onDeleteTargetWorldArea: (idx: number) => void;
}

function InvestmentTargetWorldAreaFieldBox(props: InvestmentTargetWorldAreaFieldBoxProps) {
    const onWorldAreaIdChange = props.onWorldAreaIdChange;
    const onWorldAreaPercentageChange = props.onWorldAreaPercentageChange;
    const onDeleteTargetWorldArea = props.onDeleteTargetWorldArea;
    
    const { t } = useTranslation();
    
    const availableWorldAreaIds = useMemo(() => {
        const currentWorldAreaId = props.targetWorldArea.id;
        return props.availableWorldAreas
            .filter(worldArea => worldArea.key === currentWorldAreaId || !props.targetWorldAreas.find(targetWorldArea => targetWorldArea.id === worldArea.key))
            .map(worldArea => worldArea.key);
    }, [props.availableWorldAreas, props.targetWorldAreas, props.targetWorldArea.id]);
    
    const handleWorldAreaIdChange = useCallback((_event: React.SyntheticEvent, worldArea: string | null) => {
        onWorldAreaIdChange(props.idx, (worldArea ?? props.unusedWorldAreas[0]!.key) as InvestmentTargetWorldAreaId);
    }, [onWorldAreaIdChange, props.idx, props.unusedWorldAreas]);
    
    const handleWorldAreaPercentageChange = useCallback((values: NumberFormatValues) => {
        onWorldAreaPercentageChange(props.idx, values.floatValue ?? 0);
    }, [onWorldAreaPercentageChange, props.idx]);
    
    const handleDeleteTargetWorldArea = useCallback(() => {
        onDeleteTargetWorldArea(props.idx);
    }, [onDeleteTargetWorldArea, props.idx]);
    
    const getWorldAreaIdOptionLabel = useCallback((worldAreaId: string) => {
        return `${props.worldAreaNames[worldAreaId]}`;
    }, [props.worldAreaNames]);
    
    const renderWorldAreaIdOption = useCallback((optionProps: React.HTMLAttributes<HTMLLIElement>, worldAreaId: string) => {
        return (
            <Box component="li" {...optionProps} key={worldAreaId}>
                {props.worldAreaNames[worldAreaId]}
            </Box>
        );
    }, [props.worldAreaNames]);
    
    const renderWorldAreaIdInput = useCallback((params: AutocompleteRenderInputParams) => {
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
        <div key={props.targetWorldArea.id} className="InvestmentForm__box">
            <FormControl>
                <Autocomplete
                    options={availableWorldAreaIds}
                    value={props.targetWorldArea.id}
                    onChange={handleWorldAreaIdChange}
                    autoHighlight
                    getOptionLabel={getWorldAreaIdOptionLabel}
                    renderOption={renderWorldAreaIdOption}
                    renderInput={renderWorldAreaIdInput}
                />
            </FormControl>
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("common.investments.fields.targetWorldAreas.percentage")}
                    isAllowed={isPercentageAllowed}
                    decimalScale={9}
                    customInput={TextField}
                    allowNegative={false}
                    value={props.targetWorldArea.percentage}
                    onValueChange={handleWorldAreaPercentageChange}
                />
            </FormControl>
            <Button
                variant="contained"
                color="warning"
                onClick={handleDeleteTargetWorldArea}
                sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                className="InvestmentForm__box__delete-button"
            >
                <FontAwesomeIcon icon={faSolid.faTrash} />
            </Button>
        </div>
    );
}
