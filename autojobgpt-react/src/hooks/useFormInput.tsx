import React, { useState } from "react";

export default function useFormInput(): {
  value: string,
  editing: boolean,
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  edit: (value: string) => void,
  stopEditing: () => void,
} {
  const [value, setValue] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
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

  return { value, editing, handleChange, edit, stopEditing };
}