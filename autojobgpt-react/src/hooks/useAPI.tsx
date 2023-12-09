import { useLocation } from 'react-router-dom';

const useAPI = (): string => {
  try {
    const location = useLocation();

    let apiPath: string = location.pathname;
    if (apiPath === "/") {
      return "api/";
    } else {
      const apiPathParts: string[] = apiPath.split("/");
      // add the correct number of "../" to the path
      apiPath = "";
      for (let i = 1; i < apiPathParts.length; i++) {
        apiPath += "../";
      }
      apiPath += "api/";
      return apiPath;
    }
  } catch (error) { // if we're not in a route, then we're in a test
    return "";
  }
};

export default useAPI;