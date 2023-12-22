import { getByRole, screen, getAllByRole, waitFor, queryByRole } from "@testing-library/react";

import { injectMocks, mockFunctions, renderRoute, queryResources, openAndGetEditModal, clickCloseButton, userClearInput, getSaveButton, clickSaveButton, userInput } from "../common/testUtils";
import { generateConditionalResponseByRoute, generateResponse, generateErrorResponse } from "../api/mockApi";
import { validStatus1, validStatus2, validStatus3, testDataForApiGeneralErrors, errorMessage } from "../api/mockData";
import { Status } from "../api/types";


const thisRoute = "/jobs";
const thisResource = "job board column";
const thisHeadingLabel = "job board";
const modalName = "edit column";
const thisApiPath = `../api/statuses/`;
const thisMockData = [validStatus1, validStatus2];
const newStatus = validStatus3;

const testData: {
  label: keyof Status,
  required: boolean,
  validValue: string,
}[] = [
  {
    label: "name",
    required: true,
    validValue: newStatus.name,
  },
];

const testEachModal = async (testDescription: string, func: (
  modal: HTMLElement,
  mockData: Status,
  modalNumber: number,
) => Promise<void>) => {
  for (let modalNumber = 0; modalNumber < thisMockData.length; modalNumber++) {
    test(`for ${modalName} modal ${thisMockData[modalNumber].name}, ${testDescription}`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const modal: HTMLElement = await openAndGetEditModal(resourceElements[modalNumber]);
      await func(modal, thisMockData[modalNumber], modalNumber);
    });
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: thisMockData,
  }]));
});

test(`each ${thisResource} is displayed with an edit button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
  resourceElements.forEach((resourceElement) => {
    const editButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("edit", "i")});
    expect(editButton).toBeInTheDocument();
  });
});

test(`${modalName} modal isn't visible before clicking ${modalName} button`, async () => {
  await renderRoute(thisRoute);
  expect(screen.queryByRole("dialog", {name: new RegExp(modalName, "i")})).not.toBeInTheDocument();
});

describe(`clicking each ${modalName} button shows ${modalName} modal within 1 second`, () => {
  testEachModal(`clicking ${modalName} button shows modal within 1 second`, async (modal) => {
    expect(modal).toBeInTheDocument();
  });
});

describe(`each ${modalName} modal has a close button`, () => {
  testEachModal(`modal has a close button`, async (modal) => {
    const closeButtons: HTMLElement[] = getAllByRole(modal, "button", {name: new RegExp("close", "i")});
    expect(closeButtons.length).toBeGreaterThan(0);
  });
});

describe(`clicking each ${modalName} modal close button closes the modal within 1 second`, () => {
  testEachModal(`clicking close button closes the modal within 1 second`, async (modal) => {
    await clickCloseButton(modal);
    await waitFor(() => expect(modal).not.toBeInTheDocument(), {timeout: 1000});
  });
});

describe(`each ${modalName} modal has all inputs`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`modal has a ${testDataForInput.label} input`, async (modal) => {
      const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toBeInTheDocument();
    });
  }
});

describe(`each ${modalName} modal automatically focuses on the first input within 1 second`, () => {
  testEachModal(`modal automatically focuses on the first input within 1 second`, async (modal) => {
    const firstInput: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(testData[0].label, "i")});
    await waitFor(() => expect(firstInput).toHaveFocus(), {timeout: 1000});
  });
});

describe(`each ${modalName} modal input has a save button`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`modal has a save button for ${testDataForInput.label} input`, async (modal) => {
      const saveButton: HTMLElement = getSaveButton(modal, testDataForInput.label);
      expect(saveButton).toBeInTheDocument();
    });
  }
});

describe(`for each ${modalName} modal, saving each required input with empty value shows an error for that input`, () => {
  for (const testDataForInput of testData) {
    if (testDataForInput.required) {
      testEachModal(`saving input ${testDataForInput.label} with empty value shows an error for that input`, async (modal) => {
        await userClearInput(modal, testDataForInput.label);
        await clickSaveButton(modal, testDataForInput.label);
        const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(new RegExp(testDataForInput.label, "i"));
      });
    }
  }
});

