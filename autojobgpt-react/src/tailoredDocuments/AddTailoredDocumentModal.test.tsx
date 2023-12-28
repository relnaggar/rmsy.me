import { screen, getAllByRole, waitFor, getByRole, act, queryByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, renderRoute, OpenAndGetModalParams, openAndGetModal, getSubmitButton, clickCloseButton, clickSubmitButton, mockFunctions, getRefreshButton, clickRefreshButton, queryResources } from "../common/testUtils";
import { generateConditionalResponseByRoute, generateResponse, generateErrorResponse } from "../api/mockApi";
import { validJob1, validJob2, validResumeTemplate1, validResumeTemplate2, validResume1, errorMessage, testDataForApiGeneralErrors } from "../api/mockData";
import { Job, Template, TailoredDocument } from '../api/types';


const thisRoute = "/resumes";
const thisResource = "resume";
const thisResourceHeading = "Resumes";
const modalName = "generate resume";
const openModalButtonText = "generate new resume";
const openAndGetModalParams: OpenAndGetModalParams = {modalName, openModalButtonText};

const testData: {label: keyof TailoredDocument, url: string, required: boolean}[] = [{
  label: "job",
  url: "../api/jobs/",
  required: true,
}, {
  label: "template",
  url: "../api/templates/?type=resume",
  required: true,
}];

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([
    {
      url: testData[0].url,
      data: [validJob1, validJob2],
    }, {
      url: testData[1].url,
      data: [validResumeTemplate1, validResumeTemplate2],
    }
  ]));
});

const fillWithValidValues = async (modal: HTMLElement): Promise<void> => {
  for (const testDataForInput of testData) {
    const input: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
    await act(async () => {
      userEvent.selectOptions(input, (validResume1[testDataForInput.label] as Job | Template).id.toString());
    });
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
  await waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

describe(`${modalName} modal has all select inputs`, () => {
  for (const testDataForInput of testData) {
    test(`${modalName} modal has a ${testDataForInput.label} input`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const input: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toBeInTheDocument();
    });
  }
});

describe(`each select input in ${modalName} modal has a refresh button`, () => {
  for (const testDataForInput of testData) {
    test(`${modalName} modal has a refresh button for ${testDataForInput.label} input`, async () => {
      await renderRoute(thisRoute);
      const refreshButton: HTMLElement = getRefreshButton(await openAndGetModal(openAndGetModalParams), testDataForInput.label);
      expect(refreshButton).toBeInTheDocument();
    });
  }
});

test(`${modalName} modal automatically focuses on the first select input within 1 second`, async () => {
  await renderRoute(thisRoute);
  const firstInput: HTMLElement = getByRole(await openAndGetModal(openAndGetModalParams), "combobox", {name: new RegExp(testData[0].label, "i")});
  await waitFor(() => expect(firstInput).toHaveFocus(), {timeout: 1000});
});

describe(`submitting the ${modalName} modal with empty values for required inputs shows an error for that input`, () => {
  for (const testDataForInput of testData.filter((testDataForInput) => testDataForInput.required)) {
    test(`submitting the ${modalName} modal with empty ${testDataForInput.label} input shows an error for that input`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      mockFunctions.fetchData.mockImplementationOnce(generateResponse<TailoredDocument>(validResume1));
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
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<TailoredDocument>(validResume1));
  await clickSubmitButton(modal);
  await waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
});

test(`submitting the ${modalName} modal with valid input makes an api call`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<TailoredDocument>(validResume1));
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`submitting the ${modalName} modal with valid input makes an api call to add the column`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<TailoredDocument>(validResume1));
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/tailoredDocuments/", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({
      job: validJob1.id,
      template: validResumeTemplate1.id,
      type: "resume",
    }),
  }));  
});

test(`submitting the ${modalName} modal with valid input adds the ${thisResource} to the list`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<TailoredDocument>(validResume1));
  await clickSubmitButton(modal);
  const resources: HTMLElement[] = queryResources(thisResourceHeading);
  expect(resources.length).toBe(1);
  const addedResource: HTMLElement = resources[0];
  expect(addedResource).toHaveTextContent(validResume1.name);
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

