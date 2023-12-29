import { screen, getByRole, getAllByRole, waitFor, queryByRole } from "@testing-library/react";

import { injectMocks, mockFunctions, renderRoute, queryResources, openAndGetEditModal, clickCloseButton, getSaveButton, userClearInput, clickSaveButton, userInput, getSection, querySaveButton } from "../common/testUtils";
import { validResumeTemplate1, validResumeTemplate2, validResumeTemplate3, testDataForApiGeneralErrors, errorMessage } from "../api/mockData";
import { generateConditionalResponseByRoute, generateResponse, generateErrorResponse } from "../api/mockApi";
import { defaultFillFields } from "../api/constants";
import { FillField, Template } from "../api/types";


const thisRoute = "/resumes";
const thisResource = "template";
const modalName = "edit resume template";
const thisBaseApiPath = "../api/templates/";
const thisApiPath = `${thisBaseApiPath}?type=resume`;
const thisMockData: Template[] = [validResumeTemplate1, validResumeTemplate2];
const newTemplate = validResumeTemplate3;

const relatedApiPath = "../api/fillFields/";
const relatedResourceKey = "fill_fields";
const relatedMockData: FillField[] = thisMockData.reduce((relatedMockData: FillField[], resource: Template) => {
  return relatedMockData.concat(resource[relatedResourceKey]);
}, []);
const relatedResourceName = "fill field";
const relatedResourceValueKey = "description";
const newRelatedResourceValue = `new ${relatedResourceName} ${relatedResourceValueKey}`;

const testData: {
  label: keyof Template,
  role: "textbox" | "combobox",
  required: boolean,
  validValue: string | number,
}[] = [{
  label: "name",
  role: "textbox",
  required: true,
  validValue: newTemplate.name,
}, {
  label: "additional_information",
  role: "textbox",
  required: false,
  validValue: newTemplate.additional_information!,
}];

const testEachModal = async (testDescription: string, func: (
  modal: HTMLElement,
  mockData: Template,
  modalNumber: number,
) => Promise<void>) => {
  for (let modalNumber = 0; modalNumber < thisMockData.length; modalNumber++) {
    test(`for ${modalName} modal ${thisMockData[modalNumber].name}, ${testDescription}`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
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
  }, {
    url: relatedApiPath,
    data: relatedMockData,
  }]));
});

test(`each ${thisResource} list item is displayed with an edit button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
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
      const input: HTMLElement = getByRole(
        modal, testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")}
      );
      expect(input).toBeInTheDocument();
    });
  }
});

describe(`each ${modalName} modal automatically focuses on the first input within 1 second`, () => {
  testEachModal(`modal automatically focuses on the first input within 1 second`, async (modal) => {
    const firstInput: HTMLElement = getByRole(modal,testData[0].role, {name: new RegExp(testData[0].label, "i")});
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
        await userClearInput(modal, testDataForInput.label, testDataForInput.role);
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
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
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
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.label]: testDataForInput.validValue}));
      await clickSaveButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisBaseApiPath}${mockData.id}/`, expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({[testDataForInput.label]: testDataForInput.validValue.toString()}),
      }));
    });
  }
});

describe(`for each ${modalName} modal, saving each input with valid input changes the input's value to the saved value`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`saving input ${testDataForInput.label} with valid input changes the input's value to the saved value`, async (modal, mockData, modalNumber) => {
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.label]: testDataForInput.validValue}));
      await clickSaveButton(modal, testDataForInput.label);
      await clickCloseButton(modal);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      const input: HTMLElement = getByRole(newModal, testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toHaveValue(testDataForInput.validValue.toString());
    });
  }
});

describe(`for each ${modalName} modal, saving the name changes the ${thisResource}'s name`, () => {
  testEachModal(`saving saving the name changes the ${thisResource}'s name`, async (modal, mockData, modalNumber) => {
    const testDataForInput = testData.find((testDataForInput) => testDataForInput.label === "name")!;
    await userClearInput(modal, testDataForInput.label, testDataForInput.role);
    await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.label]: testDataForInput.validValue}));
    await clickSaveButton(modal, testDataForInput.label);
    await clickCloseButton(modal);
    const resourceElements: HTMLElement[] = queryResources(thisResource);
    const resourceElement: HTMLElement = resourceElements[modalNumber];
    expect(resourceElement).toHaveTextContent(testDataForInput.validValue.toString());
  });
});

describe(`api general errors after saving each ${modalName} modal input show an error alert for that input`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    for (const testDataForInput of testData) {
      testEachModal(`api ${testDataForApiGeneralError.apiErrorType} error after saving input ${testDataForInput.label} show an error alert for that input`, async (modal) => {
        await userClearInput(modal, testDataForInput.label, testDataForInput.role);
        await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
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
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
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
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSaveButton(modal, testDataForInput.label);
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      expect(queryByRole(modal, "alert", {name: new RegExp(testDataForInput.label, "i")})).not.toBeInTheDocument();
      await clickCloseButton(modal); // close the modal to make sure transition is complete by the end of the test
    });
  }
});

