import { screen, getByRole, getAllByRole, queryByRole, queryAllByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, mockFunctions, renderRoute, openAndGetModal, getSubmitButton, closeModal } from "./testUtilities";
import { generateResponse, validJob1, validJob2 } from "./mockAPI";
import { STATUSES } from "./Jobs";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

async function renderThisRoute(): Promise<void> {
  await renderRoute("/jobs");
}

describe("every status (column title) appears in the kanban board", () => {
  for (const status of STATUSES) {
    test(`column ${status} appears in the kanban board`, async () => {
      await renderThisRoute();
      expect(screen.getByRole("heading", {name: new RegExp(status, "i")})).toBeInTheDocument();
    });
  }  
});

function getKanbanColumn(status: string): HTMLElement {
  const column: HTMLElement | null = screen.getByText( new RegExp(status, "i")).closest<HTMLElement>(".kanban-column");
  if (!column) {
    throw new Error(`Column ${status} not found`);
  }
  return column;
}

describe("every status (column title) has a kanban column", () => {
  for (const status of STATUSES) {
    test(`column ${status} has a kanban column`, async () => {
      await renderThisRoute();
      const column: HTMLElement = getKanbanColumn(status);
      expect(column).toBeInTheDocument();
    });
  }  
});

describe("columns except the backlog column do not have an add job button", () => {
  for (const status of STATUSES) {
    if (status.toLowerCase() !== "backlog") {
      test(`column ${status} does not have an add job button`, async () => {
        await renderThisRoute();
        const column: HTMLElement = getKanbanColumn(status);
        expect(queryByRole(column, "button", {name: new RegExp("add job", "i")})).not.toBeInTheDocument();
      });
    }
  }
});

function getBacklogColumn(): HTMLElement {
  return getKanbanColumn("backlog");
}

function getAddJobButton(): HTMLElement {
  const backlogColumn: HTMLElement = getBacklogColumn();
  return getByRole(backlogColumn, "button", {name: new RegExp("add job", "i")});
}
  
test("backlog column has an add job button", async () => {
  await renderThisRoute();
  const addJobButton: HTMLElement = getAddJobButton();
  expect(addJobButton).toBeInTheDocument();
});

async function openAndGetAddJobModal(timeout: number = 1000): Promise<HTMLElement> {
  return openAndGetModal(getAddJobButton(), "add job", timeout);
}

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

function queryJobs(): HTMLElement[] {
  const backlogColumn: HTMLElement = getBacklogColumn();
  const jobs = queryAllByRole(backlogColumn, "listitem");
  return jobs;
}

test("jobs are initially fetched from the server if there are any", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/jobs/", expect.objectContaining({
    method: "GET"
  }));
  const jobs: HTMLElement[] = queryJobs();
  expect(jobs.length).toBe(2);
});

test("if there are no jobs fetched then none are displayed", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/jobs/", expect.objectContaining({
    method: "GET"
  }));
  const jobs: HTMLElement[] = queryJobs();
  expect(jobs.length).toBe(0);
});

test("jobs are displayed with their titles", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();
  const jobs: HTMLElement[] = queryJobs();
  expect(jobs[0]).toHaveTextContent(validJob1.title);
  expect(jobs[1]).toHaveTextContent(validJob2.title);
});

test("jobs are displayed with their companies", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();
  const jobs: HTMLElement[] = queryJobs();
  expect(jobs[0]).toHaveTextContent(validJob1.company);
  expect(jobs[1]).toHaveTextContent(validJob2.company);
});

function closeAddJobModal(): void {
  closeModal("add job");
}

test("adding a job adds the same job to the backlog column", async () => {
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
  closeAddJobModal();

  // check that the API was called again to add the job
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/jobs/", expect.objectContaining({
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

test("deleting a job removes the job from the backlog column", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();

  // remove job 2
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
  let backlogJobs: HTMLElement[] = getAllByRole(getBacklogColumn(), "listitem");
  for (const job of backlogJobs) {
    if (job.textContent?.includes(validJob2.title)) {
      const deleteButton: HTMLElement = getByRole(job, "button", {name: new RegExp("remove", "i")});
      await act(async () => {
        userEvent.click(deleteButton);
      });
      break;
    }
  }

  // check that the API was called again to delete the job
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);

  // count the number of jobs in the backlog column
  backlogJobs = getAllByRole(getBacklogColumn(), "listitem");

  // expect the number of jobs in the backlog column to be 1
  expect(backlogJobs.length).toBe(1);

  // expect the job in the backlog column to be the job that wasn't deleted
  expect(backlogJobs[0]).toHaveTextContent(validJob1.title);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.company);
});