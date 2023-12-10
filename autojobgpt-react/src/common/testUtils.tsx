import React from "react";
import { RouterProvider, createMemoryRouter, RouteObject } from "react-router-dom";
import { render, act, screen, getByRole, getAllByRole, queryAllByRole, getByLabelText } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { routesConfig, routesBasename }  from "../routes/routesConfig";
import { generateResponse } from "../api/mockApi";


const mockRoutesConfig: RouteObject[] = [...routesConfig];

export const mockFunctions: {
  [key: string]: jest.MockedFunction<any>,
} = {
  fetchData: jest.fn() as jest.MockedFunction<typeof fetch>
};
  
export const injectMocks = (): void => {
  function injectMocksIntoRoutes(routes: RouteObject[]) {
    for (const route of routes) {
      if (route.element) {
        route.element = route.element as React.ReactElement;
        if (route.element.props && route.element.props.value) {
          route.element = React.cloneElement(route.element, {
            ...route.element.props,
            value: mockFunctions.fetchData,
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
};

export const renderRoute = async (path: string): Promise<void> => {
  await act(async () => {
    render(<RouterProvider router={createMemoryRouter(mockRoutesConfig, {
      initialEntries: [routesBasename + path],
      basename: routesBasename,
    })} />);
  });
};

export const testRouteAndAllChildren = (
  route: RouteObject,
  theTest: (routePath: string) => void,
): void => {
  if (route.path) {
    theTest(route.path);
    if (route.children) {  
      for (const child of route.children) {
        testRouteAndAllChildren(child, theTest);
      }
    }
  }
};

export interface OpenAndGetModalParams {
  modalName: string,
  timeout?: number,
  openModalButtonText?: string,
};

export const openAndGetModal = async ({
  modalName,
  timeout = 1000,
  openModalButtonText,
}: OpenAndGetModalParams): Promise<HTMLElement> => {
  let openModalButton: HTMLElement;
  if (openModalButtonText) {
    openModalButton = screen.getByRole("button", {name: new RegExp(openModalButtonText, "i")});
  } else {
    openModalButton = screen.getByRole("button", {name: new RegExp(modalName, "i")});
  }
  await act(async () => {
    userEvent.click(openModalButton!);
  });
  return await screen.findByRole(
    "dialog",
    {name: new RegExp(modalName, "i")},
    {timeout: timeout}
  );
};

export const getSubmitButton = (modal: HTMLElement): HTMLElement => {
  return getByRole(modal, "button", {name: new RegExp("submit", "i")});
};

export const clickSubmitButton = async (modal: HTMLElement): Promise<void> => {
  const submitButton: HTMLElement = getSubmitButton(modal);
  await act(async () => {
    userEvent.click(submitButton);
  });
};

export const userTypeInput = async (modal: HTMLElement, inputLabel: string, text: string): Promise<void> => {
  const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(inputLabel, "i")});
  await act(async () => {
    userEvent.type(input, text);
  });
};

export const clickCloseButton = async (modal: HTMLElement): Promise<void> => {
  const closeButton: HTMLElement = getAllByRole(modal, "button", {name: new RegExp("close", "i")})[0];
  await act(async () => {
    userEvent.click(closeButton);
  });
};

export const userUploadDocxFile = async (modal: HTMLElement, labelText: string, fileName: string): Promise<void> => {
  await act(async () => {
    const fileInput: HTMLInputElement = getByLabelText(modal, new RegExp(labelText, "i"));
    userEvent.upload(fileInput, new File([""], fileName, {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}));
  });
};

export const getSection = (headingLabel: string): HTMLElement => {
  const heading: HTMLElement = screen.getByRole("heading", {name: new RegExp(headingLabel, "i"), level: 2});
  return heading.parentElement as HTMLElement;
};

export const queryResources = (headingLabel: string): HTMLElement[] => {
  const resourceSection: HTMLElement = getSection(headingLabel);
  const listItems: HTMLElement[] = queryAllByRole(resourceSection, "listitem");
  const resources: HTMLElement[] = listItems.filter((listItem: HTMLElement) => 
    !listItem.hasAttribute("aria-busy") || listItem.getAttribute("aria-busy") === "false"
  );
  return resources;
};

export const openAndGetDeleteModal = async (resourceElement: HTMLElement, timeout: number = 1000): Promise<HTMLElement> => {
  const deleteButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("delete", "i")});
  await act(async () => {
    userEvent.click(deleteButton);
  });
  return await screen.findByRole("dialog", {name: new RegExp("confirm delete", "i")}, {timeout: timeout});
};

export const getDeleteButton = (modal: HTMLElement): HTMLElement => {
  return getByRole(modal, "button", {name: new RegExp("delete", "i")});
};

export const clickDeleteButton = async (modal: HTMLElement): Promise<void> => {
  const deleteButton: HTMLElement = getDeleteButton(modal);
  await act(async () => {
    userEvent.click(deleteButton);
  });
}

export const getRefreshButton = (modal: HTMLElement, label: string): HTMLElement => {
  const input: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(label, "i")});
  const inputId: string = input.getAttribute("id")!;
  return document.querySelector(`[aria-controls="${inputId}"]`)!;
};

export const clickRefreshButton = async (modal: HTMLElement, label: string): Promise<void> => {
  const refreshButton: HTMLElement = getRefreshButton(modal, label);
  await act(async () => {
    userEvent.click(refreshButton);
  });
};

export const getFilterByJobSelect = (): HTMLElement => {
  return screen.getByRole('combobox', {name: new RegExp("filter by job", "i")});
};