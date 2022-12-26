import "./PageContent.scss";

import React from "react";





export interface PageContentProps extends React.PropsWithChildren {
}

export function PageContent(props: PageContentProps) {
    return (
        <div className="PageContent">
            {props.children}
        </div>
    );
}