describe(`for each ${modalName} modal, saving each input with valid input makes an api call`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`saving input ${testDataForInput.label} with valid input makes an api call`, async (modal, mockData) => {
      await userClearInput(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.label]: testDataForInput.validValue}));
      await clickSaveButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
    });
  }
});

describe(`for each ${modalName} modal, saving each input with valid input makes an api call to save the data`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`saving input ${testDataForInput.label} with valid input makes an api call to save the data`, async (modal, mockData) => {
      await userClearInput(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.label]: testDataForInput.validValue}));
      await clickSaveButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisApiPath}${mockData.id}/`, expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({[testDataForInput.label]: testDataForInput.validValue}),
      }));
    });
  }
});

describe(`for each ${modalName} modal, saving each input with valid input changes the input's value to the saved value`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`saving input ${testDataForInput.label} with valid input changes the input's value to the saved value`, async (modal, mockData, modalNumber) => {
      await userClearInput(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.label]: testDataForInput.validValue}));
      await clickSaveButton(modal, testDataForInput.label);
      await clickCloseButton(modal);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      const input: HTMLElement = getByRole(newModal, "textbox", {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toHaveValue(testDataForInput.validValue);
    });
  }
});

describe(`for each ${modalName} modal, saving the name changes the ${thisResource}'s name`, () => {
  testEachModal(`saving saving the name changes the ${thisResource}'s name`, async (modal, mockData, modalNumber) => {
    const testDataForInput = testData[0];
    await userClearInput(modal, testDataForInput.label);
    await userInput(modal, testDataForInput.label, testDataForInput.validValue);
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.label]: testDataForInput.validValue}));
    await clickSaveButton(modal, testDataForInput.label);
    await clickCloseButton(modal);
    const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
    const resourceElement: HTMLElement = resourceElements[modalNumber];
    expect(resourceElement).toHaveTextContent(testDataForInput.validValue);
  });
});

describe(`api general errors after saving each ${modalName} modal input show an error alert for that input`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    for (const testDataForInput of testData) {
      testEachModal(`api ${testDataForApiGeneralError.apiErrorType} error after saving input ${testDataForInput.label} show an error alert for that input`, async (modal) => {
        await userClearInput(modal, testDataForInput.label);
        await userInput(modal, testDataForInput.label, testDataForInput.validValue);
        testDataForApiGeneralError.mockApiError();
        await clickSaveButton(modal, testDataForInput.label);
        const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(new RegExp(errorMessage, "i"));
      });
    }
  }
});

describe(`api input error after saving each ${modalName} modal input shows an error message attached to the input`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`api input error after saving input ${testDataForInput.label} shows an error message attached to the input`, async (modal) => {
      await userClearInput(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSaveButton(modal, testDataForInput.label);
      const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")});
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(new RegExp(errorMessage, "i"));
    });
  }
});

describe(`api input error after saving each ${modalName} modal input can be cleared by editing the corresponding input`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`api input error after saving input ${testDataForInput.label} can be cleared by editing the corresponding input`, async (modal) => {
      await userClearInput(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSaveButton(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      expect(queryByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")})).not.toBeInTheDocument();
      await clickCloseButton(modal); // close the modal to make sure transition is complete by the end of the test
    });
  }
});

describe(`each ${modalName} modal does not retain input values on close and reopen`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`does not retain input value for ${testDataForInput.label} on close and reopen`, async (modal, mockData, modalNumber) => {
      await userClearInput(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      await clickCloseButton(modal);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      const input: HTMLElement = getByRole(newModal, "textbox", {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toHaveValue(mockData[testDataForInput.label]);
    });
  }
});

describe(`each ${modalName} modal does not retain input errors on close and reopen`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`does not retain input error for ${testDataForInput.label} on close and reopen`, async (modal, _, modalNumber) => {
      await userClearInput(modal, testDataForInput.label);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSaveButton(modal, testDataForInput.label);
      await clickCloseButton(modal);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      expect(queryByRole(newModal, "alert", {name: new RegExp(testDataForInput.label, "i")})).not.toBeInTheDocument();
    });
  }
});