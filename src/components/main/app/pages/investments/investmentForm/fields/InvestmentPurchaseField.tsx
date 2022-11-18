import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import * as WalletsTypes from "@wpazderski/wallets-types";

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
    const { t } = useTranslation();
    const [purchaseType, setPurchaseType] = useState(props.value.type);
    const [currency, setCurrency] = useState(props.value.currency);
    const [amountOfMoney, setAmountOfMoney] = useState(props.value.type === "anyAmountOfMoney" ? props.value.amountOfMoney : 1000);
    const [numUnits, setNumUnits] = useState((props.value.type === "decimalUnits" || props.value.type === "integerUnits") ? props.value.numUnits : 10);
    const [unitPrice, setUnitPrice] = useState((props.value.type === "decimalUnits" || props.value.type === "integerUnits") ? props.value.unitPrice : 100);
    const [weightUnit, setWeightUnit] = useState(props.value.type === "weight" ? props.value.unit : "g");
    const [weightUnitPrice, setWeightUnitPrice] = useState(props.value.type === "weight" ? props.value.price : 1000);
    const [weight, setWeight] = useState(props.value.type === "weight" ? props.value.weight : 1);
    
    const onChange = props.onChange;
    
    const handleTypeChange = (type: InvestmentPurchase["type"]) => {
        setPurchaseType(type);
        if (type === "integerUnits" && numUnits < 1) {
            setNumUnits(1);
        }
    };
    
    const handleCurrencyChange = (currencyId: WalletsTypes.data.currency.Id) => {
        setCurrency(currencyId);
    };
    
    const handleAmountOfMoneyChange = (amountOfMoney: number) => {
        setAmountOfMoney(amountOfMoney);
    };
    
    const handleNumUnitsChange = (numUnits: number) => {
        setNumUnits(numUnits);
    };
    
    const handleUnitPriceChange = (unitPrice: number) => {
        setUnitPrice(unitPrice);
    };
    
    const handleWeightUnitChange = (weightUnit: InvestmentWeightUnit) => {
        setWeightUnit(weightUnit);
    };
    
    const handleWeightUnitPriceChange = (weightUnitPrice: number) => {
        setWeightUnitPrice(weightUnitPrice);
    };
    
    const handleWeightChange = (weight: number) => {
        setWeight(weight);
    };
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        props.createValidator(validateField, "purchase");
    }, [props, validateField]);
    
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
                    onChange={event => handleTypeChange(event.target.value as InvestmentPurchase["type"])}
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
                    onChange={event => handleCurrencyChange(event.target.value as WalletsTypes.data.currency.Id)}
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
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.01 && values.floatValue <= 9999999999)}
                            decimalScale={2}
                            customInput={TextField}
                            allowNegative={false}
                            value={amountOfMoney}
                            onValueChange={value => handleAmountOfMoneyChange(value.floatValue ?? 0.01)}
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
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= (purchaseType === "decimalUnits" ? 0.000000001 : 1) && values.floatValue <= 9999999999)}
                            decimalScale={purchaseType === "decimalUnits" ? 9 : 0}
                            customInput={TextField}
                            allowNegative={false}
                            value={numUnits}
                            onValueChange={value => handleNumUnitsChange(value.floatValue ?? (purchaseType === "decimalUnits" ? 0.000000001 : 1))}
                        />
                    </FormControl>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            suffix={" " + currency}
                            label={t("common.investments.fields.purchase.unitPrice")}
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.01 && values.floatValue <= 9999999999)}
                            decimalScale={2}
                            customInput={TextField}
                            allowNegative={false}
                            value={unitPrice}
                            onValueChange={value => handleUnitPriceChange(value.floatValue ?? 0.01)}
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
                            onChange={event => handleWeightUnitChange(event.target.value as InvestmentWeightUnit)}
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
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.01 && values.floatValue <= 9999999999)}
                            decimalScale={2}
                            customInput={TextField}
                            allowNegative={false}
                            value={weightUnitPrice}
                            onValueChange={value => handleWeightUnitPriceChange(value.floatValue ?? 0.01)}
                        />
                    </FormControl>
                    <FormControl>
                        <NumericFormat
                            thousandSeparator=" "
                            decimalSeparator="."
                            label={t("common.investments.fields.purchase.weight")}
                            isAllowed={values => values.floatValue !== undefined && (values.floatValue >= 0.000000001 && values.floatValue <= 9999999999)}
                            decimalScale={9}
                            customInput={TextField}
                            allowNegative={false}
                            value={weight}
                            onValueChange={value => handleWeightChange(value.floatValue ?? 0.000000001)}
                        />
                    </FormControl>
                </>
            )}
        </FormField>
    );
}
