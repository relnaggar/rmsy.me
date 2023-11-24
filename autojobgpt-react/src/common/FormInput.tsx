import React from 'react';


export default function FormInput({
  id,
  label,
  type,
  value,
  handleChange,
  editing,
  loading,
  error,
  children,
  ...props
}: {
  id: string,
  label: string,
  type: string,
  value: string,
  handleChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void),
  editing: boolean,
  loading: boolean,
  error: string | undefined,
  children?: React.ReactNode,
  [key: string]: any,
}): React.JSX.Element {
  const showError: string | false | undefined = !editing && !loading && error;

  const textAreaProps: React.TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> = {
    className: `form-control${showError ? " is-invalid" : ""}`,
    id,
    name: id,
    value: value || "",
    onChange: handleChange,
    disabled: loading,
    "aria-describedby": `${id}-feedback`,
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