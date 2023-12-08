import { screen, getAllByRole, getByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderThisRoute, queryResumes, openAndGetAddResumeModal } from "./resumeTestUtils";
import { injectMocks, getSubmitButton, mockFunctions } from "../common/testUtils";
import {
  generateConditionalResponseByRoute,
  validJob1, validJob2,
  validResumeTemplate1, validResumeTemplate2,
  generateResponse,
  validResume1
 } from "../common/mockAPI";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("add resume modal isn't visible before clicking add resume button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("add resume", "i")})).not.toBeInTheDocument();
});

test("clicking add resume button shows add resume modal within 1 second", async () => {
  await renderThisRoute();
  const addResumeModal: HTMLElement = await openAndGetAddResumeModal(1000);
  expect(addResumeModal).toBeInTheDocument();
});

test("add resume modal has a submit button", async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetAddResumeModal());  
  expect(submitButton).toBeInTheDocument();
});

test("add resume modal has a close button", async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(
    await openAndGetAddResumeModal(),
    "button",
    {name: new RegExp("close", "i")}
  );
  expect(closeButtons.length).toBeGreaterThan(0);
});

describe("add resume modal has the correct select inputs with refresh buttons", () => {
  const selectInputNames: string[] = ["job", "template"];
  selectInputNames.forEach((selectInputName: string) => {
    test(`add resume modal has a ${selectInputName} select input`, async () => {
      await renderThisRoute();
      const selectInput: HTMLElement = getByRole(
        await openAndGetAddResumeModal(),
        "combobox",
        {name: new RegExp(selectInputName, "i")}
      );
      expect(selectInput).toBeInTheDocument();
    });
    
    test(`add resume modal has a ${selectInputName} refresh button`, async () => {
      await renderThisRoute();
      const selectInput: HTMLElement = getByRole(
        await openAndGetAddResumeModal(),
        "combobox",
        {name: new RegExp(selectInputName, "i")}
      );
      const selectId: string = selectInput.getAttribute("id")!;

      const refreshButton: HTMLElement = document.querySelector(`[aria-controls="${selectId}"]`)!;
      expect(refreshButton).toBeInTheDocument();
    });
  });
});

test("generating a resume closes the modal and adds a new resume to the list of resumes", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([
    {
      url: "../api/jobs/",
      data: [validJob1, validJob2],
    }, {
      url: "../api/templates/",
      data: [validResumeTemplate1, validResumeTemplate2],
    }
  ]));
  await renderThisRoute();
  const addResumeModal: HTMLElement = await openAndGetAddResumeModal();
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;

  mockFunctions.fetchData.mockImplementationOnce(generateResponse(validResume1));
  const jobSelect: HTMLElement = getByRole(addResumeModal, "combobox", {name: new RegExp("job", "i")});
  userEvent.selectOptions(jobSelect, validResume1.job.id.toString());
  const templateSelect: HTMLElement = getByRole(addResumeModal, "combobox", {name: new RegExp("template", "i")});
  userEvent.selectOptions(templateSelect, validResume1.template.id.toString());
  
  const submitButton: HTMLElement = getSubmitButton(addResumeModal);
  await act(async () => {
    userEvent.click(submitButton);
  });

  // check that the modal was closed
  expect(addResumeModal).not.toBeInTheDocument();

  // check that the API was called again to add the resume
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/resumes/", expect.objectContaining({
    method: "POST",
    body: expect.stringContaining(JSON.stringify({
      job: validResume1.job.id,
      template: validResume1.template.id,
    })),
  }));

  // check that the resume template was added
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes.length).toBe(1);
  const addedResume: HTMLElement = resumes[0];
  expect(addedResume).toHaveTextContent(validResume1.name);
});

test("API is called to fetch data for select inputs", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute(
    [{
      url: "../api/jobs/",
      data: [validJob1, validJob2],
    }, {
      url: "../api/templates/",
      data: [validResumeTemplate1, validResumeTemplate2],
    }]
  ));
  await renderThisRoute();

  expect(mockFunctions.fetchData).toHaveBeenCalledWith(
    "../api/jobs/",
    expect.objectContaining({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
  expect(mockFunctions.fetchData).toHaveBeenCalledWith(
    "../api/templates/",
    expect.objectContaining({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
});

describe("select options are rendered for all select inputs", () => {
  const selectInputNames: string[] = ["job", "template"];
  for (const selectInputName of selectInputNames) {
    test(`select options are rendered for ${selectInputName} select`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute(
        [{
          url: "../api/jobs/",
          data: [validJob1, validJob2],
        }, {
          url: "../api/templates/",
          data: [validResumeTemplate1, validResumeTemplate2],
        }]
      ));
      await renderThisRoute();
      const addResumeModal: HTMLElement = await openAndGetAddResumeModal();

      const selectInput: HTMLElement = getByRole(addResumeModal, "combobox", {name: new RegExp(selectInputName, "i")});
      expect(selectInput).toBeInTheDocument();
      const selectOptions: HTMLElement[] = getAllByRole(selectInput, "option");
      expect(selectOptions.length).toBe(3);
    });
  }
});

xtest("clicking a refresh button makes an additional API call", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute(
    [{
      url: "../api/jobs/",
      data: [validJob1, validJob2],
    }, {
      url: "../api/templates/",
      data: [validResumeTemplate1, validResumeTemplate2],
    }]
  ));
  await renderThisRoute();
  const addResumeModal: HTMLElement = await openAndGetAddResumeModal();
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;

  const buttons: HTMLElement[] = getAllByRole(addResumeModal, "button");
  const refreshButtons: HTMLElement[] = buttons.filter((button: HTMLElement) => {
    return button.getAttribute("aria-controls") !== null;
  });
  await act(async () => {
    userEvent.click(refreshButtons[0]);
  });
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
});

test("clicking a refresh button updates select options if API call returns new data", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute(
    [{
      url: "../api/jobs/",
      data: [validJob1, validJob2],
    }, {
      url: "../api/templates/",
      data: [validResumeTemplate1, validResumeTemplate2],
    }]
  ));
  await renderThisRoute();
  const addResumeModal: HTMLElement = await openAndGetAddResumeModal();

  const allOptionsBefore: HTMLElement[] = getAllByRole(addResumeModal, "option");
  expect(allOptionsBefore.length).toBe(6);

  const buttons: HTMLElement[] = getAllByRole(addResumeModal, "button");
  const refreshButtons: HTMLElement[] = buttons.filter((button: HTMLElement) => {
    return button.getAttribute("aria-controls") !== null;
  });
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute(
    [{
      url: "../api/jobs/",
      data: [validJob2],
    }, {
      url: "../api/templates/",
      data: [validResumeTemplate2],
    }]
  ));
  await act(async () => {
    userEvent.click(refreshButtons[0]);
  });

  const allOptionsAfter: HTMLElement[] = getAllByRole(addResumeModal, "option");
  expect(allOptionsAfter.length).toBe(5);
});