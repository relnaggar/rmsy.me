import React from "react";

import { WithID } from "./types";


export default function SelectWithRefresh<Option extends WithID>({
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
}: {
  id: string,
  label: string,
  optionToString: (option: Option) => string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  editing: boolean,
  options: Option[],
  loading: boolean,
  refetch: () => void,
  error?: string,
}): React.JSX.Element {
  const showError = !editing && error !== undefined;
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-group">
        <select
          id={id} name={id} className={`form-select${showError ? " is-invalid" : ""}`}
          value={value} onChange={onChange}
          required disabled={loading} aria-busy={!loading} 
        >
          <option value="0">{ loading ? "Loading..." : "Open this select menu" }</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>{optionToString(opt)}</option>
          ))}
        </select>
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={() => refetch()}
          aria-controls={id}
        >Refresh</button>
      </div>
    </div>
  );
}