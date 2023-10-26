import { screen, getByRole, getAllByRole, queryByRole, queryAllByRole, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { injectMocks, mockFunctions, renderRoute } from './testUtilities';
import { generateResponse, validJob1, validJob2 } from './mockAPI';
import { STATUSES } from './Jobs';

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test('every status (column title) appears in the kanban board', async () => {
  await renderRoute('/jobs');
  for (const status of STATUSES) {
    expect(screen.getByRole('heading', {name: new RegExp(status, "i")})).toBeInTheDocument();
  }  
});

describe('columns except the backlog column do not have an add button', () => {
  for (const status of STATUSES) {
    if (status.toLowerCase() !== "backlog") {
      test(`column ${status} does not have an add button`, async () => {
        await renderRoute('/jobs');
        const column: HTMLElement | null = screen.getByText(new RegExp(status, "i")).closest<HTMLElement>(".kanban-column");
        if (column) {
          expect(queryByRole(column, "button", {name: new RegExp("add", "i")})).not.toBeInTheDocument();
        }
      });
    }
  }
});

function getBacklogColumn(): HTMLElement | null {
  return screen.getByText(/backlog/i).closest<HTMLElement>(".kanban-column");
}

test('backlog column has an add button', async () => {
  await renderRoute('/jobs');
  const backlogColumn: HTMLElement | null = getBacklogColumn();
  if (backlogColumn) {
    expect(getByRole(backlogColumn, "button", {name: new RegExp("add", "i")})).toBeInTheDocument();
  }
});

async function openAddJobModal(): Promise<HTMLElement | null> {
  const backlogColumn: HTMLElement | null = getBacklogColumn();
  if (backlogColumn) {
    const addJobButton: HTMLElement = getByRole(backlogColumn, "button", {name: new RegExp("add", "i")});
    userEvent.click(addJobButton);
  }
  // wait up to 1 second for the modal to appear
  const addJobModal: HTMLElement | null = await screen.findByRole(
    "dialog",
    {name: new RegExp("add job", "i")},
    {timeout: 1000}
  );

  return addJobModal;
}

test("add job modal isn't visible before clicking add button", async () => {
  await renderRoute('/jobs');
  expect(screen.queryByRole("dialog", {name: new RegExp("add job", "i")})).not.toBeInTheDocument();
});

test('clicking add button shows add job modal within 1 second', async () => {
  await renderRoute('/jobs');
  const addJobModal: HTMLElement | null = await openAddJobModal();
  expect(addJobModal).toBeInTheDocument();
});

function closeAddJobModal(): void {
  // simulating clicking the close button isn't working in the test environment
  // instead, this function manually carries out the same steps as Bootstrap does when the close button is clicked
  const addJobModal: HTMLElement | null = screen.queryByRole("dialog", {name: new RegExp("add job", "i")});
  if (addJobModal) {
    addJobModal.removeAttribute("aria-modal")
    addJobModal.removeAttribute("role")
    addJobModal.classList.remove("show");
    addJobModal.setAttribute("style", "display: none;");
    addJobModal.setAttribute("aria-hidden", "true");
  }
  const backdrop: HTMLElement | null = document.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.remove();
  }
  document.body.classList.remove("modal-open");
  document.body.removeAttribute("style");
  document.body.removeAttribute("data-bs-overflow");
}

test('add job modal has a submit button', async () => {
  await renderRoute('/jobs');
  let addJobModal: HTMLElement | null = await openAddJobModal();
  if (addJobModal) {
    expect(getByRole(addJobModal, "button", {name: new RegExp("submit", "i")})).toBeInTheDocument();
  }
});

test('add job modal has a close button', async () => {
  await renderRoute('/jobs');
  let addJobModal: HTMLElement | null = await openAddJobModal();
  if (addJobModal) {
    const closeButtons: HTMLElement[] = getAllByRole(addJobModal, "button", {name: new RegExp("close", "i")});
    expect(closeButtons.length).toBeGreaterThan(0);
  }
});

test('add job modal has a url input', async () => {
  await renderRoute('/jobs');
  let addJobModal: HTMLElement | null = await openAddJobModal();
  if (addJobModal) {
    expect(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")})).toBeInTheDocument();
  }
});

test('jobs are initially fetched from the server', async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderRoute('/jobs');

  // check that the API was called once to get the initial jobs
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);

  // count the number of jobs in the backlog column
  const backlogColumn: HTMLElement | null = getBacklogColumn();
  let backlogJobs: HTMLElement[] = [];
  if (backlogColumn) {
    backlogJobs = queryAllByRole(backlogColumn, "listitem");
  }

  // expect the number of jobs in the backlog column to be 2
  expect(backlogJobs.length).toBe(2);

  // expect the jobs in the backlog column to be the same as the initial jobs
  expect(backlogJobs[0]).toHaveTextContent(validJob1.title);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.company);
  expect(backlogJobs[1]).toHaveTextContent(validJob2.title);
  expect(backlogJobs[1]).toHaveTextContent(validJob2.company);
});

test.only('adding a job adds the same job to the backlog column', async () => {
  await renderRoute('/jobs');

  // add a job
  mockFunctions.fetchData.mockImplementationOnce(generateResponse(validJob1));
  let addJobModal: HTMLElement | null = await openAddJobModal();
  if (addJobModal) {
    const urlInput: HTMLElement = getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")});
    userEvent.type(urlInput, validJob1.url);
    const submitButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("submit", "i")});
    await act(async () => {
      userEvent.click(submitButton);
    });
  }
  closeAddJobModal();

  // check that the API was called again to add the job
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);

  // count the number of jobs in the backlog column
  const backlogColumn: HTMLElement | null = getBacklogColumn();
  let backlogJobs: HTMLElement[] = [];
  if (backlogColumn) {
    backlogJobs = getAllByRole(backlogColumn, "listitem");
  }

  // expect the number of jobs in the backlog column to be 1
  expect(backlogJobs.length).toBe(1);

  // expect the job in the backlog column to be the same as the job added
  expect(backlogJobs[0]).toHaveTextContent(validJob1.title);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.company);
});

test('deleting a job removes the job from the backlog column', async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1,validJob2]));
  await renderRoute('/jobs');

  // remove job 2
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
  let backlogColumn: HTMLElement | null = getBacklogColumn();
  let backlogJobs: HTMLElement[] = [];
  if (backlogColumn) {
    backlogJobs = getAllByRole(backlogColumn, "listitem");
  }
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
  backlogColumn = getBacklogColumn();
  backlogJobs = [];
  if (backlogColumn) {
    backlogJobs = getAllByRole(backlogColumn, "listitem");
  }

  // expect the number of jobs in the backlog column to be 1
  expect(backlogJobs.length).toBe(1);

  // expect the job in the backlog column to be the job that wasn't deleted
  expect(backlogJobs[0]).toHaveTextContent(validJob1.title);
  expect(backlogJobs[0]).toHaveTextContent(validJob1.company);
});