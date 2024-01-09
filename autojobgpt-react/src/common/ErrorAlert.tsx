import React from 'react';
import BootstrapAlert from 'react-bootstrap/Alert';


export interface CommonErrorAlertProps {
  errors: Record<string,string[]>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string,string[]>>>,
  showErrorAlert: boolean,
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>,
};

interface ErrorAlertProps extends Omit<CommonErrorAlertProps, "setErrors"> {};

const ErrorAlert = ({
  errors,
  showErrorAlert,
  setShowErrorAlert,  
}: ErrorAlertProps): React.JSX.Element => {
  if (errors["detail"]) {
    errors["detail"] = [errors["detail"] as unknown as string];
  }
  errors = Object.fromEntries(Object.entries(errors).filter(([_, value]) => value !== undefined));

  const numErrors: number = Object.entries(errors).length;

  const handleDismiss = (): void => {
    setShowErrorAlert(false);
  };

  return (
    <BootstrapAlert variant="danger" className="w-100" show={showErrorAlert} onClose={handleDismiss} dismissible>
      { numErrors === 1 ?
        Object.values(errors)[0]
      :
        <ul>
          {Object.entries(errors).map(([key, value]) => (
            <li key={key}>{value}</li>
          ))}
        </ul>
      }
    </BootstrapAlert>
  );
};

export default ErrorAlert;