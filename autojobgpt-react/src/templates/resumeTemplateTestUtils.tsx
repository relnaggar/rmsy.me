import { screen, getByRole, queryByRole, queryAllByRole } from "@testing-library/react";

import { renderRoute, openAndGetModal } from "../common/testUtils";


export async function renderThisRoute(): Promise<void> {
  await renderRoute("/resumes");
}

function getResumeTemplateSection(): HTMLElement {
  const resumeTemplateHeading: HTMLElement = screen.getByRole("heading", {name: new RegExp("templates", "i"), level: 2});
  const resumeTemplateSection: HTMLElement = resumeTemplateHeading.parentElement as HTMLElement;
  return resumeTemplateSection;
}

export function getUploadResumeTemplateButton(): HTMLElement {
  const resumeTemplateSection: HTMLElement = getResumeTemplateSection();
  return getByRole(resumeTemplateSection, "button", {name: new RegExp("upload resume template", "i")});
}

export function queryResumeTemplates(): HTMLElement[] {
  // resume templates are listitems in the resume template section that don't have the aria-busy attribute set to true
  const resumeTemplatesSection: HTMLElement = getResumeTemplateSection();  
  const listItems: HTMLElement[] = queryAllByRole(resumeTemplatesSection, "listitem");
  const resumeTemplates: HTMLElement[] = listItems.filter((listItem: HTMLElement) => 
    !listItem.hasAttribute("aria-busy") || listItem.getAttribute("aria-busy") === "false"
  );
  return resumeTemplates;
}

export function getResumeTemplateByName(name: string): HTMLElement {
  const resumeTemplates: HTMLElement[] = queryResumeTemplates();
  const matchingResumeTemplate: HTMLElement = resumeTemplates.find((resumeTemplate: HTMLElement) => {
    const resumeHeading: HTMLElement | null = queryByRole(resumeTemplate, "heading", {name: name});
    return resumeHeading && resumeHeading.textContent === name;
  }
  )!;
  return matchingResumeTemplate;
}

export async function openAndGetAddResumeTemplateModal(timeout: number = 1000): Promise<HTMLElement> {
  return openAndGetModal("add resume template", timeout, getUploadResumeTemplateButton());
}