describe(`api general errors after submitting the ${modalName} modal can be cleared by clicking submit again`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    test(`api ${testDataForApiGeneralError.apiErrorType} error after submitting the ${modalName} modal can be cleared by clicking submit again`, async () => {
      await renderRoute(thisRoute);
      let modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillWithValidValues(modal);
      testDataForApiGeneralError.mockApiError();
      await clickSubmitButton(modal);
      modal = await openAndGetModal(openAndGetModalParams);
      mockFunctions.fetchData.mockImplementationOnce(generateResponse<TailoredDocument>(validResume1));
      await clickSubmitButton(modal);
      modal = await openAndGetModal(openAndGetModalParams);
      expect(queryByRole(modal, "alert")).not.toBeInTheDocument();
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
    const input: HTMLElement = getByRole(addColumnModal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
    expect(input).toHaveValue((validResume1[testDataForInput.label] as Job | Template).id.toString());  
  }
});

test(`${modalName} modal retains api input errors on close and reopen`, async () => {
  await renderRoute(thisRoute);
  let modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  const errorResponse: {[key: string]: string[]} = {};
  for (const testDataForInput of testData) {
    errorResponse[testDataForInput.label] = [errorMessage + testDataForInput.label];
  }
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse(errorResponse));
  await clickSubmitButton(modal);
  modal = await openAndGetModal(openAndGetModalParams);
  await clickCloseButton(modal);
  modal = await openAndGetModal(openAndGetModalParams);
  for (const testDataForInput of testData) {
    const errorAlert = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(errorMessage + testDataForInput.label);
  }
});

describe(`${modalName} modal retains api general errors on close and reopen`, () => {
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

describe(`${modalName} modal select options are rendered for all select inputs`, () => {
  for (const testDataForInput of testData) {
    test(`${modalName} modal select options are rendered for ${testDataForInput.label} input`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const selectInput: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(testDataForInput.label, "i")});
      const selectOptions: HTMLElement[] = getAllByRole(selectInput, "option");
      expect(selectOptions.length).toBe(3);
    });
  }
});

describe(`clicking each ${modalName} modal refresh button makes an additional api call`, () => {
  for (const testDataForInput of testData) {
    test(`clicking ${modalName} modal refresh button for ${testDataForInput.label} makes an additional api call`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
      await clickRefreshButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
    });
  }
});

describe(`clicking each ${modalName} modal refresh button makes an api call to get the updated select options`, () => {
  for (const testDataForInput of testData) {
    test(`clicking ${modalName} modal refresh button for ${testDataForInput.label} makes an api call to get the updated select options`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await clickRefreshButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(testDataForInput.url,
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

describe(`clicking each ${modalName} modal refresh button updates select options if api call returns different data`, () => {
  for (const testDataForInput of testData) {
    test(`clicking ${modalName} modal refresh button for ${testDataForInput.label} updates select options if api call returns different data`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      const allOptionsBefore: HTMLElement[] = getAllByRole(modal, "option");
      expect(allOptionsBefore.length).toBe(6);
      mockFunctions.fetchData.mockImplementationOnce(generateConditionalResponseByRoute([{
        url: testData[0].url,
        data: [validJob2],
      }, {
        url: testData[1].url,
        data: [validResumeTemplate2],
      }]));
      await clickRefreshButton(modal, testDataForInput.label);
      const allOptionsAfter: HTMLElement[] = getAllByRole(modal, "option");
      expect(allOptionsAfter.length).toBe(5);
    });
  }
});

describe(`api general errors after clicking each ${modalName} modal refresh button show an error alert within the modal`, () => {
  for (const testDataForInput of testData) {
    for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
      test(`api ${testDataForApiGeneralError.apiErrorType} error after clicking ${modalName} modal refresh button for ${testDataForInput.label} shows an error alert within the modal`, async () => {
        await renderRoute(thisRoute);
        const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
        testDataForApiGeneralError.mockApiError();
        await clickRefreshButton(modal, testDataForInput.label);
        const errorAlert: HTMLElement = getByRole(modal, "alert");
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(errorMessage);
      });
    }
  }
});