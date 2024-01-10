import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import usePost from "./usePost";
import { UseErrorAlert } from "./useErrorAlert";
import { LoginResponse } from "../api/types";
import { localLogin } from "../common/localStorage";


interface UseLogin {
  login: (username: string, password: string) => void,
  loggingIn: boolean,
};

interface UseLoginParams extends UseErrorAlert {};

const useLogin = (params?: UseLoginParams): UseLogin => {
  const navigate = useNavigate();

  const handleLoginSuccess = (responseData: LoginResponse): void => {
    localLogin(responseData.username, responseData.token);
    navigate("/jobs");
  };

  const handleFail = useCallback((errors: Record<string,string[]>) => {   
    params?.setErrors(errors);
    if (errors["error"] || errors["non_field_errors"] || errors["detail"]) {
      params?.setShowErrorAlert(true);
    }
  }, [params]);

  const { posting: loggingIn, post: doLogin } = usePost<LoginResponse>({
    apiPath: "users/login/",
    onSuccess: handleLoginSuccess,
    onFail: handleFail,
  });

  const login = useCallback((username: string, password: string): void => {
    params?.clearErrors();
    doLogin({postData: {username, password}});
  }, [doLogin, params]);

  return { login, loggingIn };
};

export default useLogin;