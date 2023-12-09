import React from "react";
import { ReactComponent as ArrowClockwiseIcon } from "bootstrap-icons/icons/arrow-clockwise.svg";

import { InputControlMixin } from "../hooks/useInputControl";
import BaseInput, { BaseInputMixin } from "./BaseInput";
import InputActionButton from "./InputActionButton";
import { WithID } from "./types";


interface SelectInputWithRefreshProps<Option extends WithID> extends InputControlMixin, Omit<BaseInputMixin, "loading"> {
  refreshing: boolean,
  optionToString: (option: Option) => string,
  options: Option[],
  refresh: () => void,
  cancel: () => void,
  optionZeroLabel?: string,
};

const SelectInputWithRefresh = <Option extends WithID>({
  value, editing, handleChange,
  id, label, errors,
  refreshing,
  options,
  optionToString,  
  refresh,
  cancel,
  optionZeroLabel = "Select...",
}: SelectInputWithRefreshProps<Option>): React.JSX.Element => {
  const input = (
    <select id={id}
      name={id} className="form-select" disabled={refreshing} aria-busy={!refreshing} value={value}
      onChange={handleChange as ((e: React.ChangeEvent<HTMLSelectElement>) => void)}
    >
      <option value="0">{refreshing ? "Refreshing..." : optionZeroLabel }</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>{optionToString(opt)}</option>
      ))}
    </select>
  );

  const handleClickRefresh = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    refresh();
  };

  const handleClickCancel = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    cancel();
  };

  return (
    <BaseInput id={id} label={label} input={input} editing={editing} loading={refreshing} errors={errors}>
      <InputActionButton controlsId={id}
        label="Refresh" icon={<ArrowClockwiseIcon />} loading={refreshing}
        onClickAction={handleClickRefresh} onClickCancel={handleClickCancel}
      />
    </BaseInput>
  );
};

export default SelectInputWithRefresh;