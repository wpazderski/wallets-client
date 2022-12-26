import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Utils } from "../../../../../../../app";
import { Investment, InvestmentInterestPeriod } from "../../../../../../../app/store/InvestmentsSlice";
import { DateTime } from "../../../../../common/dateTime/DateTime";
import { Duration } from "../../../../../common/duration/Duration";
import { FormField } from "../../../../../common/formField/FormField";
import { NumberView } from "../../../../../common/numberView/NumberView";
import { CancellationPolicyView } from "./InvestmentCancellationPolicyView";





export interface InvestmentInterestPeriodsViewProps {
    investment: Investment;
}

interface InvestmentInterestPeriodEx extends InvestmentInterestPeriod{
    startTimestamp: number;
    endTimestamp: number;
}

export function InvestmentInterestPeriodsView(props: InvestmentInterestPeriodsViewProps) {
    const { t } = useTranslation();
    
    const interestPeriods = props.investment.interestPeriods;
    const startDate = props.investment.startDate;
    
    const investmentPeriodsEx = useMemo(() => {
        const arr: InvestmentInterestPeriodEx[] = [];
        let timestamp: number = startDate!;
        for (const interestPeriod of interestPeriods) {
            for (let i = 0; i < interestPeriod.repeats; ++i) {
                const endTimestamp = Utils.addDuration(timestamp, interestPeriod.duration);
                arr.push({
                    ...interestPeriod,
                    id: interestPeriod.id + "/" + i,
                    startTimestamp: timestamp!,
                    endTimestamp: endTimestamp,
                });
                timestamp = endTimestamp;
            }
        }
        return arr;
    }, [interestPeriods, startDate]);
    
    return (
        <FormField title={t("common.investments.fields.interestPeriods")} className="FormField--full-width">
            <table>
                <thead>
                    <tr>
                        <th>{t("common.investments.fields.interestPeriods.duration")}</th>
                        <th>{t("common.investments.fields.interestPeriods.interestRate")}</th>
                        <th>{t("common.investments.fields.cancellationPolicy")}</th>
                    </tr>
                </thead>
                <tbody>
                    {investmentPeriodsEx.map(interestPeriodEx => (
                        <tr key={interestPeriodEx.id}>
                            <td>
                                <div>
                                    <Duration startTimestamp={interestPeriodEx.startTimestamp} endTimestamp={interestPeriodEx.endTimestamp} />
                                </div>
                                {interestPeriodEx.startTimestamp !== null && interestPeriodEx.endTimestamp !== null && <div>
                                    (<DateTime timestamp={interestPeriodEx.startTimestamp} showDate={true} /> - <DateTime timestamp={interestPeriodEx.endTimestamp} showDate={true} />)
                                </div>}
                            </td>
                            <td className="math-equation">
                                <NumberView num={interestPeriodEx.interestRate.additivePercent} suffix="%" precision={5} />
                                {interestPeriodEx.interestRate.additiveInflation && (
                                    <>
                                        <span className="math-equation__operator">+</span>
                                        <span>{t("common.inflationAsVarName")}</span>
                                    </>
                                )}
                                {interestPeriodEx.interestRate.additiveReferenceRate && (
                                    <>
                                        <span className="math-equation__operator">+</span>
                                        <span>{t("common.referenceRateAsVarName")}</span>
                                    </>
                                )}
                            </td>
                            <td>
                                <CancellationPolicyView cancellationPolicy={interestPeriodEx.cancellationPolicy} currency={props.investment.purchase.currency} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </FormField>
    );
}
