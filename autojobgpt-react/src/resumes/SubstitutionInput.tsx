import React, { useState } from "react";
import Alert from 'react-bootstrap/Alert';
import { ReactComponent as Robot } from "bootstrap-icons/icons/robot.svg";

import usePost from "../hooks/usePost";
import InputWithSave from "../common/InputWithSave";
import { Substitution } from '../api/types';


export default function SubstitutionInput({
  substitution,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
}: {
  substitution: Substitution,
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: () => void,
}): React.JSX.Element {
  const [errors, setErrors] = useState<Record<string,string[]>>({});
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [value, setValue] = useState<string>(substitution.value);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  const onFillSuccess = (substitution: Substitution): void => {
    setValue(substitution.value);
    setShowErrorAlert(false);
  }

  const onFillFail = (errors: Record<string,string[]>): void => {
    setErrors(errors);
    setShowErrorAlert(true);
  };

  const { posting: filling, post: fill, cancel: cancelFill } = usePost(
    `substitutions/${substitution.id}/regenerate/`, {
      onSuccess: onFillSuccess,
      onFail: onFillFail,
    }
  );

  function handleClickFillDetails(): void {
    if (showFeedback) {
      fill({value: value, feedback: feedback});
    } else {
      fill({value: value});
    }
  }

  return (
    <>
      <InputWithSave
        type="textarea"
        apiPath="substitutions/"
        resources={substitutions}
        setResources={setSubstitutions}
        editId={substitution.id}
        editableProperty="value"
        labelProperty="key"
        onSaveSuccess={onSubstitutionSaveSuccess}
        value={value}
        setValue={setValue}
        style={{minHeight: "84px"}}
        disabled={filling}
      >
        {!["JOB_TITLE", "COMPANY"].includes(substitution.key) && <>
          <button className="btn btn-outline-primary" type="button"
            onClick={filling ? () => cancelFill() : handleClickFillDetails }
            disabled={!filling && showFeedback && feedback === ""}
          >
            {filling?<>
              <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
              Cancel
            </>:<>
              <Robot className="me-1" />
              Regenerate
            </>}
          </button>
          <div className="form-check form-switch mt-2">
            <input
              className="form-check-input" type="checkbox" role="switch" checked={showFeedback}
              id={`feedback-switch-${substitution.key}`} onChange={() => setShowFeedback(!showFeedback)}
            />
            <label className="form-check-label" htmlFor={`feedback-switch-${substitution.key}`} >
              with feedback
            </label>
          </div>
        </>}
      </InputWithSave>

      {showFeedback &&
        <div className="mb-3">
          <textarea
            className="form-control" value={feedback} onChange={(e) => setFeedback(e.target.value)} disabled={filling}
            placeholder="Write your feedback here..." aria-label="Feedback"
          />
        </div>
      }

      <Alert
        variant="danger" dismissible className="w-100"
        show={showErrorAlert} onClose={() => setShowErrorAlert(false)}
      >
        {Object.values(errors).join(" ")}
      </Alert>
    </>
  );
}