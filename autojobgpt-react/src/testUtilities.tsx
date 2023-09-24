import { RouterProvider, createMemoryRouter, RouteObject } from "react-router-dom";
import { render } from '@testing-library/react';

import { routesConfig, routesBasename }  from './routesConfig';


export function renderRoute(path: string) {
  render(<RouterProvider router={createMemoryRouter(routesConfig, {
    initialEntries: [routesBasename + path],
    basename: routesBasename,
  })} />);
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