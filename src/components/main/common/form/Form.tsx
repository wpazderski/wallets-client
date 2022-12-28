import "./Form.scss";

import { useCallback } from "react";





export interface FormProps extends React.PropsWithChildren {
    onSubmit?: (e: React.FormEvent) => void;
}

export function Form(props: FormProps) {
    const onSubmit = props.onSubmit;
    
    const handleSubmit = useCallback((event: React.FormEvent) => {
        if (onSubmit) {
            onSubmit(event);
        }
    }, [onSubmit]);
    
    return (
        <div className="Form">
            <form onSubmit={handleSubmit}>
                {props.children}
            </form>
        </div>
    );
}
