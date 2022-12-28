import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatValues, NumericFormat } from "react-number-format";

import { getWeightUnits, InvestmentPurchase, InvestmentWeightUnit } from "../../../../../../../app/store/InvestmentsSlice";
import { UserSettingsState } from "../../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentPurchaseFieldProps {
    value: InvestmentPurchase;
    onChange: (value: InvestmentPurchase) => void;
    createValidator: (validate: () => boolean, validatorName: "purchase") => void;
    userSettings: UserSettingsState,
}

function getAvailablePurchaseTypes(): InvestmentPurchase["type"][] {
    return ["anyAmountOfMoney", "decimalUnits", "integerUnits", "weight"];
}

export function InvestmentPurchaseField(props: InvestmentPurchaseFieldProps) {
    const createValidator = props.createValidator;
    const onChange = props.onChange;
    
    const { t } = useTranslation();
    const [purchaseType, setPurchaseType] = useState(props.value.type);
    const [currency, setCurrency] = useState(props.value.currency);
    const [amountOfMoney, setAmountOfMoney] = useState(props.value.type === "anyAmountOfMoney" ? props.value.amountOfMoney : 1000);
    const [numUnits, setNumUnits] = useState((props.value.type === "decimalUnits" || props.value.type === "integerUnits") ? props.value.numUnits : 10);
    const [unitPrice, setUnitPrice] = useState((props.value.type === "decimalUnits" || props.value.type === "integerUnits") ? props.value.unitPrice : 100);
    const [weightUnit, setWeightUnit] = useState(props.value.type === "weight" ? props.value.unit : "g");
    const [weightUnitPrice, setWeightUnitPrice] = useState(props.value.type === "weight" ? props.value.price : 1000);
    const [weight, setWeight] = useState(props.value.type === "weight" ? props.value.weight : 1);
    
    const handleTypeChange = useCallback((event: SelectChangeEvent<InvestmentPurchase["type"]>) => {
        const type = event.target.value as InvestmentPurchase["type"];
        setPurchaseType(type);
        if (type === "integerUnits" && numUnits < 1) {
            setNumUnits(1);
        }
    }, [numUnits]);
    
    const handleCurrencyChange = useCallback((event: SelectChangeEvent<WalletsTypes.data.currency.Id>) => {
        setCurrency(event.target.value as WalletsTypes.data.currency.Id);
    }, []);
    
    const handleAmountOfMoneyChange = useCallback((values: NumberFormatValues) => {
        setAmountOfMoney(values.floatValue ?? 0.01);
    }, []);
    
    const isAmountOfMoneyAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.01 && values.floatValue <= 9999999999);
    }, []);
    
    const handleNumUnitsChange = useCallback((values: NumberFormatValues) => {
        setNumUnits(values.floatValue ?? (purchaseType === "decimalUnits" ? 0.000000001 : 1));
    }, [purchaseType]);
    
    const isNumUnitsAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= (purchaseType === "decimalUnits" ? 0.000000001 : 1) && values.floatValue <= 9999999999);
    }, [purchaseType]);
    
    const handleUnitPriceChange = useCallback((values: NumberFormatValues) => {
        setUnitPrice(values.floatValue ?? 0.01);
    }, []);
    
    const isUnitPriceAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.01 && values.floatValue <= 9999999999);
    }, []);
    
    const handleWeightUnitChange = useCallback((event: SelectChangeEvent<InvestmentWeightUnit>) => {
        setWeightUnit(event.target.value as InvestmentWeightUnit);
    }, []);
    
    const handleWeightUnitPriceChange = useCallback((values: NumberFormatValues) => {
        setWeightUnitPrice(values.floatValue ?? 0.01);
    }, []);
    
    const isWeightUnitPriceAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.01 && values.floatValue <= 9999999999);
    }, []);
    
    const handleWeightChange = useCallback((values: NumberFormatValues) => {
        setWeight(values.floatValue ?? 0.000000001);
    }, []);
    
    const isWeightAllowed = useCallback((values: NumberFormatValues) => {
        return values.floatValue !== undefined && (values.floatValue >= 0.000000001 && values.floatValue <= 9999999999);
    }, []);
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        createValidator(validateField, "purchase");
    }, [createValidator, validateField]);
    
    useEffect(() => {
        if (purchaseType === "anyAmountOfMoney") {
            onChange({
                type: "anyAmountOfMoney",
                currency,
                amountOfMoney,
            });
        }
        else if (purchaseType === "decimalUnits" || purchaseType === "integerUnits") {
            onChange({
                type: purchaseType,
                currency,
                numUnits: purchaseType === "decimalUnits" ? numUnits : Math.ceil(numUnits),
                unitPrice,
            });
        }
        else if (purchaseType === "weight") {
            onChange({
                type: "weight",
                currency,
                unit: weightUnit,
                price: weightUnitPrice,
                weight,
            });
        }
    }, [onChange, purchaseType, currency, amountOfMoney, numUnits, unitPrice, weightUnit, weightUnitPrice, weight]);
    
    return (
        <FormField title={t("common.investments.fields.purchase")}>
            <FormControl>
                <InputLabel id="investment-purchase-type-label">{t("common.investments.fields.purchase.type")}</InputLabel>
                <Select
                    label={t("common.investments.fields.purchase.type")}
                    labelId="investment-purchase-type-label"
                    value={purchaseType}
                    onChange={handleTypeChange}
                    sx={{ width: "100%" }}
                    disabled
                >
                    {getAvailablePurchaseTypes().map(type => <MenuItem key={type} value={type}>{t(`common.investments.fields.purchase.type.${type}`)}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel id="investment-purchase-currency-label">{t("common.investments.fields.purchase.currency")}</InputLabel>
                <Select
                    label={t("common.investments.fields.purchase.currency")}
                    labelId="investment-purchase-currency-label"
                    value={currency}
                    onChange={handleCurrencyChange}
                    sx={{ width: "100%" }}
                >
                    {props.userSettings.currencies.map(currency => <MenuItem key={currency.id} value={currency.id}>{currency.name} ({currency.id})</MenuItem>)}
                </Select>
            </FormControl>
            {purchaseType === "anyAmountOfMoney" && (
                <>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            suffix={" " + currency}
                            label={t("common.investments.fields.purchase.price")}
                            isAllowed={isAmountOfMoneyAllowed}
                            decimalScale={2}
                            customInput={TextField}
                            allowNegative={false}
                            value={amountOfMoney}
                            onValueChange={handleAmountOfMoneyChange}
                        />
                    </FormControl>
                </>
            )}
            {(purchaseType === "decimalUnits" || purchaseType === "integerUnits") && (
                <>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            label={t("common.investments.fields.purchase.numUnits")}
                            isAllowed={isNumUnitsAllowed}
                            decimalScale={purchaseType === "decimalUnits" ? 9 : 0}
                            customInput={TextField}
                            allowNegative={false}
                            value={numUnits}
                            onValueChange={handleNumUnitsChange}
                        />
                    </FormControl>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            suffix={" " + currency}
                            label={t("common.investments.fields.purchase.unitPrice")}
                            isAllowed={isUnitPriceAllowed}
                            decimalScale={2}
                            customInput={TextField}
                            allowNegative={false}
                            value={unitPrice}
                            onValueChange={handleUnitPriceChange}
                        />
                    </FormControl>
                </>
            )}
            {purchaseType === "weight" && (
                <>
                    <FormControl>
                        <InputLabel id="investment-purchase-weightUnit-label">{t("common.investments.fields.purchase.weightUnit")}</InputLabel>
                        <Select
                            label={t("common.investments.fields.purchase.weightUnit")}
                            labelId="investment-purchase-weightUnit-label"
                            value={weightUnit}
                            onChange={handleWeightUnitChange}
                            sx={{ width: "100%" }}
                        >
                            {getWeightUnits().map(unit => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            suffix={" " + currency}
                            label={t("common.investments.fields.purchase.weightUnitPrice", { unit: weightUnit })}
                            isAllowed={isWeightUnitPriceAllowed}
                            decimalScale={2}
                            customInput={TextField}
                            allowNegative={false}
                            value={weightUnitPrice}
                            onValueChange={handleWeightUnitPriceChange}
                        />
                    </FormControl>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            label={t("common.investments.fields.purchase.weight")}
                            isAllowed={isWeightAllowed}
                            decimalScale={9}
                            customInput={TextField}
                            allowNegative={false}
                            value={weight}
                            onValueChange={handleWeightChange}
                        />
                    </FormControl>
                </>
            )}
        </FormField>
    );
}
