import React, { useState } from "react";

import usePatch from "../hooks/usePatch";
import { WithID } from "./types";


export default function InputWithSave<Resource extends WithID>({
  type,
  apiPath,
  resources,
  setResources,
  id,
  editableProperty,
  labelProperty,
  labelText,
  ...props
}: {
  type: string,
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  id: number,
  editableProperty: keyof Resource & string,
  labelProperty?: keyof Resource,
  labelText?: string,
  [key: string]: any,
}): React.JSX.Element {
  if (!labelProperty && !labelText) throw new Error("InputWithSave must have either labelProperty or labelText");

  const resource: Resource = resources.find((resource) => resource.id === id)!;
  const elementID: string = `${apiPath.replace("/", "-")}${id}-${editableProperty}`;

  const [edited, setEdited] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const {patchResource: updateResource, patching: updating } = usePatch<Resource>(apiPath, resources, setResources, {
    onFail: setErrors,
    onSuccess: () => setErrors({}),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {    
    e.preventDefault(); // prevent page from reloading

    const value: string = (document.getElementById(elementID) as HTMLTextAreaElement).value;
    updateResource(id, { [editableProperty]: value } as Partial<Resource>);
    setEdited(false);
  }

  function handleChange(_: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setEdited(true);
  }

  const thereAreErrors: boolean = Object.keys(errors).length > 0;
  const showError: boolean = !edited && !updating && thereAreErrors;
  const textAreaProps: React.TextareaHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> = {
    className: `form-control${
      (!edited && !updating && !thereAreErrors) ? " is-valid" : ""}${
      showError ? " is-invalid" : ""
    }`,
    id: elementID,
    name: elementID,
    defaultValue: resource[editableProperty] as string,
    onChange: handleChange,
    disabled: updating,
    "aria-describedby": showError? `${elementID}-feedback` : undefined,
    ...props,
  };
  const input: React.JSX.Element = (
    <>
      {type === "textarea"?
        <textarea {...textAreaProps}></textarea>
      :
        <input type={type} {...textAreaProps} />
      }
      <div className="invalid-feedback" id={`${elementID}-feedback`} role={showError? "alert": undefined}>
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
  
  return (
    <div className="mb-3">
      <form onSubmit={handleSubmit} aria-label={`Form for updating ${ariaLabel}`}>
        {!labelProperty && <label className="form-label" htmlFor={elementID}>
          {labelText}
        </label>}
        <div className="d-flex">        
          <div className="flex-grow-1">
            {labelProperty ?
              <div className="form-floating">        
                {input}
                <label htmlFor={elementID}>{resource[labelProperty] as string}</label>              
              </div>
            :
              input
            }
          </div>
          <div className="ps-2">
            <button type="submit" className="btn btn-outline-primary" disabled={updating}>
              {updating?
                <>
                  <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                  <span role="status">Saving...</span>
                </>
              :
                <>
                  Save
                </>              
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}