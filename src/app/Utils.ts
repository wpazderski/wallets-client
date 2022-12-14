import * as WalletsTypes from "@wpazderski/wallets-types";

import { Duration } from "./store";





export interface NumberFormatterProps {
    num: number;
    currency?: WalletsTypes.data.currency.Id | string;
    precision?: number;
    suffix?: string;
}

export class Utils {
    
    static minMax(number: number, min: number, max: number): number {
        return Math.max(Math.min(number, max), min);
    }
    
    static randomInt(minInclusive: number, maxInclusive: number): number {
        const min = Math.ceil(minInclusive);
        const max = Math.floor(maxInclusive);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    static randomString(length: number): string {
        let str: string = "";
        while (str.length < length) {
            str += Math.random().toString(36).substr(2);
        }
        str = str.substring(0, length);
        return str;
    }
    
    static addDuration(timestamp: number, duration: Duration): number {
        const dt = new Date(timestamp);
        const months = this.getDurationMonths(duration);
        dt.setMonth(dt.getMonth() + months);
        return dt.getTime();
    }
    
    static getDurationMonths(duration: Duration): number {
        switch (duration.unit) {
            case "m":
                return duration.num;
            case "y":
                return duration.num * 12;
        }
    }
    
    static areArraysEqual<T>(a: T[], b: T[]): boolean {
        if (a.length !== b.length) {
            return false;
        }
        for (const el of a) {
            if (!b.includes(el)) {
                return false;
            }
        }
        return true;
    }
    
    static formatNumber(props: NumberFormatterProps): string {
        const amountStrs = props.num.toFixed(props.precision ?? 2).split(".");
        const formattedStr = amountStrs[0]!.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (amountStrs[1] ? "." + amountStrs[1] : "") + (props.suffix ?? "") + (props.currency ? " " + props.currency : "");
        return formattedStr;
    }
    
    static formatInt(value: number, digits: number): string {
        return value.toString().padStart(digits, "0");
    }
    
    static formatDateTime(timestamp: number, showDate?: boolean, showTime?: boolean, showMsec?: boolean): string {
        let dateTimeStr: string;
        if (timestamp === 0) {
            dateTimeStr = "-";
        }
        else {
            const dt = new Date(timestamp);
            let displayedElements: string[] = [];
            if (showDate) {
                displayedElements.push(`${this.formatInt(dt.getDate(), 2)}.${this.formatInt(dt.getMonth() + 1, 2)}.${this.formatInt(dt.getFullYear(), 4)}`);
            }
            if (showTime) {
                let str = `${this.formatInt(dt.getHours(), 2)}:${this.formatInt(dt.getMinutes(), 2)}:${this.formatInt(dt.getSeconds(), 2)}`;
                if (showMsec) {
                    str += `.${this.formatInt(dt.getMilliseconds(), 3)}`;
                }
                displayedElements.push(str);
            }
            dateTimeStr = displayedElements.join(" ");
        }
        return dateTimeStr;
    }
    
    static formatDuration(startTimestamp: number, endTimestamp: number): string {
        const start = new Date(startTimestamp);
        const end = new Date(endTimestamp);
        
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        if (days < 0) {
            --months;
            const dt = new Date(end);
            dt.setDate(0);
            days += dt.getDate();
        }
        if (months < 0) {
            --years;
            months += 12;
        }
        
        const parts: string[] = [];
        if (years > 0) {
            parts.push(`${years}y`);
        }
        if (months > 0) {
            parts.push(`${months}m`);
        }
        if (days > 0) {
            parts.push(`${days}d`);
        }
        if (parts.length === 0) {
            parts.push("< 1d");
        }
        
        return parts.join(" ");
    }
    
    
}
