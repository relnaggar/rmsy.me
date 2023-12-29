import React, { useId, useState } from "react";
import { ReactComponent as RobotIcon } from "bootstrap-icons/icons/robot.svg";

import useErrorAlert from "../hooks/useErrorAlert";
import usePost from "../hooks/usePost";
import InputWithSave from "../common/InputWithSave";
import InputActionButton from "../common/InputActionButton";
import ErrorAlert from "../common/ErrorAlert";
import { defaultFillFields } from "../api/constants";
import { Substitution } from '../api/types';


export interface SubstitutionInputProps {
  substitution: Substitution,
  substitutions: Substitution[],
  setSubstitutions: React.Dispatch<React.SetStateAction<Substitution[]>>,
  onSubstitutionSaveSuccess: (substitution: Substitution) => void,
}

export default function SubstitutionInput({
  substitution,
  substitutions,
  setSubstitutions,
  onSubstitutionSaveSuccess,
}: SubstitutionInputProps): React.JSX.Element {
  const id = useId();
  const feedbackSwitchId = useId();
  const errorAlert = useErrorAlert();
  const [value, setValue] = useState<string>(substitution.value);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  const onFillSuccess = (substitution: Substitution): void => {
    setValue(substitution.value);
    errorAlert.clearErrors();
  }

  const { posting: filling, post: fill, cancel: cancelFill } = usePost({
    apiPath: `substitutions/${substitution.id}/regenerate/`,
    cancelable: true,
    onSuccess: onFillSuccess,
    onFail: errorAlert.showErrors,
  });

  const handleClickFillDetails = (): void => {
    if (showFeedback) {
      fill({postData: {value: value, feedback: feedback}});
    } else {
      fill({postData: {value: value}});
    }
  };

  const handleChangeFeedback = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setFeedback(e.target.value);
  };

  const handleChangeFeedbackSwitch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setShowFeedback((showFeedback) => !showFeedback);
  };

  return (
    <>
      <InputWithSave editId={substitution.id} id={id}
        apiPath="substitutions/" resources={substitutions} setResources={setSubstitutions}
        type="textarea" editableProperty="value" labelProperty="key"
        onSaveSuccess={onSubstitutionSaveSuccess}
        value={value} setValue={setValue}
        disabled={filling} style={{minHeight: "84px"}}
      >
        { ! defaultFillFields.includes(substitution.key) &&
          <>
            <InputActionButton controlsId={id}
              label="Regenerate" icon={<RobotIcon />} loading={filling} disabled={showFeedback && feedback === ""}
              onClickAction={handleClickFillDetails} onClickCancel={cancelFill}
            />
            <div className="form-check form-switch mt-2">
              <input id={feedbackSwitchId}
                className="form-check-input" type="checkbox" role="switch" aria-controls={id}
                checked={showFeedback} onChange={handleChangeFeedbackSwitch}
              />
              <label className="form-check-label" htmlFor={feedbackSwitchId}>with feedback</label>
            </div>
          </>
        }
      </InputWithSave>
      { showFeedback &&
        <div className="mb-3">
          <textarea
            className="form-control" value={feedback} onChange={handleChangeFeedback} disabled={filling}
            placeholder="Write your feedback here..." aria-label="Feedback" aria-controls={id}
          />
        </div>
      }
      <ErrorAlert {...errorAlert} />
    </>
  );
}