import React from 'react';


export default function FormInput({
  id,
  label,
  type,  
  handleChange,
  editing,  
  error,
  value,
  loading,
  children,
  ...props
}: {
  id: string,
  label: string,
  type: string,
  handleChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void),
  editing: boolean,
  error: string | undefined,
  value: string,
  loading?: boolean,
  children?: React.ReactNode,
  [key: string]: any,
}): React.JSX.Element {
  const showError: string | false | undefined = !editing && !loading && error;

  const textAreaProps: React.TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> = {
    className: `form-control${showError ? " is-invalid" : ""}`,
    id,
    name: id,
    value: type == "file" ? undefined : (value ?? ""),
    onChange: handleChange,
    disabled: loading,
    "aria-describedby": showError? `${id}-feedback`: undefined,
    ...props,
  };

  const input: React.JSX.Element = (
    <>
      {type === "textarea"?
        <textarea {...textAreaProps} />
      :
        <input type={type} {...textAreaProps} />
      }
      <div className="invalid-feedback" id={`${id}-feedback`} role={showError? "alert": undefined}>{error}</div>
    </>
  );

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      {children?
        <div className="d-flex">
          <div className="flex-grow-1">
            {input}
          </div>
          <div className="ps-2">
            {children}
          </div>
        </div>
      :
        input
      }
    </div>
  );
}