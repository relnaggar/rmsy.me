import React, { useState, useCallback } from "react";

import useErrorAlert, { ErrorAlertMixin } from "./useErrorAlert";


interface UseAddModal extends ErrorAlertMixin {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  handleAddSuccess: () => void,
  handleAddFail: (errors: Record<string,string[]>) => void,
  open: () => void,
};

const useAddModal = (): UseAddModal => {
  const [show, setShow] = useState<boolean>(false);
  const errorAlert = useErrorAlert();

  const handleAddSuccess = useCallback(() => {
    errorAlert.clearErrors();
  }, [errorAlert]);

  const handleAddFail = useCallback((errors: Record<string,string[]>) => {   
    errorAlert.setErrors(errors);
    if (errors["error"]) {
      errorAlert.setShowErrorAlert(true);
    }
    setShow(true);
  }, [errorAlert]);

  const open = useCallback((): void => {
    setShow(true);
  }, []);

  return {show, setShow, ...errorAlert, handleAddSuccess, handleAddFail, open}
};

export default useAddModal;