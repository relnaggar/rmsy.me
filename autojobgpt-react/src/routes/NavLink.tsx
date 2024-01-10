import React from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";


interface NavLinkProps extends Omit<LinkProps, "className" | "aria-current"> {
  to: string,
  navLink?: boolean,
  className?: string,
};

const NavLink = ({
  children, ...props
}: React.PropsWithChildren<NavLinkProps>) => {
  const { navLink = true } = props;

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