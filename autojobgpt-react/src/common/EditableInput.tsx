import React, { useState } from "react";

import usePatch from "../hooks/usePatch";
import { toPascalCase } from "./utils";
import { WithID } from "./types";


export default function EditableInput<Resource extends WithID>({
  type,
  apiPath,
  resources,
  setResources,
  id,
  editableProperty,
  labelProperty,
  labelText,
}: {
  type: "text" | "textarea",
  apiPath: string,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  id: number,
  editableProperty: keyof Resource & string,
  labelProperty?: keyof Resource,
  labelText?: string,
}): React.JSX.Element {
  const resource: Resource = resources.find((resource) => resource.id === id)!;
  const elementID: string = `${apiPath.replace("/", "-")}${id}-${editableProperty}`;

  const { updateResource, updated, error } = usePatch<Resource>(apiPath, resources, setResources);
  const [edited, setEdited] = useState<boolean>(true);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    // prevent page from reloading
    e.preventDefault();

    const value: string = (document.getElementById(elementID) as HTMLTextAreaElement).value;
    updateResource(id, { [editableProperty]: value } as Partial<Resource>);
    setEdited(false);
  }

  function handleChange(_: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setEdited(true);
  }

  const input: React.JSX.Element = (
    <>
      {type === "textarea" &&
        <textarea
          className={`form-control${
            (!edited && updated && !error) ? " is-valid" : ""}${
            (error && updated) ? " is-invalid" : ""
          }`}
          style={{ minHeight: "64px" }}
          id={elementID}
          defaultValue={resource[editableProperty] as string}
          onChange={handleChange}
          disabled={!updated}
        ></textarea>
      }
      {type === "text" &&
        <input
          type="text"
          className={`form-control${
            (!edited && updated && !error) ? " is-valid" : ""}${
            (error && updated) ? " is-invalid" : ""
          }`}
          id={elementID}
          defaultValue={resource[editableProperty] as string}
          onChange={handleChange}
          disabled={!updated}
        />
      }
      <div className="invalid-feedback">
        {error}
      </div>
    </>
  );

  return (
    <div className="mb-3">
      {!labelProperty && <label className="form-label" htmlFor={elementID}>
        {labelText ? labelText : toPascalCase(editableProperty)}
      </label>}
      <form onSubmit={handleSubmit} className="d-flex">        
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
          <button type="submit" className="btn btn-outline-primary" disabled={!updated}>
            {updated?
              "Save"
            :
              <>
                <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                <span role="status">Saving...</span>
              </>
            }
          </button>
        </div>
      </form>
    </div>
  )
}