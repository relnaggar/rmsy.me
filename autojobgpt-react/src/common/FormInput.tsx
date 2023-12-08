import React from 'react';


interface FormInputProps {
  id: string,
  label: string,
  type: string,
  handleChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void),
  editing: boolean,
  error?: string[],
  value: string,
  loading?: boolean,
  children?: React.ReactNode,
  [key: string]: any,
};

// use React.forwardRef to pass ref to input element

const FormInput = React.forwardRef((
  {
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
  }: FormInputProps,
  ref: React.Ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
): React.JSX.Element => {
  let errorString: string = "";
  if (error instanceof Array) {
    if (error.length === 0) {
      errorString = "";
    } else {
      errorString = error.join(" ");
    }
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
        <textarea {...textAreaProps} ref={ref as React.Ref<HTMLTextAreaElement>} />
      :
        <input type={type} {...textAreaProps} ref={ref as React.Ref<HTMLInputElement>} />
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
});

export default FormInput;