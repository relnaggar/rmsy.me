import React, { createContext, useState } from "react";
import { Outlet, Link } from "react-router-dom";

import useFetch from "../hooks/useFetch";
import useErrorAlert from "../hooks/useErrorAlert";
import ConfirmationModal from "../common/ConfirmationModal";
import ErrorAlert from "../common/ErrorAlert";


export const ConfirmationModalContext = createContext<
  (action: () => void, actionDescription: string, actionVerb: string) => void
>(() => {});

export const CSRFTokenContext = createContext<string>("");

interface WithCsrfToken {
  csrfToken: string,
};

const Layout = (): React.JSX.Element => {
  const errorAlert = useErrorAlert();

  const { responseData, fetching: fetchingCsrfToken} = useFetch<WithCsrfToken>("csrf/", {
    initialData: { csrfToken: ""},
    onFail: errorAlert.showErrors,
    includeAuthorisationToken: false,
  }, {
    credentials: "include",
  });

  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => () => {});
  const [confirmationActionDescription, setConfirmationActionDescription] = useState<string>("");
  const [confirmationActionVerb, setConfirmationActionVerb] = useState<string>("");

  const openConfirmationModal = (action: () => void, actionDescription: string, actionVerb: string): void => {
    setConfirmationAction(() => action);
    setConfirmationActionDescription(actionDescription);
    setConfirmationActionVerb(actionVerb);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container">
      <nav className="navbar navbar-expand-sm bg-body-tertiary">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">AutoJobGPT</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-between" id="navbarSupportedContent">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/jobs" className="nav-link">Jobs</Link>
              </li>
              <li className="nav-item">
                <Link to="/resumes" className="nav-link">Resumes</Link>
              </li>
              <li className="nav-item">
                <Link to="/coverLetters" className="nav-link">Cover Letters</Link>
              </li>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item">
                <a href="/autojobgpt/api" className="nav-link">API</a>
              </li>
              <li className="nav-item">
                <a href="/autojobgpt/admin" className="nav-link">Admin</a>
              </li>
            </ul>
          </div>
        </div>        
      </nav>

      { fetchingCsrfToken ?
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border" role="status" aria-label="Loading Page">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      :
        <main className="mt-3">
          { Object.keys(errorAlert.errors).length === 0 ?      
            <>
              <CSRFTokenContext.Provider value={responseData.csrfToken}>
                <ConfirmationModalContext.Provider value={openConfirmationModal}>
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
            </>
          :
            <ErrorAlert {...errorAlert} />
          }
        </main>
      }
    </div>
  )
};

export default Layout;