describe(`each ${modalName} modal does not retain input values on close and reopen`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`does not retain input value for ${testDataForInput.label} on close and reopen`, async (modal, mockData, modalNumber) => {
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
      await clickCloseButton(modal);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      const input: HTMLElement = getByRole(newModal, testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toHaveValue(mockData[testDataForInput.label]!.toString());
    });
  }
});

describe(`each ${modalName} modal does not retain input errors on close and reopen`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`does not retain input error for ${testDataForInput.label} on close and reopen`, async (modal, _, modalNumber) => {
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.label]: [errorMessage]}));
      await clickSaveButton(modal, testDataForInput.label);
      await clickCloseButton(modal);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      expect(queryByRole(newModal, "alert", {name: new RegExp(testDataForInput.label, "i")})).not.toBeInTheDocument();
    });
  }
});

test(`api call is initially made to fetch the ${relatedResourceName}s`, async () => {
  await renderRoute(thisRoute);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith(relatedApiPath,
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
    })
  );
});

test(`api general error on fetching ${relatedResourceName}s shows an error alert within the ${thisResource} list`, async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: relatedApiPath, data: {error: [errorMessage]}, status: 500
  }]));
  await renderRoute(thisRoute);
  const listSection: HTMLElement = getSection(thisResource);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});

test(`api network error on fetching fill fileds shows an error alert within the ${thisResource} list`, async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: relatedApiPath, reject: true
  }]));
  await renderRoute(thisRoute);
  const listSection: HTMLElement = getSection(thisResource);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});

describe(`each ${modalName} modal has all ${relatedResourceName} inputs`, () => {
  testEachModal(`modal has all ${relatedResourceName} inputs`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(relatedResource.key, "i")});
      expect(input).toBeInTheDocument();
    }
  });
});

describe(`each ${modalName} modal ${relatedResourceName} input starts with the ${relatedResourceName}'s ${relatedResourceValueKey}`, () => {
  testEachModal(`modal ${relatedResourceName} inputs start with the ${relatedResourceName}'s ${relatedResourceValueKey}`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(relatedResource.key, "i")});
      expect(input).toHaveValue(relatedResource[relatedResourceValueKey]);
    }
  });
});

describe(`each ${modalName} modal default ${relatedResourceName} input doesn't have a save button`, () => {
  testEachModal(`modal has a save button for each non-default ${relatedResourceName} input`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (defaultFillFields.includes(relatedResource.key)) {
        expect(querySaveButton(modal, relatedResource.key)).not.toBeInTheDocument();    
      }
    }
  });
});

describe(`each ${modalName} modal default ${relatedResourceName} input is disabled`, () => {
  testEachModal(`modal has a disabled input for each default ${relatedResourceName} input`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (defaultFillFields.includes(relatedResource.key)) {
        const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(relatedResource.key, "i")});
        expect(input).toHaveAttribute("disabled");
      }
    }
  });
});

describe(`each ${modalName} modal non-default ${relatedResourceName} input has a save button`, () => {
  testEachModal(`modal has a save button for each non-default ${relatedResourceName} input`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        const saveButton: HTMLElement = getSaveButton(modal, relatedResource.key);
        expect(saveButton).toBeInTheDocument();
      }
    }
  });
});

describe(`each ${modalName} modal non-default ${relatedResourceName} input is not disabled`, () => {
  testEachModal(`modal has a non-disabled input for each non-default ${relatedResourceName} input`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(relatedResource.key, "i")});
        expect(input).not.toHaveAttribute("disabled");
      }
    }
  });
});

describe(`for each ${modalName} modal, saving each non-default ${relatedResourceName} input makes an api call`, () => {
  testEachModal(`saving each non-default ${relatedResourceName} input makes an api call`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        await userClearInput(modal, relatedResource.key);
        const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
        mockFunctions.fetchData.mockImplementationOnce(generateResponse({...relatedResource, [relatedResourceValueKey]: ""}));
        await clickSaveButton(modal, relatedResource.key);
        expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
      }
    }
  });
});

