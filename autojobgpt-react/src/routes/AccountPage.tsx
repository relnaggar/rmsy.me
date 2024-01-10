import React, { useContext } from "react";
import { ReactComponent as TrashIcon } from 'bootstrap-icons/icons/trash.svg';

import useScrollToTop from "../hooks/useScrollToTop"
import useErrorAlert from "../hooks/useErrorAlert";
import useDelete from "../hooks/useDelete";
import useLogout from "../hooks/useLogout";
import { ConfirmationModalContext, UsernameContext } from "./Layout";
import ErrorAlert from "../common/ErrorAlert";


const AccountPage = (): React.JSX.Element => {
  useScrollToTop();
  const username = useContext(UsernameContext);
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const { logout, loggingOut } = useLogout();
  const errorAlert = useErrorAlert();

  const { doDelete, deleting } = useDelete(`users/${username}/`, {
    onSuccess: () => logout(),
    onFail: errorAlert.showErrors
  });

  const handleClickDelete = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    openConfirmationModal(() => doDelete(), "delete your account", "Delete");
  }

  return (
    <section>
      <h2>Account</h2>
      <p className="lead">Manage your account.</p>
      <p>You are currently logged in as <strong>{username}</strong>.</p>
      <hr />
      { username !== "root" &&
        <>
          <h3>Danger Zone</h3>
          <p>Click the button below to delete your account and all associated data, including jobs, templates, resumes, and cover letters.</p>
          <button
            className="btn btn-danger"
            onClick={handleClickDelete}
            disabled={deleting}
          >
            { deleting || loggingOut ?
              <>
                <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                Bye...
              </>
            :
              <>
                Delete Account <TrashIcon className="ms-1" />
              </>
            }
          </button>
          <ErrorAlert {...errorAlert} />
        </>
      }
    </section>
  );
};

export default AccountPage;