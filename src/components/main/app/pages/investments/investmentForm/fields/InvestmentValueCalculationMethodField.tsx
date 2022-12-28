import { AutocompleteRenderInputParams, SelectChangeEvent } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import { useAppSelector } from "../../../../../../../app/store";
import { selectCryptocurrencies, selectCryptocurrencyExchangeRates } from "../../../../../../../app/store/ExternalDataSlice";
import {
    getInvestmentValueFromPurchase,
    InvestmentPurchase,
    InvestmentValueCalculationMethod,
} from "../../../../../../../app/store/InvestmentsSlice";
import { getInvestmentTypeValueCalculationMethods } from "../../../../../../../app/store/InvestmentTypesSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentValueCalculationMethodFieldProps {
    value: InvestmentValueCalculationMethod;
    onChange: (value: InvestmentValueCalculationMethod) => void;
    createValidator: (validate: () => boolean, validatorName: "valueCalculationMethod") => void;
    purchase: InvestmentPurchase;
}

function getAvailableValueCalculationMethods(): InvestmentValueCalculationMethod["type"][] {
    return getInvestmentTypeValueCalculationMethods();
}

export function InvestmentValueCalculationMethodField(props: InvestmentValueCalculationMethodFieldProps) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const cryptocurrencies = useAppSelector(selectCryptocurrencies);
    const cryptocurrencyExchangeRates = useAppSelector(selectCryptocurrencyExchangeRates);
    const cryptocurrencyIds = useMemo(() => {
        return Object.keys(cryptocurrencyExchangeRates) as WalletsTypes.data.cryptocurrency.Id[];
    }, [cryptocurrencyExchangeRates]);
    const [valueCalculationMethod, setValueCalculationMethodType] = useState(props.value.type);
    const [currentValue, setCurrentValue] = useState(props.value.type === "manual" ? props.value.currentValue : getInvestmentValueFromPurchase(props.purchase));
    const [obtainerTicker, setObtainerTicker] = useState(props.value.type === "obtainer" ? props.value.ticker : "" as WalletsTypes.data.market.Ticker);
    const [cryptocurrencyId, setCryptocurrencyId] = useState((props.value.type === "cryptocurrency" ? props.value.cryptocurrencyId : "" as WalletsTypes.data.cryptocurrency.Id) || cryptocurrencyIds[0]!);
    
    const handleTypeChange = useCallback((event: SelectChangeEvent<InvestmentValueCalculationMethod["type"]>) => {
        setValueCalculationMethodType(event.target.value as InvestmentValueCalculationMethod["type"]);
    }, []);
    
    const handleCurrentValueChange = useCallback((values: NumberFormatValues) => {
        setCurrentValue(values.floatValue ?? 0.0);
    }, []);
    
    const isCurrentValueAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.0 && values.floatValue <= 9999999999);
    }, []);
    
    const handleObtainerTickerChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setObtainerTicker(event.target.value as WalletsTypes.data.market.Ticker);
    }, []);
    
    const handleCryptocurrencyIdChange = useCallback((_event: React.SyntheticEvent, cryptocurrencyId: WalletsTypes.data.cryptocurrency.Id | null) => {
        if (cryptocurrencyId) {
            setCryptocurrencyId(cryptocurrencyId);
        }
    }, []);
    
    const getCryptocurrencyIdOptionLabel = useCallback((option: WalletsTypes.data.cryptocurrency.Id) => {
        return `${cryptocurrencies.find(cc => cc.id === option)?.name ?? option} (${option})`;
    }, [cryptocurrencies]);
    
    const renderCryptocurrencyIdInput = useCallback((params: AutocompleteRenderInputParams) => {
        return (
            <div className="InvestmentTypeForm__icon-select__selected-value">
                <TextField
                    {...params}
                    inputProps={{
                        ...params.inputProps,
                        label: t("common.investments.fields.valueCalculationMethod.cryptocurrencyId"),
                        autoComplete: "new-password",
                    }}
                />
            </div>
        );
    }, [t]);
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "valueCalculationMethod");
    }, [createValidator, validateField]);
    
    useEffect(() => {
        if (valueCalculationMethod === "manual") {
            onChange({
                type: "manual",
                currentValue,
            });
        }
        else if (valueCalculationMethod === "interest") {
            onChange({
                type: "interest",
            });
        }
        else if (valueCalculationMethod === "obtainer") {
            onChange({
                type: "obtainer",
                ticker: obtainerTicker,
            });
        }
        else if (valueCalculationMethod === "cryptocurrency") {
            onChange({
                type: "cryptocurrency",
                cryptocurrencyId,
            });
        }
    }, [onChange, valueCalculationMethod, currentValue, obtainerTicker, cryptocurrencyId]);
    
    return (
        <FormField title={t("common.investments.fields.valueCalculationMethod")}>
            <FormControl>
                <InputLabel id="investment-valueCalculationMethod-type-label">{t("common.investments.fields.valueCalculationMethod.type")}</InputLabel>
                <Select
                    label={t("common.investments.fields.valueCalculationMethod.type")}
                    labelId="investment-valueCalculationMethod-type-label"
                    value={valueCalculationMethod}
                    onChange={handleTypeChange}
                    sx={{ width: "100%" }}
                >
                    {getAvailableValueCalculationMethods().map(method => <MenuItem key={method} value={method}>{t(`common.investments.fields.valueCalculationMethod.type.${method}`)}</MenuItem>)}
                </Select>
            </FormControl>
            {valueCalculationMethod === "manual" && (
                <>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            suffix={" " + props.purchase.currency}
                            label={t("common.investments.fields.valueCalculationMethod.currentValue")}
                            isAllowed={isCurrentValueAllowed}
                            decimalScale={2}
                            customInput={TextField}
                            allowNegative={false}
                            value={currentValue}
                            onValueChange={handleCurrentValueChange}
                        />
                    </FormControl>
                </>
            )}
            {valueCalculationMethod === "obtainer" && (
                <>
                    <FormControl>
                        <TextField
                            label={t("common.investments.fields.valueCalculationMethod.obtainerTicker")}
                            value={obtainerTicker}
                            onChange={handleObtainerTickerChange}
                        />
                        <p>{t("common.investments.fields.valueCalculationMethod.obtainerTicker.extraInfo")}</p>
                    </FormControl>
                </>
            )}
            {valueCalculationMethod === "cryptocurrency" && (
                <>
                    <FormControl>
                        <Autocomplete
                            options={cryptocurrencyIds}
                            value={cryptocurrencyId}
                            onChange={handleCryptocurrencyIdChange}
                            autoHighlight
                            getOptionLabel={getCryptocurrencyIdOptionLabel}
                            renderInput={renderCryptocurrencyIdInput}
                        />
                    </FormControl>
                </>
            )}
        </FormField>
    );
}