describe(`for each ${modalName} modal, saving each non-default ${relatedResourceName} input makes an api call to save the data`, () => {
  testEachModal(`saving each non-default ${relatedResourceName} input makes an api call to save the data`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        await userClearInput(modal, relatedResource.key);
        await userInput(modal, relatedResource.key, newRelatedResourceValue);
        mockFunctions.fetchData.mockImplementationOnce(generateResponse({...relatedResource, [relatedResourceValueKey]: newRelatedResourceValue}));
        await clickSaveButton(modal, relatedResource.key);
        expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${relatedApiPath}${relatedResource.id}/`, expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({[relatedResourceValueKey]: newRelatedResourceValue}),
        }));
      }
    }
  });
});

describe(`for each ${modalName} modal, saving each non-default ${relatedResourceName} input changes the input's value to the saved value`, () => {
  testEachModal(`saving each non-default ${relatedResourceName} input changes the input's value to the saved value`, async (modal, mockData, modalNumber) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        await userClearInput(modal, relatedResource.key);
        await userInput(modal, relatedResource.key, newRelatedResourceValue);
        mockFunctions.fetchData.mockImplementationOnce(generateResponse({...relatedResource, [relatedResourceValueKey]: newRelatedResourceValue}));
        await clickSaveButton(modal, relatedResource.key);
        await clickCloseButton(modal);
        const resourceElements: HTMLElement[] = queryResources(thisResource);
        modal = await openAndGetEditModal(resourceElements[modalNumber]);
        const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(relatedResource.key, "i")});
        expect(input).toHaveValue(newRelatedResourceValue);
      }
    }
  });
});

describe(`api general errors after saving each ${modalName} modal non-default ${relatedResourceName} input show an error alert for that input`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    testEachModal(`api ${testDataForApiGeneralError.apiErrorType} error after saving each non-default ${relatedResourceName} input shows an error alert for that input`, async (modal, mockData) => {
      for (const relatedResource of mockData[relatedResourceKey]) {
        if (! defaultFillFields.includes(relatedResource.key)) {
          await userClearInput(modal, relatedResource.key);
          testDataForApiGeneralError.mockApiError();
          await clickSaveButton(modal, relatedResource.key);
          const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(relatedResource.key, "i")});
          expect(errorAlert).toBeInTheDocument();
          expect(errorAlert).toHaveTextContent(new RegExp(errorMessage, "i"));
        }
      }
    });
  }
});

describe(`api input error after saving each ${modalName} modal non-default ${relatedResourceName} input shows an error message attached to the input`, () => {
  testEachModal(`api input error after saving each non-default ${relatedResourceName} input shows an error message attached to the input`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        await userClearInput(modal, relatedResource.key);
        await userInput(modal, relatedResource.key, newRelatedResourceValue);
        mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[relatedResourceValueKey]: [errorMessage]}));
        await clickSaveButton(modal, relatedResource.key);
        const errorAlert: HTMLElement = getByRole(modal, "alert", {name: new RegExp(relatedResource.key, "i")});
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(new RegExp(errorMessage, "i"));
      }
    }
  });
});

describe(`api input error after saving each ${modalName} modal non-default ${relatedResourceName} input can be cleared by editing the corresponding input`, () => {
  testEachModal(`api input error after saving each non-default ${relatedResourceName} input can be cleared by editing the corresponding input`, async (modal, mockData) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        await userClearInput(modal, relatedResource.key);
        await userInput(modal, relatedResource.key, newRelatedResourceValue);
        mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[relatedResourceValueKey]: [errorMessage]}));
        await clickSaveButton(modal, relatedResource.key);
        await userClearInput(modal, relatedResource.key);
        expect(queryByRole(modal, "alert", {name: new RegExp(relatedResource.key, "i")})).not.toBeInTheDocument();
      }
    }
    await clickCloseButton(modal); // close the modal to make sure transition is complete by the end of the test
  });
});

describe(`each ${modalName} modal does not retain non-default ${relatedResourceName} input values on close and reopen`, () => {
  testEachModal(`does not retain non-default ${relatedResourceName} input values on close and reopen`, async (modal, mockData, modalNumber) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        await userClearInput(modal, relatedResource.key);
        await clickCloseButton(modal);
        const resourceElements: HTMLElement[] = queryResources(thisResource);
        modal = await openAndGetEditModal(resourceElements[modalNumber]);
        const input: HTMLElement = getByRole(modal, "textbox", {name: new RegExp(relatedResource.key, "i")});
        expect(input).toHaveValue(relatedResource[relatedResourceValueKey]);
      }
    }
  });
});

describe(`each ${modalName} modal does not retain non-default ${relatedResourceName} input errors on close and reopen`, () => {
  testEachModal(`does not retain non-default ${relatedResourceName} input errors on close and reopen`, async (modal, mockData, modalNumber) => {
    for (const relatedResource of mockData[relatedResourceKey]) {
      if (! defaultFillFields.includes(relatedResource.key)) {
        await userClearInput(modal, relatedResource.key);
        mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[relatedResourceValueKey]: [errorMessage]}));
        await clickSaveButton(modal, relatedResource.key);
        await clickCloseButton(modal);
        const resourceElements: HTMLElement[] = queryResources(thisResource);
        modal =  await openAndGetEditModal(resourceElements[modalNumber]);
        expect(queryByRole(modal, "alert", {name: new RegExp(relatedResource.key, "i")})).not.toBeInTheDocument();
      }
    }
  });
});