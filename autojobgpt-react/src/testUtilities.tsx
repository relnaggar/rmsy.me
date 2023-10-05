import React from 'react';
import { RouterProvider, createMemoryRouter, RouteObject } from "react-router-dom";
import { render, act } from '@testing-library/react';

import { routesConfig, routesBasename }  from './routesConfig';
import { generateResponse } from './mockAPI';


const mockRoutesConfig: RouteObject[] = [...routesConfig];

export const mockFunctions: {
  fetchData: jest.MockedFunction<typeof fetch>
} = {
  fetchData: jest.fn() as jest.MockedFunction<typeof fetch>
};
  
export function injectMocks() {
  function injectMocksIntoRoutes(routes: RouteObject[]) {
    for (const route of routes) {
      if (route.element) {
        route.element = route.element as React.ReactElement;
        if (route.element.props && route.element.props.fetchData) {
          route.element = React.cloneElement(route.element, {
            ...route.element.props,
            fetchData: mockFunctions.fetchData,
          });
        }
      }
      if (route.children) {
        injectMocksIntoRoutes(route.children);
      }
    }
  }
  injectMocksIntoRoutes(mockRoutesConfig);

  // default mocks
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
}

export async function renderRoute(path: string) {
  await act(async () => {
    render(<RouterProvider router={createMemoryRouter(mockRoutesConfig, {
      initialEntries: [routesBasename + path],
      basename: routesBasename,
    })} />);
  });
}

export function testRouteAndAllChildren(
  route: RouteObject,
  theTest: (routePath: string) => void,
): void {
  if (route.path) {
    theTest(route.path);
    if (route.children) {  
      for (const child of route.children) {
        testRouteAndAllChildren(child, theTest);
      }
    }
  }
}