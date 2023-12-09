import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { FillField, ResumeTemplate } from '../api/types';


interface EditTemplateModalProps {
  apiPath: string,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  templateId: number,
  templates: ResumeTemplate[],
  setTemplates: React.Dispatch<React.SetStateAction<ResumeTemplate[]>>,
  fillFields: FillField[],
  setFillFields: React.Dispatch<React.SetStateAction<FillField[]>>,
}

const EditTemplateModal = ({
  apiPath,
  show, setShow,
  templateId,
  templates, setTemplates,
  fillFields, setFillFields,
}: EditTemplateModalProps): React.JSX.Element => {
  return (
    <BootstrapModal aria-labelledby="editTemplateModalLabel" size="xl" backdrop="static"
      show={show} onHide={() => setShow(false)}
      onEntered={() => document.getElementsByTagName("input")[0].focus()}      
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="editTemplateModalLabel">Edit Resume Template</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <InputWithSave<ResumeTemplate>
          type="text"
          apiPath={apiPath}
          resources={templates}
          setResources={setTemplates}
          id={templateId}
          editableProperty="name"
          labelText="Template Name"
          required
        />
        <InputWithSave<ResumeTemplate>
          type="textarea"
          apiPath={apiPath}
          resources={templates}
          setResources={setTemplates}
          id={templateId}
          editableProperty="description"
          labelText="Description (optional)"
        />
        <hr />
        <h5 className="mb-3">Fill Field Descriptions</h5>
        {fillFields.map((fillField: FillField) => {
          if (fillField.template === templateId) {
            if (fillField.key === "JOB_TITLE" || fillField.key === "COMPANY") {
              const elementId: string = `${apiPath.replace("/", "-")}${fillField.id}-description`;
              return (
                <div className="mb-3 form-floating">
                  <textarea
                    className="form-control"
                    style={{ minHeight: "64px" }}
                    id={elementId}
                    disabled={true}
                  >{fillField.description}</textarea>
                  <label htmlFor={elementId}>{fillField.key}</label>  
                </div>
              )
            } else {
              return <InputWithSave<FillField>
                type="textarea"
                apiPath="fillFields/"
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
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  )
};

export default EditTemplateModal;