import { useLocation } from 'react-router-dom';

const useApiRoot = (): string => {
  try {
    const location = useLocation();

    let apiRoot: string = location.pathname;
    if (apiRoot === "/") {
      return "api/";
    } else {
      const apiRootParts: string[] = apiRoot.split("/");
      // add the correct number of "../" to the path
      apiRoot = "";
      for (let i = 1; i < apiRootParts.length; i++) {
        apiRoot += "../";
      }
      apiRoot += "api/";
      return apiRoot;
    }
  } catch (error) { // if we're not in a route, then we're in a test
    return "";
  }
};

export default useApiRoot;