import { useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useFetch from "./useFetch";
import { IsLoggedInResponse } from "../api/types";
import { localIsLoggedIn, localGetUsername, localLogout } from "../common/localStorage";


const routesRequiringLogin = [
  "/jobs",
  "/resumes",
  "/coverLetters",
];

const routesRequiringLogout = [
  "/login",
  "/signup",
];

const useAuthenticate = (): void => {
  const navigate = useNavigate();
  const location = useLocation();

  const notLoggedIn = useCallback((): void => {
    localLogout();
    if (routesRequiringLogin.includes(location.pathname)) {
      navigate("/login");
    }
  }, [navigate, location.pathname]);

  const handleIsLoggedInSuccess = useCallback((responseData: IsLoggedInResponse): void => {
    const loggedIn = responseData.loggedIn && localIsLoggedIn() && responseData.username === localGetUsername();
    if (loggedIn) {
      if (routesRequiringLogout.includes(location.pathname)) {
        navigate("/jobs");
      }
    } else {
      notLoggedIn();
    }
  }, [navigate, location.pathname, notLoggedIn]);

  const { refetch: reauthenticate } = useFetch<IsLoggedInResponse>("users/isLoggedIn/", {
    onSuccess: handleIsLoggedInSuccess,
    onFail: notLoggedIn,
    includeAuthorisationToken: false,
    initialFetch: false,
    cancelable: false,
  }, {
    credentials: "include",
  });

  useEffect(() => {
    reauthenticate();
  }, [location.pathname, reauthenticate]);
};

export default useAuthenticate;