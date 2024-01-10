import React, { useContext } from "react";

import useScrollToTop from "../hooks/useScrollToTop"
import { UsernameContext } from "./Layout";


const AccountPage = (): React.JSX.Element => {
  useScrollToTop();
  const username = useContext(UsernameContext);

  return (
    <section>
      <h2>Account</h2>
      <p className="lead">Manage your account.</p>
      <p>You are currently logged in as <strong>{username}</strong>.</p>
    </section>
  );
};

export default AccountPage;