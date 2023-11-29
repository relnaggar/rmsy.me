import React from "react";
import Modal from 'react-bootstrap/Modal';

import useFetch from "../hooks/useFetch";
import InputWithSave from "../common/InputWithSave";
import { ResumeTemplate, FillField } from "../templates/types";


export default function EditTemplateModal({ apiPath, show, setShow, templates, setTemplates, templateID }: {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  templates: ResumeTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<ResumeTemplate[]>>,
  templateID: number,
}): React.JSX.Element {
  const {
    resource: fillFields,
    setResource: setFillFields,
    refetch: refetchFillFields,
  } = useFetch<FillField[]>("fillfields/", { initialResource: [] });

  return (
    <Modal show={show} onHide={() => setShow(false)}      
      onEntered={() => document.getElementsByTagName("input")[0].focus()} aria-labelledby="editTemplateModalLabel"
      onShow={refetchFillFields}
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