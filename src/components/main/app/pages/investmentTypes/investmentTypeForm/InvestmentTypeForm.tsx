import "./InvestmentTypeForm.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AutocompleteRenderInputParams, SelectChangeEvent } from "@mui/material";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { resolveServerError, useApiContext } from "../../../../../../app";
import { useAppDispatch, useAppSelector } from "../../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../../app/store/AppSlice";
import { selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import {
    addInvestmentTypeAsync,
    createInvestmentTypeSlug,
    getEmptyCustomInvestmentType,
    getInvestmentTypePurchases,
    getInvestmentTypeValueCalculationMethods,
    InvestmentType,
    InvestmentTypeId,
    InvestmentTypeName,
    InvestmentTypePurchase,
    InvestmentTypeSlug,
    InvestmentTypeValueCalculationMethod,
    reservedInvestmentTypeSlugs,
    selectInvestmentTypesList,
    updateInvestmentTypeAsync,
} from "../../../../../../app/store/InvestmentTypesSlice";
import { FormField } from "../../../../common/formField/FormField";
import { FormSeparator } from "../../../../common/formSeparator/FormSeparator";
import { LoadingIndicator } from "../../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../../page/Page";
import { PageContent } from "../../../pageContent/PageContent";
import { PageHeader } from "../../../pageHeader/PageHeader";
import { getInvestmentTypesListUrl } from "../InvestmentTypes";





type AvailableIconsLoadingState = "initial" | "loading" | "loaded" | "failed";

function getAvailableIcons(faSolidIcons: typeof faSolid): faSolid.IconLookup[] {
    const icons: faSolid.IconLookup[] = [];
    for (const iconName in faSolidIcons) {
        const icon = (faSolidIcons as any)[iconName];
        if (icon && icon.iconName && !icons.find(ic => ic.iconName === icon.iconName && ic.prefix === icon.prefix)) {
            icons.push(icon);
        }
    }
    return icons;
}

function findIconByName(iconName: string, icons: faSolid.IconLookup[]): faSolid.IconLookup {
    const icon = icons.find(icon => icon.iconName === iconName);
    if (icon) {
        return icon;
    }
    const defaultIconName = getEmptyCustomInvestmentType().icon.iconName;
    return icons.find(icon => icon.iconName === defaultIconName)!;
}

export function InvestmentTypeForm() {
    const { investmentTypeId } = useParams() as { investmentTypeId: InvestmentTypeId };
    const isNewInvestmentType = investmentTypeId === undefined;
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const investmentTypes = useAppSelector(selectInvestmentTypesList);
    const investments = useAppSelector(selectInvestmentsList);
    const existingInvestmentType = useAppSelector(selectInvestmentTypesList).find(investmentType => investmentType.id === investmentTypeId);
    const investmentType = existingInvestmentType ?? getEmptyCustomInvestmentType();
    const [availableIcons, setAvailableIcons] = useState<faSolid.IconLookup[] | null>(null);
    const [availableIconsLoadingState, setAvailableIconsLoadingState] = useState<AvailableIconsLoadingState>("initial");
    const [isPredefined] = useState(investmentType.isPredefined);
    const [investmentTypeName, setInvestmentTypeName] = useState(investmentType.name);
    const [slug, setSlug] = useState(investmentType.slug);
    const [icon, setIcon] = useState(findIconByName(investmentType.icon.iconName, availableIcons ?? []) ?? investmentType.icon);
    const [purchase, setPurchase] = useState(investmentType.purchase);
    const [valueCalculationMethod, setValueCalculationMethod] = useState(investmentType.valueCalculationMethod);
    const [enableInterest, setEnableInterest] = useState(investmentType.enableInterest);
    const [enableEndDate, setEnableEndDate] = useState(investmentType.enableEndDate);
    const [enableCancellationPolicy, setEnableCancellationPolicy] = useState(investmentType.enableCancellationPolicy);
    const [enableCurrencies, setEnableCurrencies] = useState(investmentType.enableCurrencies);
    const [enableIndustries, setEnableIndustries] = useState(investmentType.enableIndustries);
    const [enableWorldAreas, setEnableWorldAreas] = useState(investmentType.enableWorldAreas);
    const [showInSidebar, setShowInSidebar] = useState(investmentType.showInSidebar);
    const [nameError, setNameError] = useState("");
    const [slugError, setSlugError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [touchedNameField, setTouchedNameField] = useState(false);
    const [touchedSlugField, setTouchedSlugField] = useState(false);
    const canChangeParams = !isPredefined && !investments.find(investment => investment.type === investmentType.id);
    
    useEffect(() => {
        if (availableIconsLoadingState === "initial") {
            setAvailableIconsLoadingState("loading");
            import("@fortawesome/free-solid-svg-icons-lazy").then(data => {
                const availableIcons = getAvailableIcons(data as any);
                setAvailableIconsLoadingState("loaded");
                setAvailableIcons(availableIcons);
                setIcon(findIconByName(investmentType.icon.iconName, availableIcons ?? []));
            })
            .catch(e => {
                setAvailableIconsLoadingState("failed");
                throw e;
            });
        }
    }, [investmentType.icon, availableIconsLoadingState]);
    
    const goToInvestmentTypesList = useCallback(() => {
        navigate(getInvestmentTypesListUrl());
    }, [navigate]);
    
    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value as InvestmentTypeName;
        setInvestmentTypeName(value);
        setSlug(createInvestmentTypeSlug(value));
        setTouchedNameField(true);
    }, []);
    
    const validateName = useCallback(() => {
        if (investmentTypeName.length === 0) {
            setNameError(t("page.investmentTypeForm.errors.nameRequired"));
            return false;
        }
        else {
            setNameError("");
            return true;
        }
    }, [investmentTypeName, setNameError, t]);
    
    useEffect(() => {
        if (touchedNameField) {
            validateName();
        }
    }, [validateName, touchedNameField]);
    
    const handleNameBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        const value = event.target.value.trim() as InvestmentTypeName;
        setInvestmentTypeName(value);
        setSlug(createInvestmentTypeSlug(value));
        setTouchedNameField(true);
    }, []);
    
    const handleSlugChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value as InvestmentTypeSlug;
        setSlug(value);
        setTouchedSlugField(true);
    }, []);
    
    const validateSlug = useCallback(() => {
        if (slug.length === 0) {
            setSlugError(t("page.investmentTypeForm.errors.slugRequired"));
            return false;
        }
        else if (investmentTypes.find(existing => existing.slug.trim() === slug.trim() && existing.id !== existingInvestmentType?.id)) {
            setSlugError(t("page.investmentTypeForm.errors.slugTaken"));
            return false;
        }
        else if (reservedInvestmentTypeSlugs.includes(slug.trim() as InvestmentTypeSlug)) {
            setSlugError(t("page.investmentTypeForm.errors.slugReserved"));
            return false;
        }
        else {
            setSlugError("");
            return true;
        }
    }, [slug, setSlugError, t, investmentTypes, existingInvestmentType]);
    
    useEffect(() => {
        if (touchedSlugField) {
            validateSlug();
        }
    }, [validateSlug, touchedSlugField]);
    
    const handleSlugBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        setSlug(createInvestmentTypeSlug(event.target.value as InvestmentTypeSlug));
        setTouchedNameField(true);
    }, []);
    
    const handleIconChange = useCallback((_event: React.SyntheticEvent, icon: faSolid.IconLookup | null) => {
        setIcon(icon ?? faSolid.faMoneyBill);
    }, []);
    
    const getIconOptionLabel = useCallback((option: faSolid.IconLookup) => {
        return option.iconName;
    }, []);
    
    const renderIconOption = useCallback((props: React.HTMLAttributes<HTMLLIElement>, option: faSolid.IconLookup) => {
        return (
            <Box component="li" {...props} key={option.prefix + "-" + option.iconName}>
                <FontAwesomeIcon icon={option} fixedWidth={true} className="InvestmentTypeForm__icon-select__icon" />
                {option.iconName}
            </Box>
        );
    }, []);
    
    const renderIconInput = useCallback((params: AutocompleteRenderInputParams) => {
        return (
            <div className="InvestmentTypeForm__icon-select__selected-value">
                <FontAwesomeIcon icon={icon ?? faSolid.faMoneyBill} fixedWidth={true} className="InvestmentTypeForm__icon-select__icon" />
                <TextField
                    {...params}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: "new-password",
                    }}
                />
            </div>
        );
    }, [icon]);
    
    const handlePurchaseChange = useCallback((event: SelectChangeEvent<InvestmentTypePurchase>) => {
        setPurchase(event.target.value as InvestmentTypePurchase);
    }, []);
    
    const handleCalculationMethodChange = useCallback((event: SelectChangeEvent<InvestmentTypeValueCalculationMethod>) => {
        const valueCalculationMethod = event.target.value as InvestmentTypeValueCalculationMethod;
        setValueCalculationMethod(valueCalculationMethod);
        if (valueCalculationMethod === "interest" && !enableInterest) {
            setEnableInterest(true);
        }
    }, [enableInterest]);
    
    const handleEnableInterestChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const enableInterest = event.target.checked;
        setEnableInterest(enableInterest);
        if (!enableInterest && valueCalculationMethod === "interest") {
            setValueCalculationMethod("manual");
        }
    }, [valueCalculationMethod]);
    
    const handleEnableEndDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEnableEndDate(event.target.checked);
    }, []);
    
    const handleEnableCancellationPolicyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEnableCancellationPolicy(event.target.checked);
    }, []);
    
    const handleEnableCurrenciesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEnableCurrencies(event.target.checked);
    }, []);
    
    const handleEnableIndustriesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEnableIndustries(event.target.checked);
    }, []);
    
    const handleEnableWorldAreasChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEnableWorldAreas(event.target.checked);
    }, []);
    
    const handleShowInSidebarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setShowInSidebar(event.target.checked);
    }, []);
    
    const validateConsistency = useCallback(() => {
        if (purchase === "anyAmountOfMoney" && valueCalculationMethod === "obtainer") {
            dispatch(showUserMessage({
                type: "error",
                message: t("page.investmentTypeForm.result.error.purchaseVsValueCalculationMethod"),
                duration: UserMessageDuration.ERROR,
            }));
            return false;
        }
        return true;
    }, [dispatch, purchase, t, valueCalculationMethod]);
    
    const validateForm = useCallback(() => {
        let isOk: boolean = true;
        isOk = validateName() && isOk;
        isOk = validateSlug() && isOk;
        isOk = validateConsistency() && isOk;
        return isOk;
    }, [validateConsistency, validateName, validateSlug]);
    
    const handleSaveClick = useCallback(async () => {
        if (!validateForm()) {
            return;
        }
        const investmentTypeToSave: InvestmentType = {
            ...investmentType,
            name: investmentTypeName,
            slug,
            icon,
            purchase,
            valueCalculationMethod,
            enableInterest,
            enableEndDate,
            enableCancellationPolicy,
            enableCurrencies,
            enableIndustries,
            enableWorldAreas,
            showInSidebar,
        };
        const data = { api, investmentType: investmentTypeToSave };
        setIsProcessing(true);
        try {
            const result = await (isNewInvestmentType ? dispatch(addInvestmentTypeAsync(data)) : dispatch(updateInvestmentTypeAsync(data)));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t(`page.investmentTypeForm.result.success.${isNewInvestmentType ? "created" : "updated"}`),
                duration: UserMessageDuration.SUCCESS,
            }));
            goToInvestmentTypesList();
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
    }, [api, dispatch, enableCancellationPolicy, enableCurrencies, enableEndDate, enableIndustries, enableInterest, enableWorldAreas, goToInvestmentTypesList, icon, investmentType, investmentTypeName, isNewInvestmentType, purchase, showInSidebar, slug, t, validateForm, valueCalculationMethod]);
    
    const isLoaded = availableIconsLoadingState === "loaded";
    
    return (
        <Page className="InvestmentTypeForm">
            {isLoaded && (
                <>
                    <PageHeader title={t(`page.investmentTypeForm.${isNewInvestmentType ? "create" : "edit"}`)} icon={<FontAwesomeIcon icon={isNewInvestmentType ? faSolid.faFolderPlus : faSolid.faFolder} />} />
                    <PageContent>
                        {(existingInvestmentType || isNewInvestmentType) && (
                            <>
                                <FormField title={t("common.investmentTypes.fields.isPredefined")}>
                                    {t(`common.investmentTypes.fields.isPredefined.${isPredefined ? "yes" : "no"}`)}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.name")}>
                                    {canChangeParams &&
                                        <TextField
                                            value={investmentTypeName}
                                            onChange={handleNameChange}
                                            onBlur={handleNameBlur}
                                            error={!!nameError}
                                            helperText={nameError || " "}
                                        />
                                    }
                                    {!canChangeParams && (isPredefined ? t(`common.investmentTypes.${investmentTypeName}` as any) : investmentTypeName)}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.slug")} description={t("common.investmentTypes.fields.slug.extraInfo")}>
                                    {canChangeParams &&
                                        <TextField
                                            value={slug}
                                            onChange={handleSlugChange}
                                            onBlur={handleSlugBlur}
                                            error={!!slugError}
                                            helperText={slugError || " "}
                                        />
                                    }
                                    {!canChangeParams && <span className="monospace-font">{slug}</span>}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.icon")}>
                                    {canChangeParams && 
                                        <FormControl>
                                            <Autocomplete
                                                sx={{ width: 300 }}
                                                options={availableIcons ?? []}
                                                value={icon}
                                                onChange={handleIconChange}
                                                autoHighlight
                                                getOptionLabel={getIconOptionLabel}
                                                renderOption={renderIconOption}
                                                renderInput={renderIconInput}
                                            />
                                        </FormControl>
                                    }
                                    {!canChangeParams && <FontAwesomeIcon icon={icon} className="icon-xxl" />}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.purchase")}>
                                    {canChangeParams && 
                                        <FormControl>
                                            <Select
                                                value={purchase}
                                                onChange={handlePurchaseChange}
                                            >
                                                {getInvestmentTypePurchases().map(purchase =>
                                                    <MenuItem key={purchase} value={purchase}>{t(`common.investmentTypes.fields.purchase.${purchase}`)}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    }
                                    {!canChangeParams && (t(`common.investmentTypes.fields.purchase.${purchase}`))}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.valueCalculationMethod")}>
                                    {canChangeParams && 
                                        <FormControl>
                                            <Select
                                                value={valueCalculationMethod}
                                                onChange={handleCalculationMethodChange}
                                            >
                                                {getInvestmentTypeValueCalculationMethods().map(valueCalculationMethod =>
                                                    <MenuItem key={valueCalculationMethod} value={valueCalculationMethod}>{t(`common.investmentTypes.fields.valueCalculationMethod.${valueCalculationMethod}`)}</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    }
                                    {!canChangeParams && (t(`common.investmentTypes.fields.valueCalculationMethod.${valueCalculationMethod}`))}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.enableInterest")}>
                                    {canChangeParams && <Switch checked={enableInterest} onChange={handleEnableInterestChange} />}
                                    {!canChangeParams && <Switch checked={enableInterest} disabled className="switch--readonly" />}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.enableEndDate")}>
                                    {canChangeParams && <Switch checked={enableEndDate} onChange={handleEnableEndDateChange} />}
                                    {!canChangeParams && <Switch checked={enableEndDate} disabled className="switch--readonly" />}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.enableCancellationPolicy")}>
                                    {canChangeParams && <Switch checked={enableCancellationPolicy} onChange={handleEnableCancellationPolicyChange} />}
                                    {!canChangeParams && <Switch checked={enableCancellationPolicy} disabled className="switch--readonly" />}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.enableCurrencies")}>
                                    {canChangeParams && <Switch checked={enableCurrencies} onChange={handleEnableCurrenciesChange} />}
                                    {!canChangeParams && <Switch checked={enableCurrencies} disabled className="switch--readonly" />}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.enableIndustries")}>
                                    {canChangeParams && <Switch checked={enableIndustries} onChange={handleEnableIndustriesChange} />}
                                    {!canChangeParams && <Switch checked={enableIndustries} disabled className="switch--readonly" />}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.enableWorldAreas")}>
                                    {canChangeParams && <Switch checked={enableWorldAreas} onChange={handleEnableWorldAreasChange} />}
                                    {!canChangeParams && <Switch checked={enableWorldAreas} disabled className="switch--readonly" />}
                                </FormField>
                                <FormField title={t("common.investmentTypes.fields.showInSidebar")}>
                                    <Switch checked={showInSidebar} onChange={handleShowInSidebarChange} />
                                </FormField>
                                <FormSeparator />
                                <FormField type="buttons">
                                    <Button variant="contained" startIcon={<FontAwesomeIcon icon={faSolid.faSave} />} onClick={handleSaveClick}>
                                        {t("common.buttons.save")}
                                    </Button>
                                </FormField>
                            </>
                        )}
                        {!existingInvestmentType && !isNewInvestmentType && (
                            <Alert
                                severity="error"
                                variant="filled"
                            >
                                {t("common.investmentTypes.error.doesNotExist")}
                            </Alert>
                        )}
                    </PageContent>
                    {isProcessing && <LoadingIndicator />}
                </>
            )}
            {!isLoaded && (
                <>
                    {availableIconsLoadingState !== "failed" && <LoadingIndicator />}
                    {availableIconsLoadingState === "failed" && <div className="loading-failure-indicator"><FontAwesomeIcon icon={faSolid.faXmarkCircle} /></div>}
                </>
            )}
        </Page>
    );
}
