import React from "react";

import InputModal, { InputModalMixin, ModalMixin } from "./InputModal";
import { UseResource } from "../hooks/useResource";
import { WithId } from "../api/types";


export interface EditResourceMixin<Resource extends WithId> extends
  Pick<UseResource<Resource, never>, "apiPath" | "resources" | "setResources">
{
  editId: number,
}

export interface EditResourceModalProps<Resource extends WithId> extends ModalMixin, EditResourceMixin<Resource> {};

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