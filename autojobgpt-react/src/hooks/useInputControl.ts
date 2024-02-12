import React, { useRef, useState, useEffect, useCallback } from "react";

import useControlledState from "./useControlledState";


export interface CommonInputControlProps {
  name: string,
  value: string,
  editing: boolean,
  handleChange: (
    ((e: React.ChangeEvent<HTMLInputElement>) => void) |
    ((e: React.ChangeEvent<HTMLTextAreaElement>) => void) |
    ((e: React.ChangeEvent<HTMLSelectElement>) => void)
  ),
};

export interface UseInputControl extends CommonInputControlProps {
  edit: (value: string) => void,
  stopEditing: () => void,
  ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
};

const useInputControl = (
  name: string,
  initialValue?: string,
  valueProp?: string,
  setValueProp?: React.Dispatch<React.SetStateAction<string>>,
): UseInputControl => {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const [value, setValue] = useControlledState<string>(initialValue || "", valueProp, setValueProp);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.nodeName === "TEXTAREA") {
      const textarea = ref.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
    }
  }, [value]);

  const handleChange = useCallback((e:
    React.ChangeEvent<HTMLInputElement> |
    React.ChangeEvent<HTMLTextAreaElement> |
    React.ChangeEvent<HTMLSelectElement>
  ) => {    
    if (e.target.type === "checkbox") {
      setValue((e.target as HTMLInputElement).checked.toString());
    } else if (e.target.nodeName === "TEXTAREA") {
      cursorPositionRef.current = (e as React.ChangeEvent<HTMLTextAreaElement>).target.selectionStart;
      setValue(e.target.value);
    } else {
      setValue(e.target.value);
    }
    setEditing(true);
  }, [setValue]);

  const edit = useCallback((value: string) => {
    setValue(value);
    setEditing(true);
  }, [setValue]);

  const stopEditing = useCallback(() => {
    setEditing(false);
  }, []);

  return { name, value, editing, handleChange, edit, stopEditing, ref };
};

export default useInputControl;