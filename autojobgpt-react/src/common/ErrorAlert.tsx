import React from 'react';
import BootstrapAlert from 'react-bootstrap/Alert';

import { ErrorAlertMixin } from '../hooks/useErrorAlert';


interface ErrorAlertProps extends Omit<ErrorAlertMixin, "setErrors"> {};

const ErrorAlert = ({
  errors,
  showErrorAlert,
  setShowErrorAlert,  
}: ErrorAlertProps): React.JSX.Element => {
  const numErrors: number = Object.keys(errors).length;

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