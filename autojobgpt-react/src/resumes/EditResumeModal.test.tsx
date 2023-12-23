import { screen, getByRole, getAllByRole, waitFor, queryByRole } from "@testing-library/react";

import { injectMocks, mockFunctions, renderRoute, queryResources, openAndGetEditModal, clickCloseButton, getSaveButton, userClearInput, clickSaveButton, userInput } from "../common/testUtils";
import { validResume1, validResume2, validResume3, testDataForApiGeneralErrors, errorMessage } from "../api/mockData";
import { generateConditionalResponseByRoute, generateResponse, generateErrorResponse } from "../api/mockApi";
import { Resume } from "../api/types";


const thisRoute = "/resumes";
const thisResource = "resume";
const modalName = "edit resume";
const thisApiPath = `../api/resumes/`;
const thisMockData: Resume[] = [validResume1, validResume2];

const newResume = validResume3;

const testData: {
  label: keyof Resume,
  role: "textbox" | "combobox",
  required: boolean,
  validValue: string | number,
}[] = [{
  label: "name",
  role: "textbox",
  required: true,
  validValue: newResume.name,
}];

const testEachModal = async (testDescription: string, func: (
  modal: HTMLElement,
  mockData: Resume,
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

describe(`each ${modalName} modal displays the ${thisResource}'s job title`, () => {
  testEachModal(`modal displays the ${thisResource}'s job title`, async (modal, mockData) => {
    expect(modal).toHaveTextContent(mockData.job.title);
  });
});

describe(`each ${modalName} modal displays the ${thisResource}'s job company`, () => {
  testEachModal(`modal displays the ${thisResource}'s job company`, async (modal, mockData) => {
    expect(modal).toHaveTextContent(mockData.job.company);
  });
});

describe(`each ${modalName} modal has a link to the ${thisResource}'s job url`, () => {
  testEachModal(`modal has a link to the ${thisResource}'s job url`, async (modal, mockData) => {
    const links: HTMLElement[] = getAllByRole(modal, "link");
    let hasMatchingUrl = false;
    for (const link of links) {
      if (link.getAttribute("href") === mockData.job.url) {
        hasMatchingUrl = true;
      }      
    }
    expect(hasMatchingUrl).toBe(true);
  });
});

describe(`each ${modalName} modal displays the ${thisResource}'s template name`, () => {
  testEachModal(`modal displays the ${thisResource}'s template name`, async (modal, mockData) => {
    expect(modal).toHaveTextContent(mockData.template.name);
  });
});

describe(`each ${modalName} modal displays the ${thisResource}'s version number`, () => {
  testEachModal(`modal displays the ${thisResource}'s version number`, async (modal, mockData) => {
    expect(modal).toHaveTextContent(new RegExp(`version ${mockData.version}`, "i"));
  });
});

describe(`each ${modalName} modal has a download link to the ${thisResource}`, () => {
  testEachModal(`modal has a download link to the ${thisResource}`, async (modal, mockData) => {
    const links: HTMLElement[] = getAllByRole(modal, "link");
    let hasMatchingUrl = false;
    for (const link of links) {
      if (link.getAttribute("href") === mockData.docx && link.getAttribute("download") !== null) {
        hasMatchingUrl = true;
      }      
    }
    expect(hasMatchingUrl).toBe(true);
  });
});

describe(`each ${modalName} modal has a download link to the ${thisResource}'s template`, () => {
  testEachModal(`modal has a download link to the ${thisResource}`, async (modal, mockData) => {
    const links: HTMLElement[] = getAllByRole(modal, "link");
    let hasMatchingUrl = false;
    for (const link of links) {
      if (link.getAttribute("href") === mockData.template.docx && link.getAttribute("download") !== null) {
        hasMatchingUrl = true;
      }      
    }
    expect(hasMatchingUrl).toBe(true);
  });
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
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisApiPath}${mockData.id}/`, expect.objectContaining({
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