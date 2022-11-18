import "./SummaryTableWithChart.scss";

import { Chart } from "chart.js";
import * as ChartGeo from "chartjs-chart-geo";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import * as WalletsTypes from "@wpazderski/wallets-types";

import { ChartColors, Utils } from "../../../../../../app";
import { WalletId } from "../../../../../../app/store/WalletsSlice";
import { NumberView } from "../../../../common/numberView/NumberView";
import { InvestmentEx } from "../Summary";
import { WorldMapData } from "./WorldMapData";

export type Align = "left" | "right" | "centered";

export interface Column {
    id: string;
    width: string;
    header: string;
    alignHeader: Align;
    alignContent: Align;
    renderContent: (entry: Entry) => JSX.Element;
}

export interface Entry {
    id: string;
    title: string;
    value: number;
}

export type ChartLabelFormatter = (label: string, value: number) => string;

export type TableElementTextKey = "name" | "currentValue" | "currentValueShare" | "total";

type TableElementTextResolver = (text: TableElementTextKey) => string;

export interface TableWithChartProps {
    includedWallets: WalletId[];
    investmentsEx: InvestmentEx[];
    entries: Entry[];
    mainCurrencyId: WalletsTypes.data.currency.Id;
    columns?: Column[];
    footer?: Entry;
    chartLabelFormatter?: ChartLabelFormatter,
    withWorldMap?: boolean;
}

export function SummaryTableWithChart(props: TableWithChartProps) {
    const { t } = useTranslation();
    const worldMapRef = useRef<HTMLCanvasElement>(null);
    
    const propsEntries = props.entries;
    const propsColumns = props.columns;
    const propsFooter = props.footer;
    const propsChartLabelFormatter = props.chartLabelFormatter;
    const mainCurrencyId = props.mainCurrencyId;
    
    const entries = useMemo(() => {
        return [...propsEntries].sort((a, b) => b.value - a.value);
    }, [propsEntries]);
    
    const totalValue = useMemo(() => {
        return entries.map(entry => entry.value).reduce((sum, current) => sum + current, 0);
    }, [entries]);
    
    const tableElementTextResolver = useCallback<TableElementTextResolver>(textKey => {
        return t(`page.summary.table.${textKey}`);
    }, [t]);
    
    const columns = useMemo(() => propsColumns ?? getDefaultColumns(totalValue, mainCurrencyId, tableElementTextResolver), [propsColumns, totalValue, mainCurrencyId, tableElementTextResolver]);
    const footer = useMemo(() => propsFooter ?? getDefaultFooter(totalValue, tableElementTextResolver), [propsFooter, totalValue, tableElementTextResolver]);
    const chartLabelFormatter = useMemo(() => propsChartLabelFormatter ?? getDefaultChartLabelFormatter(totalValue, mainCurrencyId), [propsChartLabelFormatter, totalValue, mainCurrencyId]);
    
    const chartOptions = useMemo(() => {
        return {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            return chartLabelFormatter(context.label, context.raw);
                        },
                    },
                },
            },
        };
    }, [chartLabelFormatter]);
    
    const chartData = useMemo(() => {
        const colors = new ChartColors();
        const chartLabels = entries.map(entry => entry.title);
        const dataArr = entries.map(entry => entry.value);
        return {
            labels: chartLabels,
            datasets: [
                {
                    data: dataArr,
                    backgroundColor: dataArr.map(() => colors.next()),
                },
            ],
        };
    }, [entries]);
    
    const countries = useMemo(() => {
        const geo = WorldMapData as any;
        const countries = (ChartGeo.topojson.feature(geo, geo.objects.countries) as any).features;
        return countries;
    }, []);
    
    useEffect(() => {
        if (!worldMapRef.current) {
            return;
        }
        const chart = new Chart(worldMapRef.current!.getContext("2d")!, {
            type: "choropleth" as any,
            data: {
                labels: countries.map((d: any) => d.properties.name),
                datasets: [{
                    data: countries.map((d: any) => ({ feature: d, value: entries.find(entry => entry.title === d.properties.name)?.value ?? 0 })),
                }],
            },
            options: {
                showOutline: true,
                showGraticule: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                return chartLabelFormatter(context.raw.feature.properties.name, context.raw.value);
                            },
                        },
                    },
                },
                scales: {
                    xy: {
                        projection: "naturalEarth1",
                    },
                },
            },
        });
        return () => chart.destroy();
    }, [worldMapRef, countries, entries, chartLabelFormatter]);
    
    return (
        <div className="SummaryTableWithChart">
            <table>
                <colgroup>
                    {columns.map(column => <col key={column.id} style={{ width: column.width }} />)}
                </colgroup>
                <thead>
                    <tr>
                        {columns.map(column => <th key={column.id} className={column.alignHeader}>{column.header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {entries.map(entry => (
                        <tr key={entry.id}>
                            {columns.map(column => (
                                <td key={column.id} className={column.alignContent}>
                                    {column.renderContent(entry)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        {columns.map(column => (
                            <td key={column.id} className={column.alignContent}>
                                {column.renderContent(footer)}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
            <div className="chart-container chart-container--medium">
                <Pie options={chartOptions} data={chartData} />
            </div>
            {props.withWorldMap && (
                <div className="chart-container chart-container--large">
                    <canvas ref={worldMapRef}></canvas>
                </div>
            )}
        </div>
    );
}

function getDefaultColumns(totalValue: number, mainCurrencyId: WalletsTypes.data.currency.Id, tableElementTextResolver: TableElementTextResolver): Column[] {
    return [
        {
            id: "name",
            header: tableElementTextResolver("name"),
            width: "auto",
            alignHeader: "left",
            alignContent: "left",
            renderContent: entry => {
                return (<>{entry.title}</>);
            },
        },
        {
            id: "currentValue",
            header: tableElementTextResolver("currentValue"),
            width: "200px",
            alignHeader: "right",
            alignContent: "right",
            renderContent: entry => {
                return (<NumberView num={entry.value} currency={mainCurrencyId} />);
            },
        },
        {
            id: "currentValueShare",
            header: tableElementTextResolver("currentValueShare"),
            width: "150px",
            alignHeader: "right",
            alignContent: "right",
            renderContent: entry => {
                return (<NumberView num={totalValue === 0 ? 0 : (entry.value / totalValue * 100)} suffix={"%"} precision={2} />);
            },
        },
    ];
}

function getDefaultFooter(totalValue: number, tableElementTextResolver: TableElementTextResolver): Entry {
    return {
        id: "footer",
        title: tableElementTextResolver("total"),
        value: totalValue,
    };
}

function getDefaultChartLabelFormatter(totalValue: number, mainCurrencyId: WalletsTypes.data.currency.Id): ChartLabelFormatter {
    return (label, value) => {
        const sharePercent = totalValue === 0 ? 0 : (value / totalValue * 100);
        const sharePercentStr = sharePercent.toFixed(2) + "%";
        const formattedValue = Utils.formatNumber({
            num: value,
        });
        return ` ${label}: ${formattedValue} ${mainCurrencyId} (${sharePercentStr})`;
    };
}
