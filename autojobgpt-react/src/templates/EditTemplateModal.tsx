import React from "react";
import Modal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { ResumeTemplate, FillField } from "../templates/types";


export default function EditTemplateModal({
  apiPath,
  show, setShow,
  templateID,
  templates, setTemplates,
  fillFields, setFillFields,
}: {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  templateID: number,
  templates: ResumeTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<ResumeTemplate[]>>,
  fillFields: FillField[],
  setFillFields: React.Dispatch<React.SetStateAction<FillField[]>>,
}): React.JSX.Element {
  return (
    <Modal show={show} onHide={() => setShow(false)} size="lg" backdrop="static"
      onEntered={() => document.getElementsByTagName("input")[0].focus()} aria-labelledby="editTemplateModalLabel"
    >
      <Modal.Header closeButton>
        <Modal.Title id="editTemplateModalLabel">Edit Resume Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputWithSave<ResumeTemplate>
          type="text"
          apiPath={apiPath}
          resources={templates}
          setResources={setTemplates}
          id={templateID}
          editableProperty="name"
          labelText="Template Name"
          required
        />
        <InputWithSave<ResumeTemplate>
          type="textarea"
          apiPath={apiPath}
          resources={templates}
          setResources={setTemplates}
          id={templateID}
          editableProperty="description"
          labelText="Description (optional)"
        />
        <hr />
        <h5 className="mb-3">Fill Field Descriptions</h5>
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
              return <InputWithSave<FillField>
                type="textarea"
                apiPath="fillfields/"
                resources={fillFields}
                setResources={setFillFields}
                id={fillField.id}
                editableProperty="description"
                labelProperty="key"
              />
            }
          } else {
            return null;
          }
        })}
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}