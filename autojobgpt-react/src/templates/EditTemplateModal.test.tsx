import { screen, getByRole, getAllByRole } from "@testing-library/react";

import { renderThisRoute, getResumeTemplateByName } from "./resumeTemplateTestUtils";
import { injectMocks, mockFunctions, openAndGetModal } from "../common/testUtils";
import { validResumeTemplate1, validResumeTemplate2, generateConditionalResponseByRoute } from "../common/mockAPI";
import { ResumeTemplate } from "../templates/types";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("edit resume template modal isn't visible before clicking edit resume template button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("edit resume template", "i")})).not.toBeInTheDocument();
});

describe("clicking every edit resume template button shows edit resume modal within 1 second", () => {
  const validTemplates: ResumeTemplate[] = [validResumeTemplate1,validResumeTemplate2];
  for (const validTemplate of validTemplates) {
    test(`clicking edit button for ${validTemplate.name} shows edit template modal within 1 second`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/templates/",
        data: validTemplates,
      }]));
      await renderThisRoute();
      const template: HTMLElement = getResumeTemplateByName(validTemplate.name);
      const editButton: HTMLElement = getByRole(template, "button", {name: new RegExp("edit", "i")});
      const editTemplateModal: HTMLElement = await openAndGetModal(editButton, "edit resume template", 1000);
      expect(editTemplateModal).toBeInTheDocument();
    });
  }
});

describe("every edit resume template modal has a close button", () => {
  const validTemplates: ResumeTemplate[] = [validResumeTemplate1,validResumeTemplate2];
  for (const validTemplate of validTemplates) {
    test(`edit resume template modal for ${validTemplate.name} has a close button`, async () => {
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: "../api/templates/",
        data: validTemplates,
      }]));
      await renderThisRoute();
      const template: HTMLElement = getResumeTemplateByName(validTemplate.name);
      const editButton: HTMLElement = getByRole(template, "button", {name: new RegExp("edit", "i")});
      const editTemplateModal: HTMLElement = await openAndGetModal(editButton, "edit resume template", 1000);
      const closeButtons: HTMLElement[] = getAllByRole(editTemplateModal, "button", {name: new RegExp("close", "i")});
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
});