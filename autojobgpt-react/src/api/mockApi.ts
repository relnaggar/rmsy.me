import { errorMessage } from "./mockData";


export const generateResponse = <T extends any>(data: T, status: number = 200) => async () => new Response(
  JSON.stringify(data), {
    status: status,
    headers: {
      "Content-type": "application/json",
    },
  }
);

export const generateErrorResponse = (data: Record<string,string[]>, status: number = 400) =>
    async () => new Response(
  JSON.stringify(data), {
    status: status,
    headers: {
      "Content-type": "application/json",
    },
  }
);

interface MockApiRoute {
  url: string,
  data?: any,
  status?: number,
  reject?: boolean,
}

export const generateConditionalResponseByRoute = (mockApiRoutes: MockApiRoute[], status=200) =>
    async (input: RequestInfo | URL, _?: RequestInit | undefined) => {
  const mockApiRoute: MockApiRoute | undefined = mockApiRoutes.find((mockApiRoute) => mockApiRoute.url === input.toString());
  if (mockApiRoute && mockApiRoute.reject) {
    return Promise.reject(new Error(errorMessage));
  } else if (input.toString().includes("isLoggedIn")) {
    return new Response(
      JSON.stringify({
        loggedIn: true,
        username: "",
      }), {
        status: 200,
        headers: {
          "Content-type": "application/json",
        },
      }
    );
  } else {
    return new Response(
      JSON.stringify(mockApiRoute ? mockApiRoute.data : []), {
        status: mockApiRoute && mockApiRoute.status ? mockApiRoute.status : status,
        headers: {
          "Content-type": "application/json",
        },
      }
    );
  }
};