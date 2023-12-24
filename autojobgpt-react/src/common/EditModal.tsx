import React from "react";

import InputModal, { CommonInputModalProps, CommonModalProps, InputModalProps } from "./InputModal";
import { UseResource } from "../hooks/useResource";
import { WithId } from "../api/types";


export interface EditResourceModalProps<Resource extends WithId> extends CommonModalProps, CommonEditModalProps<Resource> {};

export interface CommonEditModalProps<Resource extends WithId> extends
  Pick<UseResource<Resource, never>, "apiPath" | "resources" | "setResources">
{
  editId: number,
}

interface EditModalProps extends CommonInputModalProps, Pick<InputModalProps, "footerButton"> {};

const EditModal = ({
  modalId, title, show, setShow,
  size = undefined,  
  footerButton = <></>,
  children,
}: React.PropsWithChildren<EditModalProps>): React.JSX.Element => {
  return (
    <InputModal modalId={modalId}
      title={title} show={show} setShow={setShow} size={size} staticBackdrop={true} footerButton={footerButton}
    >
      {children}
    </InputModal>
  );
};

export default EditModal;