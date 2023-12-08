import { screen, getAllByRole, getByRole, act, getByLabelText, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, getSubmitButton, mockFunctions } from "../common/testUtils";
import { validResumeTemplate1, generateResponse } from "../common/mockAPI";
import { renderThisRoute,  queryResumeTemplates, openAndGetAddResumeTemplateModal } from "./resumeTemplateTestUtils";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("add resume template modal isn't visible before clicking add resume template button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("add resume template", "i")})).not.toBeInTheDocument();
});

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

test("adding a resume template closes the modal and adds the resume template to the list of resume templates", async () => {
  await renderThisRoute();
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;

  // add a resume template
  const addResumeTemplateModal: HTMLElement = await openAndGetAddResumeTemplateModal();
  const nameInput: HTMLInputElement = getByRole(addResumeTemplateModal, "textbox", {name: new RegExp("name", "i")});
  await act(async () => {
    userEvent.type(nameInput, validResumeTemplate1.name);
  });
  const fileInput: HTMLInputElement = getByLabelText(addResumeTemplateModal, new RegExp("upload", "i"));
  await act(async () => {
    userEvent.upload(fileInput, new File([""], "test.docx", {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}));
  });
  fileInput.required = false; // workaround for limitation of userEvent.upload

  const submitButton: HTMLElement = getSubmitButton(addResumeTemplateModal);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse(validResumeTemplate1));
  await act(async () => {
    userEvent.click(submitButton);
  });

  // check that the modal was closed within 1 second
  await waitFor(() => {
    expect(addResumeTemplateModal).not.toBeInTheDocument();
  }, {timeout: 1000});  

  // check that the API was called again to add the resume template
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/templates/", expect.objectContaining({
    method: "POST",
    body: expect.any(FormData)
  }));

  // check that the resume template was added
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  expect(resumeTemplates.length).toBe(1);
  const addedResumeTemplate: HTMLElement = resumeTemplates[0];
  expect(addedResumeTemplate).toHaveTextContent(validResumeTemplate1.name);
});