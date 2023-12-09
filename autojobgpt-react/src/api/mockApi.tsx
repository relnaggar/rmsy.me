export function generateResponse<T = any>(data: T, status: number = 200): () => Promise<Response> {
  return async () => new Response(
    JSON.stringify(data), {
      status: status,
      headers: {
        "Content-type": "application/json",
      },
    }
  );
}

export function generateErrorResponse(data: Record<string,string|string[]>, status: number = 400): () => Promise<Response> {
  return async () => new Response(
    JSON.stringify(data), {
      status: status,
      headers: {
        "Content-type": "application/json",
      },
    }
  );
}

interface MockAPIRoute {
  url: string,
  data: any,
  status?: number,
}

export function generateConditionalResponseByRoute(mockAPIRoutes: MockAPIRoute[], status: number = 200): (
  input: RequestInfo | URL, init?: RequestInit | undefined
) => Promise<Response> {
  return async (input: RequestInfo | URL, init?: RequestInit | undefined) => {
    const mockAPIRoute: MockAPIRoute | undefined = mockAPIRoutes.find((mockAPIRoute) => mockAPIRoute.url === input.toString());
    return new Response(      
      JSON.stringify(mockAPIRoute ? mockAPIRoute.data : []), {
        status: mockAPIRoute && mockAPIRoute.status ? mockAPIRoute.status : status,
        headers: {
          "Content-type": "application/json",
        },
      }
    );
  }
}


