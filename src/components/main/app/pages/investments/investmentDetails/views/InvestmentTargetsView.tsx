import { useMemo } from "react";
import { Pie } from "react-chartjs-2";

import { ChartColors } from "../../../../../../../app";
import { Investment, InvestmentTarget } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";

export interface InvestmentTargetsViewProps {
    investment: Investment;
    targets: InvestmentTarget<string>[];
    title: string;
    labelFormatter?: (target: InvestmentTarget<string>) => string;
}

export function InvestmentTargetsView(props: InvestmentTargetsViewProps) {
    const propsTargets = props.targets;
    const labelFormatter = props.labelFormatter;
    
    const targets = useMemo(() => {
        return [ ...propsTargets ].sort((a, b) => b.percentage - a.percentage);
    }, [propsTargets]);
    
    const chartOptions = useMemo(() => ({
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return " " + context.label + ": " + context.formattedValue + "%";
                    },
                },
            },
        },
    }), []);
    
    const chartData = useMemo(() => {
        const colors = new ChartColors();
        const chartLabels = targets.map(item => labelFormatter ? labelFormatter(item) : item.id);
        const dataArr: number[] = targets.map(item => item.percentage);
        return {
            labels: chartLabels,
            datasets: [
                {
                    data: dataArr,
                    backgroundColor: dataArr.map(() => colors.next()),
                },
            ],
        };
    }, [labelFormatter, targets]);
    
    return (
        <FormField title={props.title} className="FormField--full-width FormField--full-widthx">
            <div className="chart-container chart-container--small">
                <Pie options={chartOptions} data={chartData} />
            </div>
        </FormField>
    );
}
