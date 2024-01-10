import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import usePost from "./usePost";
import { UseErrorAlert } from "./useErrorAlert";
import { localLogout } from "../common/localStorage";


interface UseLogout {
  logout: () => void,
  loggingOut: boolean,
};

interface UseLogoutParams extends UseErrorAlert {};

const useLogout = (params?: UseLogoutParams): UseLogout => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutSuccess = useCallback((): void => {
    localLogout();
    if (location.pathname !== "/") {
      navigate("/");
    }
  }, [navigate, location.pathname]);

  const { posting: loggingOut, post: logout } = usePost({
    apiPath: "users/logout/",
    onSuccess: handleLogoutSuccess,
    onFail: params?.showErrors,
    responseType: "none",
  });

  return { logout, loggingOut };
};

export default useLogout;