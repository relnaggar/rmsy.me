import React, { useCallback, useState, useRef, useEffect } from "react";
import { ReactComponent as FloppyIcon } from "bootstrap-icons/icons/floppy.svg";

import usePatch from "../hooks/usePatch";
import useControlledState from "../hooks/useControlledState";
import { WithId } from '../api/types';


export type SelectOption = {
  value: string,
  label: string,
};

interface InputWithSaveProps<Resource extends WithId>{
  type: string,
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  id: number,
  editableProperty: keyof Resource & string,
  labelProperty?: keyof Resource,
  labelText?: string,
  onSaveSuccess?: () => void,
  value?: string,
  setValue?: React.Dispatch<React.SetStateAction<string>>,
  selectOptions?: SelectOption[],
  children?: React.ReactNode,
  [key: string]: any,
}

const InputWithSave = <Resource extends WithId>({
  type,
  apiPath,
  resources,
  setResources,
  id,
  editableProperty,
  labelProperty,
  labelText,
  onSaveSuccess,
  value: valueProp,
  setValue: setValueProp,
  selectOptions,
  children,
  ...props
}: InputWithSaveProps<Resource>): React.JSX.Element => {
  if (!labelProperty && !labelText) throw new Error("InputWithSave must have either labelProperty or labelText");

  const resource: Resource = resources.find((resource) => resource.id === id)!;
  const elementId: string = `${apiPath.replace("/", "-")}${id}-${editableProperty}`;
  
  let tmp: string;
  if (typeof resource[editableProperty] === "string") {
    tmp = resource[editableProperty] as string;
  } else if (typeof resource[editableProperty] === "number") {
    tmp = (resource[editableProperty] as number).toString();
  } else {
    throw new Error(`resourceEditableProperty must be a string or number, but it is a ${typeof resource[editableProperty]}`);
  }
  const resourceEditableProperty: string = tmp;

  const [editing, setEditing] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string,string[]>>({});
  const [value, setValue] = useControlledState<string>(resourceEditableProperty, valueProp, setValueProp);
  
  useEffect(() => {
    if (value === resourceEditableProperty) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [value, resourceEditableProperty]);

  const handleUpdateFail = useCallback((errors: Record<string,string[]>) => {
    setErrors(errors);
  }, [setErrors]);

  const handleUpdateSuccess = useCallback(() => {
    setErrors({});
    setSaved(true);
    onSaveSuccess && onSaveSuccess();
  }, [setErrors, onSaveSuccess]);

  const {patchResource: updateResource, patching: updating } = usePatch<Resource>(apiPath, resources, setResources, {
    onFail: handleUpdateFail,
    onSuccess: handleUpdateSuccess,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {  
    e.preventDefault(); // prevent page from reloading

    const value: string = (document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    updateResource(id, { [editableProperty]: value } as Partial<Resource>);
    setEditing(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setValue(e.target.value);
  }

  const thereAreErrors: boolean = Object.keys(errors).length > 0;
  const showError: boolean = !editing && !updating && thereAreErrors;
  const textAreaProps: React.TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {
    className: `form-control${
      saved ? " is-valid" : ""}${
      showError ? " is-invalid" : ""
    }`,
    id: elementId,
    name: elementId,
    value: value ?? "",
    onChange: handleChange,
    disabled: updating,
    "aria-describedby": showError? `${elementId}-feedback` : undefined,
    ...props,
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
  }, [value]);

  const input: React.JSX.Element = (
    <>
      {type === "textarea"?
        <textarea {...textAreaProps} ref={textareaRef}></textarea>
      :
        (type === "select"?
          <select {...textAreaProps}>
            {!textAreaProps.required && <option value="">Select...</option>}
            {selectOptions!.map((selectOption) => (
              <option key={selectOption.value} value={selectOption.value}>{selectOption.label}</option>
            ))}
          </select>
        :
          <input type={type} {...textAreaProps} />
        )
      }
      <div className="invalid-feedback" id={`${elementId}-feedback`} role={showError? "alert": undefined}>
        {Object.values(errors).join(" ")}
      </div>
    </>
  );  

  let ariaLabel: string;
  if (labelProperty) {
    ariaLabel = resource[labelProperty] as string;
  } else {
    ariaLabel = labelText!;
  }

  const saveButton: React.JSX.Element = (
    <button
      type="submit" className="btn btn-outline-primary" disabled={updating || saved} aria-busy={updating}
    >
      {updating?
        <>
          <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
          <span role="status">Saving...</span>
        </>
      : (saved?
        <>
          <FloppyIcon className="me-1" />
          Saved
        </>
      :
        <>
          <FloppyIcon className="me-1" />
          Save
        </>
      )}
    </button>
  );
  
  return (
    <>
      <div className="mb-3">
        <form onSubmit={handleSubmit} aria-label={`Form for updating ${ariaLabel}`}>
          {!labelProperty && <label className="form-label" htmlFor={elementId}>
            {labelText}
          </label>}
          <div className="d-flex">        
            <div className="flex-grow-1">
              {labelProperty ?
                <div className="form-floating">        
                  {input}
                  <label htmlFor={elementId}>{resource[labelProperty] as string}</label>              
                </div>
              :
                input
              }
            </div>
            <div className="d-none ps-2 d-md-flex flex-column gap-2">
              {saveButton}
              {children}
            </div>
          </div>        
        </form>
      </div>
      <div className="d-md-none d-flex justify-content-end mb-3 gap-2">
        {saveButton}
        {children}
      </div>
    </>
  )
};

export default InputWithSave;