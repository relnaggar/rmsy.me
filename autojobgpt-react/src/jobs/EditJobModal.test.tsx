import { screen, getByRole, getAllByRole, waitFor, queryByRole } from "@testing-library/react";

import { generateConditionalResponseByRoute, generateResponse, generateErrorResponse } from "../api/mockApi";
import { validJob1, validJob2, validJob3, validStatus1, validStatus2, validStatus3, testDataForApiGeneralErrors, errorMessage, validResume1, validResume2, validResume3 } from "../api/mockData";
import { injectMocks, mockFunctions, renderRoute, queryResources, openAndGetEditModal, clickCloseButton, getSaveButton, userClearInput, clickSaveButton, userInput, getJobByTitleCompany } from "../common/testUtils";
import { Job, Status, Resume } from "../api/types";


const thisRoute = "/jobs";
const thisResource = "job";
const thisHeadingLabel = "job board";
const modalName = "edit job";
const thisApiPath = `../api/jobs/`;
const thisAllMockData: {
  jobs: Job[],
  statuses: Status[],
  resumes: Resume[],
} = {
  jobs: [validJob1, validJob2],
  statuses: [validStatus1, validStatus2, validStatus3],
  resumes: [validResume1, validResume2, validResume3],
}
const newJob: Job = validJob3;

const testData: {
  key: keyof Job,
  label: string,
  role: "textbox" | "combobox",
  required: boolean,
  validValue: string | number,
}[] = [{
  key: "status",
  label: "status",
  role: "combobox",
  required: true,
  validValue: newJob.status,
}, {
  key: "chosen_resume",
  label: "chosen resume",
  role: "combobox",
  required: false,
  validValue: "",
}, {
  key: "url",
  label: "url",
  role: "textbox",
  required: false,
  validValue: newJob.url,
}, {
  key: "title",
  label: "title",
  role: "textbox",
  required: true,
  validValue: newJob.title,
}, {
  key: "company",
  label: "company",
  role: "textbox",
  required: true,
  validValue: newJob.company,
}, {
  key: "posting",
  label: "posting",
  role: "textbox",
  required: true,
  validValue: newJob.posting,
}];

const testEachModal = async (testDescription: string, func: (
  modal: HTMLElement,
  mockData: Job,
  modalNumber: number,
) => Promise<void>) => {
  for (let modalNumber = 0; modalNumber < thisAllMockData.jobs.length; modalNumber++) {
    test(`for ${modalName} modal ${thisAllMockData.jobs[modalNumber].title}, ${testDescription}`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const modal: HTMLElement = await openAndGetEditModal(resourceElements[modalNumber]);
      await func(modal, thisAllMockData.jobs[modalNumber], modalNumber);
    });
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: thisAllMockData.jobs,
  }, {
    url: "../api/statuses/",
    data: thisAllMockData.statuses,
  }, {
    url: "../api/tailoredDocuments/",
    data: thisAllMockData.resumes,
  }]));
});

test(`each ${thisResource} is displayed with an edit button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
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

describe(`each ${modalName} modal has all options for status input`, () => {
  testEachModal(`modal has all options for status input`, async (modal) => {
    const statusInput: HTMLElement = getByRole(modal, "combobox", {name: new RegExp("status", "i")});
    const options: HTMLElement[] = getAllByRole(statusInput, "option");
    expect(options.length).toBe(thisAllMockData.statuses.length+1);
    for (let i = 0; i < thisAllMockData.statuses.length; i++) {
      expect(options[i+1]).toHaveTextContent(thisAllMockData.statuses[i].name);
    }
  });
});

describe(`each ${modalName} modal has all options for chosen resume input`, () => {
  testEachModal(`modal has all options for chosen resume input`, async (modal, _, modalNumber) => {
    const resumeInput: HTMLElement = getByRole(modal, "combobox", {name: new RegExp("chosen resume", "i")});
    const options: HTMLElement[] = getAllByRole(resumeInput, "option");
    const matchingResumes: Resume[] = thisAllMockData.resumes.filter((resume) => resume.job.id === thisAllMockData.jobs[modalNumber].id);
    expect(options.length).toBe(matchingResumes.length+1);
    for (let i = 0; i < matchingResumes.length; i++) {
      expect(options[i+1]).toHaveTextContent(matchingResumes[i].name);
    }
  });
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
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.key]: testDataForInput.validValue}));
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
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.key]: testDataForInput.validValue}));
      await clickSaveButton(modal, testDataForInput.label);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisApiPath}${mockData.id}/`, expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({[testDataForInput.key]: testDataForInput.validValue.toString()}),
      }));
    });
  }
});

