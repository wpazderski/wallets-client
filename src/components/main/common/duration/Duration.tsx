import "./Duration.scss";

import { useMemo } from "react";

import { Utils } from "../../../../app";





export interface DurationProps {
    startTimestamp: number;
    endTimestamp: number;
}

export function Duration(props: DurationProps) {
    const displayedStr = useMemo(() => {
        return Utils.formatDuration(props.startTimestamp, props.endTimestamp);
    }, [props.endTimestamp, props.startTimestamp]);
    
    return (
        <span className="Duration">{displayedStr}</span>
    );
}
