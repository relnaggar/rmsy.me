import React from "react";
import { ReactComponent as ArrowClockwiseIcon } from "bootstrap-icons/icons/arrow-clockwise.svg";

import { InputControlMixin } from "../hooks/useInputControl";
import BaseInput, { BaseInputMixin } from "./BaseInput";
import { WithID } from "./types";


interface SelectInputWithRefreshProps<Option extends WithID> extends InputControlMixin, BaseInputMixin {
  optionToString: (option: Option) => string,
  options: Option[],
  refetch: () => void,
  optionZeroLabel?: string,
};

const SelectInputWithRefresh = <Option extends WithID>({
  value, editing, handleChange,
  id, label, loading, errors,
  options,
  optionToString,  
  refetch,
  optionZeroLabel = "Select...",
}: SelectInputWithRefreshProps<Option>): React.JSX.Element => {
  const input = (
    <select id={id}
      name={id} className="form-select" disabled={loading} aria-busy={!loading} value={value}
      onChange={handleChange as ((e: React.ChangeEvent<HTMLSelectElement>) => void)}
    >
      <option value="0">{loading ? "Loading..." : optionZeroLabel }</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>{optionToString(opt)}</option>
      ))}
    </select>
  );

  const handleClick = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    refetch();
  };

  return (
    <BaseInput id={id} label={label} input={input} editing={editing} loading={loading} errors={errors}>
      <button aria-controls={id}
        className="btn btn-outline-primary" type="button" onClick={handleClick} disabled={loading} aria-busy={loading}
      >
        <ArrowClockwiseIcon className="me-1" />
        Refresh
      </button>
    </BaseInput>
  );
};

export default SelectInputWithRefresh;