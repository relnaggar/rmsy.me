import React from "react";

import { UsePostResource } from "../hooks/usePostResource";
import { CommonErrorAlertProps } from "./ErrorAlert";
import InputModal, { CommonModalProps, CommonInputModalProps } from "./InputModal";


export interface AddResourceModalProps<ResourceUpload> extends CommonAddModalProps,
  Pick<UsePostResource<ResourceUpload>, "postResource"> {};

export interface CommonAddModalProps extends CommonModalProps, CommonErrorAlertProps {};

interface AddModalProps extends CommonInputModalProps, CommonErrorAlertProps {
  onSubmit?: () => void,
  onValidatedSubmit: () => void,
  submitDisabled?: boolean,
  validateSubmit: () => boolean,
};

const AddModal = ({
  modalId, title, show, setShow,
  size = undefined,
  errors, setErrors, showErrorAlert, setShowErrorAlert,  
  onSubmit = () => {},
  onValidatedSubmit,
  submitDisabled = false,
  validateSubmit,
  onEntered = () => {},
  children,
}: React.PropsWithChildren<AddModalProps>): React.JSX.Element => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault(); // prevent page from reloading

    setErrors({});
    setShowErrorAlert(false);
    onSubmit?.();

    if (validateSubmit()) {
      onValidatedSubmit();
      setShow(false);
    }
  };

  return (
    <InputModal
      title={title} modalId={modalId} show={show} setShow={setShow} size={size}
      handleSubmit={handleSubmit} submitDisabled={submitDisabled} onEntered={onEntered}
      errors={errors} showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
    >
      {children}
    </InputModal>
  );
};

export default AddModal;