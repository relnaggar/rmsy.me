import { screen, getByRole, queryAllByRole, queryByRole, act, fireEvent } from "@testing-library/react";

import { renderRoute, openAndGetModal } from "../common/testUtils";


export const renderThisRoute = async (): Promise<void> => {
  await renderRoute("/jobs");
};

export const getFirstColumn = (): HTMLElement => {
  const allColumns: HTMLElement[] = queryAllByRole(screen.getByRole("main"), "region");
  return allColumns[0];
};

export const getColumnByName = (status: string): HTMLElement => {
  return screen.getByRole("region", {name: new RegExp(status, "i")});
};

export const queryFirstColumnJobs = (): HTMLElement[] => {
  return queryAllByRole(getFirstColumn(), "listitem");
};

export const getFirstColumnJobByTitle = (title: string): HTMLElement => {
  const matchingJob: HTMLElement | undefined = queryFirstColumnJobs().find((job: HTMLElement) => {
    const jobHeading: HTMLElement | null = queryByRole(job, "heading", {name: title});
    return jobHeading && jobHeading.textContent === title;
  });
  if (!matchingJob) {
    throw new Error(`Job ${title} not found`);
  }
  return matchingJob;
};

export const getAddColumnButton = (): HTMLElement => {
  return screen.getByRole("button", {name: new RegExp("add column", "i")});
};

export const getAddJobButton = (): HTMLElement => {
  return getByRole(getFirstColumn(), "button", {name: new RegExp("add job", "i")});
};

export const getFirstColumnEditJobButton = (jobTitle: string): HTMLElement => {
  return getByRole(getFirstColumnJobByTitle(jobTitle), "button", {name: new RegExp("edit", "i")});
};

export const openAndGetAddJobModal = async (timeout: number = 1000): Promise<HTMLElement> => {
  return openAndGetModal(getAddJobButton(), "add job", timeout);
};

export const openAndGetFirstColumnEditJobModal = async (
  jobTitle: string, timeout: number = 1000
): Promise<HTMLElement> => {
  return openAndGetModal(getFirstColumnEditJobButton(jobTitle), "edit job", timeout);
};

export const openAndGetAddColumnModal = async (timeout: number = 1000): Promise<HTMLElement> => {
  return await openAndGetModal(getAddColumnButton(), "add column", timeout);
};

export const dragJob = async (job: HTMLElement, targetStatus: string): Promise<void> => {
  await act(async () => {
    fireEvent.dragStart(job);
  });
  await act(async () => {
    fireEvent.dragOver(getColumnByName(targetStatus));
  });
  await act(async () => {
    fireEvent.drop(getColumnByName(targetStatus));
  });
};