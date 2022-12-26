import "./SidebarNavLink.scss";

import { useCallback } from "react";
import { Link, LinkProps, useMatch, useResolvedPath } from "react-router-dom";





export interface SidebarNavLinkProps extends LinkProps {
    onClick?: () => void;
    matchWholePath?: boolean;
}

export function SidebarNavLink({ children, to, matchWholePath, ...props }: SidebarNavLinkProps) {
    const onClick = props.onClick;
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (onClick) {
            e.stopPropagation();
            e.preventDefault();
            onClick();
        }
    }, [onClick]);
    const resolved = useResolvedPath(to);
    const match = useMatch({ path: resolved.pathname, end: !!matchWholePath });
    
    return (
        <div>
            <Link
                to={to}
                {...props}
                onClick={handleClick}
                className={`SidebarNavLink ${match ? "SidebarNavLink--active" : "SidebarNavLink--inactive"}`}
            >
                {children}
            </Link>
        </div>
    );
}
