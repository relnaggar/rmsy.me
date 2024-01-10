import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import usePost from "./usePost";
import { localLogout } from "../common/localStorage";


interface UseLogout {
  logout: () => void,
  loggingOut: boolean,
};

const useLogout = (): UseLogout => {
  const navigate = useNavigate();
  const location = useLocation();

  const doLogout = useCallback((): void => {
    localLogout();
    if (location.pathname !== "/") {
      navigate("/");
    }
  }, [navigate, location.pathname]);

  const { posting: loggingOut, post: logout } = usePost({
    apiPath: "users/logout/",
    onSuccess: doLogout,
    onFail: doLogout,
    responseType: "none",
  });

  return { logout, loggingOut };
};

export default useLogout;