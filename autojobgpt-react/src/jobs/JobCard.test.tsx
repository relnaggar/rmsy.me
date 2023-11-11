import { screen, act, getByRole, getAllByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, mockFunctions, openAndGetModal } from "../common/testUtils";
import { renderThisRoute, queryBacklogJobs, getBacklogJobByTitle } from "./jobTestUtils";
import { generateResponse, validJob1, validJob2, generateConditionalResponseByRoute } from "../common/mockAPI";
import { Job } from "./types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("job cards are displayed with their titles", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/jobs/",
    data: [validJob1,validJob2],
  }]));
  await renderThisRoute();
  const jobs: HTMLElement[] = queryBacklogJobs();
  expect(jobs[0]).toHaveTextContent(validJob1.title);
  expect(jobs[1]).toHaveTextContent(validJob2.title);
});

test("job cards are displayed with their companies", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/jobs/",
    data: [validJob1,validJob2],
  }]));
  await renderThisRoute();
  const jobs: HTMLElement[] = queryBacklogJobs();
  expect(jobs[0]).toHaveTextContent(validJob1.company);
  expect(jobs[1]).toHaveTextContent(validJob2.company);
});

describe("job cards are displayed with edit and delete buttons", () => {
  for (const buttonText of ["edit", "delete"]) {
    test(`job cards are displayed with ${buttonText} button`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: [validJob1,validJob2],
      }]));
      await renderThisRoute();
      const jobs: HTMLElement[] = queryBacklogJobs();
      for (const job of jobs) {
        const button: HTMLElement = getByRole(job, "button", {name: new RegExp(buttonText, "i")});
        expect(button).toBeInTheDocument();
      }
    });
  }
});

test("confirm delete modal isn't visible before clicking delete button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("confirm delete", "i")})).not.toBeInTheDocument();
});

describe("clicking every delete job button shows delete confirmation modal within 1 second", () => {
  const validJobs: Job[] = [validJob1,validJob2];
  for (const validJob of validJobs) {
    test(`clicking delete button for ${validJob.title} shows delete confirmation modal within 1 second`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: validJobs,
      }]));
      await renderThisRoute();
      const job: HTMLElement = getBacklogJobByTitle(validJob.title);
      const deleteButton: HTMLElement = getByRole(job, "button", {name: new RegExp("delete", "i")});
      const deleteConfirmationModal: HTMLElement = await openAndGetModal(deleteButton, "confirm delete", 1000);
      expect(deleteConfirmationModal).toBeInTheDocument();
    });
  }
});

describe("every delete job confirmation modal has a delete button", () => {
  const validJobs: Job[] = [validJob1,validJob2];
  for (const validJob of validJobs) {
    test(`delete confirmation modal for ${validJob.title} has a delete button`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: validJobs,
      }]));
      await renderThisRoute();
      const job: HTMLElement = getBacklogJobByTitle(validJob.title);
      const deleteButton: HTMLElement = getByRole(job, "button", {name: new RegExp("delete", "i")});
      const deleteConfirmationModal: HTMLElement = await openAndGetModal(deleteButton, "confirm delete", 1000);
      const deleteConfirmationButton: HTMLElement = getByRole(deleteConfirmationModal, "button", {name: new RegExp("delete", "i")});
      expect(deleteConfirmationButton).toBeInTheDocument();
    });
  }
});

describe("every delete job confirmation modal has a close button", () => {
  const validJobs: Job[] = [validJob1,validJob2];
  for (const validJob of validJobs) {
    test(`delete confirmation modal for ${validJob.title} has a delete button`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: validJobs,
      }]));
      await renderThisRoute();
      const job: HTMLElement = getBacklogJobByTitle(validJob.title);
      const deleteButton: HTMLElement = getByRole(job, "button", {name: new RegExp("delete", "i")});
      const deleteConfirmationModal: HTMLElement = await openAndGetModal(deleteButton, "confirm delete", 1000);
      const closeButtons: HTMLElement[] = getAllByRole(deleteConfirmationModal, "button", {name: new RegExp("close", "i")});
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
});

describe("every delete job confirmation modal asks are you sure", () => {
  const validJobs: Job[] = [validJob1,validJob2];
  for (const validJob of validJobs) {
    test(`delete confirmation modal for ${validJob.title} asks are you sure`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: validJobs,
      }]));
      await renderThisRoute();
      const job: HTMLElement = getBacklogJobByTitle(validJob.title);
      const deleteButton: HTMLElement = getByRole(job, "button", {name: new RegExp("delete", "i")});
      const deleteConfirmationModal: HTMLElement = await openAndGetModal(deleteButton, "confirm delete", 1000);
      expect(deleteConfirmationModal).toHaveTextContent(new RegExp("are you sure", "i"));
    });
  }
});

test("deleting a job closes the confirmation modal, removes the job from the backlog column and calls the API", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/jobs/",
    data: [validJob1,validJob2],
  }]));
  await renderThisRoute();

  // delete validJob2
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
  const matchingJob: HTMLElement = getBacklogJobByTitle(validJob2.title);
  const deleteButton: HTMLElement = getByRole(matchingJob, "button", {name: new RegExp("delete", "i")});
  const deleteConfirmationModal: HTMLElement = await openAndGetModal(deleteButton, "confirm delete", 1000);
  const deleteConfirmationButton: HTMLElement = getByRole(deleteConfirmationModal, "button", {name: new RegExp("delete", "i")});
  await act(async () => {
    userEvent.click(deleteConfirmationButton);
  });

  // check that the confirmation modal is closed
  expect(deleteConfirmationModal).not.toBeInTheDocument();

  // check that the API was called again to delete the job
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`../api/jobs/${validJob2.id}/`, expect.objectContaining({
    method: "DELETE"
  }));

  // check that the only job left in the backlog column is the job that wasn't deleted
  const backlogJobs: HTMLElement[] = queryBacklogJobs();
  expect(backlogJobs.length).toBe(1);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.title);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.company);
});