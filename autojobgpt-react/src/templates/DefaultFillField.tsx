import React from "react";

import { useId } from "react";
import { FillField } from "../api/types";


interface DefaultFillFieldProps {
  fillField: FillField,
}

const DefaultFillField = ({
  fillField,
}: DefaultFillFieldProps): React.JSX.Element => {
  const elementId = useId();
  return (
    <div className="mb-3 form-floating" key={fillField.id}>
      <textarea id={elementId}
        className="form-control"
        style={{ minHeight: "64px" }}
        disabled={true}
        defaultValue={fillField.description}
      />
      <label htmlFor={elementId}>{fillField.key}</label>  
    </div>
  );
};

export default DefaultFillField;