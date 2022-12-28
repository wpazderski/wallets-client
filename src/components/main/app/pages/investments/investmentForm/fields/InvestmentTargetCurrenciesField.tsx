import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

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
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [targetCurrencies, setTargetCurrencies] = useState(props.value);
    const availableCurrencies = useAppSelector(selectCurrencies);
    
    const unusedCurrencies = useMemo(() => {
        return availableCurrencies.filter(currency => !targetCurrencies.find(targetCurrency => targetCurrency.id === currency.id));
    }, [availableCurrencies, targetCurrencies]);
    
    const currencyNames = useMemo(() => {
        const names: { [id: string]: WalletsTypes.data.currency.Name } = {};
        for (const currency of availableCurrencies) {
            names[currency.id] = currency.name;
        }
        return names;
    }, [availableCurrencies]);
    
    const handleAddTargetCurrency = useCallback(() => {
        const arr = [...targetCurrencies];
        arr.push({
            id: (unusedCurrencies[0]?.id ?? "") as InvestmentTargetCurrencyId,
            percentage: 100,
        });
        setTargetCurrencies(arr);
    }, [targetCurrencies, unusedCurrencies]);
    
    const handleDeleteTargetCurrency = useCallback((targetCurrencyIdx: number) => {
        const arr = [...targetCurrencies];
        arr.splice(targetCurrencyIdx, 1);
        setTargetCurrencies(arr);
    }, [targetCurrencies]);
    
    const handleCurrencyIdChange = useCallback((targetCurrencyIdx: number, currencyId: InvestmentTargetCurrencyId) => {
        const arr = [...targetCurrencies];
        arr[targetCurrencyIdx] = { ...arr[targetCurrencyIdx], id: currencyId };
        setTargetCurrencies(arr);
    }, [targetCurrencies]);
    
    const handleCurrencyPercentageChange = useCallback((targetCurrencyIdx: number, percentage: number) => {
        const arr = [...targetCurrencies];
        arr[targetCurrencyIdx] = { ...arr[targetCurrencyIdx], percentage };
        setTargetCurrencies(arr);
    }, [targetCurrencies]);
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "targetCurrencies");
    }, [createValidator, validateField]); 
    
    useEffect(() => {
        onChange(targetCurrencies);
    }, [onChange, targetCurrencies]);
    
    return (
        <FormField title={t("common.investments.fields.targetCurrencies")}>
            {targetCurrencies.map((targetCurrency, idx) => (
                <InvestmentFormBox
                    key={targetCurrency.id}
                    idx={idx}
                    currencyNames={currencyNames}
                    targetCurrencies={targetCurrencies}
                    availableCurrencies={availableCurrencies}
                    unusedCurrencies={unusedCurrencies}
                    currency={targetCurrency}
                    onCurrencyIdChange={handleCurrencyIdChange}
                    onCurrencyPercentageChange={handleCurrencyPercentageChange}
                    onDeleteTargetCurrency={handleDeleteTargetCurrency}
                />
            ))}
            <Button
                variant="contained"
                onClick={handleAddTargetCurrency}
                sx={{ marginBottom: 3 }}
                startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
            >
                {t("common.investments.fields.targetCurrencies.addButton.label")}
            </Button>
        </FormField>
    );
}

interface InvestmentFormBoxProps {
    idx: number;
    currencyNames: { [id: string]: WalletsTypes.data.currency.Name };
    targetCurrencies: Array<InvestmentTarget<InvestmentTargetCurrencyId>>;
    availableCurrencies: WalletsTypes.data.currency.Currency[];
    unusedCurrencies: WalletsTypes.data.currency.Currency[];
    currency: InvestmentTarget<InvestmentTargetCurrencyId>;
    onCurrencyIdChange: (idx: number, currency: InvestmentTargetCurrencyId) => void;
    onCurrencyPercentageChange: (idx: number, value: number) => void;
    onDeleteTargetCurrency: (idx: number) => void;
}

function InvestmentFormBox(props: InvestmentFormBoxProps) {
    const { t } = useTranslation();
    
    const onCurrencyIdChange = props.onCurrencyIdChange;
    const onCurrencyPercentageChange = props.onCurrencyPercentageChange;
    const onDeleteTargetCurrency = props.onDeleteTargetCurrency;
    
    const availableCurrencyIds = useMemo(() => {
        const currentCurrencyId = props.currency.id;
        return props.availableCurrencies
            .filter(currency => currency.id === currentCurrencyId || !props.targetCurrencies.find(targetCurrency => targetCurrency.id === currency.id))
            .map(currency => currency.id);
    }, [props.availableCurrencies, props.currency.id, props.targetCurrencies]);
    
    const handleCurrencyIdChange = useCallback((_event: React.SyntheticEvent, currency: WalletsTypes.data.currency.Id | null) => {
        onCurrencyIdChange(props.idx, (currency ?? props.unusedCurrencies[0]!.id) as InvestmentTargetCurrencyId);
    }, [onCurrencyIdChange, props.idx, props.unusedCurrencies]);
    
    const handleCurrencyPercentageChange = useCallback((values: NumberFormatValues) => {
        onCurrencyPercentageChange(props.idx, values.floatValue ?? 0);
    }, [onCurrencyPercentageChange, props.idx]);
    
    const handleDeleteTargetCurrency = useCallback(() => {
        onDeleteTargetCurrency(props.idx);
    }, [onDeleteTargetCurrency, props.idx]);
    
    const formatOptionLabel = useCallback((currencyId: WalletsTypes.data.currency.Id) => {
        return `${props.currencyNames[currencyId]} (${currencyId})`;
    }, [props.currencyNames]);
    
    const renderCurrencyOption = useCallback((optionProps: React.HTMLAttributes<HTMLLIElement>, currencyId: WalletsTypes.data.currency.Id) => {
        return (
            <Box component="li" {...optionProps} key={currencyId}>
                {props.currencyNames[currencyId]} ({currencyId})
            </Box>
        );
    }, [props.currencyNames]);
    
    const renderCurrencyInput = useCallback((params: AutocompleteRenderInputParams) => {
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
        <div className="InvestmentForm__box">
            <FormControl>
                <Autocomplete
                    options={availableCurrencyIds}
                    value={props.currency.id}
                    onChange={handleCurrencyIdChange}
                    autoHighlight
                    getOptionLabel={formatOptionLabel}
                    renderOption={renderCurrencyOption}
                    renderInput={renderCurrencyInput}
                />
            </FormControl>
            <FormControl>
                <NumericFormat
                    thousandSeparator=" "
                    decimalSeparator="."
                    suffix={"%"}
                    label={t("common.investments.fields.targetCurrencies.percentage")}
                    isAllowed={isPercentageAllowed}
                    decimalScale={9}
                    customInput={TextField}
                    allowNegative={false}
                    value={props.currency.percentage}
                    onValueChange={handleCurrencyPercentageChange}
                />
            </FormControl>
            <Button
                variant="contained"
                color="warning"
                onClick={handleDeleteTargetCurrency}
                sx={{ minWidth: 30, paddingLeft: 1, paddingRight: 1 }}
                className="InvestmentForm__box__delete-button"
            >
                <FontAwesomeIcon icon={faSolid.faTrash} />
            </Button>
        </div>
    );
}
