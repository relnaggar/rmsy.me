import { screen, getAllByRole, waitFor, getByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, OpenAndGetModalParams, openAndGetModal, getSubmitButton, clickCloseButton, clickSubmitButton, mockFunctions } from "../common/testUtils";
import { renderThisRoute, queryResumes, getRefreshButton, clickRefreshButton } from "./resumeTestUtils";
import { validResume1, generateConditionalResponseByRoute, validJob1, validJob2, validResumeTemplate1, validResumeTemplate2, generateResponse, testDataForAPIGeneralErrors, errorMessage, generateErrorResponse } from "../common/mockAPI";
import { Resume } from "../resumes/types";
import { Job } from "../jobs/types";
import { ResumeTemplate } from "../templates/types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([
    {
      url: "../api/jobs/",
      data: [validJob1, validJob2],
    }, {
      url: "../api/templates/",
      data: [validResumeTemplate1, validResumeTemplate2],
    }
  ]));
});

const modalName = "generate resume";
const openModalButtonText = "generate new resume";
const openAndGetModalParams: OpenAndGetModalParams = {modalName, openModalButtonText};

const testDataForInputs: {label: keyof Resume, required: boolean}[] = [{
  label: "job",
  required: true,
}, {
  label: "template",
  required: true,
}];

const fillWithValidValues = async (modal: HTMLElement): Promise<void> => {
  for (const testDataForInput of testDataForInputs) {
    const input: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
    await act(async () => {
      userEvent.selectOptions(input, (validResume1[testDataForInput.label] as Job | ResumeTemplate).id.toString());
    });
  }
};

test(`${modalName} modal isn't visible before clicking ${modalName} button`, async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp(modalName, "i")})).not.toBeInTheDocument();
});

test(`clicking ${modalName} button shows ${modalName} modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal({...openAndGetModalParams, timeout: 1000});
  expect(modal).toBeInTheDocument();
});

test(`${modalName} has a submit button`, async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetModal(openAndGetModalParams));
  expect(submitButton).toBeInTheDocument();
});

test(`${modalName} has a close button`, async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetModal(openAndGetModalParams), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test(`clicking close button closes the ${modalName} modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await clickCloseButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

describe(`${modalName} modal has all select inputs`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`${modalName} modal has a ${testDataForInput.label} input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const input: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toBeInTheDocument();
    });
  }
});

describe(`each select input in ${modalName} modal has a refresh button`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`${modalName} modal has a refresh button for ${testDataForInput.label} input`, async () => {
      await renderThisRoute();
      const refreshButton: HTMLElement = getRefreshButton(await openAndGetModal(openAndGetModalParams), testDataForInput.label);
      expect(refreshButton).toBeInTheDocument();
    });
  }
});

test(`${modalName} modal automatically focuses on the first select input within 1 second`, async () => {
  await renderThisRoute();
  const firstInput: HTMLElement = getByRole(await openAndGetModal(openAndGetModalParams), "combobox", {name: new RegExp(testDataForInputs[0].label, "i")});
  await waitFor(() => expect(firstInput).toHaveFocus(), {timeout: 1000});
});

describe(`submitting the ${modalName} modal with empty values for required inputs shows an error for that input`, () => {
  for (const testDataForInput of testDataForInputs.filter((testDataForInput) => testDataForInput.required)) {
    test(`submitting the ${modalName} modal with empty ${testDataForInput.label} input shows an error for that input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      mockFunctions.fetchData.mockImplementationOnce(generateResponse<Resume>(validResume1));
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(new RegExp(testDataForInput.label, "i"));
    });
  }
});

test(`submitting the ${modalName} modal with valid input closes the modal within 1 second`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Resume>(validResume1));
  await clickSubmitButton(modal);
  waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

test(`submitting the ${modalName} modal with valid input makes an API call`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Resume>(validResume1));
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`submitting the ${modalName} modal with valid input makes an API call to add the column`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Resume>(validResume1));
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/resumes/", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({
      job: validJob1.id,
      template: validResumeTemplate1.id,
    }),
  }));  
});

test(`submitting the ${modalName} modal with valid input adds the resume to the list`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Resume>(validResume1));
  await clickSubmitButton(modal);
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes.length).toBe(1);
  const addedResume: HTMLElement = resumes[0];
  expect(addedResume).toHaveTextContent(validResume1.name);
});

