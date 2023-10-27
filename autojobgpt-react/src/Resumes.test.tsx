import { screen, getAllByRole, getByRole, getByLabelText } from "@testing-library/react";

import { injectMocks, renderRoute, openAndGetModal, getSubmitButton, mockFunctions } from "./testUtilities";
import { generateResponse, validResumeTemplate1, validResumeTemplate2 } from "./mockAPI";
import { ResumeTemplateDownload } from "./Resumes";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

async function renderThisRoute(): Promise<void> {
  await renderRoute("/resumes");
}

function getAddResumeTemplateButton(): HTMLElement {
  return screen.getByRole("button", {name: new RegExp("add resume template", "i")});
}

test("add resume template button appears", async () => {
  await renderThisRoute();
  const addResumeTemplateButton: HTMLElement = getAddResumeTemplateButton();
  expect(addResumeTemplateButton).toBeInTheDocument();
});

test("add resume template modal isn't visible before clicking add resume template button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("add resume template", "i")})).not.toBeInTheDocument();
});

async function openAndGetAddResumeTemplateModal(timeout: number = 1000): Promise<HTMLElement> {
  return openAndGetModal(getAddResumeTemplateButton(), "add resume template", timeout);
}

test("clicking add resume template button shows add resume template modal within 1 second", async () => {
  await renderThisRoute();
  const addResumeTemplateModal: HTMLElement = await openAndGetAddResumeTemplateModal(1000);
  expect(addResumeTemplateModal).toBeInTheDocument();
});

test("add resume template modal has a submit button", async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetAddResumeTemplateModal());  
  expect(submitButton).toBeInTheDocument();
});

test("add resume template modal has a close button", async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetAddResumeTemplateModal(), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test("add resume template modal has a name input", async () => {
  await renderThisRoute();
  const nameInput: HTMLElement = getByRole(await openAndGetAddResumeTemplateModal(), "textbox", {name: new RegExp("name", "i")});
  expect(nameInput).toBeInTheDocument();
});

test("add resume template modal has a file input", async () => {
  await renderThisRoute();
  const fileInput: HTMLElement = getByLabelText(await openAndGetAddResumeTemplateModal(), new RegExp("upload", "i"));
  expect(fileInput).toBeInTheDocument();
});

test("add resume template modal has a description input", async () => {
  await renderThisRoute();
  const descriptionInput: HTMLElement = getByRole(await openAndGetAddResumeTemplateModal(), "textbox", {name: new RegExp("description", "i")});
  expect(descriptionInput).toBeInTheDocument();
});

test("resume templates are initially fetched from the server", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
});

function queryResumeTemplates(): HTMLElement[] {
  // resume templates are elements with a child img with alt text containing "resume template"
  return screen.queryAllByRole("img", {name: new RegExp("resume template", "i")}).map(
    (img: HTMLElement) => img.parentElement as HTMLElement
  );
}

test("resume templates are initially fetched from the server", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/templates/");
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(2);
});

test("resume templates are displayed with their names", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates[0]).toHaveTextContent(validResumeTemplate1.name);
  expect(resumeTemplates[1]).toHaveTextContent(validResumeTemplate2.name);
});

test("resume templates are displayed with their images", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates[0].querySelector("img")?.src).toBe(validResumeTemplate1.png);
  expect(resumeTemplates[1].querySelector("img")?.src).toBe(validResumeTemplate2.png);
});

test("resume templates are displayed with a remove button", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  for (const resumeTemplate of resumeTemplates) {
    const deleteButton: HTMLElement = getByRole(resumeTemplate, "button", {name: new RegExp("remove", "i")});
    expect(deleteButton).toBeInTheDocument();
  }
});

test("resume templates are displayed with a download button", async () => {
  const validResumeTemplates: ResumeTemplateDownload[] = [validResumeTemplate1,validResumeTemplate2];
  mockFunctions.fetchData.mockImplementation(generateResponse(validResumeTemplates));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  for (let i = 0; i < resumeTemplates.length; i++) {
    const resumeTemplate: HTMLElement = resumeTemplates[i];
    const downloadButton: HTMLElement = getByRole(resumeTemplate, "button", {name: new RegExp("download", "i")});
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("href", validResumeTemplates[i].upload);
  }
});