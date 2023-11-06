import { screen, getByRole, getAllByRole, queryAllByRole, act, queryByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, renderRoute, openAndGetModal, getSubmitButton, mockFunctions } from "../common/testUtilities";
import {
  generateConditionalResponseByRoute,
  validResume1,
  validResume2,
  generateResponse,
  validJob1,
  validJob2,
  validResumeTemplate1,
  validResumeTemplate2
} from "../common/mockAPI";
import { Resume } from "./types";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

async function renderThisRoute(): Promise<void> {
  await renderRoute("/resumes");
}

function getResumeSection(): HTMLElement {
  const resumeHeading: HTMLElement = screen.getByRole("heading", {name: new RegExp("resumes", "i"), level: 2});
  const resumeSection: HTMLElement = resumeHeading.parentElement as HTMLElement;
  return resumeSection;
}

function getGenerateResumeButton(): HTMLElement {
  const resumeTemplateSection: HTMLElement = getResumeSection();
  return getByRole(resumeTemplateSection, "button", {name: new RegExp("generate new resume", "i")});
}

test("generate resume button appears", async () => {
  await renderThisRoute();
  const generateResumeButton: HTMLElement = getGenerateResumeButton();
  expect(generateResumeButton).toBeInTheDocument();
});

test("generate resume modal isn't visible before clicking generate resume button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("generate resume", "i")})).not.toBeInTheDocument();
});

function openAndGetGenerateResumeModal(timeout: number = 1000): Promise<HTMLElement> {
  return openAndGetModal(getGenerateResumeButton(), "generate resume", timeout);
}

test("clicking generate resume button shows generate resume modal within 1 second", async () => {
  await renderThisRoute();
  const generateResumeModal: HTMLElement = await openAndGetGenerateResumeModal(1000);
  expect(generateResumeModal).toBeInTheDocument();
});

test("generate resume template modal has a submit button", async () => {
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

function queryResumes(): HTMLElement[] {
  // resumes are listitems in the resume section that don't have the aria-busy attribute set to true
  const resumeSection: HTMLElement = getResumeSection();  
  const listItems: HTMLElement[] = queryAllByRole(resumeSection, "listitem");
  const resumes: HTMLElement[] = listItems.filter((listItem: HTMLElement) => 
    !listItem.hasAttribute("aria-busy") || listItem.getAttribute("aria-busy") === "false"
  );
  return resumes;
}

test("resumes are initially fetched from the server", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/resumes/",
    data: [validResume1,validResume2],
  }]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledWith(
    "../api/resumes/",
    expect.objectContaining({
      method: "GET",
    })
  );
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes.length).toBe(2);
});

test("if there are no resumes fetched then none are displayed", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledWith(
    "../api/resumes/",
    expect.objectContaining({
      method: "GET",
    }),
  );
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes.length).toBe(0);
});

test("resumes are displayed with their names", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/resumes/",
    data: [validResume1,validResume2],
  }]));
  await renderThisRoute();
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes[0]).toHaveTextContent(validResume1.name);
  expect(resumes[1]).toHaveTextContent(validResume2.name);
});

test("resumes are displayed with their images", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/resumes/",
    data: [validResume1,validResume2],
  }]));
  await renderThisRoute();
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes[0].querySelector("img")?.src).toBe(validResume1.png);
  expect(resumes[1].querySelector("img")?.src).toBe(validResume2.png);
});

test("resumes are displayed with a delete button", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/resumes/",
    data: [validResume1,validResume2],
  }]));
  await renderThisRoute();
  const resumes: HTMLElement[] = queryResumes();
  for (const resume of resumes) {
    const deleteButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("delete", "i")});
    expect(deleteButton).toBeInTheDocument();
  }
});

test("resumes are displayed with a download button", async () => {
  const validResumes: Resume[] = [validResume1,validResume2];
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/resumes/",
    data: validResumes,
  }]));
  await renderThisRoute();
  const resumes: HTMLElement[] = queryResumes();
  for (let i = 0; i < resumes.length; i++) {
    const resume: HTMLElement = resumes[i];
    const downloadButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("download", "i")});
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("href", validResumes[i].docx);
  }
});

test("generating a resume adds a new resume to the list of resumes", async () => {
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

function getResumeByName(name: string): HTMLElement {
  const resumes: HTMLElement[] = queryResumes();
  const matchingResume: HTMLElement = resumes.find((resume: HTMLElement) => {
    const resumeHeading: HTMLElement | null = queryByRole(resume, "heading", {name: name});
    return resumeHeading && resumeHeading.textContent === name;
  })!;
  return matchingResume;
}

test("deleting a resume removes it from the list of resumes", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/resumes/",
    data: [validResume1,validResume2],
  }]));
  await renderThisRoute();
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;

  // delete validResumeTemplate2
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
  const matchingResume: HTMLElement = getResumeByName(validResume2.name);
  const deleteButton: HTMLElement = getByRole(matchingResume, "button", {name: new RegExp("delete", "i")});
  await act(async () => {
    userEvent.click(deleteButton);
  });

  // check that the API was called again to delete the resume template
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
    `../api/resumes/${validResume2.id}/`,
    expect.objectContaining({method: "DELETE"}
  ));

  // check that the only resume left is the one that wasn't deleted
  const resumes: HTMLElement[] = queryResumes();
  expect(resumes.length).toBe(1);
  expect(resumes[0]).toHaveTextContent(validResume1.name);
});