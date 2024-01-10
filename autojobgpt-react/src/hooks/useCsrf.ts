import useFetch from "./useFetch";

import { UseErrorAlert } from "./useErrorAlert";
import { CsrfResponse } from "../api/types";


interface UseCsrf {
  csrfToken: string,
  fetchingCsrfToken: boolean,
};

interface UseCsrfParams extends UseErrorAlert {};

const useCsrf = ({...errorAlert}: UseCsrfParams ): UseCsrf  => {
  const { responseData, fetching: fetchingCsrfToken} = useFetch<CsrfResponse>("csrf/", {
    initialData: { csrfToken: "" },
    onFail: errorAlert.showErrors,
    includeAuthorisationToken: false,
  }, {
    credentials: "include",
  });

  return { csrfToken: responseData.csrfToken, fetchingCsrfToken };
};

export default useCsrf;