import React from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";


interface NavLinkProps extends Omit<LinkProps, "className" | "aria-current"> {
  to: string,
  className?: string,
};

const NavLink = ({
  children, ...props
}: React.PropsWithChildren<NavLinkProps>) => {
  const { pathname } = useLocation();
  const isActive = pathname === props.to;

  return (
    <Link
      {...props}
      className={`nav-link${props.className ? ` ${props.className}` : ""}${isActive ? " active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export default NavLink;