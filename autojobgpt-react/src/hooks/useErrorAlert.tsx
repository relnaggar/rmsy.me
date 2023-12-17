import { useState, useCallback } from 'react';

import { ErrorAlertMixin } from "../common/ErrorAlert";


interface UseErrorAlert extends ErrorAlertMixin {  
  clearErrors: () => void,
  showErrors: (errors: Record<string,string[]>) => void,
};

const useErrorAlert = (): UseErrorAlert => {
  const [errors, setErrors] = useState<Record<string,string[]>>({});
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  const clearErrors = useCallback((): void => {
    setErrors({});
    setShowErrorAlert(false);
  }, []);

  const showErrors = useCallback((errors: Record<string,string[]>): void => {
    setErrors(errors);
    setShowErrorAlert(true);
  }, []);

  return { errors, setErrors, showErrorAlert, setShowErrorAlert, clearErrors, showErrors };
};

export default useErrorAlert;