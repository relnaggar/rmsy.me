import React from "react";

import { UsePostResource } from "../hooks/usePostResource";
import { ErrorAlertMixin } from "./ErrorAlert";
import InputModal, { ModalMixin, InputModalMixin } from "./InputModal";


export interface AddResourceModalProps<ResourceUpload> extends AddModalMixin,
  Pick<UsePostResource<ResourceUpload>, "postResource"> {};

export interface AddModalMixin extends ModalMixin, ErrorAlertMixin {};

interface AddModalProps extends InputModalMixin, ErrorAlertMixin {
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
      handleSubmit={handleSubmit} submitDisabled={submitDisabled}
      errors={errors} showErrorAlert={showErrorAlert} setShowErrorAlert={setShowErrorAlert}
    >
      {children}
    </InputModal>
  );
};

export default AddModal;