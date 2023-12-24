import { useCallback } from "react";

import useApiCall, { OnSuccessParams } from "./useApiCall";


interface PostParams {
  postData?: any,
  apiPath?: string,
};

export interface UsePost {
  posting: boolean,
  post: (params?: PostParams) => Promise<void>,
  cancel: () => void,
};

const usePost = <ResponseData extends unknown>(
  options?: {
    apiPath?: string,
    cancelable?: boolean,
    onSuccess?: (responseData: ResponseData) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UsePost => {
  const { apiPath, onSuccess, onFail, cancelable = false } = options || {};

  const handleSuccess = useCallback(async ({response}: OnSuccessParams): Promise<void> => {
    const responseData: ResponseData = await response.json();
    onSuccess?.(responseData);
  }, [onSuccess]);

  const { calling: posting, call, cancel } = useApiCall("POST", {
    apiPath,
    cancelable,
    onSuccess: handleSuccess,
    onFail
  });

  const post = useCallback(async (params?: PostParams): Promise<void> => {
    const { postData, apiPath } = params || {};
    await call({apiPath: apiPath, data: postData});
  }, [call]);

  const cancelPost = useCallback((): void => {
    cancel!();
  }, [cancel]);

  return { posting, post, cancel: cancelPost };
};

export default usePost;