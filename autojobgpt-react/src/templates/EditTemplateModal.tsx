import React from "react";
import BootstrapModal from 'react-bootstrap/Modal';

import { EditResourceModalProps } from "../common/EditModal";
import InputWithSave from "../common/InputWithSave";
import { FillField, ResumeTemplate } from '../api/types';


interface EditTemplateModalProps extends EditResourceModalProps<ResumeTemplate> {
  fillFields: FillField[],
  setFillFields: React.Dispatch<React.SetStateAction<FillField[]>>,
}

const EditTemplateModal = ({
  show, setShow, editId,
  fillFields, setFillFields,
  ...resourceManager
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
        <InputWithSave editId={editId}
          {...resourceManager}
          type="text" editableProperty="name" labelText="Template Name"
          required
        />
        <InputWithSave editId={editId}
          {...resourceManager}
          type="textarea" editableProperty="description" labelText="Description (optional)"
        />
        <hr />
        <h5 className="mb-3">Fill Field Descriptions</h5>
        {fillFields.map((fillField: FillField) => {
          if (fillField.template === editId) {
            if (fillField.key === "JOB_TITLE" || fillField.key === "COMPANY") {
              const elementId: string = `${resourceManager.apiPath.replace("/", "-")}${fillField.id}-description`;
              return (
                <div className="mb-3 form-floating" key={fillField.id}>
                  <textarea id={elementId}
                    className="form-control"
                    style={{ minHeight: "64px" }}
                    disabled={true}
                    defaultValue={fillField.description}
                  />
                  <label htmlFor={elementId}>{fillField.key}</label>  
                </div>
              )
            } else {
              return <InputWithSave key={fillField.id} editId={fillField.id}
                apiPath="fillFields/" resources={fillFields} setResources={setFillFields}
                type="textarea" editableProperty="description" labelProperty="key"
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