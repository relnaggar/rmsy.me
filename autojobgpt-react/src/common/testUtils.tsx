import React from "react";
import { RouterProvider, createMemoryRouter, RouteObject } from "react-router-dom";
import { render, act, screen, getByRole, getAllByRole, queryAllByRole, getByLabelText, queryByRole, queryByText, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/dom";

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
        if (child.path !== "*") {
          testRouteAndAllChildren(child, theTest);
        }
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

export const userInput = async (modal: HTMLElement, inputLabel: string, value: string, role = "textbox"): Promise<void> => {
  const input: HTMLElement = getByRole(modal, role, {name: new RegExp(inputLabel, "i")});
  if (role === "combobox") {
    await act(async () => {
      userEvent.selectOptions(input, value);
    });
  } else {
    await act(async () => {
      userEvent.type(input, value);
    });
  }
};

export const userClearInput = async (modal: HTMLElement, inputLabel: string, role = "textbox"): Promise<void> => {
  const input: HTMLElement = getByRole(modal, role, {name: new RegExp(inputLabel, "i")});
  if (role === "combobox") {
    await act(async () => {
      userEvent.selectOptions(input, "");
    });
  } else {
    await act(async () => {
      userEvent.clear(input);
    });
  }
};

export const clickCloseButton = async (modal: HTMLElement): Promise<void> => {
  const allCloseButtons: HTMLElement[] = getAllByRole(modal, "button", {name: new RegExp("close", "i")});
  const closeButton: HTMLElement = getAllByRole(modal, "button", {name: new RegExp("close", "i")})[allCloseButtons.length - 1];
  await act(async () => {
    userEvent.click(closeButton);
  });
  await waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
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

export const queryResources = (headingLabel: string, role = "listitem"): HTMLElement[] => {
  const resourceSection: HTMLElement = getSection(headingLabel);
  const listItems: HTMLElement[] = queryAllByRole(resourceSection, role);
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

export const openAndGetEditModal = async (resourceElement: HTMLElement, timeout: number = 1000): Promise<HTMLElement> => {
  const editButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("edit", "i")});
  await act(async () => {
    userEvent.click(editButton);
  });
  return await screen.findByRole("dialog", {name: new RegExp("edit", "i")}, {timeout: timeout});
};

export const getDeleteButton = (modal: HTMLElement): HTMLElement => {
  return getByRole(modal, "button", {name: new RegExp("delete", "i")});
};

export const clickDeleteButton = async (modal: HTMLElement): Promise<void> => {
  const deleteButton: HTMLElement = getDeleteButton(modal);
  await act(async () => {
    userEvent.click(deleteButton);
  });
};

export const queryActionElement = (modal: HTMLElement, inputLabel: string, actionElementLabel: string, actionRole: string): HTMLElement | null => {
  const matchingInputs: HTMLElement[] = [
    ...queryAllByRole(modal, "combobox", {name: new RegExp(inputLabel, "i")}),
    ...queryAllByRole(modal, "textbox", {name: new RegExp(inputLabel, "i")})
  ];
  if (matchingInputs.length !== 1) {
    throw new Error(`Input ${inputLabel} not found`);
  }
  const inputId: string = matchingInputs[0].getAttribute("id")!;
  const actionElements: HTMLElement[] = queryAllByRole(modal, actionRole, {name: new RegExp(actionElementLabel, "i")});
  const matchingActionElement: HTMLElement | undefined = actionElements.find((button: HTMLElement) => {
    return button.getAttribute("aria-controls") === inputId;
  });
  if (!matchingActionElement) {
    return null;
  } else {
    return matchingActionElement;  
  }
};

export const getActionElement = (modal: HTMLElement, inputLabel: string, actionElementLabel: string, actionRole: string): HTMLElement => {
  const actionElement: HTMLElement | null = queryActionElement(modal, inputLabel, actionElementLabel, actionRole);
  if (actionElement === null) {
    throw new Error(`Action element ${actionElementLabel} controlling input ${inputLabel} not found`);
  } else {
    return actionElement;  
  }
};

export const clickActionElement = async (modal: HTMLElement, inputLabel: string, actionElementLabel: string, actionRole: string): Promise<void> => {
  const actionElement: HTMLElement = getActionElement(modal, inputLabel, actionElementLabel, actionRole);
  await act(async () => {
    userEvent.click(actionElement);
  });
};

export const queryActionButton = (modal: HTMLElement, inputLabel: string, buttonLabel: string): HTMLElement | null => {
  return queryActionElement(modal, inputLabel, buttonLabel, "button");
};

export const getActionButton = (modal: HTMLElement, inputLabel: string, buttonLabel: string): HTMLElement => {
  return getActionElement(modal, inputLabel, buttonLabel, "button");
};

export const clickActionButton = async (modal: HTMLElement, inputLabel: string, buttonLabel: string): Promise<void> => {
  await clickActionElement(modal, inputLabel, buttonLabel, "button");
};

export const queryFeedbackSwitch = (modal: HTMLElement, label: string): HTMLElement | null => {
  return queryActionElement(modal, label, "feedback", "switch");
};

export const getFeedbackSwitch = (modal: HTMLElement, label: string): HTMLElement => {
  return getActionElement(modal, label, "feedback", "switch");
};

export const clickFeedbackSwitch = async (modal: HTMLElement, label: string): Promise<void> => {
  await clickActionElement(modal, label, "feedback", "switch");
};

export const queryFeedbackInput = (modal: HTMLElement, label: string): HTMLElement | null => {
  return queryActionElement(modal, label, "feedback", "textbox");
};

export const getFeedbackInput = (modal: HTMLElement, label: string): HTMLElement => {
  return getActionElement(modal, label, "feedback", "textbox");
};

export const queryRegenerateButton = (modal: HTMLElement, label: string): HTMLElement | null => {
  return queryActionButton(modal, label, "regenerate");
};

export const getRegenerateButton = (modal: HTMLElement, label: string): HTMLElement => {
  return getActionButton(modal, label, "regenerate");
};

export const clickRegenerateButton = async (modal: HTMLElement, label: string): Promise<void> => {
  await clickActionButton(modal, label, "regenerate");
};

export const getRefreshButton = (modal: HTMLElement, label: string): HTMLElement => {
  return getActionButton(modal, label, "refresh");
};

export const querySaveButton = (modal: HTMLElement, label: string): HTMLElement | null => {
  return queryActionButton(modal, label, "save");
};

export const getSaveButton = (modal: HTMLElement, label: string): HTMLElement => {
  return getActionButton(modal, label, "save");
};

export const clickSaveButton = async (modal: HTMLElement, label: string): Promise<void> => {
  await clickActionButton(modal, label, "save");
};

export const getFilterByJobSelect = (): HTMLElement => {
  return screen.getByRole('combobox', {name: new RegExp("filter by job", "i")});
};

export const getFillButton = (modal: HTMLElement): HTMLElement => {
  return getByRole(modal, "button", {name: new RegExp("fill", "i")});
}

export const clickFillButton = async (modal: HTMLElement): Promise<void> => {
  const fillButton: HTMLElement = getFillButton(modal);
  await act(async () => {
    userEvent.click(fillButton);
  });
}

export const getFirstColumn = (): HTMLElement => {
  const allColumns: HTMLElement[] = queryResources("job board", "region");
  return allColumns[0];
};

export const getColumnByName = (name: string): HTMLElement => {
  const allColumns: HTMLElement[] = queryResources("job board", "region");
  const matchingColumn: HTMLElement | undefined = allColumns.find((column: HTMLElement) => {
    const columnHeading: HTMLElement | null = queryByRole(column, "heading", {name: name});
    return columnHeading && columnHeading.textContent === name;
  });
  if (!matchingColumn) {
    throw new Error(`Column ${name} not found`);
  }
  return matchingColumn;
};

export const getJobByTitleCompany = (title: string, company: string): HTMLElement => {
  const allJobs: HTMLElement[] = queryResources("job board", "listitem");
  const matchingJob: HTMLElement | undefined = allJobs.find((job: HTMLElement) => {
    const jobTitle: HTMLElement | null = queryByText(job, title);
    const jobCompany: HTMLElement | null = queryByText(job, company);
    return jobTitle && jobCompany;
  });
  if (!matchingJob) {
    throw new Error(`Job ${title} at ${company} not found`);
  }
  return matchingJob;
};

export const dragJob = async (jobElement: HTMLElement, targetStatus: string): Promise<void> => {
  await act(async () => {
    fireEvent.dragStart(jobElement);
  });
  await act(async () => {
    fireEvent.dragOver(getColumnByName(targetStatus));
  });
  await act(async () => {
    fireEvent.drop(getColumnByName(targetStatus));
  });
};

export const getMoveRightButton = (columnElement: HTMLElement): HTMLElement => {
  return getByRole(columnElement, "button", {name: new RegExp("move right", "i")});
};

export const getMoveLeftButton = (columnElement: HTMLElement): HTMLElement => {
  return getByRole(columnElement, "button", {name: new RegExp("move left", "i")});
};

export const clickMoveRightButton = async (columnElement: HTMLElement): Promise<void> => {
  const moveRightButton: HTMLElement = getMoveRightButton(columnElement);
  await act(async () => {
    userEvent.click(moveRightButton);
  });
};

export const clickMoveLeftButton = async (columnElement: HTMLElement): Promise<void> => {
  const moveLeftButton: HTMLElement = getMoveLeftButton(columnElement);
  await act(async () => {
    userEvent.click(moveLeftButton);
  });
};

export const clearDisssmissibleErrorAlerts = async (modalElement: HTMLElement): Promise<void> => {
  const errorAlerts: HTMLElement[] = queryAllByRole(modalElement, "alert");
  for (const errorAlert of errorAlerts) {
    const closeButton: HTMLElement | null = queryByRole(errorAlert, "button", {name: new RegExp("close alert", "i")});
    if (closeButton !== null) {
      await act(async () => {
        userEvent.click(closeButton);
      });
    }
  }
};

export const getDuplicateButton = (modalElement: HTMLElement): HTMLElement => {
  return getByRole(modalElement, "button", {name: new RegExp("duplicate", "i")});
};

export const clickDuplicateButton = async (modalElement: HTMLElement): Promise<void> => {
  const duplicateButton: HTMLElement = getDuplicateButton(modalElement);
  await act(async () => {
    userEvent.click(duplicateButton);
  });
};