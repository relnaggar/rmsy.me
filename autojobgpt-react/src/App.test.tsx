import { render, screen } from '@testing-library/react';
import { RouteObject } from "react-router-dom";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

import { routesConfig, routesBasename }  from './routesConfig';


function renderRoutesAndAllChildren(route: RouteObject): void {
  if (route.path) {
    renderRoute(route.path);  
    if (route.children) {  
      for (const child of route.children) {
        renderRoutesAndAllChildren(child);
      }
    }
  }
}

function renderRoute(path: string): void {
  render(<RouterProvider router={createMemoryRouter(routesConfig, {
    initialEntries: [routesBasename + path],
    basename: routesBasename,
  })} />);
}


test('every route renders without errors', () => {
  for (const route of routesConfig) {
    renderRoutesAndAllChildren(route);
  }
});