import "./Form.scss";

import { FormEvent } from "react";





export interface FormProps extends React.PropsWithChildren {
    onSubmit?: (e: FormEvent) => void;
}

export function Form(props: FormProps) {
    return (
        <div className="Form">
            <form onSubmit={e => props.onSubmit && props.onSubmit(e)}>
                {props.children}
            </form>
        </div>
    );
}
