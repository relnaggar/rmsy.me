import React from "react";
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';

import useFormInput from "../hooks/useFormInput";
import FormInput from "../common/FormInput";
import { ResumeTemplateUpload } from "../templates/types";


export default function AddTemplateModal({
  show, setShow,
  onSubmitAddTemplate, errors,
  showErrorAlert, setShowErrorAlert
}: {
  show: boolean,
  setShow: (show: boolean) => void,
  onSubmitAddTemplate: (template: ResumeTemplateUpload) => void,
  errors: Record<string,string>,
  showErrorAlert: boolean,
  setShowErrorAlert: React.Dispatch<React.SetStateAction<boolean>>,
}): React.JSX.Element {
  const nameInput = useFormInput();
  const uploadInput = useFormInput();
  const descriptionInput = useFormInput();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault(); // prevent page from reloading

    setShowErrorAlert(false);

    const formElement: HTMLFormElement = document.getElementById("addTemplateForm") as HTMLFormElement;
    if (formElement.reportValidity()) {    
      const name: string = (document.getElementById("name") as HTMLInputElement).value;
      const docx: File = (document.getElementById("upload") as HTMLInputElement).files![0];
      const description: string = (document.getElementById("description") as HTMLInputElement).value;
      const templateUpload: ResumeTemplateUpload = { name, docx, description };
      onSubmitAddTemplate(templateUpload);

      nameInput.stopEditing();
      uploadInput.stopEditing();
      descriptionInput.stopEditing();
      setShow(false);
    }
  }

  return (
    <Modal
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementsByTagName("input")[0].focus()} aria-labelledby="addTemplateModalLabel"
    >
      <Modal.Header closeButton>
        <Modal.Title id="addTemplateModalLabel">Add Resume Template</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit} id="addTemplateForm">
        <Modal.Body>
          <FormInput 
            id="name" label="Template Name" type="text" value={nameInput.value} handleChange={nameInput.handleChange}
            editing={nameInput.editing} error={errors["name"]} required
          />
          <FormInput
            id="upload" label="Upload" type="file" value={uploadInput.value} handleChange={uploadInput.handleChange}
            editing={uploadInput.editing} error={errors["upload"]} required
            accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />          
          <FormInput
            id="description" label="Description (optional)" type="textarea" value={descriptionInput.value}
            handleChange={descriptionInput.handleChange} rows={3}
            editing={descriptionInput.editing} error={errors["description"]}
          />
        </Modal.Body>
        <Modal.Footer>
          <Alert
            variant="danger" dismissible
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