import { screen, getAllByRole, getByRole, getByLabelText, waitFor, queryByRole } from "@testing-library/react";

import { injectMocks, renderRoute, getSubmitButton, openAndGetModal, clickCloseButton, clickSubmitButton, userInput, mockFunctions, OpenAndGetModalParams, queryResources, userUploadDocxFile } from "../common/testUtils";
import { generateResponse, generateErrorResponse } from "../api/mockApi";
import { validResumeTemplate1, errorMessage, testDataForApiGeneralErrors } from "../api/mockData";
import { Template } from '../api/types';


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

const thisRoute = "/resumes";
const thisResource = "template";
const modalName = "add resume template";
const openModalButtonText = "upload resume template";
const openAndGetModalParams: OpenAndGetModalParams = {modalName, openModalButtonText};

const testData: {
  label: string,
  name: string,
  required: boolean,
  validValue: string,
  role: string,
}[] = [{
  label: "name",
  name: "name",
  required: true,
  validValue: validResumeTemplate1.name,
  role: "textbox",
}, {
  label: "upload",
  name: "docx",
  required: true,
  validValue: "test.docx",
  role: "file",
}, {
  label: "additional information",
  name: "additional_information",
  required: false,
  validValue: validResumeTemplate1.additional_information!,
  role: "textbox",
}];

const fillWithValidValues = async (modal: HTMLElement): Promise<void> => {
  for (const testDataForInput of testData) {
    if (testDataForInput.role === "file") {
      await userUploadDocxFile(modal, testDataForInput.label, testDataForInput.validValue);      
    } else { 
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
    }
  }
};

test(`${modalName} button appears`, async () => {
  await renderRoute(thisRoute);
  expect(screen.getByRole("button", {name: new RegExp(openModalButtonText, "i")})).toBeInTheDocument();
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
      let input: HTMLElement;
      if (testDataForInput.role === "file") {
        input = getByLabelText(await openAndGetModal(openAndGetModalParams), new RegExp(testDataForInput.label, "i"));
      } else {
        input = getByRole(await openAndGetModal(openAndGetModalParams), testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")});
      }
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
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Template>(validResumeTemplate1));
  await clickSubmitButton(modal);
  await waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

test(`submitting the ${modalName} modal with valid input makes an api call`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`submitting the ${modalName} modal with valid input makes an api call to add the resume template`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/templates/", expect.objectContaining({
    method: "POST",
    body: expect.any(FormData),
  }));
  const formData = mockFunctions.fetchData.mock.calls[mockFunctions.fetchData.mock.calls.length - 1][1].body;
  for (const testDataForInput of testData) {
    const data = formData.get(testDataForInput.name);
    if (testDataForInput.role === "file") {      
      expect(data).toEqual(expect.any(File));
      expect((data as File).name).toBe(testDataForInput.validValue);
    } else {
      expect(data).toBe(testDataForInput.validValue);
    }
  }
});

test(`submitting the ${modalName} modal with valid input adds the ${thisResource} to the list`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Template>(validResumeTemplate1));
  await clickSubmitButton(modal);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
  expect(resourceElements.length).toBe(1);
  const addedResourceElement: HTMLElement = resourceElements[0];
  expect(addedResourceElement).toHaveTextContent(validResumeTemplate1.name);
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

describe(`api input error after submitting the ${modalName} modal can be cleared by editing the corresponding input`, () => {
  for (const testDataForInput of testData) {
    test(`api input error for ${testDataForInput.label} after submitting the ${modalName} modal can be cleared by editing the corresponding input`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.name]: [errorMessage]}));
      await clickSubmitButton(modal);
      let errorAlert: HTMLElement | null = queryByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      if  (!errorAlert) {
        errorAlert = queryByRole(modal, "alert", {name: new RegExp(testDataForInput.name, "i")});
      }
      if (testDataForInput.role === "file") {
        await userUploadDocxFile(modal, testDataForInput.label, testDataForInput.validValue);
      } else {
        await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      }
      expect(errorAlert).not.toBeInTheDocument();
      await clickCloseButton(modal); // close the modal to make sure transition is complete by the end of the test
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
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      await clickSubmitButton(modal);
      expect(errorAlert).not.toHaveTextContent(errorMessage);
    });
  }
});

test(`${modalName} modal retains input values (except for files) on close and reopen`, async () => {
  await renderRoute(thisRoute);
  let addColumnModal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(addColumnModal);
  await clickCloseButton(addColumnModal);
  addColumnModal = await openAndGetModal(openAndGetModalParams);
  for (const testDataForInput of testData) {
    if (testDataForInput.role !== "file") {
      expect(getByRole(addColumnModal, testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")})).toHaveValue(testDataForInput.validValue);
    }
  }
});

xtest(`${modalName} modal retains api input errors on close and reopen`, async () => {
  await renderRoute(thisRoute);
  let modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const errorResponse: {[key: string]: string[]} = {};
  for (const testDataForInput of testData) {
    errorResponse[testDataForInput.name] = [errorMessage];
  }
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse(errorResponse));
  await clickSubmitButton(modal);
  modal = await openAndGetModal(openAndGetModalParams);
  await clickCloseButton(modal);
  modal = await openAndGetModal(openAndGetModalParams);
  for (const testDataForInput of testData) {
    let errorAlert: HTMLElement | null = queryByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
    if  (errorAlert === null) {
      errorAlert = queryByRole(modal, "alert", {name: new RegExp(testDataForInput.name, "i")});
    }
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
      modal = await openAndGetModal(openAndGetModalParams);
      await clickCloseButton(modal);
      modal = await openAndGetModal(openAndGetModalParams);
      const errorAlert = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});