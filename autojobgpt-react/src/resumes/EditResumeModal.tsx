import React from "react";
import Modal from 'react-bootstrap/Modal';

import InputWithSave from "../common/InputWithSave";
import { Substitution } from "./types";


export default function EditResumeModal({
  show,
  setShow,
  id,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
}: {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  id: number,
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: () => void,
}): React.JSX.Element {
  return (
    <Modal
      show={show} onHide={() => setShow(false)} aria-labelledby="editResumeModalLabel"
      onEntered={() => document.getElementsByTagName("textarea")[0].focus()}
    >
      <Modal.Header closeButton>
        <Modal.Title id="editResumeModalLabel">Edit Resume</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {substitutions
          .filter((substitution: Substitution) => substitution.resume === id)
          .map((substitution: Substitution) => {
            return <InputWithSave<Substitution>
              type="textarea"
              apiPath="resumesubstitutions/"
              resources={substitutions}
              setResources={setSubstitutions}
              id={substitution.id}
              editableProperty="value"
              labelProperty="key"
              onSaveSuccess={onSubstitutionSaveSuccess}
            />
          })
        }
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
      </Modal.Footer>
    </Modal>
  )
}