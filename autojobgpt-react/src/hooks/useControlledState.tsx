import React, { useState, useEffect, useCallback } from 'react';


const useControlledState = <T extends unknown>(
  initialValue: T,
  valueProp?: T,
  setValueProp?: React.Dispatch<React.SetStateAction<T>>,
): readonly [T, (newValue: T) => void] => {
  const [value, setInternalValue] = useState<T>(valueProp || initialValue);

  useEffect(() => {
    if (valueProp !== undefined) {
      setInternalValue(valueProp);
    }
  }, [valueProp]);

  const setValue = useCallback((newValue: T): void => {
    if (valueProp === undefined) {
      setInternalValue(newValue);
    }
    if (setValueProp !== undefined) {
      setValueProp(newValue);
    }
  }, [valueProp, setValueProp]);

  return [value, setValue] as const;
};

export default useControlledState;