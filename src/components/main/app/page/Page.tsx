import "./Page.scss";

import React from "react";





export interface PageProps extends React.PropsWithChildren {
    className: string;
}

export function Page(props: PageProps) {
    return (
        <div className={`Page ${props.className}`}>
            {props.children}
        </div>
    );
}
