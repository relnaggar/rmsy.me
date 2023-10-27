import { screen, getAllByRole, getByRole, getByLabelText, queryByRole, queryAllByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, renderRoute, openAndGetModal, getSubmitButton, mockFunctions, closeModal } from "./testUtilities";
import { generateResponse, validResumeTemplate1, validResumeTemplate2 } from "./mockAPI";
import { ResumeTemplateDownload } from "./Resumes";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

async function renderThisRoute(): Promise<void> {
  await renderRoute("/resumes");
}

function getResumeTemplateSection(): HTMLElement {
  const resumeTemplateHeading: HTMLElement = screen.getByRole("heading", {name: new RegExp("templates", "i"), level: 2});
  const resumeTemplateSection: HTMLElement = resumeTemplateHeading.parentElement as HTMLElement;
  return resumeTemplateSection;
}

function getAddResumeTemplateButton(): HTMLElement {
  const resumeTemplateSection: HTMLElement = getResumeTemplateSection();
  return getByRole(resumeTemplateSection, "button", {name: new RegExp("add resume template", "i")});
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
  // resume templates are listitems in the resume template section that don't have the aria-busy attribute set to true
  const resumeTemplatesSection: HTMLElement = getResumeTemplateSection();  
  const listItems: HTMLElement[] = queryAllByRole(resumeTemplatesSection, "listitem");
  const resumeTemplates: HTMLElement[] = listItems.filter((listItem: HTMLElement) => 
    !listItem.hasAttribute("aria-busy") || listItem.getAttribute("aria-busy") === "false"
  );
  return resumeTemplates;
}

test("resume templates are initially fetched from the server", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/templates/");
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(2);
});

test("if there are no resume templates fetched then none are displayed", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/templates/");
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(0);
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

test("resume templates are displayed with a delete button", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  for (const resumeTemplate of resumeTemplates) {
    const deleteButton: HTMLElement = getByRole(resumeTemplate, "button", {name: new RegExp("delete", "i")});
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

function closeResumeTemplateModal(): void {
  closeModal("add resume template");
}

test("adding a job adds the same job to the backlog column", async () => {
  await renderThisRoute();

  // add a resume template
  mockFunctions.fetchData.mockImplementationOnce(generateResponse(validResumeTemplate1));
  const addResumeTemplateModal: HTMLElement = await openAndGetAddResumeTemplateModal();
  const nameInput: HTMLElement = getByRole(addResumeTemplateModal, "textbox", {name: new RegExp("name", "i")});
  userEvent.type(nameInput, validResumeTemplate1.name);
  const fileInput: HTMLElement = getByLabelText(addResumeTemplateModal, new RegExp("upload", "i"));
  userEvent.upload(fileInput, new File([""], "test.docx", {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}));
  const submitButton: HTMLElement = getSubmitButton(addResumeTemplateModal);
  await act(async () => {
    userEvent.click(submitButton);
  });
  closeResumeTemplateModal();

  // check that the API was called again to add the resume template
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/templates/", expect.objectContaining({
    method: "POST",
    body: expect.any(FormData)
  }));

  // check that the resume template was added
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(1);
  const addedResumeTemplate: HTMLElement = resumeTemplates[0];
  expect(addedResumeTemplate).toHaveTextContent(validResumeTemplate1.name);
});

function getResumeTemplateByName(name: string): HTMLElement {
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  const matchingResumeTemplate: HTMLElement = resumeTemplates.find((resumeTemplate: HTMLElement) => {
    const resumeHeading: HTMLElement | null = queryByRole(resumeTemplate, "heading", {name: name});
    return resumeHeading && resumeHeading.textContent === name;
  }
  )!;
  return matchingResumeTemplate;
}

test("deleting a resume template removes it from the backlog column", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validResumeTemplate1,validResumeTemplate2]));
  await renderThisRoute();

  // delete validResumeTemplate2
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
  const matchingResumeTemplate: HTMLElement = getResumeTemplateByName(validResumeTemplate2.name);
  const deleteButton: HTMLElement = getByRole(matchingResumeTemplate, "button", {name: new RegExp("delete", "i")});
  await act(async () => {
    userEvent.click(deleteButton);
  });

  // check that the API was called again to delete the resume template
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith(
    `../api/templates/${validResumeTemplate2.name}/`,
    expect.objectContaining({method: "DELETE"}
  ));

  // check that the only resume left is the one that wasn't deleted
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(1);
  expect(resumeTemplates[0]).toHaveTextContent(validResumeTemplate1.name);
});