import React from "react";
import { ReactComponent as ArrowClockwiseIcon } from "bootstrap-icons/icons/arrow-clockwise.svg";

import { CommonInputControlProps } from "../hooks/useInputControl";
import { UseFetchResource } from "../hooks/useFetchResource";
import InputActionButton from "./InputActionButton";
import BaseInput, { BaseInputProps } from "./BaseInput";
import { WithId } from '../api/types';


interface SelectInputWithRefreshProps<Option extends WithId> extends
  CommonInputControlProps,
  UseFetchResource<Option>,
  Pick<BaseInputProps, "id" | "label" | "errors">
{
  optionToString: (option: Option) => string,
};

const SelectInputWithRefresh = <Option extends WithId>({
  value, editing, handleChange,
  id, label, errors,
  fetching, resources, refetch, cancel,
  optionToString,
}: SelectInputWithRefreshProps<Option>): React.JSX.Element => {
  const selectOptions = resources.map((opt) => ({
    value: opt.id.toString(),
    label: optionToString(opt),
  }));

  const handleClickRefresh = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    refetch();
  };

  const handleClickCancel = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    cancel();
  };

  return (
    <BaseInput id={id} type="select" value={value} loadingOptionLabel="Refreshing..."
      label={label} editing={editing} loading={fetching} errors={errors}
      selectOptions={selectOptions} handleChange={handleChange}    
    >
      <InputActionButton controlsId={id}
        label="Refresh" icon={<ArrowClockwiseIcon />} loading={fetching}
        onClickAction={handleClickRefresh} onClickCancel={handleClickCancel}
      />
    </BaseInput>
  );
};

export default SelectInputWithRefresh;