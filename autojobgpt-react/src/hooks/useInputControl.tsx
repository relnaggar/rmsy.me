import React, { useRef, useState } from "react";


export interface InputControlMixin {
  value: string,
  editing: boolean,
  handleChange: (
    ((e: React.ChangeEvent<HTMLInputElement>) => void) |
    ((e: React.ChangeEvent<HTMLTextAreaElement>) => void) |
    ((e: React.ChangeEvent<HTMLSelectElement>) => void)
  ),
};

interface UseInputControl extends InputControlMixin {
  edit: (value: string) => void,
  stopEditing: () => void,
  ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
};

const useInputControl = (
  initialValue?: string
): UseInputControl => {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  
  const [value, setValue] = useState<string>(initialValue || "");
  const [editing, setEditing] = useState<boolean>(false);

  const handleChange = (e:
    React.ChangeEvent<HTMLInputElement> |
    React.ChangeEvent<HTMLTextAreaElement> |
    React.ChangeEvent<HTMLSelectElement>
  ) => {
    setValue(e.target.value);
    setEditing(true);
  };

  const edit = (value: string) => {
    setValue(value);
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  return { value, editing, handleChange, edit, stopEditing, ref };
};

export default useInputControl;