import React, { useId, useState } from 'react';


interface ToggleInputProps {
  title?: string,
  label: string,
}

const ToggleInput = ({
  title,
  label,
  children
}: React.PropsWithChildren<ToggleInputProps>): React.JSX.Element => {  
  if (title === undefined) {
    title = label;
  }
  const id = useId();
  const [showInput, setShowInput] = useState<boolean>(false);  

  const onChangeToggle = (_: React.ChangeEvent<HTMLInputElement>): void => {
    setShowInput(!showInput);
  };

  return (
    <>
      <input id={id}
        type="checkbox" className="btn-check" checked={showInput} onChange={onChangeToggle}
        aria-expanded={showInput} aria-label={title}
      />
      <label htmlFor={id} className="btn btn-light text-start mb-3" title={title}>{label}</label>
      { showInput &&
        children
      }
    </>
  );
};

export default ToggleInput;