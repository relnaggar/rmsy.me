import React, { createContext, useContext, useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";

import useAPI from "../hooks/useAPI";
import { FetchDataContext } from "../routes/routesConfig";
import ConfirmationModal from "../common/ConfirmationModal";


export const ConfirmationModalContext = createContext<
  (action: () => void, actionDescription: string, actionVerb: string) => void
>(() => {});

export const CSRFTokenContext = createContext<string>("");

export default function Layout(): React.JSX.Element {
  const apiRoute: string = useAPI();
  const fetchData = useContext(FetchDataContext);    
  const [csrfToken, setCsrfToken] = useState<string>("");  
  
  useEffect(() => {
    async function fetchCSRFToken() {
      await fetchData(`${apiRoute}csrf/`, {
        credentials: "include",
      })
      .then(response => response.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(error => console.error(error));
    }
    fetchCSRFToken();
  }, [fetchData, apiRoute, setCsrfToken]);

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => () => {});
  const [confirmationActionDescription, setConfirmationActionDescription] = useState<string>("");
  const [confirmationActionVerb, setConfirmationActionVerb] = useState<string>("");

  function openConfirmationModal(action: () => void, actionDescription: string, actionVerb: string): void {
    setConfirmationAction(() => action);
    setConfirmationActionDescription(actionDescription);
    setConfirmationActionVerb(actionVerb);
    setShowConfirmationModal(true);
  }

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

      <CSRFTokenContext.Provider value={csrfToken}>
        <ConfirmationModalContext.Provider value={openConfirmationModal}>
          {csrfToken === "" ?
            <div className="position-fixed top-50 start-50 translate-middle">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          :
            <Outlet />
          }
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