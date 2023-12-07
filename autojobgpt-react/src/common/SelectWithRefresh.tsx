import React from "react";
import { ReactComponent as ArrowClockwiseIcon } from "bootstrap-icons/icons/arrow-clockwise.svg";

import { WithID } from "./types";


interface SelectWithRefreshProps<Option extends WithID> {
  id: string,
  label: string,
  optionToString: (option: Option) => string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  editing: boolean,
  options: Option[],
  loading: boolean,
  refetch: () => void,
  error?: string | string[],
  optionZeroLabel?: string,
};

const SelectWithRefresh: <Option extends WithID>(props: SelectWithRefreshProps<Option>) => React.JSX.Element = ({
  id,
  label,
  optionToString,
  value,
  onChange,
  editing,
  options,
  loading,
  refetch,
  error,
  optionZeroLabel,
}) => {
  let errorString: string;
  if (typeof error === "string") {
    errorString = error;
  } else if (error instanceof Array) {
    if (error.length === 0) {
      errorString = "";
    } else {
      errorString = error.join(" ");
    }
  } else {
    errorString = "";
  }
  if (optionZeroLabel === undefined) {
    optionZeroLabel = "Select...";
  }

  const showError = !editing && !loading && errorString !== "";
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-group">
        <select id={id}
          name={id} className={`form-select${showError ? " is-invalid" : ""}`}
          value={value} onChange={onChange} disabled={loading} aria-busy={!loading}
        >
          <option value="0">{ loading ? "Loading..." : optionZeroLabel }</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>{optionToString(opt)}</option>
          ))}
        </select>
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={() => refetch()}
          aria-controls={id}
          disabled={loading}
          aria-busy={loading}
        >
          <ArrowClockwiseIcon className="me-1" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default SelectWithRefresh;