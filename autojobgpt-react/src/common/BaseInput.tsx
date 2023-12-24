import React, { useId } from 'react';

import useResponsive from "../hooks/useResponsive";
import { CommonInputControlProps } from "../hooks/useInputControl";


export type SelectOption = {
  value: string,
  label: string,
};

export interface BaseInputProps extends CommonInputControlProps,
  Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'value'>
{
  type: string,
  id?: string,
  label: string,
  loading?: boolean,
  errors?: string[],
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void,
  floatingLabel?: boolean,
  isValid?: boolean,
  selectOptions?: SelectOption[],
  loadingOptionLabel?: string,
  defaultOptionValue?: string,
  defaultOptionLabel?: string,
};

const BaseInput = React.forwardRef(({  
  value, editing, handleChange,
  type,
  id,
  label,
  loading = false,
  errors = [],
  handleSubmit,
  floatingLabel = false,
  isValid = false,
  selectOptions,
  loadingOptionLabel = "Loading...",
  defaultOptionValue = "",
  defaultOptionLabel = "Select...",
  children,
  ...extraInputProps
}: React.PropsWithChildren<BaseInputProps>,
  ref: React.Ref<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
): React.JSX.Element => {
  const error: string = errors.join(" ");
  const showError: boolean = !editing && !loading && error !== "";
  const autoId = useId();
  const currentId = id ?? autoId;
  const feedbackId = useId();
  const isMobile = useResponsive();

  const inputProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> | React.InputHTMLAttributes<HTMLInputElement> = {
    id: currentId,
    name: currentId,
    className: `${
      type === "select" ? "form-select" : "form-control"}${
      isValid ? " is-valid" : ""}${
      showError ? " is-invalid" : ""
    }`,
    value: type === "file" ? undefined : (value ?? ""),
    disabled: loading,
    "aria-busy": loading,
    "aria-invalid": showError,
    "aria-describedby": showError ? feedbackId: undefined,
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
  } else if (type === "select") {
    input = (
      <select ref={ref as React.Ref<HTMLSelectElement>}
        onChange={handleChange as ((e: React.ChangeEvent<HTMLSelectElement>) => void)}
        {...inputProps as React.SelectHTMLAttributes<HTMLSelectElement>}
      >
        { !inputProps.required &&
          <option value={defaultOptionValue}>{loading ? loadingOptionLabel : defaultOptionLabel}</option>
        }
        {selectOptions!.map((selectOption) => (
          <option key={selectOption.value} value={selectOption.value}>{selectOption.label}</option>
        ))}
      </select>
    );
  } else {
    input = (
      <input ref={ref as React.Ref<HTMLInputElement>}
        type={type} onChange={handleChange as ((e: React.ChangeEvent<HTMLInputElement>) => void)}
        {...inputProps as React.InputHTMLAttributes<HTMLInputElement>}
      />
    );
  }

  const inputWithFeedback = (
    <>
      {input}
      {showError &&
        <div id={feedbackId}
          className="invalid-feedback"  role={showError ? "alert": undefined} aria-labelledby={currentId}
        >
          {error}
        </div>
      }
    </>
  );

  const inputContent = (
    <>
      { !floatingLabel &&
        <label className="form-label" htmlFor={currentId}>
          {label}
        </label>
      }
      { children ?
        <div className="d-flex">
          <div className="flex-grow-1">
            { floatingLabel ?
              <div className="form-floating">        
                {inputWithFeedback}
                <label htmlFor={currentId}>{label}</label>              
              </div>
            :
              inputWithFeedback
            }
          </div>
          { !isMobile &&
            <div className="ps-2 d-flex flex-column gap-2">
              {children}
            </div>
          }
        </div>
      :
        inputWithFeedback
      }
    </>
  );

  return (
    <>
      <div className="mb-3">
        { handleSubmit ?
          <form onSubmit={handleSubmit} aria-label={`Form for updating ${label}`}>
            {inputContent}
          </form>
        :
          inputContent
        }
      </div>
      { isMobile &&
        <div className="d-flex justify-content-end mb-3 gap-2">
          {children}
        </div>
      }
    </>    
  );
});

export default BaseInput;