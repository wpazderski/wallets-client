import { useTranslation } from "react-i18next";

import { Investment } from "../../../../../../../app/store/InvestmentsSlice";
import { DateTime } from "../../../../../common/dateTime/DateTime";
import { Duration } from "../../../../../common/duration/Duration";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentDatesViewProps {
    investment: Investment;
}

export function InvestmentDatesView(props: InvestmentDatesViewProps) {
    const { t } = useTranslation();
    
    return (
        <FormField title={t("common.investments.fields.dateRange")} className="FormField--full-width">
            <div className="date-range">
                <span className="date-range__start">
                    {props.investment.startDate && <DateTime timestamp={props.investment.startDate} showDate={true} />}
                    {!props.investment.startDate && "..."}
                </span>
                <span className="date-range__separator">-</span>
                <span className="date-range__end">
                    {props.investment.endDate && <DateTime timestamp={props.investment.endDate} showDate={true} />}
                    {!props.investment.endDate && "..."}
                </span>
                {props.investment.startDate && props.investment.endDate && <div>
                    <Duration startTimestamp={props.investment.startDate} endTimestamp={props.investment.endDate} />
                </div>}
            </div>
        </FormField>
    );
}
