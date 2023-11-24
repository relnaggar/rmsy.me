import { screen, getByRole, getAllByRole, waitFor } from "@testing-library/react";

import { renderThisRoute, openAndGetEditJobModal } from "./jobTestUtils";
import { injectMocks, mockFunctions } from "../common/testUtils";
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
      const editJobModal: HTMLElement = await openAndGetEditJobModal(validJob.title);
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
      const editJobModal: HTMLElement = await openAndGetEditJobModal(validJob.title);
      const closeButtons: HTMLElement[] = getAllByRole(editJobModal, "button", {name: new RegExp("close", "i")});
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
});

test("edit job modal puts url input in focus within 1 second when opened", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: "../api/jobs/",
    data: [validJob1],
  }]));
  await renderThisRoute();
  const editJobModal: HTMLElement = await openAndGetEditJobModal(validJob1.title);
  const urlInput: HTMLElement = getByRole(editJobModal, "textbox", {name: new RegExp("url", "i")});
  await waitFor(() => {
    expect(document.activeElement).toEqual(urlInput);
  }, { timeout: 1000 });
});

describe("every edit job modal has all the correct inputs, each with a save button", () => {
  const inputFields: string[] = ["url", "title", "company", "posting"];
  const validJobs: Job[] = [validJob1,validJob2];
  for (const inputField of inputFields) {
    for (const validJob of validJobs) {
      test(`edit job modal for ${validJob.title} has a ${inputField} input`, async () => {
        mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
          url: "../api/jobs/",
          data: validJobs,
        }]));
        await renderThisRoute();
        const editJobModal: HTMLElement = await openAndGetEditJobModal(validJob.title);
        const inputElement: HTMLElement = getByRole(editJobModal, "textbox", {name: new RegExp(inputField, "i")});
        expect(inputElement).toBeInTheDocument();
        const formElement: HTMLElement = inputElement.closest("form") as HTMLElement;
        const saveButton: HTMLElement = getByRole(formElement, "button", {name: new RegExp("save", "i")});
        expect(saveButton).toBeInTheDocument();
      });
    }
  }
});