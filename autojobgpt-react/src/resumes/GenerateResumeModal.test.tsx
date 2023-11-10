import { screen, getAllByRole, getByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderThisRoute, queryResumes, openAndGetGenerateResumeModal } from "./resumeTestUtils";
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

test("generate resume modal isn't visible before clicking generate resume button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("generate resume", "i")})).not.toBeInTheDocument();
});

test("clicking generate resume button shows generate resume modal within 1 second", async () => {
  await renderThisRoute();
  const generateResumeModal: HTMLElement = await openAndGetGenerateResumeModal(1000);
  expect(generateResumeModal).toBeInTheDocument();
});

test("generate resume modal has a submit button", async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetGenerateResumeModal());  
  expect(submitButton).toBeInTheDocument();
});

test("generate resume modal has a close button", async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(
    await openAndGetGenerateResumeModal(),
    "button",
    {name: new RegExp("close", "i")}
  );
  expect(closeButtons.length).toBeGreaterThan(0);
});

describe("generate resume modal has the correct select inputs with refresh buttons", () => {
  const selectInputNames: string[] = ["job", "template"];
  selectInputNames.forEach((selectInputName: string) => {
    test(`generate resume modal has a ${selectInputName} select input`, async () => {
      await renderThisRoute();
      const selectInput: HTMLElement = getByRole(
        await openAndGetGenerateResumeModal(),
        "combobox",
        {name: new RegExp(selectInputName, "i")}
      );
      expect(selectInput).toBeInTheDocument();
    });
    
    test(`generate resume modal has a ${selectInputName} refresh button`, async () => {
      await renderThisRoute();
      const selectInput: HTMLElement = getByRole(
        await openAndGetGenerateResumeModal(),
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
  const generateResumeModal: HTMLElement = await openAndGetGenerateResumeModal();
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;

  // generate resume
  mockFunctions.fetchData.mockImplementationOnce(generateResponse(validResume1));
  const jobSelect: HTMLElement = getByRole(generateResumeModal, "combobox", {name: new RegExp("job", "i")});
  userEvent.selectOptions(jobSelect, validResume1.job.toString());
  const templateSelect: HTMLElement = getByRole(generateResumeModal, "combobox", {name: new RegExp("template", "i")});
  userEvent.selectOptions(templateSelect, validResume1.template.toString());
  
  const submitButton: HTMLElement = getSubmitButton(generateResumeModal);
  await act(async () => {
    userEvent.click(submitButton);
  });

  // check that the modal was closed
  expect(generateResumeModal).not.toBeInTheDocument();

  // check that the API was called again to add the resume
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/resumes/", expect.objectContaining({
    method: "POST",
    body: expect.stringContaining(JSON.stringify({
      job: validResume1.job,
      template: validResume1.template,
    })),
  }));

  // check that the resume template was added
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes.length).toBe(1);
  const addedResume: HTMLElement = resumes[0];
  expect(addedResume).toHaveTextContent(validResume1.name);
});