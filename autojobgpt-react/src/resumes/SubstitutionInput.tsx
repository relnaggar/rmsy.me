import React from "react";
import { ReactComponent as Robot } from "bootstrap-icons/icons/robot.svg";

import useFetch from "../hooks/useFetch";
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
  const { fetching: filling, refetch: fill, cancel: cancelFill } = useFetch<Substitution>(
    `resumesubstitutions/${substitution.id}/regenerate/`, {
      initialFetch: false,
      // onSuccess: onFillSuccess,
      // onFail: onFillFail,
    }
  );

  function handleClickFillDetails(): void {
    fill();
  }

  return (
    <InputWithSave<Substitution>
      type="textarea"
      apiPath="resumesubstitutions/"
      resources={substitutions}
      setResources={setSubstitutions}
      id={substitution.id}
      editableProperty="value"
      labelProperty="key"
      onSaveSuccess={onSubstitutionSaveSuccess}
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
  );
}