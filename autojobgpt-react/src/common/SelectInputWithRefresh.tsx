import React from "react";
import { ReactComponent as ArrowClockwiseIcon } from "bootstrap-icons/icons/arrow-clockwise.svg";

import { InputControlMixin } from "../hooks/useInputControl";
import { UseFetchResource } from "../hooks/useFetchResource";
import BaseInput, { BaseInputMixin } from "./BaseInput";
import InputActionButton from "./InputActionButton";
import { WithId } from '../api/types';


interface SelectInputWithRefreshProps<Option extends WithId> extends
  InputControlMixin,
  Omit<BaseInputMixin, "loading">,
  UseFetchResource<Option>
{
  optionToString: (option: Option) => string,
  optionZeroLabel?: string,
};

const SelectInputWithRefresh = <Option extends WithId>({
  value, editing, handleChange,
  id, label, errors,
  fetching, resources, refetch, cancel,
  optionToString,
  optionZeroLabel = "Select...",  
}: SelectInputWithRefreshProps<Option>): React.JSX.Element => {
  const input = (
    <select id={id}
      name={id} className="form-select" disabled={fetching} aria-busy={!fetching}
      value={value} onChange={handleChange as ((e: React.ChangeEvent<HTMLSelectElement>) => void)}
    >
      <option value="0">{fetching ? "Refreshing..." : optionZeroLabel }</option>
      {resources.map((opt) => (
        <option key={opt.id} value={opt.id}>{optionToString(opt)}</option>
      ))}
    </select>
  );

  const handleClickRefresh = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    refetch();
  };

  const handleClickCancel = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    cancel();
  };

  return (
    <BaseInput id={id} label={label} input={input} editing={editing} loading={fetching} errors={errors}>
      <InputActionButton controlsId={id}
        label="Refresh" icon={<ArrowClockwiseIcon />} loading={fetching}
        onClickAction={handleClickRefresh} onClickCancel={handleClickCancel}
      />
    </BaseInput>
  );
};

export default SelectInputWithRefresh;