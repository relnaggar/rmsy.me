import { screen, getByRole, getAllByRole } from "@testing-library/react";

import { renderThisRoute, getResumeByName } from "./resumeTestUtils";
import { injectMocks, mockFunctions, openAndGetModal } from "../common/testUtils";
import { validResume1, validResume2, generateConditionalResponseByRoute } from "../common/mockAPI";
import { Resume } from "./types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("edit resume modal isn't visible before clicking edit resume button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("edit resume", "i")})).not.toBeInTheDocument();
});

describe("clicking every edit resume button shows edit resume modal within 1 second", () => {
  const validResumes: Resume[] = [validResume1,validResume2];
  for (const validResume of validResumes) {
    test(`clicking edit button for ${validResume.name} shows edit resume modal within 1 second`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/resumes/",
        data: validResumes,
      }]));
      await renderThisRoute();
      const resume: HTMLElement = getResumeByName(validResume.name);
      const editButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("edit", "i")});
      const editResumeModal: HTMLElement = await openAndGetModal(editButton, "edit resume", 1000);
      expect(editResumeModal).toBeInTheDocument();
    });
  }
});

describe("every edit resume modal has a close button", () => {
  const validResumes: Resume[] = [validResume1,validResume2];
  for (const validResume of validResumes) {
    test(`edit resume modal for ${validResume.name} has a close button`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/resumes/",
        data: validResumes,
      }]));
      await renderThisRoute();
      const resume: HTMLElement = getResumeByName(validResume.name);
      const editButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("edit", "i")});
      const editResumeModal: HTMLElement = await openAndGetModal(editButton, "edit resume", 1000);
      const closeButtons: HTMLElement[] = getAllByRole(editResumeModal, "button", {name: new RegExp("close", "i")});
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
});