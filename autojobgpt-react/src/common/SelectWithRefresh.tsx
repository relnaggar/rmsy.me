import React, {useState} from "react";

import useFetch from "../hooks/useFetch";
import { WithID } from "./types";


export default function SelectWithRefresh<Option extends WithID>({
  apiPath,
  id,
  label,
  optionToString,
  onRefreshSuccess,
  onRefreshFail,
}: {
  apiPath: string,
  id: string,
  label: string,
  optionToString: (option: Option) => string,
  onRefreshSuccess?: () => void,
  onRefreshFail?: (errors: Record<string, string>) => void,
}): React.JSX.Element {
  const { resource: options, fetching: loading, refetch } = useFetch<Option[]>(apiPath, {
    initialResource: [],
    onSuccess: onRefreshSuccess ?? (() => {}),
    onFail: onRefreshFail ?? (() => {}),
  });

  function handleRefresh(): void {
    refetch();
  }

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-group">
        <select
          id={id} name={id} className="form-select" defaultValue="0"
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
          onClick={handleRefresh}
          aria-controls={id}
        >Refresh</button>
      </div>
    </div>
  );
}