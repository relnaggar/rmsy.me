import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BootstrapAlert from 'react-bootstrap/Alert';
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';

import useInputControl from '../hooks/useInputControl';
import useErrorAlert from '../hooks/useErrorAlert';
import BaseInput from '../common/BaseInput';
import ErrorAlert from '../common/ErrorAlert';
import usePost from '../hooks/usePost';


const SignupPage = (): React.JSX.Element => {
  const errorAlert = useErrorAlert();
  const usernameInput = useInputControl("username");
  const passwordInput = useInputControl("password");
  const agreeInput = useInputControl("agree", "false");

  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);

  const handleDismissSuccessAlert = (): void => {
    setShowSuccessAlert(false);
  };

  useEffect(() => {
    usernameInput.ref.current?.focus();
  }, [usernameInput.ref]);

  const handleSuccess = useCallback(() => {
    setShowSuccessAlert(true);
    usernameInput.edit("");
    passwordInput.edit("");
  }, [usernameInput, passwordInput]);

  const handleFail = useCallback((errors: Record<string,string[]>) => {   
    errorAlert.setErrors(errors);
    if (errors["error"] || errors["non_field_errors"] || errors["detail"]) {
      errorAlert.setShowErrorAlert(true);
    }
  }, [errorAlert]);

  const { post: signup, posting: signingUp } = usePost({
    apiPath: "users/",
    onSuccess: handleSuccess,
    onFail: handleFail,
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    let valid = true;
    const newErrors: Record<string,string[]> = {};

    if (usernameInput.value === "") {
      newErrors[usernameInput.name] = ["Username is required."];
      valid = false;
    }
    if (passwordInput.value === "") {
      newErrors[passwordInput.name] = ["Password is required."];
      valid = false;
    }
    if (agreeInput.value === "false") {
      newErrors[agreeInput.name] = ["In order to sign up, you must agree to the Terms of Service and Privacy Policy."];
      valid = false;
    }

    for (const input of [usernameInput, passwordInput, agreeInput]) {
      input.stopEditing();
    }
    errorAlert.setErrors(newErrors);

    if (valid) {
      signup({ postData: { username: usernameInput.value, password: passwordInput.value, agree: agreeInput.value === "true" } });
    }
  };

  return (
    <section className="d-flex justify-content-center">
      <div className="col-xxl-3 col-xl-4 col-lg-5 col-md-6 col-sm-8 col-10">
        <h2>Sign up</h2>
        <p className="lead">Sign up for AutoJobGPT.</p>
        { showSuccessAlert ?
          <BootstrapAlert
            variant="success" className="w-100" dismissible
            show={showSuccessAlert} onClose={handleDismissSuccessAlert}
          >
            <p>
              Your account has been created! <Link to="/login">Log in here</Link>.
            </p>
          </BootstrapAlert>
        : <>
            <form onSubmit={onSubmit}>
              <BaseInput ref={usernameInput.ref} name={usernameInput.name}
                value={usernameInput.value} editing={usernameInput.editing} handleChange={usernameInput.handleChange}
                label="Username" type="text" errors={errorAlert.errors[usernameInput.name]}
              />
              <BaseInput ref={passwordInput.ref} name={passwordInput.name}
                value={passwordInput.value} editing={passwordInput.editing} handleChange={passwordInput.handleChange}
                label="Password" type="password" errors={errorAlert.errors[passwordInput.name]}
              />
              <BaseInput ref={agreeInput.ref} name={agreeInput.name}
                value={agreeInput.value} editing={agreeInput.editing} handleChange={agreeInput.handleChange}
                label={<>I agree to the <Link to="/legal" target="_blank" rel="noopener noreferrer">Terms of Service and Privacy Policy</Link> <BoxArrowUpRightIcon className="ms-1" /></>}
                type="checkbox" errors={errorAlert.errors[agreeInput.name]}
              />
              <ErrorAlert {...{...errorAlert, errors: {
                error: errorAlert.errors["error"],
                non_field_errors: errorAlert.errors["non_field_errors"],
                detail: errorAlert.errors["detail"],
              }}} />
              <button type="submit" className="btn btn-primary" disabled={signingUp}>
                { signingUp ? <>
                  <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                  Signing up...
                </>:<>
                  Sign up
                </>}
              </button>
            </form>
            <p className="mt-3">
              Already have an account? <Link to="/login">Log in here</Link>.
            </p>
          </>
        }        
      </div>
    </section>
  );
};

export default SignupPage;