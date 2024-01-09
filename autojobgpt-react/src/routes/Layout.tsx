import React, { createContext, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';


import useAuthControl from "../hooks/useAuthControl";
import useFetch from "../hooks/useFetch";
import useErrorAlert from "../hooks/useErrorAlert";
import ConfirmationModal from "../common/ConfirmationModal";
import NavLink from "./NavLink";
import ErrorAlert from "../common/ErrorAlert";
import { CsrfResponse } from "../api/types";


export const ConfirmationModalContext = createContext<
  (action: () => void, actionDescription: string, actionVerb: string) => void
>(() => {});

export const CSRFTokenContext = createContext<string>("");

const Layout = (): React.JSX.Element => {
  const errorAlert = useErrorAlert();
  const { loggedIn, username, logout, loggingOut } = useAuthControl({...errorAlert});

  const { responseData, fetching: fetchingCsrfToken} = useFetch<CsrfResponse>("csrf/", {
    initialData: { csrfToken: "" },
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
    <>
      <div className="container min-vh-100">
        <nav className="navbar navbar-expand-md bg-body-tertiary">
          <div className="container-fluid">
            <Link to="/" className="navbar-brand">AutoJobGPT</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-between" id="navbarSupportedContent">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <NavLink to="/">
                    Home
                  </NavLink>
                </li>
                { loggedIn &&
                  <>
                    <li className="nav-item">
                      <NavLink to="/jobs">
                        Jobs
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/resumes">
                        Resumes
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/coverLetters">
                        Cover Letters
                      </NavLink>
                    </li>
                  </>
                }
              </ul>
              <ul className="navbar-nav align-items-center">
                <li className="nav-item">
                  <a href="/autojobgpt/api" className="nav-link" target="_blank" rel="noopener noreferrer">
                    API <BoxArrowUpRightIcon className="ms-1" />
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/autojobgpt/admin" className="nav-link" target="_blank" rel="noopener noreferrer">
                    Admin <BoxArrowUpRightIcon className="ms-1" />
                  </a>
                </li>
                { loggedIn ?
                  loggingOut ?
                    <li className="nav-item">
                      <button className="nav-link" disabled>
                        <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                        Logging out...
                      </button>
                    </li>
                  :
                    <li className="nav-item dropdown">
                      <button className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        {username}
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <button className="dropdown-item" onClick={logout} disabled={loggingOut}>
                          Logout
                        </button>
                      </ul>
                    </li>
                :
                  <>
                    <li className="nav-item">
                      <NavLink to="/login">
                        Login
                      </NavLink>
                    </li>
                    <li className="nav-item btn btn-success">
                      <NavLink to="/signup" className="text-light">
                        Sign up for free
                      </NavLink>
                    </li>
                  </>
                }
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
      <footer className="text-center mt-5 p-5 bg-body-tertiary">  
        <div className="text-muted">
          <p>
            This application is a demonstration and is provided as-is for illustrative purposes only.
          </p>
          <p>
            Copyright &copy; {new Date().getFullYear()} by Ramsey El-Naggar.
          </p>
        </div>      
        <nav className="navbar navbar-expand">
          <div className="container-fluid justify-content-center">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink to="/legal">
                  Legal
                </NavLink>
              </li>
              <li className="nav-item">
                <a href="/contact" className="nav-link" target="_blank" rel="noopener noreferrer">
                  Contact <BoxArrowUpRightIcon className="ms-1" />
                </a>
              </li>
            </ul>
          </div>
        </nav>        
      </footer>
    </>
  )
};

export default Layout;