import React, { useCallback, useState, useRef, useEffect } from "react";
import { ReactComponent as Floppy } from "bootstrap-icons/icons/floppy.svg";

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
  onSaveSuccess,
  children,
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
  onSaveSuccess?: () => void,
  children?: React.ReactNode,
  [key: string]: any,
}): React.JSX.Element {
  if (!labelProperty && !labelText) throw new Error("InputWithSave must have either labelProperty or labelText");

  const resource: Resource = resources.find((resource) => resource.id === id)!;
  const elementID: string = `${apiPath.replace("/", "-")}${id}-${editableProperty}`;

  const [edited, setEdited] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const handleUpdateFail = useCallback((errors: Record<string,string>) => {
    setErrors(errors);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    setErrors({});
    onSaveSuccess && onSaveSuccess();
  }, [onSaveSuccess]);

  const {patchResource: updateResource, patching: updating } = usePatch<Resource>(apiPath, resources, setResources, {
    onFail: handleUpdateFail,
    onSuccess: handleUpdateSuccess,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  let textAreaText: string = "";
  if (labelProperty) {
    textAreaText = resource[editableProperty] as string;
  }
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
      }
    };

    adjustHeight();
  }, [textAreaText]);

  const input: React.JSX.Element = (
    <>
      {type === "textarea"?
        <textarea {...textAreaProps} ref={textareaRef}></textarea>
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
          <div className="ps-2 d-flex flex-column gap-2">
            <button
              type="submit" className="btn btn-outline-primary" disabled={updating} aria-busy={updating}
            >
              {updating?
                <>
                  <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                  <span role="status">Saving...</span>
                </>
              :
                <>
                  <Floppy className="me-1" />
                  Save
                </>
              }
            </button>
            {children}
          </div>
        </div>
      </form>
    </div>
  )
}