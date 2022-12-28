import "./InvestmentDetails.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector, worldAreas } from "../../../../../../app/store";
import { selectCurrencies } from "../../../../../../app/store/ExternalDataSlice";
import { InvestmentId, InvestmentTarget, selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import { InvestmentTypeSlug, selectInvestmentTypesList } from "../../../../../../app/store/InvestmentTypesSlice";
import { Page } from "../../../page/Page";
import { PageContent } from "../../../pageContent/PageContent";
import { PageHeader } from "../../../pageHeader/PageHeader";
import { getEditInvestmentUrl, getInvestmentsListUrl } from "../Investments";
import { InvestmentCancellationPolicyView } from "./views/InvestmentCancellationPolicyView";
import { InvestmentCapitalizationView } from "./views/InvestmentCapitalizationView";
import { InvestmentCurrentValueView } from "./views/InvestmentCurrentValueView";
import { InvestmentDatesView } from "./views/InvestmentDatesView";
import { InvestmentIncomeTaxApplicableView } from "./views/InvestmentIncomeTaxApplicableView";
import { InvestmentInterestPeriodsView } from "./views/InvestmentInterestPeriodsView";
import { InvestmentPurchaseView } from "./views/InvestmentPurchaseView";
import { InvestmentTargetsView } from "./views/InvestmentTargetsView";
import { InvestmentValueCalculationMethodView } from "./views/InvestmentValueCalculationMethodView";
import { InvestmentWalletIdView } from "./views/InvestmentWalletIdView";





export function InvestmentDetails() {
    const { investmentTypeSlug, investmentId } = useParams() as { investmentTypeSlug: InvestmentTypeSlug, investmentId: InvestmentId };
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currencies = useAppSelector(selectCurrencies);
    const investmentType = useAppSelector(selectInvestmentTypesList).find(investmentType => investmentType.slug === investmentTypeSlug);
    const investment = useAppSelector(selectInvestmentsList).find(investment => investment.id === investmentId);
    
    const handleEditClick = useCallback(() => {
        if (investmentType && investment) {
            navigate(getEditInvestmentUrl(investmentType.slug, investment.id));
        }
    }, [investment, investmentType, navigate]);
    
    const goToInvestmentsList = useCallback(() => {
        navigate(getInvestmentsListUrl(investmentTypeSlug));
    }, [investmentTypeSlug, navigate]);
    
    useEffect(() => {
        if (investment && investmentType && investment.type !== investmentType.id) {
            goToInvestmentsList();
        }
    }, [goToInvestmentsList, investment, investmentType]);
    
    const targetCurrenciesLabelFormatter = useCallback((target: InvestmentTarget<string>) => {
        return `${currencies.find(currency => currency.id === target.id)!.name} (${target.id})`;
    }, [currencies]);
    
    const targetWorldAreasLabelFormatter = useCallback((target: InvestmentTarget<string>) => {
        return worldAreas[target.id].name;
    }, []);
    
    return (
        <Page className="InvestmentDetails">
            <PageHeader
                title={investment ? investment.name : ""}
                icon={<FontAwesomeIcon icon={investmentType?.icon ?? faSolid.faTimes} />}
            />
            <PageContent>
                {investment && investmentType && (
                    <div className="InvestmentDetails__views">
                        <Button
                            variant="contained"
                            onClick={handleEditClick}
                            sx={{ minWidth: 45, padding: 1.5, marginBottom: 2, marginLeft: 2 }}
                        >
                            <FontAwesomeIcon icon={faSolid.faPen} />
                        </Button>
                        
                        <InvestmentCurrentValueView investment={investment} />
                        <InvestmentWalletIdView investment={investment} />
                        {(investment.startDate || investment.endDate) && <InvestmentDatesView investment={investment} />}
                        <InvestmentPurchaseView investment={investment} />
                        <InvestmentValueCalculationMethodView investment={investment} />
                        {investmentType.enableInterest && <InvestmentInterestPeriodsView investment={investment} />}
                        {investmentType.enableInterest && (<InvestmentCapitalizationView investment={investment} />)}
                        <InvestmentIncomeTaxApplicableView investment={investment} />
                        {investment.interestPeriods.length === 0 && investmentType.enableCancellationPolicy && (<InvestmentCancellationPolicyView investment={investment} />)}
                        
                        {investmentType.enableCurrencies && investment.targetCurrencies.length > 0 && (
                            <InvestmentTargetsView
                                investment={investment}
                                targets={investment.targetCurrencies}
                                title={t("common.investments.fields.targetCurrencies")}
                                labelFormatter={targetCurrenciesLabelFormatter}
                            />
                        )}
                        {investmentType.enableIndustries && investment.targetIndustries.length > 0 && (
                            <InvestmentTargetsView
                                investment={investment}
                                targets={investment.targetIndustries}
                                title={t("common.investments.fields.targetIndustries")}
                            />
                        )}
                        {investmentType.enableWorldAreas && investment.targetWorldAreas.length > 0 && (
                            <InvestmentTargetsView
                                investment={investment}
                                targets={investment.targetWorldAreas}
                                title={t("common.investments.fields.targetWorldAreas")}
                                labelFormatter={targetWorldAreasLabelFormatter}
                            />
                        )}
                    </div>
                )}
                {!investment && (
                    <Alert
                        severity="error"
                        variant="filled"
                    >
                        {t("common.investments.error.doesNotExist")}
                    </Alert>
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
