import "./Duration.scss";





export interface DurationProps {
    startTimestamp: number;
    endTimestamp: number;
}

export function Duration(props: DurationProps) {
    const displayedStr = getDurationStr(props.startTimestamp, props.endTimestamp);
    
    return (
        <span className="Duration">{displayedStr}</span>
    );
}

function getDurationStr(startTimestamp: number, endTimestamp: number): string {
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
