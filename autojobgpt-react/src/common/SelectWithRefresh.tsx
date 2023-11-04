import React, { useContext, useState, useEffect } from "react";

import { FetchDataContext } from "../routes/routesConfig";


interface WithID {
  id: number,
}

export default function SelectWithRefresh<Option extends WithID>({apiPath, id, optionToString}: {
  apiPath: string,
  id: string,
  optionToString: (option: Option) => string,
}): React.JSX.Element {
  const fetchData = useContext(FetchDataContext);

  const [options, setOptions] = useState<Option[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    async function getOptions(): Promise<void> {
      await fetchData(apiPath, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(response => response.json())
      .then(data => setOptions(data))
      .catch(error => console.error("Error:", error))
      .finally(() => setLoaded(true));
    }
    if (!loaded) {
      getOptions();
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRefresh(): void {
    setLoaded(false);
  }

  return (
    <div className="input-group">
      <select className="form-select" id={id} name={id} defaultValue="0" required disabled={!loaded} >
        <option value="0">{ loaded ? "Open this select menu" : "Loading..."}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{optionToString(option)}</option>
        ))}
      </select>
      <button className="btn btn-outline-primary" type="button" onClick={handleRefresh}>Refresh</button>
    </div>
  );
}