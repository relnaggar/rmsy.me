import { screen, getByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  renderThisRoute,
  getUploadResumeTemplateButton,
  queryResumeTemplates,
  getResumeTemplateByName
} from "./resumeTemplateTestUtils";
import { injectMocks, mockFunctions, openAndGetModal } from "../common/testUtils";
import {
  generateResponse,
  generateConditionalResponseByRoute,
  validResumeTemplate1,
  validResumeTemplate2
} from "../common/mockAPI";
import { ResumeTemplate } from "./types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("add resume template button appears", async () => {
  await renderThisRoute();
  const addResumeTemplateButton: HTMLElement = getUploadResumeTemplateButton();
  expect(addResumeTemplateButton).toBeInTheDocument();
});

test("add resume template modal isn't visible before clicking add resume template button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("add resume template", "i")})).not.toBeInTheDocument();
});

test("confirm delete modal isn't visible before clicking delete button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("confirm delete", "i")})).not.toBeInTheDocument();
});

test("resume templates are initially fetched from the server", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/templates/",
    data: [validResumeTemplate1,validResumeTemplate2],
  }]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/templates/",
    expect.objectContaining({
      method: "GET",
    })
  );
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(2);
});

test("if there are no resume templates fetched then none are displayed", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/templates/",
    expect.objectContaining({
      method: "GET",
    })
  );
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(0);
});

test("resume templates are displayed with their names", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/templates/",
    data: [validResumeTemplate1,validResumeTemplate2],
  }]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates[0]).toHaveTextContent(validResumeTemplate1.name);
  expect(resumeTemplates[1]).toHaveTextContent(validResumeTemplate2.name);
});

test("resume templates are displayed with their images", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/templates/",
    data: [validResumeTemplate1,validResumeTemplate2],
  }]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates[0].querySelector("img")?.src).toBe(validResumeTemplate1.png);
  expect(resumeTemplates[1].querySelector("img")?.src).toBe(validResumeTemplate2.png);
});

test("resume templates are displayed with an edit button", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/templates/",
    data: [validResumeTemplate1,validResumeTemplate2],
  }]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  for (const resumeTemplate of resumeTemplates) {
    const editButton: HTMLElement = getByRole(resumeTemplate, "button", {name: new RegExp("edit", "i")});
    expect(editButton).toBeInTheDocument();
  }
});

test("resume templates are displayed with a delete button", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/templates/",
    data: [validResumeTemplate1,validResumeTemplate2],
  }]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  for (const resumeTemplate of resumeTemplates) {
    const deleteButton: HTMLElement = getByRole(resumeTemplate, "button", {name: new RegExp("delete", "i")});
    expect(deleteButton).toBeInTheDocument();
  }
});

test("resume templates are displayed with a download button", async () => {
  const validResumeTemplates: ResumeTemplate[] = [validResumeTemplate1,validResumeTemplate2];
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/templates/",
    data: validResumeTemplates,
  }]));
  await renderThisRoute();
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  for (let i = 0; i < resumeTemplates.length; i++) {
    const resumeTemplate: HTMLElement = resumeTemplates[i];
    const downloadButton: HTMLElement = getByRole(resumeTemplate, "button", {name: new RegExp("download", "i")});
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("href", validResumeTemplates[i].docx);
  }
});

test("deleting a resume template removes it from the list of resume templates", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/templates/",
    data: [validResumeTemplate1,validResumeTemplate2],
  }]));
  await renderThisRoute();
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;

  // delete validResumeTemplate2
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
  const matchingResumeTemplate: HTMLElement = getResumeTemplateByName(validResumeTemplate2.name);
  const deleteButton: HTMLElement = getByRole(matchingResumeTemplate, "button", {name: new RegExp("delete", "i")});
  const deleteConfirmationModal: HTMLElement = await openAndGetModal(deleteButton, "confirm delete", 1000);
  const deleteConfirmationButton: HTMLElement = getByRole(deleteConfirmationModal, "button", {name: new RegExp("delete", "i")});
  await act(async () => {
    userEvent.click(deleteConfirmationButton);
  });

  // check that the modal was closed
  expect(deleteConfirmationModal).not.toBeInTheDocument();


  // check that the API was called again to delete the resume template
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
    `../api/templates/${validResumeTemplate2.id}/`,
    expect.objectContaining({method: "DELETE"}
  ));

  // check that the only resume left is the one that wasn't deleted
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(1);
  expect(resumeTemplates[0]).toHaveTextContent(validResumeTemplate1.name);
});