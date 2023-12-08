import { screen, getAllByRole, getByRole, getByLabelText, waitFor } from "@testing-library/react";

import { injectMocks, getSubmitButton, openAndGetModal, clickCloseButton, clickSubmitButton, userTypeInput, mockFunctions, OpenAndGetModalProps } from "../common/testUtils";
import { validResumeTemplate1, generateResponse, testDataForAPIGeneralErrors, errorMessage, generateErrorResponse } from "../common/mockAPI";
import { renderThisRoute, userUploadDocxFile, queryResumeTemplates } from "./resumeTemplateTestUtils";
import { ResumeTemplate } from "../templates/types";
import exp from "constants";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

const modalName = "add resume template";
const openModalButtonText = "upload resume template";
const openAndGetModalProps: OpenAndGetModalProps = {
  modalName,
  openModalButtonText,
};

const testDataForInputs: {
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
  label: "description",
  name: "description",
  required: false,
  validValue: validResumeTemplate1.description!,
  role: "textbox",
}];

const fillWithValidValues = async (modal: HTMLElement): Promise<void> => {
  for (const testDataForInput of testDataForInputs) {
    if (testDataForInput.role === "file") {
      await userUploadDocxFile(modal, testDataForInput.label, testDataForInput.validValue);      
    } else { 
      await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
    }
  }
};

test(`${modalName} modal isn't visible before clicking ${modalName} button`, async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp(modalName, "i")})).not.toBeInTheDocument();
});

test(`clicking ${modalName} button shows ${modalName} modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal({...openAndGetModalProps, timeout: 1000});
  expect(modal).toBeInTheDocument();
});

test(`${modalName} has a submit button`, async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetModal(openAndGetModalProps));
  expect(submitButton).toBeInTheDocument();
});

test(`${modalName} has a close button`, async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetModal(openAndGetModalProps), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test(`clicking close button closes the ${modalName} modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
  await clickCloseButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

describe(`${modalName} modal has all inputs`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`${modalName} modal has a ${testDataForInput.label} input`, async () => {
      await renderThisRoute();
      let input: HTMLElement;
      if (testDataForInput.role === "file") {
        input = getByLabelText(await openAndGetModal(openAndGetModalProps), new RegExp(testDataForInput.label, "i"));
      } else {
        input = getByRole(await openAndGetModal(openAndGetModalProps), testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")});
      }
      expect(input).toBeInTheDocument();
    });
  }
});

test(`${modalName} modal automatically focuses on the first input within 1 second`, async () => {
  await renderThisRoute();
  const firstInput: HTMLElement = getByRole(await openAndGetModal(openAndGetModalProps), "textbox", {name: new RegExp(testDataForInputs[0].label, "i")});
  await waitFor(() => expect(firstInput).toHaveFocus(), {timeout: 1000});
});

describe(`submitting the ${modalName} modal with empty values for required inputs shows an error for that input`, () => {
  for (const testDataForInput of testDataForInputs.filter((testDataForInput) => testDataForInput.required)) {
    test(`submitting the ${modalName} modal with empty ${testDataForInput.label} input shows an error for that input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(new RegExp(testDataForInput.label, "i"));
    });
  }
});

test(`submitting the ${modalName} modal with valid input closes the modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
  await fillWithValidValues(modal);
  await clickSubmitButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

test(`submitting the ${modalName} modal with valid input makes an API call`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
  await fillWithValidValues(modal);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`submitting the ${modalName} modal with valid input makes an API call to add the resume template`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
  await fillWithValidValues(modal);
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/templates/", expect.objectContaining({
    method: "POST",
    body: expect.any(FormData),
  }));
  const formData = mockFunctions.fetchData.mock.calls[mockFunctions.fetchData.mock.calls.length - 1][1].body;
  for (const testDataForInput of testDataForInputs) {
    const data = formData.get(testDataForInput.name);
    if (testDataForInput.role === "file") {      
      expect(data).toEqual(expect.any(File));
      expect((data as File).name).toBe(testDataForInput.validValue);
    } else {
      expect(data).toBe(testDataForInput.validValue);
    }
  }
});

test(`submitting the ${modalName} modal with valid input adds the resume template to the list`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<ResumeTemplate>(validResumeTemplate1));
  await clickSubmitButton(modal);
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(1);
  const addedResumeTemplate: HTMLElement = resumeTemplates[0];
  expect(addedResumeTemplate).toHaveTextContent(validResumeTemplate1.name);
});

describe(`API general errors after submitting the ${modalName} modal show an error alert within the modal`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`API ${testDataForAPIGeneralError.apiErrorType} error after submitting the ${modalName} modal shows an error alert within the modal`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
      await fillWithValidValues(modal);
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

describe(`API input error after submitting the ${modalName} modal can be cleared by editing the corresponding input`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`API input error for ${testDataForInput.label} after submitting the ${modalName} modal can be cleared by editing the corresponding input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
      await fillWithValidValues(modal);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      if (testDataForInput.role === "file") {
        await userUploadDocxFile(modal, testDataForInput.label, testDataForInput.validValue);
      } else {
        await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
      }
      expect(errorAlert).not.toBeInTheDocument();
      await clickSubmitButton(modal); // close the modal to make sure transition is complete by the end of the test
    });
  }
});

describe(`API general errors after submitting the ${modalName} modal can be cleared by clicking submit again`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`API ${testDataForAPIGeneralError.apiErrorType} error after submitting the ${modalName} modal can be cleared by clicking submit again`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
      await fillWithValidValues(modal);
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      await clickSubmitButton(modal);
      expect(errorAlert).not.toHaveTextContent(errorMessage);
    });
  }
});

test(`${modalName} modal retains input values (except for files) on close and reopen`, async () => {
  await renderThisRoute();
  let addColumnModal: HTMLElement = await openAndGetModal(openAndGetModalProps);
  await fillWithValidValues(addColumnModal);
  await clickCloseButton(addColumnModal);
  addColumnModal = await openAndGetModal(openAndGetModalProps);
  for (const testDataForInput of testDataForInputs) {
    if (testDataForInput.role !== "file") {
      expect(getByRole(addColumnModal, testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")})).toHaveValue(testDataForInput.validValue);
    }
  }
});

test(`${modalName} modal retains API input errors on close and reopen`, async () => {
  await renderThisRoute();
  let modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
  await fillWithValidValues(modal);
  const errorResponse: {[key: string]: string[]} = {};
  for (const testDataForInput of testDataForInputs) {
    errorResponse[testDataForInput.label] = [errorMessage];
  }
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse(errorResponse));
  await clickSubmitButton(modal);
  await clickCloseButton(modal);
  modal = await openAndGetModal(openAndGetModalProps);
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
      let modal: HTMLElement = await openAndGetModal(openAndGetModalProps);
      await fillWithValidValues(modal);
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      await clickCloseButton(modal);
      modal = await openAndGetModal(openAndGetModalProps);
      const errorAlert = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});