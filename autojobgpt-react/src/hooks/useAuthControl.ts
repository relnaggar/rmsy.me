import { useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useFetch from "./useFetch";
import usePost from "./usePost";
import { UseErrorAlert } from "./useErrorAlert";
import { LoginResponse, IsLoggedInResponse } from "../api/types";


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
  username: string,
  logout: () => void,
  loggingOut: boolean,
  login: (username: string, password: string) => void,
  loggingIn: boolean,
};

interface UseAuthControlParams extends UseErrorAlert {};

const localLogout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
};

const localLogin = (username: string, token: string): void => {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
};

const localIsLoggedIn = (): boolean => {
  return localStorage.getItem("token") !== null && localStorage.getItem("username") !== null;
};

const localGetUsername = (): string => {
  return localStorage.getItem("username") || "";
}

const useAuthControl = (params?: UseAuthControlParams): UseAuthControl => {
  const navigate = useNavigate();
  const location = useLocation();

  const onNotLoggedIn = useCallback((): void => {
    localLogout();
    if (routesRequiringLogin.includes(location.pathname)) {
      navigate("/login");
    }
  }, [navigate, location.pathname]);

  const onIsLoggedInSuccess = useCallback((responseData: IsLoggedInResponse): void => {
    const loggedIn = responseData.loggedIn && localIsLoggedIn() && responseData.username === localGetUsername();
    if (loggedIn) {
      if (routesRequiringLogout.includes(location.pathname)) {
        navigate("/jobs");
      }
    } else {
      onNotLoggedIn();
    }
  }, [navigate, location.pathname, onNotLoggedIn]);

  const { refetch: reauthenticate } = useFetch<IsLoggedInResponse>("users/isLoggedIn/", {
    onSuccess: onIsLoggedInSuccess,
    onFail: onNotLoggedIn,
    includeAuthorisationToken: false,
  }, {
    credentials: "include",
  });

  useEffect(() => {
    reauthenticate();
  }, [location.pathname, reauthenticate]);

  const onLogoutSuccess = (): void => {
    localLogout();
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const { posting: loggingOut, post: logout } = usePost({
    apiPath: "users/logout/",
    onSuccess: onLogoutSuccess,
    onFail: params?.showErrors,
    responseType: "none",
  });

  const onLoginSuccess = (responseData: LoginResponse): void => {
    localLogin(responseData.username, responseData.token);
    navigate("/jobs");
  };

  const handleFail = (errors: Record<string,string[]>) => {   
    params?.setErrors(errors);
    if (errors["error"]) {
      params?.setShowErrorAlert(true);
    }
  };

  const { posting: loggingIn, post: doLogin } = usePost<LoginResponse>({
    apiPath: "users/login/",
    onSuccess: onLoginSuccess,
    onFail: handleFail,
  });

  const login = useCallback((username: string, password: string): void => {
    params?.clearErrors();
    doLogin({postData: {username, password}});
  }, [doLogin, params]);

  return { loggedIn: localIsLoggedIn(), username: localGetUsername(), logout, loggingOut, login, loggingIn };
};

export default useAuthControl;