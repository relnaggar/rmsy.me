import { screen, getAllByRole, getByRole, waitFor } from "@testing-library/react";

import { injectMocks, getSubmitButton, clickSubmitButton, userTypeInput, mockFunctions, clickCloseButton, openAndGetModal } from "../common/testUtils";
import { renderThisRoute, getColumnByName } from "./jobTestUtils";
import { generateResponse, validStatus1, generateErrorResponse, errorMessage, testDataForAPIGeneralErrors } from "../common/mockAPI";
import { Status } from "./types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

const modalName = "add column";

test(`${modalName} modal isn't visible before clicking ${modalName} button`, async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp(modalName, "i")})).not.toBeInTheDocument();
});

test(`clicking ${modalName} button shows ${modalName} modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName, 1000);
  expect(modal).toBeInTheDocument();
});

test(`${modalName} has a submit button`, async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetModal(modalName));
  expect(submitButton).toBeInTheDocument();
});

test(`${modalName} has a close button`, async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetModal(modalName), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test(`clicking close button closes the ${modalName} modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName);
  await clickCloseButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

const testDataForInputs: {
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

describe(`${modalName} modal has all inputs`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`${modalName} modal has a ${testDataForInput.label} input`, async () => {
      await renderThisRoute();
      const input: HTMLElement = getByRole(await openAndGetModal(modalName), "textbox", {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toBeInTheDocument();
    });
  }
});

test(`${modalName} modal automatically focuses on the first input within 1 second`, async () => {
  await renderThisRoute();
  const firstInput: HTMLElement = getByRole(await openAndGetModal(modalName), "textbox", {name: new RegExp(testDataForInputs[0].label, "i")});
  await waitFor(() => expect(firstInput).toHaveFocus(), {timeout: 1000});
});

describe(`submitting the ${modalName} modal with empty values for required inputs shows an error for that input`, () => {
  for (const testDataForInput of testDataForInputs.filter((testDataForInput) => testDataForInput.required)) {
    test(`submitting the ${modalName} modal with empty ${testDataForInput.label} input shows an error for that input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(modalName);
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(new RegExp(testDataForInput.label, "i"));
    });
  }
});

test(`submitting the ${modalName} modal with valid input closes the modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
  await clickSubmitButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

test(`submitting the ${modalName} modal with valid input makes an API call`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`submitting the ${modalName} modal with valid input makes an API call to add the column`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/statuses/", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({
      name: validStatus1.name,
    }),
  }));  
});

test(`submitting the ${modalName} modal with valid input adds the column to the list of columns`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Status>(validStatus1));
  await clickSubmitButton(modal);
  expect(getColumnByName(validStatus1.name)).toBeInTheDocument();
});

describe(`API general errors after submitting the ${modalName} modal show an error alert within the modal`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`API ${testDataForAPIGeneralError.apiErrorType} error after submitting the ${modalName} modal shows an error alert within the modal`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(modalName);
      for (const testDataForInput of testDataForInputs) {
        await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
      }
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

describe(`API input error after submitting the ${modalName} modal shows an error message attached to the input`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`API input error after submitting the ${modalName} modal shows an error message attached to the ${testDataForInput.label} input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(modalName);
      for (const testDataForInput of testDataForInputs) {
        await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
      }
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

describe(`API input error after submitting the ${modalName} modal can be cleared by editing the corresponding input`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`API input error for ${testDataForInput.label} after submitting the ${modalName} modal can be cleared by editing the corresponding input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(modalName);
      for (const testDataForInput of testDataForInputs) {
        await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
      }
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      await userTypeInput(modal, testDataForInput.label, "abc");
      expect(errorAlert).not.toBeInTheDocument();
      await clickSubmitButton(modal); // close the modal to make sure transition is complete by the end of the test
    });
  }
});

describe(`API general errors after submitting the ${modalName} modal can be cleared by clicking submit again`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`API ${testDataForAPIGeneralError.apiErrorType} error after submitting the ${modalName} modal can be cleared by clicking submit again`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(modalName);
      for (const testDataForInput of testDataForInputs) {
        await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
      }
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      await clickSubmitButton(modal);
      expect(errorAlert).not.toBeInTheDocument();
    });
  }
});

test(`${modalName} modal retains input values on close and reopen`, async () => {
  await renderThisRoute();
  let addColumnModal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(addColumnModal, testDataForInput.label, testDataForInput.validValue);
  }
  await clickCloseButton(addColumnModal);
  addColumnModal = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    expect(getByRole(addColumnModal, "textbox", {name: new RegExp(testDataForInput.label, "i")})).toHaveValue(testDataForInput.validValue);
  }
});

test(`${modalName} modal retains API input errors on close and reopen`, async () => {
  await renderThisRoute();
  let modal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
  const errorResponse: {[key: string]: string[]} = {};
  for (const testDataForInput of testDataForInputs) {
    errorResponse[testDataForInput.label] = [errorMessage];
  }
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse(errorResponse));
  await clickSubmitButton(modal);
  await clickCloseButton(modal);
  modal = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    const errorAlert = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(errorMessage);
  }
});

describe(`${modalName} retains API general errors on close and reopen`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`${modalName} modal retains API ${testDataForAPIGeneralError.apiErrorType} error on close and reopen`, async () => {
      await renderThisRoute();
      let modal: HTMLElement = await openAndGetModal(modalName);
      for (const testDataForInput of testDataForInputs) {
        await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
      }
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      await clickCloseButton(modal);
      modal = await openAndGetModal(modalName);
      const errorAlert = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});