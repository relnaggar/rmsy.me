import React from "react";
import { RouterProvider, createMemoryRouter, RouteObject } from "react-router-dom";
import { render, act, screen, getByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { routesConfig, routesBasename }  from "../routes/routesConfig";
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

export function openModal(openModalButton: HTMLElement): void {
  const modalId: string = openModalButton.getAttribute("data-bs-target")!.slice(1);
  const modal: HTMLElement = document.getElementById(modalId)!;

  modal.setAttribute("aria-modal", "true")
  modal.setAttribute("role", "dialog")
  modal.classList.add("show");
  modal.setAttribute("style", "display: block;");
  modal.removeAttribute("aria-hidden");

  document.body.classList.add("modal-open");
  document.body.setAttribute("style", "overflow: hidden; padding-right: 15px;");

  const backdrop = document.createElement("div");
  backdrop.classList.add("modal-backdrop", "fade", "show");
  document.body.appendChild(backdrop);
}

export async function openAndGetModal(openModalButton: HTMLElement, modalName: string, timeout: number = 1000): Promise<HTMLElement> {
  // click the add resume template button
  userEvent.click(openModalButton);

  // bootstrap not working in test environment so manually open modal
  openModal(openModalButton);
  
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