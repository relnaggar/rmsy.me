import React from 'react';

export interface BaseInputMixin {
  id: string,
  label: string,
  editing: boolean,
  loading?: boolean,
  errors?: string[],  
};

interface BaseInputProps extends BaseInputMixin {
  input: React.JSX.Element,
  children?: React.ReactNode,
};

const BaseInput = ({
  id, label, editing, children,
  loading = false,
  errors = [],
  input,
}: BaseInputProps): React.JSX.Element => {
  const error: string = errors.join(" ");
  const showError: boolean = !editing && !loading && error !== "";
  const feedbackId = `${id}Feedback`;

  let updatedInput: React.JSX.Element;
  if (showError) {
    updatedInput = React.cloneElement(input, {
      className: `${input.props.className} is-invalid`,
      "aria-describedby": feedbackId
    })
  } else {
    updatedInput = input;
  }  

  const inputWithFeedback = (
    <>
      {updatedInput}
      {showError &&
        <div className="invalid-feedback" id={feedbackId} role={"alert"} aria-labelledby={id}>{error}</div>
      }
    </>
  );

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      { children ?
        <div className="d-flex">
          <div className="flex-grow-1">
            {inputWithFeedback}
          </div>
          <div className="ps-2">
            {children}
          </div>
        </div>
      :
        inputWithFeedback
      }
    </div>
  );
};

export default BaseInput;