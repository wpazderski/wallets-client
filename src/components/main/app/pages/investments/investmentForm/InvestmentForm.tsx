import "./InvestmentForm.scss";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import * as KvapiTypes from "@wpazderski/kvapi-types";

import { resolveServerError, useApiContext, Utils } from "../../../../../../app";
import { Duration, store, useAppDispatch, useAppSelector } from "../../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../../app/store/AppSlice";
import { loadExternalDataAsync } from "../../../../../../app/store/ExternalDataSlice";
import { addInvestmentAsync, getAllTickers, getEmptyInvestment, Investment, InvestmentCancellationPolicy, InvestmentId, InvestmentInterestPeriod, InvestmentName, InvestmentPurchase, InvestmentTarget, InvestmentTargetCurrencyId, InvestmentTargetIndustryId, InvestmentTargetWorldAreaId, InvestmentValueCalculationMethod, selectInvestmentsList, updateInvestmentAsync } from "../../../../../../app/store/InvestmentsSlice";
import { getEmptyCustomInvestmentType, InvestmentTypeSlug, selectInvestmentTypesList } from "../../../../../../app/store/InvestmentTypesSlice";
import { selectUserSettings } from "../../../../../../app/store/UserSettingsSlice";
import { WalletId } from "../../../../../../app/store/WalletsSlice";
import { FormField } from "../../../../common/formField/FormField";
import { FormSeparator } from "../../../../common/formSeparator/FormSeparator";
import { LoadingIndicator } from "../../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../../page/Page";
import { PageContent } from "../../../pageContent/PageContent";
import { PageHeader } from "../../../pageHeader/PageHeader";
import { getInvestmentsListUrl } from "../Investments";
import { InvestmentCancellationPolicyField } from "./fields/InvestmentCancellationPolicyField";
import { InvestmentCapitalizationField } from "./fields/InvestmentCapitalizationField";
import { InvestmentEndDateField } from "./fields/InvestmentEndDateField";
import { InvestmentIncomeTaxApplicableField } from "./fields/InvestmentIncomeTaxApplicableField";
import { InvestmentInterestPeriodsField } from "./fields/InvestmentInterestPeriodsField";
import { InvestmentNameField } from "./fields/InvestmentNameField";
import { InvestmentPurchaseField } from "./fields/InvestmentPurchaseField";
import { InvestmentStartFieldDate } from "./fields/InvestmentStartDateField";
import { InvestmentTargetCurrenciesField } from "./fields/InvestmentTargetCurrenciesField";
import { InvestmentTargetIndustriesField } from "./fields/InvestmentTargetIndustriesField";
import { InvestmentTargetWorldAreaField } from "./fields/InvestmentTargetWorldAreasField";
import { InvestmentValueCalculationMethodField } from "./fields/InvestmentValueCalculationMethodField";
import { InvestmentWalletIdField } from "./fields/InvestmentWalletIdField";

