import "./PageHeader.scss";

export interface PageHeaderProps {
    title: string;
    icon: React.ReactNode;
}

export function PageHeader(props: PageHeaderProps) {
    return (
        <h2 className="PageHeader">
            <span className="PageHeader__icon">
                {props.icon}
            </span>
            <span className="PageHeader__title">
                {props.title}
            </span>
        </h2>
    );
}