describe(`API general errors after submitting the ${modalName} modal show an error alert within the modal`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`API ${testDataForAPIGeneralError.apiErrorType} error after submitting the ${modalName} modal shows an error alert within the modal`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

describe(`API general errors after submitting the ${modalName} modal can be cleared by clicking submit again`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`API ${testDataForAPIGeneralError.apiErrorType} error after submitting the ${modalName} modal can be cleared by clicking submit again`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      mockFunctions.fetchData.mockImplementationOnce(generateResponse<Resume>(validResume1));
      await clickSubmitButton(modal);
      expect(errorAlert).not.toBeInTheDocument();
    });
  }
});

test(`${modalName} modal retains input values on close and reopen`, async () => {
  await renderThisRoute();
  let addColumnModal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(addColumnModal);
  await clickCloseButton(addColumnModal);
  addColumnModal = await openAndGetModal(openAndGetModalParams);
  for (const testDataForInput of testDataForInputs) {
    const input: HTMLElement = getByRole(addColumnModal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
    expect(input).toHaveValue((validResume1[testDataForInput.label] as Job | ResumeTemplate).id.toString());  
  }
});

test(`${modalName} modal retains API input errors on close and reopen`, async () => {
  await renderThisRoute();
  let modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const errorResponse: {[key: string]: string[]} = {};
  for (const testDataForInput of testDataForInputs) {
    errorResponse[testDataForInput.label] = [errorMessage + testDataForInput.label];
  }
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse(errorResponse));
  await clickSubmitButton(modal);
  await clickCloseButton(modal);
  modal = await openAndGetModal(openAndGetModalParams);
  for (const testDataForInput of testDataForInputs) {
    const errorAlert = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(errorMessage + testDataForInput.label);
  }
});

describe(`${modalName} modal retains API general errors on close and reopen`, () => {
  for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
    test(`${modalName} modal retains API ${testDataForAPIGeneralError.apiErrorType} error on close and reopen`, async () => {
      await renderThisRoute();
      let modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      testDataForAPIGeneralError.mockAPIError();
      await clickSubmitButton(modal);
      await clickCloseButton(modal);
      modal = await openAndGetModal(openAndGetModalParams);
      const errorAlert = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});

describe(`${modalName} modal select options are rendered for all select inputs`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`${modalName} modal select options are rendered for ${testDataForInput.label} input`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const selectInput: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
      const selectOptions: HTMLElement[] = getAllByRole(selectInput, "option");
      expect(selectOptions.length).toBe(3);
    });
  }
});

describe(`clicking each ${modalName} modal refresh button makes an additional API call`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`clicking ${modalName} modal refresh button for ${testDataForInput.label} makes an additional API call`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
      await clickRefreshButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
    });
  }
});

describe(`clicking each ${modalName} modal refresh button makes an API call to get the updated select options`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`clicking ${modalName} modal refresh button for ${testDataForInput.label} makes an API call to get the updated select options`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await clickRefreshButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`../api/${testDataForInput.label}s/`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  }
});

describe(`clicking each ${modalName} modal refresh button updates select options if API call returns different data`, () => {
  for (const testDataForInput of testDataForInputs) {
    test(`clicking ${modalName} modal refresh button for ${testDataForInput.label} updates select options if API call returns different data`, async () => {
      await renderThisRoute();
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const allOptionsBefore: HTMLElement[] = getAllByRole(modal, "option");
      expect(allOptionsBefore.length).toBe(6);
      mockFunctions.fetchData.mockImplementationOnce(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: [validJob2],
      }, {
        url: "../api/templates/",
        data: [validResumeTemplate2],
      }]));
      await clickRefreshButton(modal, testDataForInput.label);
      const allOptionsAfter: HTMLElement[] = getAllByRole(modal, "option");
      expect(allOptionsAfter.length).toBe(5);
    });
  }
});

describe(`API general errors after clicking each ${modalName} modal refresh button show an error alert within the modal`, () => {
  for (const testDataForInput of testDataForInputs) {
    for (const testDataForAPIGeneralError of testDataForAPIGeneralErrors(mockFunctions)) {
      test(`API ${testDataForAPIGeneralError.apiErrorType} error after clicking ${modalName} modal refresh button for ${testDataForInput.label} shows an error alert within the modal`, async () => {
        await renderThisRoute();
        const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
        testDataForAPIGeneralError.mockAPIError();
        await clickRefreshButton(modal, testDataForInput.label);
        const errorAlert: HTMLElement = getByRole(modal, "alert");
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(errorMessage);
      });
    }
  }
});