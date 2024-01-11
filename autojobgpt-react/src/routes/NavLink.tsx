import React from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";


interface NavLinkProps extends Omit<LinkProps, "className" | "aria-current"> {
  navLink?: boolean,
  to: string,  
  className?: string,
};

const NavLink = ({  
  navLink = true,
  children,
  ...props
}: React.PropsWithChildren<NavLinkProps>) => {
  const { pathname } = useLocation();
  const isActive = pathname === props.to;

  return (
    <Link
      {...props}
      className={`${navLink ? "nav-link" : ""}${props.className ? ` ${props.className}` : ""}${isActive && navLink ? " active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export default NavLink;