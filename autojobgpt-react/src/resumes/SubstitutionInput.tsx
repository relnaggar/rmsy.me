import React, { useState } from "react";
import Alert from 'react-bootstrap/Alert';
import { ReactComponent as Robot } from "bootstrap-icons/icons/robot.svg";

import usePost from "../hooks/usePost";
import InputWithSave from "../common/InputWithSave";
import { Substitution } from "./types";


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
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [value, setValue] = useState<string>(substitution.value);

  const onFillSuccess = (substitution: Substitution): void => {
    setValue(substitution.value);
    setShowErrorAlert(false);
  }

  const onFillFail = (errors: Record<string,string>): void => {
    setErrors(errors);
    setShowErrorAlert(true);
  };

  const { posting: filling, post: fill, cancel: cancelFill } = usePost(
    `resumesubstitutions/${substitution.id}/regenerate/`, {
      onSuccess: onFillSuccess,
      onFail: onFillFail,
    }
  );

  function handleClickFillDetails(): void {
    fill();
  }

  return (
    <>
      <InputWithSave<Substitution>
        type="textarea"
        apiPath="resumesubstitutions/"
        resources={substitutions}
        setResources={setSubstitutions}
        id={substitution.id}
        editableProperty="value"
        labelProperty="key"
        onSaveSuccess={onSubstitutionSaveSuccess}
        value={value}
        setValue={setValue}
        style={{minHeight: "84px"}}
      >
        {!["JOB_TITLE", "COMPANY"].includes(substitution.key) &&
          <button className="btn btn-outline-primary" type="button"
            onClick={filling ? () => cancelFill() : handleClickFillDetails }
          >
            {filling?<>
              <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
              Cancel
            </>:<>
              <Robot className="me-1" />
              Autofill
            </>}
          </button>
        }
      </InputWithSave>
      <Alert 
        variant="danger" dismissible className="w-100"
        show={showErrorAlert} onClose={() => setShowErrorAlert(false)}
      >            
        {Object.values(errors).join(" ")}
      </Alert>
    </>
  );
}