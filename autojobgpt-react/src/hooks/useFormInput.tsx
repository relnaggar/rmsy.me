import React, { useRef, useState } from "react";


export default function useFormInput(
  initialValue?: string
): {
  value: string,
  editing: boolean,
  handleChange: (e:
    React.ChangeEvent<HTMLInputElement> |
    React.ChangeEvent<HTMLTextAreaElement> |
    React.ChangeEvent<HTMLSelectElement>
  ) => void,
  edit: (value: string) => void,
  stopEditing: () => void,
  ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
} {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  
  const [value, setValue] = useState<string>(initialValue || "");
  const [editing, setEditing] = useState<boolean>(false);

  function handleChange(e:
    React.ChangeEvent<HTMLInputElement> |
    React.ChangeEvent<HTMLTextAreaElement> |
    React.ChangeEvent<HTMLSelectElement>
  ) {
    setValue(e.target.value);
    setEditing(true);
  }

  function edit(value: string) {
    setValue(value);
    setEditing(true);
  }

  function stopEditing() {
    setEditing(false);
  };

  return { value, editing, handleChange, edit, stopEditing, ref };
}