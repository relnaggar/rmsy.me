import React from "react";
import { Link, useLocation } from "react-router-dom";


interface NavLinkProps {
  to: string,
}

const NavLink = ({
  children, ...props
}: React.PropsWithChildren<NavLinkProps>) => {
  const { pathname } = useLocation();
  const isActive = pathname === props.to;

  return (
    <Link
      {...props}
      className={`nav-link ${isActive ? " active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export default NavLink;