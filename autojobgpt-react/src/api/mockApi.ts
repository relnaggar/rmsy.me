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

interface MockAPIRoute {
  url: string,
  data?: any,
  status?: number,
  reject?: boolean,
}

export const generateConditionalResponseByRoute = (mockAPIRoutes: MockAPIRoute[], status=200) =>
    async (input: RequestInfo | URL, _?: RequestInit | undefined) => {
  const mockAPIRoute: MockAPIRoute | undefined = mockAPIRoutes.find((mockAPIRoute) => mockAPIRoute.url === input.toString());
  if (mockAPIRoute && mockAPIRoute.reject) {
    return Promise.reject(new Error(errorMessage));
  } else {
    return new Response(
      JSON.stringify(mockAPIRoute ? mockAPIRoute.data : []), {
        status: mockAPIRoute && mockAPIRoute.status ? mockAPIRoute.status : status,
        headers: {
          "Content-type": "application/json",
        },
      }
    );
  }
};