describe(`for each ${modalName} modal, saving each input with valid input changes the input's value to the saved value`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`saving input ${testDataForInput.label} with valid input changes the input's value to the saved value`, async (modal, mockData) => {
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
      const updatedJob: Job = {...mockData, [testDataForInput.key]: testDataForInput.validValue};
      mockFunctions.fetchData.mockImplementationOnce(generateResponse(updatedJob));
      await clickSaveButton(modal, testDataForInput.label);
      await clickCloseButton(modal);
      const resourceElement: HTMLElement = getJobByTitleCompany(updatedJob.title, updatedJob.company);
      const newModal: HTMLElement = await openAndGetEditModal(resourceElement);
      const input: HTMLElement = getByRole(newModal, testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toHaveValue(testDataForInput.validValue.toString());
    });
  }
});

describe(`for each ${modalName} modal, saving the name changes the ${thisResource}'s title`, () => {
  testEachModal(`saving saving the name changes the ${thisResource}'s title`, async (modal, mockData, modalNumber) => {
    const testDataForInput = testData.find((testDataForInput) => testDataForInput.label === "title")!;
    await userClearInput(modal, testDataForInput.label, testDataForInput.role);
    await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.key]: testDataForInput.validValue}));
    await clickSaveButton(modal, testDataForInput.label);
    await clickCloseButton(modal);
    const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
    const resourceElement: HTMLElement = resourceElements[modalNumber];
    expect(resourceElement).toHaveTextContent(testDataForInput.validValue.toString());
  });
});

describe(`for each ${modalName} modal, saving the company changes the ${thisResource}'s company`, () => {
  testEachModal(`saving saving the company changes the ${thisResource}'s company`, async (modal, mockData, modalNumber) => {
    const testDataForInput = testData.find((testDataForInput) => testDataForInput.label === "company")!;
    await userClearInput(modal, testDataForInput.label, testDataForInput.role);
    await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.key]: testDataForInput.validValue}));
    await clickSaveButton(modal, testDataForInput.label);
    await clickCloseButton(modal);
    const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
    const resourceElement: HTMLElement = resourceElements[modalNumber];
    expect(resourceElement).toHaveTextContent(testDataForInput.validValue.toString());
  });
});

describe(`for each ${modalName} modal, saving the url changes the ${thisResource}'s url`, () => {
  testEachModal(`saving saving the url changes the ${thisResource}'s url`, async (modal, mockData, modalNumber) => {
    const testDataForInput = testData.find((testDataForInput) => testDataForInput.label === "url")!;
    await userClearInput(modal, testDataForInput.label, testDataForInput.role);
    await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...mockData, [testDataForInput.key]: testDataForInput.validValue}));
    await clickSaveButton(modal, testDataForInput.label);
    await clickCloseButton(modal);
    const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
    const resourceElement: HTMLElement = resourceElements[modalNumber];
    const link: HTMLElement = getByRole(resourceElement, "link");
    expect(link).toHaveAttribute("href", testDataForInput.validValue.toString());
  });
});

describe(`api general errors after saving each ${modalName} modal input show an error alert for that input`, () => {
  for (const testDataForApiGeneralError of testDataForApiGeneralErrors(mockFunctions)) {
    for (const testDataForInput of testData) {
      testEachModal(`api ${testDataForApiGeneralError.apiErrorType} error after saving input ${testDataForInput.label} shows an error alert for that input`, async (modal) => {
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
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.key]: [errorMessage]}));
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
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.key]: [errorMessage]}));
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
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      const input: HTMLElement = getByRole(newModal, testDataForInput.role, {name: new RegExp(testDataForInput.label, "i")});
      expect(input).toHaveValue(mockData[testDataForInput.key]!.toString());
    });
  }
});

describe(`each ${modalName} modal does not retain input errors on close and reopen`, () => {
  for (const testDataForInput of testData) {
    testEachModal(`does not retain input error for ${testDataForInput.label} on close and reopen`, async (modal, _, modalNumber) => {
      await userClearInput(modal, testDataForInput.label, testDataForInput.role);
      await userInput(modal, testDataForInput.label, testDataForInput.validValue.toString(), testDataForInput.role);
      mockFunctions.fetchData.mockImplementationOnce(generateErrorResponse({[testDataForInput.key]: [errorMessage]}));
      await clickSaveButton(modal, testDataForInput.label);
      await clickCloseButton(modal);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const newModal =  await openAndGetEditModal(resourceElements[modalNumber]);
      expect(queryByRole(newModal, "alert", {name: new RegExp(testDataForInput.label, "i")})).not.toBeInTheDocument();
    });
  }
});