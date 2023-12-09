import React from 'react';

import { InputControlMixin } from "../hooks/useInputControl";
import BaseInput, { BaseInputMixin } from "./BaseInput";

interface TextInputProps extends InputControlMixin, BaseInputMixin,
  Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'value'>
{
  type: string,
  children?: React.ReactNode,
};

const TextInput = React.forwardRef(({
  value, editing, handleChange,
  id, label, errors,
  loading = false,
  type,
  children,
  ...extraInputProps
}: TextInputProps,
  ref: React.Ref<HTMLInputElement | HTMLTextAreaElement>,
): React.JSX.Element => {
  const inputProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> | React.InputHTMLAttributes<HTMLInputElement> = {
    id,
    name: id,
    className: "form-control",    
    value: type === "file" ? undefined : (value ?? ""),
    disabled: loading,
    "aria-busy": loading,
    ...extraInputProps,
  };

  let input: React.JSX.Element;
  if (type === "textarea") {
    input = (
      <textarea ref={ref as React.Ref<HTMLTextAreaElement>}
        onChange={handleChange as ((e: React.ChangeEvent<HTMLTextAreaElement>) => void)}
        {...inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
      />
    );
  } else {
    input = (
      <input ref={ref as React.Ref<HTMLInputElement>}
        type={type} onChange={handleChange as ((e: React.ChangeEvent<HTMLInputElement>) => void)}
        {...inputProps as React.InputHTMLAttributes<HTMLInputElement>}
      />
    );
  }

  return (
    <BaseInput id={id} label={label} input={input} editing={editing} loading={loading} errors={errors}>
      {children}
    </BaseInput>
  );
});

export default TextInput;