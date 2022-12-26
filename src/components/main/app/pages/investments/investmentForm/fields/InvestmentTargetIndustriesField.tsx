import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

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
    const { t } = useTranslation();
    const availableIndustries = useAppSelector(selectInvestmentTargetIndustryIds);
    const [targetIndustries, setTargetIndustries] = useState(props.value);
    
    const onChange = props.onChange;
    
    const handleAddTargetIndustry = () => {
        const arr = [...targetIndustries];
        arr.push({
            id: "" as InvestmentTargetIndustryId,
            percentage: 100,
        });
        setTargetIndustries(arr);
    };
    
    const handleDeleteTargetIndustry = (targetIndustryIdx: number) => {
        const arr = [...targetIndustries];
        arr.splice(targetIndustryIdx, 1);
        setTargetIndustries(arr);
    };
    
    const handleIndustryIdChange = (targetIndustryIdx: number, industryId: InvestmentTargetIndustryId) => {
        const arr = [...targetIndustries];
        arr[targetIndustryIdx] = { ...arr[targetIndustryIdx], id: industryId };
        setTargetIndustries(arr);
    };
    
    const handleIndustryPercentageChange = (targetIndustryIdx: number, percentage: number) => {
        const arr = [...targetIndustries];
        arr[targetIndustryIdx] = { ...arr[targetIndustryIdx], percentage };
        setTargetIndustries(arr);
    };
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        props.createValidator(validateField, "targetIndustries");
    }, [props, validateField]); 
    
    useEffect(() => {
        onChange(targetIndustries);
    }, [onChange, targetIndustries]);
    
    const getAvailableIndustryIds = useCallback((currentIndustryId: InvestmentTargetIndustryId) => {
        return availableIndustries
            .filter(industry => industry === currentIndustryId || !targetIndustries.find(targetIndustry => targetIndustry.id === industry))
            .map(industry => industry);
    }, [availableIndustries, targetIndustries]);
    
    return (
        <FormField title={t("common.investments.fields.targetIndustries")}>
            {targetIndustries.map((targetIndustry, idx) => (
                <div key={targetIndustry.id} className="InvestmentForm__box">
                    <FormControl>
                        <Autocomplete
                            options={getAvailableIndustryIds(targetIndustry.id)}
                            value={targetIndustry.id}
                            onChange={(_, industry) => handleIndustryIdChange(idx, (industry ?? "") as InvestmentTargetIndustryId)}
                            autoHighlight
                            autoSelect
                            freeSolo
                            getOptionLabel={industryId => `${industryId ?? ""}`}
                            renderOption={(props, industryId) => (
                                <Box component="li" {...props} key={industryId}>
                                    {industryId ?? ""}
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
                            label={t("common.investments.fields.targetIndustries.percentage")}
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 100)}
                            decimalScale={9}
                            customInput={TextField}
                            allowNegative={false}
                            value={targetIndustry.percentage}
                            onValueChange={value => handleIndustryPercentageChange(idx, value.floatValue ?? 0)}
                        />
                    </FormControl>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleDeleteTargetIndustry(idx)}
                        sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                        className="InvestmentForm__box__delete-button"
                    >
                        <FontAwesomeIcon icon={faSolid.faTrash} />
                    </Button>
                </div>
            ))}
            <Button
                variant="contained"
                onClick={() => handleAddTargetIndustry()}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.targetIndustries.addButton.label")}
            </Button>
        </FormField>
    );
}
