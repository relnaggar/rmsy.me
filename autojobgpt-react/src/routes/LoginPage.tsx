import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import useLogin from '../hooks/useLogin';
import useInputControl from '../hooks/useInputControl';
import useErrorAlert from '../hooks/useErrorAlert';
import BaseInput from '../common/BaseInput';
import ErrorAlert from '../common/ErrorAlert';
import useScrollToTop from '../hooks/useScrollToTop';


const LoginPage = (): React.JSX.Element => {
  useScrollToTop();
  const errorAlert = useErrorAlert();
  const { login, loggingIn } = useLogin({...errorAlert});
  const usernameInput = useInputControl("username");
  const passwordInput = useInputControl("password");

  useEffect(() => {
    usernameInput.ref.current?.focus();
  }, [usernameInput.ref]);

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

    for (const input of [usernameInput, passwordInput]) {
      input.stopEditing();
    }
    errorAlert.setErrors(newErrors);

    if (valid) {
      login(usernameInput.value, passwordInput.value);
    }
  };

  return (
    <section className="d-flex justify-content-center">
      <div className="col-xxl-3 col-xl-4 col-lg-5 col-md-6 col-sm-8 col-10">
        <h2>Log in</h2>
        <p className="lead">Log in to AutoJobGPT.</p>
        <form onSubmit={onSubmit}>
          <BaseInput ref={usernameInput.ref} name={usernameInput.name}
            value={usernameInput.value} editing={usernameInput.editing} handleChange={usernameInput.handleChange}
            label="Username" type="text" errors={errorAlert.errors[usernameInput.name]}
          />
          <BaseInput ref={passwordInput.ref} name={passwordInput.name}
            value={passwordInput.value} editing={passwordInput.editing} handleChange={passwordInput.handleChange}
            label="Password" type="password" errors={errorAlert.errors[passwordInput.name]}
          />
          <ErrorAlert {...{...errorAlert, errors: {
            error: errorAlert.errors["error"],
            non_field_errors: errorAlert.errors["non_field_errors"],
            detail: errorAlert.errors["detail"],
          }}} />
          <button type="submit" className="btn btn-primary" disabled={loggingIn}>
            { loggingIn ? <>
              <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
              Logging in...
            </>:<>
              Log in
            </>}
          </button>
        </form>
        <p className="mt-3">
          No account? <Link to="/signup">Sign up for free</Link>, no email required!
        </p>
      </div>
    </section>
  );
};

export default LoginPage;