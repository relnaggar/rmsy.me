import { useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import usePost from "./usePost";
import { UseErrorAlert } from "./useErrorAlert";
import { LoginResponse } from "../api/types";


const routesRequiringLogin = [
  "/jobs",
  "/resumes",
  "/coverLetters",
];

const routesRequiringLogout = [
  "/login",
  "/signup",
];

interface UseAuthControl {
  loggedIn: boolean,
  logout: () => void,
  loggingOut: boolean,
  login: (username: string, password: string) => void,
  loggingIn: boolean,
};

interface UseAuthControlParams extends UseErrorAlert {};

const useAuthControl = (params?: UseAuthControlParams): UseAuthControl => {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = localStorage.getItem("token") !== null;

  useEffect(() => {
    if (!loggedIn && routesRequiringLogin.includes(location.pathname)) {
      navigate("/login");
    } else if (loggedIn && routesRequiringLogout.includes(location.pathname)) {
      navigate("/jobs");
    }
  }, [loggedIn, navigate, location]);

  const onLogoutSuccess = (): void => {
    localStorage.removeItem("token");
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const { posting: loggingOut, post: logout } = usePost({
    apiPath: "logout/",
    onSuccess: onLogoutSuccess,
    onFail: params?.showErrors,
    responseType: "none",
  });

  const onLoginSuccess = (responseData: LoginResponse): void => {
    localStorage.setItem("token", responseData.token);
    navigate("/jobs");
  };

  const handleFail = (errors: Record<string,string[]>) => {   
    params?.setErrors(errors);
    if (errors["error"]) {
      params?.setShowErrorAlert(true);
    }
  };

  const { posting: loggingIn, post: doLogin } = usePost<LoginResponse>({
    apiPath: "login/",
    onSuccess: onLoginSuccess,
    onFail: handleFail,
  });

  const login = useCallback((username: string, password: string): void => {
    params?.clearErrors();
    doLogin({postData: {username, password}});
  }, [doLogin, params]);

  return { loggedIn, logout, loggingOut, login, loggingIn};
};

export default useAuthControl;