export function InvestmentForm() {
    const { investmentTypeSlug, investmentId } = useParams() as { investmentTypeSlug: InvestmentTypeSlug, investmentId: InvestmentId };
    const isNewInvestment = investmentId === undefined;
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const userSettings = useAppSelector(selectUserSettings);
    const existingInvestmentType = useAppSelector(selectInvestmentTypesList).find(investmentType => investmentType.slug === investmentTypeSlug);
    const investmentType = existingInvestmentType ?? getEmptyCustomInvestmentType();
    const existingInvestment = useAppSelector(selectInvestmentsList).find(investment => investment.id === investmentId) ?? getEmptyInvestment(investmentType);
    const investment = existingInvestment ?? getEmptyCustomInvestmentType();
    const [investmentName, setInvestmentName] = useState(investment.name);
    const [walletId, setWalletId] = useState(investment.walletId);
    const [startDate, setStartDate] = useState(investment.startDate);
    const [endDate, setEndDate] = useState(investment.endDate);
    const [purchase, setPurchase] = useState(investment.purchase);
    const [valueCalculationMethod, setValueCalculationMethod] = useState(investment.valueCalculationMethod);
    const [interestPeriods, setInterestPeriods] = useState(investment.interestPeriods);
    const [capitalization, setCapitalization] = useState(investment.capitalization);
    const [incomeTaxApplicable, setIncomeTaxApplicable] = useState(investment.incomeTaxApplicable);
    const [cancellationPolicy, setCancellationPolicy] = useState(investment.cancellationPolicy);
    const [targetCurrencies, setTargetCurrencies] = useState(investment.targetCurrencies);
    const [targetIndustries, setTargetIndustries] = useState(investment.targetIndustries);
    const [targetWorldAreas, setTargetWorldAreas] = useState(investment.targetWorldAreas);
    const [isProcessing, setIsProcessing] = useState(false);
    const validators = useMemo<{ [key: string]: (() => boolean)}>(() => ({}), []);
    
    if (purchase.type !== investmentType.purchase) {
        if (investmentType.purchase === "anyAmountOfMoney") {
            setPurchase({
                type: "anyAmountOfMoney",
                currency: userSettings.mainCurrencyId,
                amountOfMoney: 1000,
            });
        }
        else if (investmentType.purchase === "decimalUnits" || investmentType.purchase === "integerUnits") {
            setPurchase({
                type: investmentType.purchase,
                currency: userSettings.mainCurrencyId,
                numUnits: 10,
                unitPrice: 100,
            });
        }
        else if (investmentType.purchase === "weight") {
            setPurchase({
                type: "weight",
                currency: userSettings.mainCurrencyId,
                unit: "g",
                price: 1000,
                weight: 1,
            });
        }
    }
    
    const goToInvestmentsList = () => {
        navigate(getInvestmentsListUrl(investmentTypeSlug));
    };
    
    if (investment.type !== investmentType.id) {
        goToInvestmentsList();
    }
    
    const handleSaveClick = async () => {
        if (!validateForm()) {
            return;
        }
        const investmentToSave: Investment = {
            ...investment,
            name: investmentName,
            walletId,
            startDate,
            endDate,
            purchase,
            valueCalculationMethod,
            interestPeriods,
            capitalization,
            incomeTaxApplicable,
            cancellationPolicy,
            targetCurrencies,
            targetIndustries: targetIndustries.filter(targetIndustry => targetIndustry.id.trim().length > 0),
            targetWorldAreas,
        };
        const data = { api, investment: investmentToSave };
        setIsProcessing(true);
        try {
            const tickersBefore = getAllTickers(store.getState().investments.investmentsList);
            const result = await (isNewInvestment ? dispatch(addInvestmentAsync(data)) : dispatch(updateInvestmentAsync(data)));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            const tickersAfter = getAllTickers(store.getState().investments.investmentsList);
            if (!Utils.areArraysEqual(tickersBefore, tickersAfter)) {
                await dispatch(loadExternalDataAsync({ tickers: tickersAfter, cacheMaxLifetime: 0, api }));
            }
            dispatch(showUserMessage({
                type: "success",
                message: t(`page.investmentForm.result.success.${isNewInvestment ? "created" : "updated"}`),
                duration: UserMessageDuration.SUCCESS,
            }));
            goToInvestmentsList();
        }
        catch (err) {
            console.error(err);
            const serverError = resolveServerError(err);
            dispatch(showUserMessage({
                type: "error",
                message: t(`common.errors.server.${serverError}`),
                duration: UserMessageDuration.ERROR,
            }));
        }
        finally {
            setIsProcessing(false);
        }
    };
    const validateForm = () => {
        let isOk: boolean = true;
        for (const validator of Object.values(validators)) {
            isOk = validator() && isOk;
        }
        return isOk;
    };
    
    useEffect(() => {
        if (startDate === null || valueCalculationMethod.type !== "interest") {
            return;
        }
        const months = interestPeriods
            .map(interestPeriod => interestPeriod.repeats * Utils.getDurationMonths(interestPeriod.duration))
            .reduce((sum, value) => sum + value, 0);
        const duration: Duration = { num: months, unit: "m" };
        const endDate = Utils.addDuration(startDate, duration);
        setEndDate(endDate as KvapiTypes.Timestamp);
    }, [interestPeriods, startDate, valueCalculationMethod, setEndDate]);
    
    const handleNameChange = useCallback((value: InvestmentName) => {
        setInvestmentName(value);
    }, [setInvestmentName]);
    const handleWalletIdChange = useCallback((value: WalletId) => {
        setWalletId(value);
    }, [setWalletId]);
    const handleStartDateChange = useCallback((value: KvapiTypes.Timestamp | null) => {
        setStartDate(value);
    }, [setStartDate]);
    const handleEndDateChange = useCallback((value: KvapiTypes.Timestamp | null) => {
        setEndDate(value);
    }, [setEndDate]);
    const handlePurchaseChange = useCallback((value: InvestmentPurchase) => {
        setPurchase(value);
    }, [setPurchase]);
    const handleValueCalculationMethodChange = useCallback((value: InvestmentValueCalculationMethod) => {
        setValueCalculationMethod(value);
    }, [setValueCalculationMethod]);
    const handleInterestPeriodsChange = useCallback((value: InvestmentInterestPeriod[]) => {
        setInterestPeriods(value);
    }, [setInterestPeriods]);
    const handleCapitalizationChange = useCallback((value: boolean) => {
        setCapitalization(value);
    }, [setCapitalization]);
    const handleIncomeTaxApplicableChange = useCallback((value: boolean) => {
        setIncomeTaxApplicable(value);
    }, [setIncomeTaxApplicable]);
    const handleCancellationPolicyChange = useCallback((value: InvestmentCancellationPolicy) => {
        setCancellationPolicy(value);
    }, [setCancellationPolicy]);
    const handleTargetCurrenciesChange = useCallback((value: InvestmentTarget<InvestmentTargetCurrencyId>[]) => {
        setTargetCurrencies(value);
    }, [setTargetCurrencies]);
    const handleTargetIndustriesChange = useCallback((value: InvestmentTarget<InvestmentTargetIndustryId>[]) => {
        setTargetIndustries(value);
    }, [setTargetIndustries]);
    const handleTargetWorldAreasChange = useCallback((value: InvestmentTarget<InvestmentTargetWorldAreaId>[]) => {
        setTargetWorldAreas(value);
    }, [setTargetWorldAreas]);
    
    return (
        <Page className="InvestmentForm">
            <PageHeader title={t(`page.investmentForm.${isNewInvestment ? "create" : "edit"}`)} icon={<FontAwesomeIcon icon={isNewInvestment ? faSolid.faPlus : faSolid.faPen} />} />
            <PageContent>
                {existingInvestmentType && (
                    <>
                        {(existingInvestment || isNewInvestment) && (
                            <>
                                <InvestmentNameField
                                    value={investmentName}
                                    onChange={handleNameChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                />
                                <InvestmentWalletIdField
                                    value={walletId}
                                    onChange={handleWalletIdChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                />
                                <InvestmentStartFieldDate
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                    required={valueCalculationMethod.type === "interest" && interestPeriods.length > 0}
                                />
                                {investmentType.enableEndDate && valueCalculationMethod.type !== "interest" && <InvestmentEndDateField
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                    required={false}
                                />}
                                <InvestmentPurchaseField
                                    value={purchase}
                                    onChange={handlePurchaseChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                    userSettings={userSettings}
                                />
                                <InvestmentValueCalculationMethodField
                                    value={valueCalculationMethod}
                                    onChange={handleValueCalculationMethodChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                    purchase={purchase}
                                />
                                {investmentType.enableInterest && <InvestmentInterestPeriodsField
                                    value={interestPeriods}
                                    onChange={handleInterestPeriodsChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                    currency={purchase.currency}
                                    purchasingUnits={purchase.type === "decimalUnits" || purchase.type === "integerUnits"}
                                    enableCancellationPolicy={investmentType.enableCancellationPolicy}
                                />}
                                {investmentType.enableInterest && <InvestmentCapitalizationField
                                    value={capitalization}
                                    onChange={handleCapitalizationChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                />}
                                <InvestmentIncomeTaxApplicableField
                                    value={incomeTaxApplicable}
                                    onChange={handleIncomeTaxApplicableChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                />
                                {interestPeriods.length === 0 && investmentType.enableCancellationPolicy && <InvestmentCancellationPolicyField
                                    value={cancellationPolicy}
                                    onChange={handleCancellationPolicyChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                    currency={purchase.currency}
                                    purchasingUnits={purchase.type === "decimalUnits" || purchase.type === "integerUnits"}
                                />}
                                {investmentType.enableCurrencies && <InvestmentTargetCurrenciesField
                                    value={targetCurrencies}
                                    onChange={handleTargetCurrenciesChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                />}
                                {investmentType.enableIndustries && <InvestmentTargetIndustriesField
                                    value={targetIndustries}
                                    onChange={handleTargetIndustriesChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                />}
                                {investmentType.enableWorldAreas && <InvestmentTargetWorldAreaField
                                    value={targetWorldAreas}
                                    onChange={handleTargetWorldAreasChange}
                                    createValidator={(validator, validatorName) => validators[validatorName] = validator}
                                />}
                                <FormSeparator />
                                <FormField type="buttons">
                                    <Button variant="contained" startIcon={<FontAwesomeIcon icon={faSolid.faSave} />} onClick={() => handleSaveClick()}>
                                        {t("common.buttons.save")}
                                    </Button>
                                </FormField>
                            </>
                        )}
                        {!investment && !isNewInvestment && (
                            <Alert
                                severity="error"
                                variant="filled"
                            >
                                {t("common.investments.error.doesNotExist")}
                            </Alert>
                        )}
                    </>
                )}
                {!existingInvestmentType && (
                    <Alert
                        severity="error"
                        variant="filled"
                    >
                        {t("common.investmentTypes.error.doesNotExist")}
                    </Alert>
                )}
            </PageContent>
            {isProcessing && <LoadingIndicator />}
        </Page>
    );
}
