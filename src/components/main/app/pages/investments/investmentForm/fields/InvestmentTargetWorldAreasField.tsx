import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

import { worldAreasArray } from "../../../../../../../app/store";
import { InvestmentTarget, InvestmentTargetWorldAreaId } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentTargetWorldAreasFieldProps {
    value: InvestmentTarget<InvestmentTargetWorldAreaId>[];
    onChange: (value: InvestmentTarget<InvestmentTargetWorldAreaId>[]) => void;
    createValidator: (validate: () => boolean, validatorName: "targetWorldAreas") => void;
}

export function InvestmentTargetWorldAreaField(props: InvestmentTargetWorldAreasFieldProps) {
    const { t } = useTranslation();
    const [targetWorldAreas, setTargetWorldAreas] = useState(props.value);
    
    const onChange = props.onChange;
    
    const availableWorldAreas = useMemo(() => JSON.parse(JSON.stringify(worldAreasArray)) as typeof worldAreasArray, []);
    const unusedWorldAreas = availableWorldAreas.filter(worldArea => !targetWorldAreas.find(targetWorldArea => targetWorldArea.id === worldArea.key));
    const worldAreaNames = useMemo(() => {
        const names: { [id: string]: string } = {};
        for (const worldArea of availableWorldAreas) {
            names[worldArea.key] = worldArea.name;
        }
        return names;
    }, [availableWorldAreas]);
    
    const handleAddTargetWorldArea = () => {
        const arr = [...targetWorldAreas];
        arr.push({
            id: (unusedWorldAreas[0]?.key ?? "") as InvestmentTargetWorldAreaId,
            percentage: 100,
        });
        setTargetWorldAreas(arr);
    };
    
    const handleDeleteTargetWorldArea = (targetWorldAreaIdx: number) => {
        const arr = [...targetWorldAreas];
        arr.splice(targetWorldAreaIdx, 1);
        setTargetWorldAreas(arr);
    };
    
    const handleWorldAreaIdChange = (targetWorldAreaIdx: number, worldAreaId: InvestmentTargetWorldAreaId) => {
        const arr = [...targetWorldAreas];
        arr[targetWorldAreaIdx] = { ...arr[targetWorldAreaIdx], id: worldAreaId };
        setTargetWorldAreas(arr);
    };
    
    const handleWorldAreaPercentageChange = (targetWorldAreaIdx: number, percentage: number) => {
        const arr = [...targetWorldAreas];
        arr[targetWorldAreaIdx] = { ...arr[targetWorldAreaIdx], percentage };
        setTargetWorldAreas(arr);
    };
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        props.createValidator(validateField, "targetWorldAreas");
    }, [props, validateField]); 
    
    useEffect(() => {
        onChange(targetWorldAreas);
    }, [onChange, targetWorldAreas]);
    
    const getAvailableWorldAreaIds = useCallback((currentWorldAreaId: InvestmentTargetWorldAreaId) => {
        return availableWorldAreas
            .filter(worldArea => worldArea.key === currentWorldAreaId || !targetWorldAreas.find(targetWorldArea => targetWorldArea.id === worldArea.key))
            .map(worldArea => worldArea.key);
    }, [availableWorldAreas, targetWorldAreas]);
    
    return (
        <FormField title={t("common.investments.fields.targetWorldAreas")}>
            {targetWorldAreas.map((targetWorldArea, idx) => (
                <div key={targetWorldArea.id} className="InvestmentForm__box">
                    <FormControl>
                        <Autocomplete
                            options={getAvailableWorldAreaIds(targetWorldArea.id)}
                            value={targetWorldArea.id}
                            onChange={(_, worldArea) => handleWorldAreaIdChange(idx, (worldArea ?? unusedWorldAreas[0]!.key) as InvestmentTargetWorldAreaId)}
                            autoHighlight
                            getOptionLabel={worldAreaId => `${worldAreaNames[worldAreaId]}`}
                            renderOption={(props, worldAreaId) => (
                                <Box component="li" {...props} key={worldAreaId}>
                                    {worldAreaNames[worldAreaId]}
                                </Box>
                            )}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    inputProps={{
                                        ...params.inputProps,
                                        autoComplete: "new-password",
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            suffix={"%"}
                            label={t("common.investments.fields.targetWorldAreas.percentage")}
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 100)}
                            decimalScale={9}
                            customInput={TextField}
                            allowNegative={false}
                            value={targetWorldArea.percentage}
                            onValueChange={value => handleWorldAreaPercentageChange(idx, value.floatValue ?? 0)}
                        />
                    </FormControl>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleDeleteTargetWorldArea(idx)}
                        sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                        className="InvestmentForm__box__delete-button"
                    >
                        <FontAwesomeIcon icon={faSolid.faTrash} />
                    </Button>
                </div>
            ))}
            <Button
                variant="contained"
                onClick={() => handleAddTargetWorldArea()}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.targetWorldAreas.addButton.label")}
            </Button>
        </FormField>
    );
}
