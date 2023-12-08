import React from 'react';


interface FormInputProps {
  id: string,
  label: string,
  type: string,
  handleChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void),
  editing: boolean,
  error?: string | string[],
  value: string,
  loading?: boolean,
  children?: React.ReactNode,
  [key: string]: any,
};

const FormInput: (props: FormInputProps) => React.JSX.Element = ({
  id,
  label,
  type,  
  handleChange,
  editing,  
  error,
  value,
  loading = false,
  children,
  ...props
}) => {
  let errorString: string;
  if (typeof error === "string") {
    errorString = error;
  } else if (error instanceof Array) {
    if (error.length === 0) {
      errorString = "";
    } else {
      errorString = error.join(" ");
    }
  } else {
    errorString = "";
  }

  const showError: boolean = !editing && !loading && errorString !== "";

  const textAreaProps: React.TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> = {
    className: `form-control${showError ? " is-invalid" : ""}`,
    id,
    name: id,
    value: type === "file" ? undefined : (value ?? ""),
    onChange: handleChange,
    disabled: loading,
    "aria-describedby": showError? `${id}Feedback`: undefined,
    ...props,
  };

  const inputElement: React.JSX.Element = (
    <>
      {type === "textarea"?
        <textarea {...textAreaProps} />
      :
        <input type={type} {...textAreaProps} />
      }
      {showError &&
        <div className="invalid-feedback" id={`${id}Feedback`} role={"alert"} aria-labelledby={id}>{error}</div>
      }
    </>
  );

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      { children ?
        <div className="d-flex">
          <div className="flex-grow-1">
            {inputElement}
          </div>
          <div className="ps-2">
            {children}
          </div>
        </div>
      :
        inputElement
      }
    </div>
  );
};

export default FormInput;