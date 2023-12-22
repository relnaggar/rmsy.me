import { useCallback } from "react";

import useApiCall, { OnSuccessParams } from "./useApiCall";


export interface UsePost {
  posting: boolean,
  post: (postData?: any) => Promise<void>,
};

const usePost = <ResponseData extends unknown>(
  apiPath: string,
  options?: {
    onSuccess?: (responseData: ResponseData) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UsePost => {
  const { onSuccess, onFail } = options || {};

  const handleSuccess = useCallback(async ({response}: OnSuccessParams): Promise<void> => {
    const responseData: ResponseData = await response.json();
    onSuccess?.(responseData);
  }, [onSuccess]);

  const { calling: posting, call } = useApiCall(apiPath, "POST", {
    onSuccess: handleSuccess,
    onFail
  });

  const post = useCallback(async (postData?: any): Promise<void> => {
    await call({data: postData});
  }, [call]);

  return { posting, post };
};

export default usePost;