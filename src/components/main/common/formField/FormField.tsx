import "./FormField.scss";





type FormFieldType = "default" | "buttons";

export interface FormFieldProps extends React.PropsWithChildren {
    className?: string;
    title?: string;
    description?: string;
    type?: FormFieldType;
}

export function FormField(props: FormFieldProps) {
    return (
        <div className={`FormField FormField--${props.type ?? "default"} ${props.className ?? ""}`}>
            <div className="FormField-info">
                <div className="FormField-title">{props.title}</div>
                <div className="FormField-description">{props.description}</div>
            </div>
            <div className="FormField-input">
                {props.children}
            </div>
        </div>
    );
}
