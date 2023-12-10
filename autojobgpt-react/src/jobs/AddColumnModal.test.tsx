import { screen, getAllByRole, getByRole, waitFor, queryByRole } from "@testing-library/react";

import { injectMocks, renderRoute, getSubmitButton, clickSubmitButton, userTypeInput, mockFunctions, clickCloseButton, openAndGetModal, OpenAndGetModalParams, getColumnByName } from "../common/testUtils";
import { generateResponse, generateErrorResponse } from "../api/mockApi";
import { errorMessage, testDataForApiGeneralErrors, validStatus1 } from "../api/mockData";
import { Status } from '../api/types';


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

const thisRoute = "/jobs";
const modalName = "add column";
const openAndGetModalParams: OpenAndGetModalParams = {modalName};

const testData: {
  label: string,
  required: boolean,
  validValue: string,
}[] = [
  {
    label: "name",
    required: true,
    validValue: validStatus1.name,
  },
];

const fillWithValidValues = async (modal: HTMLElement): Promise<void> => {
  for (const testDataForInput of testData) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
};

test(`${modalName} button appears`, async () => {
  await renderRoute(thisRoute);
  expect(screen.getByRole("button", {name: new RegExp(modalName, "i")})).toBeInTheDocument();
});

test(`${modalName} modal isn't visible before clicking ${modalName} button`, async () => {
  await renderRoute(thisRoute);
  expect(screen.queryByRole("dialog", {name: new RegExp(modalName, "i")})).not.toBeInTheDocument();
});

test(`clicking ${modalName} button shows ${modalName} modal within 1 second`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal({...openAndGetModalParams, timeout: 1000});
  expect(modal).toBeInTheDocument();
});

test(`${modalName} has a submit button`, async () => {
  await renderRoute(thisRoute);
  const submitButton: HTMLElement = getSubmitButton(await openAndGetModal(openAndGetModalParams));
  expect(submitButton).toBeInTheDocument();
});

test(`${modalName} has a close button`, async () => {
  await renderRoute(thisRoute);
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetModal(openAndGetModalParams), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test(`clicking close button closes the ${modalName} modal within 1 second`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await clickCloseButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

describe(`${modalName} modal has all inputs`, () => {
  for (const testDataForInput of testData) {
    test(`${modalName} modal has a ${testDataForInput.label} input`, async () => {
      await renderRoute(thisRoute);
      const input: HTMLElement = getByRole(await openAndGetModal(openAndGetModalParams), "textbox", {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toBeInTheDocument();
    });
  }
});

test(`${modalName} modal automatically focuses on the first input within 1 second`, async () => {
  await renderRoute(thisRoute);
  const firstInput: HTMLElement = getByRole(await openAndGetModal(openAndGetModalParams), "textbox", {name: new RegExp(testData[0].label, "i")});
  await waitFor(() => expect(firstInput).toHaveFocus(), {timeout: 1000});
});

describe(`submitting the ${modalName} modal with empty values for required inputs shows an error for that input`, () => {
  for (const testDataForInput of testData.filter((testDataForInput) => testDataForInput.required)) {
    test(`submitting the ${modalName} modal with empty ${testDataForInput.label} input shows an error for that input`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(new RegExp(testDataForInput.label, "i"));
    });
  }
});

test(`submitting the ${modalName} modal with valid input closes the modal within 1 second`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  await clickSubmitButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

test(`submitting the ${modalName} modal with valid input makes an api call`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`submitting the ${modalName} modal with valid input makes an api call to add the column`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/statuses/", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({
      name: validStatus1.name,
    }),
  }));  
});

test(`submitting the ${modalName} modal with valid input adds the column to the list of columns`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Status>(validStatus1));
  await clickSubmitButton(modal);
  expect(getColumnByName(validStatus1.name)).toBeInTheDocument();
});

describe(`api general errors after submitting the ${modalName} modal show an error alert within the modal`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    test(`api ${testDataForApiGeneralError.apiErrorType} error after submitting the ${modalName} modal shows an error alert within the modal`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      testDataForApiGeneralError.mockApiError();
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

describe(`api input error after submitting the ${modalName} modal shows an error message attached to the input`, () => {
  for (const testDataForInput of testData) {
    test(`api input error after submitting the ${modalName} modal shows an error message attached to the ${testDataForInput.label} input`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

describe(`api input error after submitting the ${modalName} modal can be cleared by editing the corresponding input`, () => {
  for (const testDataForInput of testData) {
    test(`api input error for ${testDataForInput.label} after submitting the ${modalName} modal can be cleared by editing the corresponding input`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      await userTypeInput(modal, testDataForInput.label, "abc");
      expect(errorAlert).not.toBeInTheDocument();
      await clickSubmitButton(modal); // close the modal to make sure transition is complete by the end of the test
    });
  }
});

describe(`api general errors after submitting the ${modalName} modal can be cleared by clicking submit again`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    test(`api ${testDataForApiGeneralError.apiErrorType} error after submitting the ${modalName} modal can be cleared by clicking submit again`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      testDataForApiGeneralError.mockApiError();
      await clickSubmitButton(modal);
      await clickSubmitButton(modal);
      waitFor(() => expect(queryByRole(modal, "alert")).not.toBeInTheDocument(), {timeout: 1000});
    });
  }
});

test(`${modalName} modal retains input values on close and reopen`, async () => {
  await renderRoute(thisRoute);
  let addColumnModal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(addColumnModal);
  await clickCloseButton(addColumnModal);
  addColumnModal = await openAndGetModal(openAndGetModalParams);
  for (const testDataForInput of testData) {
    expect(getByRole(addColumnModal, "textbox", {name: new RegExp(testDataForInput.label, "i")})).toHaveValue(testDataForInput.validValue);
  }
});

test(`${modalName} modal retains api input errors on close and reopen`, async () => {
  await renderRoute(thisRoute);
  let modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const errorResponse: {[key: string]: string[]} = {};
  for (const testDataForInput of testData) {
    errorResponse[testDataForInput.label] = [errorMessage];
  }
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse(errorResponse));
  await clickSubmitButton(modal);
  await clickCloseButton(modal);
  modal = await openAndGetModal(openAndGetModalParams);
  for (const testDataForInput of testData) {
    const errorAlert = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(errorMessage);
  }
});

describe(`${modalName} retains api general errors on close and reopen`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    test(`${modalName} modal retains api ${testDataForApiGeneralError.apiErrorType} error on close and reopen`, async () => {
      await renderRoute(thisRoute);
      let modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      testDataForApiGeneralError.mockApiError();
      await clickSubmitButton(modal);
      await clickCloseButton(modal);
      modal = await openAndGetModal(openAndGetModalParams);
      const errorAlert = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});