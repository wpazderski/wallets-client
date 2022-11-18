import "./NumberView.scss";

import * as WalletsTypes from "@wpazderski/wallets-types";

import { Utils } from "../../../../app";

export interface NumberViewProps {
    num: number;
    currency?: WalletsTypes.data.currency.Id | string;
    precision?: number;
    suffix?: string;
    className?: string;
}

export function NumberView(props: NumberViewProps) {
    const displayedStr = Utils.formatNumber({
        num: props.num,
        currency: props.currency,
        precision: props.precision,
        suffix: props.suffix,
    });
    
    return (
        <span className={"NumberView" + (props.className ? ` ${props.className}` : "")}>{displayedStr}</span>
    );
}
