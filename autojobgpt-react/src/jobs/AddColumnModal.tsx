import React from "react";
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import useFormInput from "../hooks/useFormInput";
import FormInput from "../common/FormInput";
import { StatusUpload } from "./types";


export default function AddColumnModal({
  show, setShow,
  addColumn, addingColumn,
  errors, showErrorAlert, setShowErrorAlert
}: {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  addColumn: (statusUpload: StatusUpload) => void,
  addingColumn: boolean,
  errors: Record<string,string>,
  showErrorAlert: boolean,
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>,
}): React.JSX.Element {
  const nameInput = useFormInput();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault(); // prevent page from reloading

    setShowErrorAlert(false);

    const formElement: HTMLFormElement = document.getElementById("addColumnForm") as HTMLFormElement;
    if (formElement.reportValidity()) {
      const name: string = (document.getElementById("name") as HTMLInputElement).value;
      const statusUpload: StatusUpload = { name };
      addColumn(statusUpload);

      nameInput.stopEditing();
      setShow(false);
    }
  }

  return (
    <Modal
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementsByTagName("input")[0].focus()} aria-labelledby="addColumnModalLabel"
    >
      <Modal.Header closeButton>
        <Modal.Title id="addColumnModalLabel">Add Column</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit} id="addColumnForm">
        <Modal.Body>
          <FormInput 
            id="name" label="Column Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
            editing={nameInput.editing} error={errors["name"]} required
          />
        </Modal.Body>
        <Modal.Footer>
          <Alert
            variant="danger" dismissible className="w-100"
            show={showErrorAlert} onClose={() => setShowErrorAlert(false)}
          >
            {errors["error"]}
          </Alert>

          <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
          <button type="submit" className="btn btn-primary" formNoValidate>Submit</button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}