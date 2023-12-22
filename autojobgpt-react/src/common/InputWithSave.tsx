import React, { useState, useEffect, useId } from "react";
import { ReactComponent as FloppyIcon } from "bootstrap-icons/icons/floppy.svg";

import useInputControl from "../hooks/useInputControl";
import usePatch from "../hooks/usePatchResource";
import { CommonEditModalProps } from "../common/EditModal";
import BaseInput, { SelectOption } from "./BaseInput";
import { WithId } from '../api/types';


interface InputWithSaveProps<Resource extends WithId> extends
  CommonEditModalProps<Resource>,
  Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'value'>
{
  type: string,
  editableProperty: keyof Resource & string,
  labelProperty?: keyof Resource,
  labelText?: string,
  onSaveSuccess?: () => void,
  selectOptions?: SelectOption[],
  value?: string,
  setValue?: React.Dispatch<React.SetStateAction<string>>,
}

const InputWithSave = <Resource extends WithId>({
  apiPath, resources, setResources, editId,
  type,  
  editableProperty,
  labelProperty,
  labelText,
  onSaveSuccess,  
  selectOptions,
  value: valueProp,
  setValue: setValueProp,
  children,
  required,
  ...extraInputProps
}: React.PropsWithChildren<InputWithSaveProps<Resource>>): React.JSX.Element => {
  if (!labelProperty && !labelText) throw new Error("InputWithSave must have either labelProperty or labelText");

  const resource: Resource = resources.find((resource) => resource.id === editId)!;
  const id = useId();
  
  let tmp: string;
  if (typeof resource[editableProperty] === "string") {
    tmp = resource[editableProperty] as string;
  } else if (typeof resource[editableProperty] === "number") {
    tmp = (resource[editableProperty] as number).toString();
  } else {
    throw new Error(`resourceEditableProperty must be a string or number, but it is a ${typeof resource[editableProperty]}`);
  }
  const resourceEditableProperty: string = tmp;

  const validateSubmit = (value: string) => {
    const errors: Record<string,string[]> = {};
    if (required && (value === "" || (type === "select" && value === "0"))) {
      errors[editableProperty] = [`Please enter a ${labelText ? labelText.toLowerCase() : editableProperty}.`];
    }
    return errors;
  };

  const [saved, setSaved] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string,string[]>>({});
  const { editing, value, edit, handleChange, stopEditing, ref } = useInputControl(resourceEditableProperty, valueProp, setValueProp);

  useEffect(() => {
    edit(resourceEditableProperty);
  }, [edit, resourceEditableProperty]);
  
  useEffect(() => {
    if (value === resourceEditableProperty) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [value, resourceEditableProperty]);

  const handleUpdateFail = (errors: Record<string,string[]>) => {
    setErrors(errors);
  };

  const handleUpdateSuccess = () => {
    setErrors({});
    setSaved(true);
    onSaveSuccess && onSaveSuccess();
  };

  const {patchResource: updateResource, patching: updating } = usePatch<Resource>(apiPath, resources, setResources, {
    onFail: handleUpdateFail,
    onSuccess: handleUpdateSuccess,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {  
    e.preventDefault(); // prevent page from reloading

    const value: string = (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    const errorMessage = validateSubmit(value);
    if (Object.keys(errorMessage).length === 0) {
      updateResource(editId, { [editableProperty]: value } as Partial<Resource>);
    } else {
      setErrors(errorMessage);
    }
    stopEditing();
  };

  let label: string;
  if (labelProperty) {
    label = resource[labelProperty] as string;
  } else {
    label = labelText!;
  }

  const saveButton: React.JSX.Element = (
    <button aria-controls={id}
      type="submit" className="btn btn-outline-primary" disabled={updating || saved} aria-busy={updating}
    >
      { updating ?
        <>
          <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
          <span role="status">Saving...</span>
        </>
      : saved ?
        <>
          <FloppyIcon className="me-1" />
          Saved
        </>
      :
        <>
          <FloppyIcon className="me-1" />
          Save
        </>
      }
    </button>
  );
  
  return (
    <BaseInput id={id} ref={ref}
      value={value} editing={editing} handleChange={handleChange}
      type={type} label={label} loading={updating} errors={Object.values(errors).flat()}      
      handleSubmit={handleSubmit} floatingLabel={labelProperty !== undefined} isValid={saved}
      selectOptions={selectOptions} {...extraInputProps}
    >
      {saveButton}
      {children}
    </BaseInput>
  );
};

export default InputWithSave;