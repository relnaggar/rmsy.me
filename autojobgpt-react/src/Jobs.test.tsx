import { screen, getByRole, getAllByRole, queryByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderRoute } from './testUtilities';
import { STATUSES } from './Jobs';


test('every status (column title) appears in the kanban board', () => {
  renderRoute('/jobs');
  for (const status of STATUSES) {
    expect(screen.getByRole('heading', {name: new RegExp(status, "i")})).toBeInTheDocument();
  }  
});

describe('columns except the backlog column do not have an add button', () => {
  for (const status of STATUSES) {
    if (status.toLowerCase() !== "backlog") {
      test(`column ${status} does not have an add button`, () => {
        renderRoute('/jobs');
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

test('backlog column has an add button', () => {
  renderRoute('/jobs');
  const backlogColumn: HTMLElement | null = getBacklogColumn();
  if (backlogColumn) {
    expect(getByRole(backlogColumn, "button", {name: new RegExp("add", "i")})).toBeInTheDocument();
  }
});

async function openAddJobModal(): Promise<HTMLElement | null> {
  const backlogColumn: HTMLElement | null = getBacklogColumn();
  if (backlogColumn) {
    const addJobButton: HTMLElement = getByRole(backlogColumn, "button", {name: new RegExp("add", "i")});
    userEvent.click(addJobButton)
  }
  // wait up to 1 second for the modal to appear
  const addJobModal: HTMLElement | null = await screen.findByRole(
    "dialog",
    {name: new RegExp("add job", "i")},
    {timeout: 1000}
  );

  return addJobModal;
}

test("add job modal isn't visible before clicking add button", () => {
  renderRoute('/jobs');
  expect(screen.queryByRole("dialog", {name: new RegExp("add job", "i")})).not.toBeInTheDocument();
});

test('clicking add button shows add job modal within 1 second', async () => {
  renderRoute('/jobs');
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
  renderRoute('/jobs');
  let addJobModal: HTMLElement | null = await openAddJobModal();
  if (addJobModal) {
    expect(getByRole(addJobModal, "button", {name: new RegExp("submit", "i")})).toBeInTheDocument();
  }
});

test('add job modal has a close button', async () => {
  renderRoute('/jobs');
  let addJobModal: HTMLElement | null = await openAddJobModal();
  if (addJobModal) {
    const closeButtons: HTMLElement[] = getAllByRole(addJobModal, "button", {name: new RegExp("close", "i")});
    expect(closeButtons.length).toBeGreaterThan(0);
  }
});