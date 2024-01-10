import { useCallback } from "react";

import useApiCall from "./useApiCall";


interface UseDelete {
  doDelete: () => void,
  deleting: boolean,
};

const useDelete = (
  apiPath: string,
  options?: {
    onSuccess?: () => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UseDelete => {
  const { onSuccess, onFail } = options || {};

  const handleSuccess = useCallback(async (): Promise<void> => {
    onSuccess?.();
  }, [onSuccess]);

  const { call, calling: deleting } = useApiCall("DELETE", {
    apiPath,
    onSuccess: handleSuccess,
    onFail,
  });

  const doDelete = useCallback((): void => {
    call();    
  }, [call]);
  
  return { doDelete, deleting };
};

export default useDelete;