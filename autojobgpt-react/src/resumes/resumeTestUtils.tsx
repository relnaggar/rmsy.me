import { screen, queryAllByRole, getByRole, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";


const getResumeSection = (): HTMLElement => {
  const resumeHeading: HTMLElement = screen.getByRole("heading", {name: new RegExp("resumes", "i"), level: 2});
  const resumeSection: HTMLElement = resumeHeading.parentElement as HTMLElement;
  return resumeSection;
};

export const queryResumes = (): HTMLElement[] => {
  // resumes are listitems in the resume section that don't have the aria-busy attribute set to true
  const resumeSection: HTMLElement = getResumeSection();  
  const listItems: HTMLElement[] = queryAllByRole(resumeSection, "listitem");
  const resumes: HTMLElement[] = listItems.filter((listItem: HTMLElement) => 
    !listItem.hasAttribute("aria-busy") || listItem.getAttribute("aria-busy") === "false"
  );
  return resumes;
};

export const getRefreshButton = (modal: HTMLElement, label: string): HTMLElement => {
  const input: HTMLElement = getByRole(modal, "combobox", {name: new RegExp(label, "i")});
  const inputId: string = input.getAttribute("id")!;
  return document.querySelector(`[aria-controls="${inputId}"]`)!;
};

export const clickRefreshButton = async (modal: HTMLElement, label: string): Promise<void> => {
  const refreshButton: HTMLElement = getRefreshButton(modal, label);
  await act(async () => {
    userEvent.click(refreshButton);
  });
};

// export function getResumeByName(name: string): HTMLElement {
//   const resumes: HTMLElement[] = queryResumes();
//   const matchingResume: HTMLElement = resumes.find((resume: HTMLElement) => {
//     const resumeHeading: HTMLElement | null = queryByRole(resume, "heading", {name: name});
//     return resumeHeading && resumeHeading.textContent === name;
//   })!;
//   return matchingResume;
// }