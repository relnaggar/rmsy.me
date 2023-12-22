import React from "react";

import InputModal, { CommonInputModalProps, CommonModalProps } from "./InputModal";
import { UseResource } from "../hooks/useResource";
import { WithId } from "../api/types";


export interface EditResourceModalProps<Resource extends WithId> extends CommonModalProps, CommonEditModalProps<Resource> {};

export interface CommonEditModalProps<Resource extends WithId> extends
  Pick<UseResource<Resource, never>, "apiPath" | "resources" | "setResources">
{
  editId: number,
}

interface EditModalProps extends CommonInputModalProps {};

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