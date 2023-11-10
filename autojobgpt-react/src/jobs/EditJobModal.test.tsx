import { screen, getByRole, getAllByRole } from "@testing-library/react";

import { renderThisRoute, getBacklogJobByTitle } from "./jobTestUtils";
import { injectMocks, mockFunctions, openAndGetModal } from "../common/testUtils";
import { generateConditionalResponseByRoute, validJob1, validJob2 } from "../common/mockAPI";
import { Job } from "./types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("edit job modal isn't visible before clicking edit job button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("edit job", "i")})).not.toBeInTheDocument();
});

describe("clicking every edit job button shows edit job modal within 1 second", () => {
  const validJobs: Job[] = [validJob1,validJob2];
  for (const validJob of validJobs) {
    test(`clicking delete button for ${validJob.title} shows delete confirmation modal within 1 second`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: validJobs,
      }]));
      await renderThisRoute();
      const job: HTMLElement = getBacklogJobByTitle(validJob.title);
      const editButton: HTMLElement = getByRole(job, "button", {name: new RegExp("edit", "i")});
      const editJobModal: HTMLElement = await openAndGetModal(editButton, "edit job", 1000);
      expect(editJobModal).toBeInTheDocument();
    });
  }
});

describe("every edit job modal has a close button", () => {
  const validJobs: Job[] = [validJob1,validJob2];
  for (const validJob of validJobs) {
    test(`edit job modal for ${validJob.title} has a close button`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/jobs/",
        data: validJobs,
      }]));
      await renderThisRoute();
      const job: HTMLElement = getBacklogJobByTitle(validJob.title);
      const editButton: HTMLElement = getByRole(job, "button", {name: new RegExp("edit", "i")});
      const editJobModal: HTMLElement = await openAndGetModal(editButton, "edit job", 1000);
      const closeButtons: HTMLElement[] = getAllByRole(editJobModal, "button", {name: new RegExp("close", "i")});
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
});