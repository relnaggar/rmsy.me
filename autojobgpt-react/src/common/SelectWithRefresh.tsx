import React from "react";

import useFetch from "../hooks/useFetch";
import { WithID } from "./types";


export default function SelectWithRefresh<Option extends WithID>({apiPath, id, optionToString}: {
  apiPath: string,
  id: string,
  optionToString: (option: Option) => string,
}): React.JSX.Element {
  const { resource: options, fetching: loading, refetch } = useFetch<Option[]>(apiPath);

  function handleRefresh(): void {
    refetch();
  }

  return (
    <div className="input-group">
      <select className="form-select" id={id} name={id} defaultValue="0" required disabled={loading} aria-busy={!loading}>
        <option value="0">{ loading ? "Loading..." : "Open this select menu" }</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{optionToString(option)}</option>
        ))}
      </select>
      <button
        className="btn btn-outline-primary"
        type="button"
        onClick={handleRefresh}
        aria-controls={id}
      >Refresh</button>
    </div>
  );
}