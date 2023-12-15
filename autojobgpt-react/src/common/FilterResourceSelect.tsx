import React from "react";

import useInputControl from "../hooks/useInputControl";
import { WithId } from "../api/types";


export interface FilterResourceMixin<FilterByOption extends WithId> {
  inputControl: ReturnType<typeof useInputControl>,
  filterByOptions: FilterByOption[],
}

interface FilterResourceSelectProps<FilterByOption extends WithId> extends FilterResourceMixin<FilterByOption> {
  filterByOptionToString: (resource: FilterByOption) => string,
  filterLabel: string,
  defaultOptionLabel: string,
}

const FilterResourceSelect = <FilterByOption extends WithId>({
  inputControl,
  filterByOptions,
  filterByOptionToString,
  filterLabel,
  defaultOptionLabel,
}: FilterResourceSelectProps<FilterByOption>): React.JSX.Element => {
  if (filterByOptions.length < 2) {
    return <></>;
  }

  return (
    <div className="mb-3 row">
      <label htmlFor="resume-job-select" className="col-auto col-form-label me-3">{filterLabel}</label>
      <div className="col-auto">
        <select id="resume-job-select"
          className="form-select"
          value={inputControl.value}
          onChange={inputControl.handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
        >
          <option value="0">{defaultOptionLabel}</option>
          {filterByOptions.map((filterByOption) => (
            <option key={filterByOption.id} value={filterByOption.id}>{filterByOptionToString(filterByOption)}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterResourceSelect;