import { screen, act, getByLabelText, queryAllByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";


const getResumeTemplateSection = (): HTMLElement => {
  const resumeTemplateHeading: HTMLElement = screen.getByRole("heading", {name: new RegExp("templates", "i"), level: 2});
  const resumeTemplateSection: HTMLElement = resumeTemplateHeading.parentElement as HTMLElement;
  return resumeTemplateSection;
};

export const queryResumeTemplates = (): HTMLElement[] => {
  // resume templates are listitems in the resume template section that don't have the aria-busy attribute set to true
  const resumeTemplatesSection: HTMLElement = getResumeTemplateSection();  
  const listItems: HTMLElement[] = queryAllByRole(resumeTemplatesSection, "listitem");
  const resumeTemplates: HTMLElement[] = listItems.filter((listItem: HTMLElement) => 
    !listItem.hasAttribute("aria-busy") || listItem.getAttribute("aria-busy") === "false"
  );
  return resumeTemplates;
};

// export const getResumeTemplateByName = (name: string): HTMLElement => {
//   const resumeTemplates: HTMLElement[] = queryResumeTemplates();
//   const matchingResumeTemplate: HTMLElement = resumeTemplates.find((resumeTemplate: HTMLElement) => {
//     const resumeHeading: HTMLElement | null = queryByRole(resumeTemplate, "heading", {name: name});
//     return resumeHeading && resumeHeading.textContent === name;
//   }
//   )!;
//   return matchingResumeTemplate;
// };

export const userUploadDocxFile = async (modal: HTMLElement, labelText: string, fileName: string): Promise<void> => {
  await act(async () => {
    const fileInput: HTMLInputElement = getByLabelText(modal, new RegExp(labelText, "i"));
    userEvent.upload(fileInput, new File([""], fileName, {type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}));
  });
};