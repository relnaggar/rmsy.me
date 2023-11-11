import { screen, getByRole, getAllByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, mockFunctions } from "../common/testUtils";
import { renderThisRoute, openAndGetAddJobModal, getBacklogColumn } from "./jobTestUtils";
import { getSubmitButton } from "../common/testUtils";
import { generateResponse, validJob1 } from "../common/mockAPI";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("add job modal isn't visible before clicking add button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("add job", "i")})).not.toBeInTheDocument();
});

test("clicking add button shows add job modal within 1 second", async () => {
  await renderThisRoute();
  const addJobModal: HTMLElement = await openAndGetAddJobModal(1000);
  expect(addJobModal).toBeInTheDocument();
});

test("add job modal has a submit button", async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetAddJobModal());  
  expect(submitButton).toBeInTheDocument();
});

test("add job modal has a close button", async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetAddJobModal(), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test("add job modal has a url input", async () => {
  await renderThisRoute();
  const urlInput: HTMLElement = getByRole(await openAndGetAddJobModal(), "textbox", {name: new RegExp("url", "i")});
  expect(urlInput).toBeInTheDocument();
});

test("adding a job adds the same job to the backlog column, closes the modal, and calls the API", async () => {
  await renderThisRoute();

  // add a job
  mockFunctions.fetchData.mockImplementationOnce(generateResponse(validJob1));
  const addJobModal: HTMLElement = await openAndGetAddJobModal();
  const urlInput: HTMLElement = getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")});
  userEvent.type(urlInput, validJob1.url);
  const submitButton: HTMLElement = getSubmitButton(addJobModal);
  await act(async () => {
    userEvent.click(submitButton);
  });

  // check that the modal was closed
  expect(addJobModal).not.toBeInTheDocument();

  // check that the API was called again to add the job
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/jobs/", expect.objectContaining({
    method: "POST",
    body: expect.stringContaining(validJob1.url)
  }));

  // check that the job was added to the backlog column
  const backlogJobs: HTMLElement[] = getAllByRole(getBacklogColumn(), "listitem");
  expect(backlogJobs.length).toBe(1);
  const addedJob: HTMLElement = backlogJobs[0];
  expect(addedJob).toHaveTextContent(validJob1.title);
  expect(addedJob).toHaveTextContent(validJob1.company);
});