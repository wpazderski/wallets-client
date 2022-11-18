import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";

import { useAppSelector } from "../../../../../../../app/store";
import { selectCurrencies } from "../../../../../../../app/store/ExternalDataSlice";
import { InvestmentTarget, InvestmentTargetCurrencyId } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";

export interface InvestmentTargetCurrenciesFieldProps {
    value: InvestmentTarget<InvestmentTargetCurrencyId>[];
    onChange: (value: InvestmentTarget<InvestmentTargetCurrencyId>[]) => void;
    createValidator: (validate: () => boolean, validatorName: "targetCurrencies") => void;
}

export function InvestmentTargetCurrenciesField(props: InvestmentTargetCurrenciesFieldProps) {
    const { t } = useTranslation();
    const [targetCurrencies, setTargetCurrencies] = useState(props.value);
    const availableCurrencies = useAppSelector(selectCurrencies);
    
    const onChange = props.onChange;
    
    const unusedCurrencies = availableCurrencies.filter(currency => !targetCurrencies.find(targetCurrency => targetCurrency.id === currency.id));
    
    const currencyNames = useMemo(() => {
        const names: { [id: string]: string } = {};
        for (const currency of availableCurrencies) {
            names[currency.id] = currency.name;
        }
        return names;
    }, [availableCurrencies]);
    
    const handleAddTargetCurrency = () => {
        const arr = [...targetCurrencies];
        arr.push({
            id: (unusedCurrencies[0]?.id ?? "") as InvestmentTargetCurrencyId,
            percentage: 100,
        });
        setTargetCurrencies(arr);
    };
    
    const handleDeleteTargetCurrency = (targetCurrencyIdx: number) => {
        const arr = [...targetCurrencies];
        arr.splice(targetCurrencyIdx, 1);
        setTargetCurrencies(arr);
    };
    
    const handleCurrencyIdChange = (targetCurrencyIdx: number, currencyId: InvestmentTargetCurrencyId) => {
        const arr = [...targetCurrencies];
        arr[targetCurrencyIdx] = { ...arr[targetCurrencyIdx], id: currencyId };
        setTargetCurrencies(arr);
    };
    
    const handleCurrencyPercentageChange = (targetCurrencyIdx: number, percentage: number) => {
        const arr = [...targetCurrencies];
        arr[targetCurrencyIdx] = { ...arr[targetCurrencyIdx], percentage };
        setTargetCurrencies(arr);
    };
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        props.createValidator(validateField, "targetCurrencies");
    }, [props, validateField]); 
    
    useEffect(() => {
        onChange(targetCurrencies);
    }, [onChange, targetCurrencies]);
    
    const getAvailableCurrencyIds = useCallback((currentCurrencyId: WalletsTypes.data.currency.Id) => {
        return availableCurrencies
            .filter(currency => currency.id === currentCurrencyId || !targetCurrencies.find(targetCurrency => targetCurrency.id === currency.id))
            .map(currency => currency.id);
    }, [availableCurrencies, targetCurrencies]);
    
    return (
        <FormField title={t("common.investments.fields.targetCurrencies")}>
            {targetCurrencies.map((targetCurrency, idx) => (
                <div key={targetCurrency.id} className="InvestmentForm__box">
                    <FormControl>
                        <Autocomplete
                            options={getAvailableCurrencyIds(targetCurrency.id)}
                            value={targetCurrency.id}
                            onChange={(_, currency) => handleCurrencyIdChange(idx, (currency ?? unusedCurrencies[0]!.id) as InvestmentTargetCurrencyId)}
                            autoHighlight
                            getOptionLabel={currencyId => `${currencyNames[currencyId]} (${currencyId})`}
                            renderOption={(props, currencyId) => (
                                <Box component="li" {...props} key={currencyId}>
                                    {currencyNames[currencyId]} ({currencyId})
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
                            label={t("common.investments.fields.targetCurrencies.percentage")}
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0 && values.floatValue <= 100)}
                            decimalScale={9}
                            customInput={TextField}
                            allowNegative={false}
                            value={targetCurrency.percentage}
                            onValueChange={value => handleCurrencyPercentageChange(idx, value.floatValue ?? 0)}
                        />
                    </FormControl>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleDeleteTargetCurrency(idx)}
                        sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                        className="InvestmentForm__box__delete-button"
                    >
                        <FontAwesomeIcon icon={faSolid.faTrash} />
                    </Button>
                </div>
            ))}
            <Button
                variant="contained"
                onClick={() => handleAddTargetCurrency()}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.targetCurrencies.addButton.label")}
            </Button>
        </FormField>
    );
}
