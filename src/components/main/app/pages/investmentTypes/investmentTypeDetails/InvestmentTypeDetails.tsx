import "./InvestmentTypeDetails.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "../../../../../../app/store";
import { InvestmentTypeId, selectInvestmentTypesList } from "../../../../../../app/store/InvestmentTypesSlice";
import { FormField } from "../../../../common/formField/FormField";
import { Page } from "../../../page/Page";
import { PageContent } from "../../../pageContent/PageContent";
import { PageHeader } from "../../../pageHeader/PageHeader";
import { getEditInvestmentTypeUrl } from "../InvestmentTypes";





export function InvestmentTypeDetails() {
    const { investmentTypeId } = useParams() as { investmentTypeId: InvestmentTypeId };
    const { t } = useTranslation();
    const navigate = useNavigate();
    const investmentType = useAppSelector(selectInvestmentTypesList).find(investmentType => investmentType.id === investmentTypeId);
    
    const handleEditClick = useCallback(() => {
        navigate(getEditInvestmentTypeUrl(investmentTypeId));
    }, [navigate, investmentTypeId]);
    
    return (
        <Page className="InvestmentTypeDetails">
            <PageHeader title={t("page.investmentType")} icon={<FontAwesomeIcon icon={faSolid.faFolder} />} />
            <PageContent>
                {investmentType && (
                    <>
                        <Button
                            variant="contained"
                            onClick={handleEditClick}
                            sx={{ minWidth: 45, padding: 1.5, marginBottom: 2, marginLeft: 2 }}
                        >
                            <FontAwesomeIcon icon={faSolid.faPen} />
                        </Button>
                        <FormField title={t("common.investmentTypes.fields.isPredefined")}>
                            {t(`common.investmentTypes.fields.isPredefined.${investmentType.isPredefined ? "yes" : "no"}`)}
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.name")}>
                            {investmentType.isPredefined ? t(`common.investmentTypes.${investmentType.name}` as any) : investmentType.name}
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.slug")} description={t("common.investmentTypes.fields.slug.extraInfo")}>
                            <span className="monospace-font">{investmentType.slug}</span>
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.icon")}>
                            <FontAwesomeIcon icon={investmentType.icon} className="icon-xxl" />
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.purchase")}>
                            {t(`common.investmentTypes.fields.purchase.${investmentType.purchase}`)}
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.valueCalculationMethod")}>
                            {t(`common.investmentTypes.fields.valueCalculationMethod.${investmentType.valueCalculationMethod}`)}
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.enableInterest")}>
                            <Switch checked={investmentType.enableInterest} disabled className="switch--readonly" />
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.enableEndDate")}>
                            <Switch checked={investmentType.enableEndDate} disabled className="switch--readonly" />
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.enableCancellationPolicy")}>
                            <Switch checked={investmentType.enableCancellationPolicy} disabled className="switch--readonly" />
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.enableCurrencies")}>
                            <Switch checked={investmentType.enableCurrencies} disabled className="switch--readonly" />
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.enableIndustries")}>
                            <Switch checked={investmentType.enableIndustries} disabled className="switch--readonly" />
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.enableWorldAreas")}>
                            <Switch checked={investmentType.enableWorldAreas} disabled className="switch--readonly" />
                        </FormField>
                        <FormField title={t("common.investmentTypes.fields.showInSidebar")}>
                            <Switch checked={investmentType.showInSidebar} disabled className="switch--readonly" />
                        </FormField>
                    </>
                )}
                {!investmentType && (
                    <Alert
                        severity="error"
                        variant="filled"
                    >
                        {t("common.investmentTypes.error.doesNotExist")}
                    </Alert>
                )}
            </PageContent>
        </Page>
    );
}
