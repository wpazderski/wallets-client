import "./DateTime.scss";

export interface DateTimeProps {
    showDate?: boolean;
    showTime?: boolean;
    showMsec?: boolean;
    timestamp: number;
}

export function DateTime(props: DateTimeProps) {
    let displayedStr: string;
    if (props.timestamp === 0) {
        displayedStr = "-";
    }
    else {
        const dt = new Date(props.timestamp);
        let displayedElements: string[] = [];
        if (props.showDate) {
            displayedElements.push(`${formatInt(dt.getDate(), 2)}.${formatInt(dt.getMonth() + 1, 2)}.${formatInt(dt.getFullYear(), 4)}`);
        }
        if (props.showTime) {
            let str = `${formatInt(dt.getHours(), 2)}:${formatInt(dt.getMinutes(), 2)}:${formatInt(dt.getSeconds(), 2)}`;
            if (props.showMsec) {
                str += `.${formatInt(dt.getMilliseconds(), 3)}`;
            }
            displayedElements.push(str);
        }
        displayedStr = displayedElements.join(" ");
    }
    
    return (
        <span className="DateTime">{displayedStr}</span>
    );
}

function formatInt(value: number, digits: number): string {
    return value.toString().padStart(digits, "0");
}
