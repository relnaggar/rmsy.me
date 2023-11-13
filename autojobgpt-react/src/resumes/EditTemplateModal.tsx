import React from "react";
import Modal from 'react-bootstrap/Modal';

import useFetch from "../hooks/useFetch";
import EditableInput from "../common/EditableInput";
import { ResumeTemplate, FillField } from "./types";


export default function EditTemplateModal({ apiPath, show, setShow, templates, setTemplates, templateID }: {
  apiPath: string,
  show: boolean,
  setShow: (show: boolean) => void,
  templates: ResumeTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<ResumeTemplate[]>>,
  templateID: number,
}): React.JSX.Element {
  const {
    resources: fillFields,
    setResources: setFillFields,
    error: fetchError,
  } = useFetch<FillField>("fillfields/");

  function handleClose() {
    setShow(false);
  }

  return (
    <Modal show={show} onHide={handleClose} aria-labelledby="editTemplateModalLabel">
      <Modal.Header closeButton>
        <Modal.Title id="editTemplateModalLabel">Edit Resume Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <EditableInput<ResumeTemplate>
          type="text"
          apiPath={apiPath}
          resources={templates}
          setResources={setTemplates}
          id={templateID}
          editableProperty="name"
          labelText="Template Name"
        />
        <EditableInput<ResumeTemplate>
          type="textarea"
          apiPath={apiPath}
          resources={templates}
          setResources={setTemplates}
          id={templateID}
          editableProperty="description"
          labelText="Description (optional)"
        />
        <hr />
        <h6>Fill Field Descriptions</h6>
        {fillFields.map((fillField: FillField) => {
          if (fillField.template === templateID) {
            if (fillField.key === "JOB_TITLE" || fillField.key === "COMPANY") {
              const elementID: string = `${apiPath.replace("/", "-")}${fillField.id}-description`;
              return (
                <div className="mb-3 form-floating">
                  <textarea
                    className="form-control"
                    style={{ minHeight: "64px" }}
                    id={elementID}
                    disabled={true}
                  >{fillField.description}</textarea>
                  <label htmlFor={elementID}>{fillField.key}</label>  
                </div>
              )
            } else {
              return <EditableInput<FillField>
                type="textarea"
                apiPath="fillfields/"
                resources={fillFields}
                setResources={setFillFields}
                id={fillField.id}
                editableProperty="description"
                labelProperty="key"
              />
            }
          }
        })}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}