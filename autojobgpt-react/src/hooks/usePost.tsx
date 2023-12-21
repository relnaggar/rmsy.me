import useApiCall from "./useApiCall";


export interface UsePost {
  posting: boolean,
  post: (postData?: any) => Promise<void>,  
  cancel: () => void,
};

const usePost = <ResponseData extends unknown>(
  apiPath: string,
  options?: {
    onSuccess?: (responseData: ResponseData) => void,
    onFail?: (errors: Record<string,string[]>) => void,
  },
): UsePost => {
  const { onSuccess, onFail } = options || {};

  const handleSuccess = async (response: Response): Promise<void> => {
    const responseData: ResponseData = await response.json();
    onSuccess?.(responseData);
  }

  const { calling: posting, call: post, cancel } = useApiCall(apiPath, "POST", {
    onSuccess: handleSuccess,
    onFail
  });

  return { posting, post, cancel };
};

export default usePost;