import React, { useId, useState } from 'react';

import SubstitutionInput, { SubstitutionInputProps } from './SubstitutionInput';


const ToggleSubstitutionInput = ({
  ...substitutionInput
}: SubstitutionInputProps): React.JSX.Element => {
  const { substitution } = substitutionInput;
  
  const id = useId();
  const [showSubstitutionInput, setShowSubstitutionInput] = useState<boolean>(false);  

  const onChangeToggleSubstitution = (_: React.ChangeEvent<HTMLInputElement>): void => {
    setShowSubstitutionInput(!showSubstitutionInput);
  };

  return (
    <>
      <input id={id}
        type="checkbox" className="btn-check" checked={showSubstitutionInput} onChange={onChangeToggleSubstitution}
        aria-expanded={showSubstitutionInput} aria-label={substitution!.key}
      />
      <label htmlFor={id} className="btn btn-light text-start mb-3" title={substitution!.key}>
        { substitution!.value}
      </label>
      { showSubstitutionInput &&
        <SubstitutionInput {...substitutionInput} />
       }
    </>
  );
};

export default ToggleSubstitutionInput;