import React from "react";

import InputModal, { InputModalMixin, ModalMixin } from "./InputModal";
import { WithId } from "../api/types";


export interface EditResourceModalProps<Resource extends WithId> extends ModalMixin {
  apiPath: string,
  resourceId: number,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
};

interface EditModalProps extends InputModalMixin {};

const EditModal = ({
  modalId, title, show, setShow,
  size = undefined,  
  children,
}: React.PropsWithChildren<EditModalProps>): React.JSX.Element => {
  return (
    <InputModal modalId={modalId} title={title} show={show} setShow={setShow} size={size}>
      {children}
    </InputModal>
  );
};

export default EditModal;