import "./SidebarNavLink.scss";

import { useCallback } from "react";
import { Link, LinkProps, useMatch, useResolvedPath } from "react-router-dom";





export interface SidebarNavLinkProps extends LinkProps {
    onClick?: () => void;
    matchWholePath?: boolean;
}

export function SidebarNavLink({ children, to, matchWholePath, ...props }: SidebarNavLinkProps) {
    const onClick = props.onClick;
    
    const resolvedPath = useResolvedPath(to);
    const pathMatch = useMatch({ path: resolvedPath.pathname, end: !!matchWholePath });
    
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (onClick) {
            e.stopPropagation();
            e.preventDefault();
            onClick();
        }
    }, [onClick]);
    
    return (
        <div>
            <Link
                to={to}
                {...props}
                onClick={handleClick}
                className={`SidebarNavLink ${pathMatch ? "SidebarNavLink--active" : "SidebarNavLink--inactive"}`}
            >
                {children}
            </Link>
        </div>
    );
}
