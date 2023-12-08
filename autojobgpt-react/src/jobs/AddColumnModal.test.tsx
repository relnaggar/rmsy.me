import { screen, getAllByRole, getByRole, waitFor } from "@testing-library/react";

import { injectMocks, getSubmitButton, clickSubmitButton, userTypeInput, mockFunctions, clickCloseButton } from "../common/testUtils";
import { renderThisRoute, getAddColumnButton, openAndGetAddColumnModal, getColumnByName } from "./jobTestUtils";
import { generateResponse, validStatus1, generateErrorResponse, errorMessage } from "../common/mockAPI";
import { Status } from "./types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("add column button is visible", async () => {
  await renderThisRoute();
  expect(getAddColumnButton()).toBeInTheDocument();
});

test("add column modal isn't visible before clicking add column button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("add column", "i")})).not.toBeInTheDocument();
});

test("clicking add column button shows add column modal within 1 second", async () => {
  await renderThisRoute();
  const addColumnModal: HTMLElement = await openAndGetAddColumnModal(1000);
  expect(addColumnModal).toBeInTheDocument();
});

test("add column modal has a submit button", async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetAddColumnModal());
  expect(submitButton).toBeInTheDocument();
});

test("add column modal has a close button", async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetAddColumnModal(), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test("add column modal has a name input", async () => {
  await renderThisRoute();
  const nameInput: HTMLElement = getByRole(await openAndGetAddColumnModal(), "textbox", {name: new RegExp("name", "i")});
  expect(nameInput).toBeInTheDocument();
});

test("add column modal automatically focuses on the name input within 1 second", async () => {
  await renderThisRoute();
  const nameInput: HTMLElement = getByRole(await openAndGetAddColumnModal(), "textbox", {name: new RegExp("name", "i")});
  await waitFor(() => expect(nameInput).toHaveFocus(), {timeout: 1000});
});

test("submitting the add column modal with empty name input shows an error", async () => {
  await renderThisRoute();
  const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await clickSubmitButton(addColumnModal);
  const nameInput: HTMLElement = getByRole(addColumnModal, "textbox", {name: new RegExp("name", "i")});
  expect(nameInput).toBeInvalid();
});

test("submitting the add column modal with valid input closes the modal", async () => {
  await renderThisRoute();
  const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await userTypeInput(addColumnModal, "name", validStatus1.name);
  await clickSubmitButton(addColumnModal);
  expect(addColumnModal).not.toBeInTheDocument();
});

test("submitting the add column modal with valid input makes an API call to add the column", async () => {
  await renderThisRoute();
  const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await userTypeInput(addColumnModal, "name", validStatus1.name);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  await clickSubmitButton(addColumnModal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/statuses/", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({
      name: validStatus1.name,
    }),
  }));  
});

test("submitting the add column modal with valid input adds the column to the list of columns", async () => {
  await renderThisRoute();
  const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await userTypeInput(addColumnModal, "name", validStatus1.name);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Status>(validStatus1));
  await clickSubmitButton(addColumnModal);
  expect(getColumnByName(validStatus1.name)).toBeInTheDocument();
});

const apiGeneralErrors: {
  apiErrorType: string,
  mockAPIError: () => void,
}[] = [{
  apiErrorType: "network",
  mockAPIError: () => mockFunctions.fetchData.mockRejectedValueOnce(new Error(errorMessage)),
}, {
  apiErrorType: "general",
  mockAPIError: () => mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({error: errorMessage})),
}];

describe("API general errors after submitting the add column modal show an error alert within the modal", () => {
  for (const apiGeneralError of apiGeneralErrors) {
    test(`API ${apiGeneralError.apiErrorType} error after submitting the add column modal shows an error alert within the modal`, async () => {
      await renderThisRoute();
      const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
      await userTypeInput(addColumnModal, "name", validStatus1.name);
      apiGeneralError.mockAPIError();
      await clickSubmitButton(addColumnModal);
      const errorAlert: HTMLElement = getByRole(addColumnModal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

test("API input error after submitting the add column modal shows an error message attached to the input", async () => {
  await renderThisRoute();
  const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await userTypeInput(addColumnModal, "name", validStatus1.name);
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({name: [errorMessage]}));
  await clickSubmitButton(addColumnModal);
  const errorAlert: HTMLElement = getByRole(addColumnModal, "alert", {name: new RegExp("name", "i")});
  expect(errorAlert).toBeInTheDocument();
  expect(errorAlert).toHaveTextContent(errorMessage);
});

test("API input error after submitting the add column modal can be cleared by editing the input", async () => {
  await renderThisRoute();
  const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await userTypeInput(addColumnModal, "name", validStatus1.name);
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({name: [errorMessage]}));
  await clickSubmitButton(addColumnModal);
  const errorAlert: HTMLElement = getByRole(addColumnModal, "alert", {name: new RegExp("name", "i")});
  await userTypeInput(addColumnModal, "name", "abc");
  expect(errorAlert).not.toBeInTheDocument();
  await clickSubmitButton(addColumnModal); // close the modal to make sure transition is complete by the end of the test
});

describe("API general errors after submitting the add column modal can be cleared by clicking submit again", () => {
  for (const apiGeneralError of apiGeneralErrors) {
    test(`API ${apiGeneralError.apiErrorType} error after submitting the add column modal can be cleared by clicking submit again`, async () => {
      await renderThisRoute();
      const addColumnModal: HTMLElement = await openAndGetAddColumnModal();
      await userTypeInput(addColumnModal, "name", validStatus1.name);
      apiGeneralError.mockAPIError();
      await clickSubmitButton(addColumnModal);
      const errorAlert: HTMLElement = getByRole(addColumnModal, "alert");
      await clickSubmitButton(addColumnModal);
      expect(errorAlert).not.toBeInTheDocument();
    });
  }
});

test("add column modal retains input values on close and reopen", async () => {
  await renderThisRoute();
  let addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await userTypeInput(addColumnModal, "name", validStatus1.name);
  await clickCloseButton(addColumnModal);
  addColumnModal = await openAndGetAddColumnModal();
  expect(getByRole(addColumnModal, "textbox", {name: new RegExp("name", "i")})).toHaveValue(validStatus1.name);
});

test("add column modal retains API input errors on close and reopen", async () => {
  await renderThisRoute();
  let addColumnModal: HTMLElement = await openAndGetAddColumnModal();
  await userTypeInput(addColumnModal, "name", validStatus1.name);
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({name: [errorMessage]}));
  await clickSubmitButton(addColumnModal);
  await clickCloseButton(addColumnModal);
  addColumnModal = await openAndGetAddColumnModal();
  const errorAlert = getByRole(addColumnModal, "alert", {name: new RegExp("name", "i")});
  expect(errorAlert).toBeInTheDocument();
  expect(errorAlert).toHaveTextContent(errorMessage);
});

describe("add column modal retains API general errors on close and reopen", () => {
  for (const apiGeneralError of apiGeneralErrors) {
    test(`add column modal retains API ${apiGeneralError.apiErrorType} error on close and reopen`, async () => {
      await renderThisRoute();
      let addColumnModal: HTMLElement = await openAndGetAddColumnModal();
      await userTypeInput(addColumnModal, "name", validStatus1.name);
      apiGeneralError.mockAPIError();
      await clickSubmitButton(addColumnModal);
      await clickCloseButton(addColumnModal);
      addColumnModal = await openAndGetAddColumnModal();
      const errorAlert = getByRole(addColumnModal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});