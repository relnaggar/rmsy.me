import { screen, getByRole, queryAllByRole, queryByRole, act, fireEvent } from "@testing-library/react";

import { renderRoute, openAndGetModal } from "../common/testUtils";


export async function renderThisRoute(): Promise<void> {
  await renderRoute("/jobs");
}

export function getKanbanColumn(status: string): HTMLElement {
  const column: HTMLElement | null = screen.getByText( new RegExp(status, "i")).closest<HTMLElement>(".kanban-column");
  if (!column) {
    throw new Error(`Column ${status} not found`);
  }
  return column;
}

export function getBacklogColumn(): HTMLElement {
  return getKanbanColumn("backlog");
}

export function getAddJobButton(): HTMLElement {
  const backlogColumn: HTMLElement = getBacklogColumn();
  return getByRole(backlogColumn, "button", {name: new RegExp("add job", "i")});
}

export async function openAndGetAddJobModal(timeout: number = 1000): Promise<HTMLElement> {
  return openAndGetModal(getAddJobButton(), "add job", timeout);
}

export function queryBacklogJobs(): HTMLElement[] {
  const backlogColumn: HTMLElement = getBacklogColumn();
  const jobs = queryAllByRole(backlogColumn, "listitem");
  return jobs;
}

export function getBacklogJobByTitle(title: string): HTMLElement {
  const backlogJobs: HTMLElement[] = queryBacklogJobs();
  const matchingJob: HTMLElement = backlogJobs.find((job: HTMLElement) => {
    const jobHeading: HTMLElement | null = queryByRole(job, "heading", {name: title});
    return jobHeading && jobHeading.textContent === title;
  })!;
  return matchingJob;
}

export async function dragJob(job: HTMLElement, targetStatus: string): Promise<void> {
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