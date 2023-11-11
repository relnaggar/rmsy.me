import React, { createContext, useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";

import { FetchDataContext } from "../routes/routesConfig";
import ConfirmationModal from "../common/ConfirmationModal";


export const ConfirmationModalContext = createContext<{
  setShow: (show: boolean) => void,
  setAction: (action: () => void) => void,
  setActionDescription: (description: string) => void,
  setActionVerb: (verb: string) => void,
}>({
  setShow: () => {},
  setAction: () => {},
  setActionDescription: () => {},
  setActionVerb: () => {},
});

export const CSRFTokenContext = createContext<string>("");

export default function Layout(): React.JSX.Element {
  const fetchData = React.useContext(FetchDataContext);

  const [CSRFToken, setCSRFToken] = useState<string>("");
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => () => {});
  const [confirmationActionDescription, setConfirmationActionDescription] = useState<string>("");
  const [confirmationActionVerb, setConfirmationActionVerb] = useState<string>("");
  
  useEffect(() => {
    async function fetchCSRFToken() {
      await fetchData('../api/csrf/', {
        credentials: 'include',
      })
      .then(response => response.json())
      .then(data => setCSRFToken(data.csrfToken))
      .catch(error => console.error(error));
    }
    fetchCSRFToken();
  }, [fetchData, setCSRFToken]);

  return (
    <div className="container">
      <nav className="navbar navbar-expand bg-body-tertiary">
        <div className="container-fluid justify-content-start">
          <Link to="/" className="navbar-brand">AutoJobGPT</Link>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/jobs" className="nav-link">Jobs</Link>
            </li>
            <li className="nav-item">
              <Link to="/resumes" className="nav-link">Resumes</Link>
            </li>
          </ul>
        </div>
        <ul className="navbar-nav">
          <li className="nav-item">
            <a href="/autojobgpt/api" className="nav-link">API</a>
          </li>
          <li className="nav-item">
          <a href="/autojobgpt/admin" className="nav-link">Admin</a>
          </li>
        </ul>
      </nav>

      <CSRFTokenContext.Provider value={CSRFToken}>
        <ConfirmationModalContext.Provider value={{
          setShow: setShowConfirmationModal,
          setAction: setConfirmationAction,
          setActionDescription: setConfirmationActionDescription,
          setActionVerb: setConfirmationActionVerb,
        }}>
          <Outlet />
        </ConfirmationModalContext.Provider>
      </CSRFTokenContext.Provider>

      <ConfirmationModal
        show={showConfirmationModal}
        setShow={setShowConfirmationModal}
        action={confirmationAction}
        actionDescription={confirmationActionDescription}
        actionVerb={confirmationActionVerb}
      />
    </div>
  )
}