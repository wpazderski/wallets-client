import * as WalletsTypes from "@wpazderski/wallets-types";
import { useTranslation } from "react-i18next";

import {
    Investment,
    InvestmentCancellationPolicy,
    InvestmentInterestPeriodCancellationPolicy,
} from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";
import { NumberView } from "../../../../../common/numberView/NumberView";





export interface InvestmentCancellationPolicyViewProps {
    investment: Investment;
}

export function InvestmentCancellationPolicyView(props: InvestmentCancellationPolicyViewProps) {
    const { t } = useTranslation();
    const cancellationPolicy = props.investment.cancellationPolicy;
    
    return (
        <FormField title={t("common.investments.fields.cancellationPolicy")} className="FormField--full-width">
            <CancellationPolicyView cancellationPolicy={cancellationPolicy} currency={props.investment.purchase.currency} />
        </FormField>
    );
}

export interface CancellationPolicyViewProps {
    cancellationPolicy: InvestmentCancellationPolicy | InvestmentInterestPeriodCancellationPolicy;
    currency: WalletsTypes.data.currency.Id;
}

export function CancellationPolicyView(props: CancellationPolicyViewProps) {
    const { t } = useTranslation();
    const cancellationPolicy = props.cancellationPolicy;
    
    return (
        <>
            <div className="math-equation">
                <NumberView num={cancellationPolicy.fixedPenalty} currency={props.currency} precision={2} />
                {cancellationPolicy.percentOfTotalInterest > 0 && (
                    <>
                        <span className="math-equation__operator">+</span>
                        <span>
                            <NumberView num={cancellationPolicy.percentOfTotalInterest} suffix="%" precision={5} />
                            <span className="math-equation__operator">*</span>
                            {t("common.totalInterestAsVarName")}
                        </span>
                    </>
                )}
                {"percentOfInterestPeriodInterest" in cancellationPolicy && cancellationPolicy.percentOfInterestPeriodInterest > 0 && (
                    <>
                        <span className="math-equation__operator">+</span>
                        <span>
                            <NumberView num={cancellationPolicy.percentOfInterestPeriodInterest} suffix="%" precision={5} />
                            <span className="math-equation__operator">*</span>
                            {t("common.interestPeriodInterestAsVarName")}
                        </span>
                    </>
                )}
            </div>
            {cancellationPolicy.limitedToTotalInterest && <div>
                {t("common.investments.fields.cancellationPolicy.limitedToTotalInterest")}
            </div>}
            {"limitedToInterestPeriodInterest" in cancellationPolicy && cancellationPolicy.limitedToInterestPeriodInterest && <div>
                {t("common.investments.fields.cancellationPolicy.limitedToInterestPeriodInterest")}
            </div>}
        </>
    );
}
