import { screen, getByRole, getAllByRole, queryByRole, queryAllByRole, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, mockFunctions, renderRoute, openAndGetModal, getSubmitButton, closeModal } from "./testUtilities";
import { generateResponse, validJob1, validJob2 } from "./mockAPI";
import { STATUSES } from "./JobsPage";

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

function queryBacklogJobs(): HTMLElement[] {
  const backlogColumn: HTMLElement = getBacklogColumn();
  const jobs = queryAllByRole(backlogColumn, "listitem");
  return jobs;
}

test("backlog jobs are initially fetched from the server if there are any", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/jobs/", expect.objectContaining({
    method: "GET"
  }));
  const jobs: HTMLElement[] = queryBacklogJobs();
  expect(jobs.length).toBe(2);
});

test("if there are no backlog jobs fetched then none are displayed", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderThisRoute();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/jobs/", expect.objectContaining({
    method: "GET"
  }));
  const jobs: HTMLElement[] = queryBacklogJobs();
  expect(jobs.length).toBe(0);
});

test("backlog jobs are displayed with their titles", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();
  const jobs: HTMLElement[] = queryBacklogJobs();
  expect(jobs[0]).toHaveTextContent(validJob1.title);
  expect(jobs[1]).toHaveTextContent(validJob2.title);
});

test("backlog jobs are displayed with their companies", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();
  const jobs: HTMLElement[] = queryBacklogJobs();
  expect(jobs[0]).toHaveTextContent(validJob1.company);
  expect(jobs[1]).toHaveTextContent(validJob2.company);
});

function closeAddJobModal(): void {
  closeModal("add job");
}

test("adding a job adds the same job to the backlog column and calls the API", async () => {
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

function getBacklogJobByTitle(title: string): HTMLElement {
  const backlogJobs: HTMLElement[] = queryBacklogJobs();
  const matchingJob: HTMLElement = backlogJobs.find((job: HTMLElement) => {
    const jobHeading: HTMLElement | null = queryByRole(job, "heading", {name: title});
    return jobHeading && jobHeading.textContent === title;
  })!;
  return matchingJob;
}

test("deleting a job removes it from the backlog column and calls the API", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderThisRoute();

  // delete validJob2
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
  const matchingJob: HTMLElement = getBacklogJobByTitle(validJob2.title);
  const deleteButton: HTMLElement = getByRole(matchingJob, "button", {name: new RegExp("delete", "i")});
  await act(async () => {
    userEvent.click(deleteButton);
  });

  // check that the API was called again to delete the job
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith(`../api/jobs/${validJob2.id}/`, expect.objectContaining({
    method: "DELETE"
  }));

  // check that the only job left in the backlog column is the job that wasn't deleted
  const backlogJobs: HTMLElement[] = queryBacklogJobs();
  expect(backlogJobs.length).toBe(1);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.title);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.company);
});

async function dragJob(job: HTMLElement, targetStatus: string): Promise<void> {
  await act(async () => {
    fireEvent.dragStart(job);
  });
  await act(async () => {
    fireEvent.dragOver(getKanbanColumn(targetStatus));
  });
  await act(async () => {
    fireEvent.drop(getKanbanColumn(targetStatus));
  });
}

describe("dragging a job according to allowed transitions results in the job being moved", () => {
  test("dragging a job from the backlog column to the applying column results in the job being moved", async () => {
    mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
    await renderThisRoute();

    // drag validJob2 from backlog to applying
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...validJob2, status: "applying"}));
    const matchingJob: HTMLElement = getBacklogJobByTitle(validJob2.title);
    await dragJob(matchingJob, "applying");

    // check that the job was moved to the applying column
    const applyingJobs: HTMLElement[] = queryAllByRole(getKanbanColumn("applying"), "listitem");
    expect(applyingJobs.length).toBe(1);
    const movedJob: HTMLElement = applyingJobs[0];
    expect(movedJob).toHaveTextContent(validJob2.title);
    expect(movedJob).toHaveTextContent(validJob2.company);

    // check that the job was removed from the backlog column
    const backlogJobs: HTMLElement[] = queryBacklogJobs();
    expect(backlogJobs.length).toBe(1);
    const remainingJob: HTMLElement = backlogJobs[0];
    expect(remainingJob).toHaveTextContent(validJob1.title);
    expect(remainingJob).toHaveTextContent(validJob1.company);
  });
});

describe("dragging a job when its new status is not allowed results in the job not being moved", () => {
  test("dragging a job from the backlog column to the pending column results in the job not being moved", async () => {
    mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
    await renderThisRoute();

    // drag validJob2 from backlog to pending
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...validJob2, status: "pending"}));
    const matchingJob: HTMLElement = getBacklogJobByTitle(validJob2.title);    
    await dragJob(matchingJob, "pending");

    // check that the job was not moved to the pending column
    const pendingJobs: HTMLElement[] = queryAllByRole(getKanbanColumn("pending"), "listitem");
    expect(pendingJobs.length).toBe(0);

    // check that both jobs are still in the backlog column
    const backlogJobs: HTMLElement[] = queryBacklogJobs();
    expect(backlogJobs.length).toBe(2);
    expect(backlogJobs[0]).toHaveTextContent(validJob1.title);
    expect(backlogJobs[0]).toHaveTextContent(validJob1.company);
    expect(backlogJobs[1]).toHaveTextContent(validJob2.title);
    expect(backlogJobs[1]).toHaveTextContent(validJob2.company);
    
  });
});

describe("dragging a job according to allowed transitions calls the API to update the job", () => {
  test("dragging a job from the backlog column to the applying column calls the API to update the job", async () => {  
    mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
    await renderThisRoute();

    // drag validJob2 from backlog to applying
    mockFunctions.fetchData.mockImplementationOnce(generateResponse({...validJob2, status: "applying"}));
    const matchingJob: HTMLElement = getBacklogJobByTitle(validJob2.title);    
    await dragJob(matchingJob, "applying");

    // check that the API was called again to update the job
    expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);
    expect(mockFunctions.fetchData).toHaveBeenCalledWith(`../api/jobs/${validJob2.id}/`, expect.objectContaining({
      method: "PATCH",
      body: expect.stringContaining("applying")
    }));
  });
});