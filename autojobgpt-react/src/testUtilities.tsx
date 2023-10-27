import React from "react";
import { RouterProvider, createMemoryRouter, RouteObject } from "react-router-dom";
import { render, act, screen, getByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { routesConfig, routesBasename }  from "./routesConfig";
import { generateResponse } from "./mockAPI";


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

export async function openAndGetModal(openModalButton: HTMLElement, modalName: string, timeout: number = 1000): Promise<HTMLElement> {
  // click the add resume template button
  userEvent.click(openModalButton);
  
  // wait for the modal to appear
  const modal: HTMLElement = await screen.findByRole(
    "dialog",
    {name: new RegExp(modalName, "i")},
    {timeout: timeout}
  );
  return modal;
}

export function getSubmitButton(modal: HTMLElement): HTMLElement {
  return getByRole(modal, "button", {name: new RegExp("submit", "i")});
}

export function closeModal(modalName: string): void {
  // simulating clicking the close button isn't working in the test environment
  // instead, this function manually carries out the same steps as Bootstrap does when the close button is clicked
  const modal: HTMLElement = screen.getByRole("dialog", {name: new RegExp(modalName, "i")});
  modal.removeAttribute("aria-modal")
  modal.removeAttribute("role")
  modal.classList.remove("show");
  modal.setAttribute("style", "display: none;");
  modal.setAttribute("aria-hidden", "true");

  const backdrop: HTMLElement | null = document.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.remove();
  }
  document.body.classList.remove("modal-open");
  document.body.removeAttribute("style");
  document.body.removeAttribute("data-bs-overflow");
}