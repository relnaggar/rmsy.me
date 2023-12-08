import { screen, getAllByRole, getByRole, waitFor } from "@testing-library/react";

import { injectMocks, openAndGetModal, getSubmitButton, clickCloseButton, clickSubmitButton, userTypeInput, mockFunctions } from "../common/testUtils";
import { validJob1, generateResponse, testDataForAPIGeneralErrors, errorMessage, generateErrorResponse, generateConditionalResponseByRoute } from "../common/mockAPI";
import { renderThisRoute, getFirstColumn } from "./jobTestUtils";
import { Job } from "../jobs/types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/statuses/",
    data: [
      {"id": 1, "name": "Backlog", "order": 1},
    ],
  }]));
});

const modalName = "add job";

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

test.only(`submitting the ${modalName} modal with valid input makes an API call to add the job`, async () => {
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
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
  await renderThisRoute();
  const modal: HTMLElement = await openAndGetModal(modalName);
  for (const testDataForInput of testDataForInputs) {
    await userTypeInput(modal, testDataForInput.label, testDataForInput.validValue);
  }
  mockFunctions.fetchData.mockImplementationOnce(generateResponse<Job>(validJob1));
  await clickSubmitButton(modal);
  const firstColumnJobs: HTMLElement[] = getAllByRole(getFirstColumn(), "listitem");
  expect(firstColumnJobs.length).toBe(1);
  const addedJob: HTMLElement = firstColumnJobs[0];
  expect(addedJob).toHaveTextContent(validJob1.title);
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

// test("add job modal has a fill button", async () => {
//   await renderThisRoute();
//   const fillButton: HTMLElement = getByRole(await openAndGetAddJobModal(), "button", {name: new RegExp("fill", "i")});
//   expect(fillButton).toBeInTheDocument();
// });

// test("clicking the fill button calls the API", async () => {
//   await renderThisRoute();
//   const addJobModal: HTMLElement = await openAndGetAddJobModal();
//   const fillButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("fill", "i")});
//   await act(async () => {
//     userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")}), validJob1.url);
//   });
//   await act(async () => {
//     userEvent.click(fillButton);
//   });
//   expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
//     expect.stringContaining("../api/jobs/extract-details-from-url?url="),
//     expect.objectContaining({
//       method: "GET",
//       headers: expect.objectContaining({
//         "Content-Type": "application/json",
//       }),
//     })
//   );
// });

// test("clicking the fill button when the API fails shows an error alert", async () => {
//   await renderThisRoute();
//   const addJobModal: HTMLElement = await openAndGetAddJobModal();
//   mockFunctions.fetchData.mockRejectedValueOnce(new Error("Failed to fetch"));

//   const fillButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("fill", "i")});
//   await act(async () => {
//     userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")}), validJob1.url);
//   });
//   await act(async () => {
//     userEvent.click(fillButton);
//   });

//   const alert: HTMLElement = getByRole(addJobModal, "alert");
//   expect(alert).toHaveTextContent("Failed to connect to server. Please check your internet connection and try again.");
// });

// type FillButtonTest = {
//   test_description: string,
//   url: string,
//   data: Record<string, string | string[]>,
//   status: number,
// };

// describe("clicking the fill button invalid URLs calls the API and shows an error alert", () => {
//   const allTestData: FillButtonTest[] = [{
//       "test_description": "an invalid URL",
//       "url": "ab:cd",
//       "data": {"url": ["Enter a valid URL."]},
//       "status": 400,
//     }, {
//       "test_description": "a URL with no job details",
//       "url": "https://www.notajobposting.com",
//       "data": {"error": "The provided job posting text does not contain a job title or a company name."},
//       "status": 400,
//     }, {
//       "test_description": "an empty URL",
//       "url": "",
//       "data": {"error": ["Please enter a URL."]},
//       "status": 400,
//     }, {
//       "test_description": "a server error",
//       "url": "https://www.validjobposting.com",
//       "data": {"error": "An error occurred."},
//       "status": 500,
//     }
//   ];

//   for (const currentTestData of allTestData) {
//     test(`clicking fill button with ${currentTestData["test_description"]} calls the API and shows an error alert`, async () => {
//       await renderThisRoute();
//       const addJobModal: HTMLElement = await openAndGetAddJobModal();
  
//       // fill with an invalid URL
//       if (currentTestData["url"] !== "") {
//         await act(async () => {
//           userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")}), currentTestData["url"]);
//         });
//       }
//       mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//         url: `../api/jobs/extract-details-from-url?url=${currentTestData["url"]}`,
//         data: currentTestData["data"],
//         status: currentTestData["status"],
//       }]));
  
//       // click fill button
//       const fillButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("fill", "i")});
//       await act(async () => {
//         userEvent.click(fillButton);
//       });
  
//       // check that the error alert is shown
//       const alert: HTMLElement = getByRole(addJobModal, "alert");
//       if (currentTestData["data"]["error"]) {
//         expect(alert).toHaveTextContent(currentTestData["data"]["error"] as string)
//       } else {
//         expect(alert).toHaveTextContent(Object.values(currentTestData["data"]).flat().join(" "));
//       }
//     });
//   }
// });

// test("clicking the fill button with a valid URL calls the API and fills the job detail inputs", async () => {
//   await renderThisRoute();
//   const addJobModal: HTMLElement = await openAndGetAddJobModal();

//   // fill with a valid URL
//   await act(async () => {
//     userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")}), validJob1.url);
//   });
//   mockFunctions.fetchData.mockImplementation(generateResponse({
//     "title": validJob1.title,
//     "company": validJob1.company,
//     "posting": validJob1.posting,
//   }));

//   // click fill button
//   const fillButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("fill", "i")});
//   await act(async () => {
//     userEvent.click(fillButton);
//   });

//   // check that the job detail inputs were filled
//   expect(getByRole(addJobModal, "textbox", {name: new RegExp("title", "i")})).toHaveValue(validJob1.title);
//   expect(getByRole(addJobModal, "textbox", {name: new RegExp("company", "i")})).toHaveValue(validJob1.company);
//   expect(getByRole(addJobModal, "textbox", {name: new RegExp("posting", "i")})).toHaveValue(validJob1.posting);
// });

// type SubmitButtonTest = {
//   url: string,
//   title: string,
//   company: string,
//   posting: string,
//   data: Record<string, string | string[]>,
//   status: number,
// };