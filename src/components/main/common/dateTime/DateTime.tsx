import "./DateTime.scss";

import { useMemo } from "react";

import { Utils } from "../../../../app";





export interface DateTimeProps {
    timestamp: number;
    showDate?: boolean;
    showTime?: boolean;
    showMsec?: boolean;
}

export function DateTime(props: DateTimeProps) {
    const dateTimeStr = useMemo(() => {
        return Utils.formatDateTime(props.timestamp, props.showDate, props.showTime, props.showMsec);
    }, [props.showDate, props.showMsec, props.showTime, props.timestamp]);
    
    return (
        <span className="DateTime">{dateTimeStr}</span>
    );
}
