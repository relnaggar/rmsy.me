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
  [key: string]: any,
}): React.JSX.Element {
  const textAreaProps: React.TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> = {
    className: `form-control${!editing && !loading && error ? " is-invalid" : ""}`,
    id,
    name: id,
    value,
    onChange: handleChange,
    disabled: loading,
    ...props,
  };

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      {type === "textarea"?
        <textarea {...textAreaProps} />
      :
        <input type={type} {...textAreaProps} />      
      }
      {<div className="invalid-feedback">{error}</div>}
    </div>
  );
}