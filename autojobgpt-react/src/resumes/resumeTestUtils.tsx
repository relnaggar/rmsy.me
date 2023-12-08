// import { screen, getByRole, queryByRole, queryAllByRole } from "@testing-library/react";

import { renderRoute } from "../common/testUtils";


export const renderThisRoute = async (): Promise<void> => {
  await renderRoute("/resumes");
}

// function getResumeSection(): HTMLElement {
//   const resumeHeading: HTMLElement = screen.getByRole("heading", {name: new RegExp("resumes", "i"), level: 2});
//   const resumeSection: HTMLElement = resumeHeading.parentElement as HTMLElement;
//   return resumeSection;
// }

// export function getAddResumeButton(): HTMLElement {
//   const resumeTemplateSection: HTMLElement = getResumeSection();
//   return getByRole(resumeTemplateSection, "button", {name: new RegExp("generate new resume", "i")});
// }

// export function queryResumes(): HTMLElement[] {
//   // resumes are listitems in the resume section that don't have the aria-busy attribute set to true
//   const resumeSection: HTMLElement = getResumeSection();  
//   const listItems: HTMLElement[] = queryAllByRole(resumeSection, "listitem");
//   const resumes: HTMLElement[] = listItems.filter((listItem: HTMLElement) => 
//     !listItem.hasAttribute("aria-busy") || listItem.getAttribute("aria-busy") === "false"
//   );
//   return resumes;
// }

// export function getResumeByName(name: string): HTMLElement {
//   const resumes: HTMLElement[] = queryResumes();
//   const matchingResume: HTMLElement = resumes.find((resume: HTMLElement) => {
//     const resumeHeading: HTMLElement | null = queryByRole(resume, "heading", {name: name});
//     return resumeHeading && resumeHeading.textContent === name;
//   })!;
//   return matchingResume;
// }