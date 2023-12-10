import { screen, getAllByRole, getByRole, waitFor, queryByRole } from "@testing-library/react";

import { injectMocks, renderRoute, openAndGetModal, getSubmitButton, clickCloseButton, clickSubmitButton, userTypeInput, mockFunctions, OpenAndGetModalParams, getFillButton, clickFillButton, getFirstColumn } from "../common/testUtils";
import { generateResponse, generateErrorResponse, generateConditionalResponseByRoute } from "../api/mockApi";
import { errorMessage, testDataForApiGeneralErrors, validJob1, validStatus1, validStatus2 } from "../api/mockData";
import { Job, JobDetails } from '../api/types';


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/statuses/",
    data: [validStatus1, validStatus2],
  }]));
});

const thisRoute = "/jobs";
const modalName = "add job";
const openAndGetModalParams: OpenAndGetModalParams = {modalName};

const testData: {
  label: string,
  required: boolean,
  validValue: string,
}[] = [{
  label: "url",
  required: false,
  validValue: validJob1.url,
}, {
  label: "title",
  required: true,
  validValue: validJob1.title,
}, {
  label: "company",
  required: true,
  validValue: validJob1.company,
}, {
  label: "posting",
  required: false,
  validValue: validJob1.posting,
}];

const fillWithValidValues = async (modal: HTMLElement): Promise<void> => {
  for (const testDataForInput of testData) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
};

const fillValidURL = async (modal: HTMLElement): Promise<void> => {
  await userTypeInput(modal, "url", validJob1.url);
};

test(`${modalName} button appears once on the page`, async () => {
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

test(`submitting the ${modalName} modal with valid input makes an api call to add the job`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  await clickSubmitButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/jobs/", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({
      "url": validJob1.url,
      "title": validJob1.title,
      "company": validJob1.company,
      "posting": validJob1.posting,
    }),
  }));  
});

test(`submitting the ${modalName} modal with valid input adds the job to the first column`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillWithValidValues(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Job>(validJob1));
  await clickSubmitButton(modal);
  const firstColumnJobs: HTMLElement[] = getAllByRole(getFirstColumn(), "listitem");
  expect(firstColumnJobs.length).toBe(1);
  const addedJob: HTMLElement = firstColumnJobs[0];
  expect(addedJob).toHaveTextContent(validJob1.title);
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
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      await clickSubmitButton(modal);
      expect(errorAlert).not.toBeInTheDocument();
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

test(`${modalName} modal has a fill button`, async () => {
  await renderRoute(thisRoute);
  const fillButton: HTMLElement = getFillButton(await openAndGetModal(openAndGetModalParams));
  expect(fillButton).toBeInTheDocument();
});

test(`clicking the ${modalName} modal fill button with empty URL shows an error for that input`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await clickFillButton(modal);
  const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp("url", "i")});
  expect(errorAlert).toBeInTheDocument();
  expect(errorAlert).toHaveTextContent(new RegExp("url", "i"));
});

test(`clicking the ${modalName} modal fill button with valid URL makes an api call`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillValidURL(modal);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  await clickFillButton(modal);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`clicking the ${modalName} modal fill button with valid URL makes an api call to fill the job details`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillValidURL(modal);
  await clickFillButton(modal);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
    `../api/jobs/extract-details-from-url?url=${validJob1.url}`,
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
    })
  );
});

test(`clicking the ${modalName} modal fill button with valid URL fills the job details`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillValidURL(modal);
  const {title, company, posting}: JobDetails = validJob1;
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<JobDetails>({title, company, posting}));
  await clickFillButton(modal);
  expect(getByRole(modal, "textbox", {name: new RegExp("title", "i")})).toHaveValue(title);
  expect(getByRole(modal, "textbox", {name: new RegExp("company", "i")})).toHaveValue(company);
  expect(getByRole(modal, "textbox", {name: new RegExp("posting", "i")})).toHaveValue(posting);
});

describe(`api general errors after clicking the ${modalName} modal fill button show an error alert within the modal`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    test(`api ${testDataForApiGeneralError.apiErrorType} error after submitting the ${modalName} modal shows an error alert within the modal`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillValidURL(modal);
      testDataForApiGeneralError.mockApiError();
      await clickFillButton(modal);
      const errorAlert: HTMLElement = getByRole(modal, "alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(errorMessage);
    });
  }
});


test(`api input error after clicking the ${modalName} modal fill button shows an error message attached to the URL input`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillValidURL(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({url: [errorMessage]}));
  await clickFillButton(modal);
  const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp("url", "i")});
  expect(errorAlert).toBeInTheDocument();
  expect(errorAlert).toHaveTextContent(errorMessage);
});

test(`api input error after clicking the ${modalName} modal fill button can be cleared by editing the corresponding input`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await fillValidURL(modal);
  mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({url: [errorMessage]}));
  await clickFillButton(modal);
  const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp("url", "i")});
  await userTypeInput(modal, "url", "abc");
  expect(errorAlert).not.toBeInTheDocument();
  await clickCloseButton(modal); // close the modal to make sure transition is complete by the end of the test
});

test(`empty URL input error after clicking the ${modalName} modal fill button can be cleared by editing the corresponding input`, async () => {
  await renderRoute(thisRoute);
  const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
  await clickFillButton(modal);
  const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp("url", "i")});
  await userTypeInput(modal, "url", "abc");
  expect(errorAlert).not.toBeInTheDocument();
  await clickCloseButton(modal); // close the modal to make sure transition is complete by the end of the test
});

describe(`api general errors after clicking the ${modalName} modal fill button can be cleared by clicking the button again`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    test(`api ${testDataForApiGeneralError.apiErrorType} error after clicking the ${modalName} modal fill button can be cleared by clicking the button again`, async () => {
      await renderRoute(thisRoute);
      const modal: HTMLElement = await openAndGetModal(openAndGetModalParams);
      await fillValidURL(modal);
      testDataForApiGeneralError.mockApiError();
      await clickFillButton(modal);
      await clickFillButton(modal);
      waitFor(() => expect(queryByRole(modal, "alert")).not.toBeInTheDocument(), {timeout: 1000});
    });
  }
});