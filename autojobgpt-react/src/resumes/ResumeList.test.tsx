// import { screen, getByRole, act,  getAllByRole } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";

// import { renderThisRoute, getAddResumeButton, queryResumes, getResumeByName } from "./resumeTestUtils";
// import { injectMocks, mockFunctions, openAndGetModal } from "../common/testUtils";
// import {
//   generateConditionalResponseByRoute,
//   validResume1,
//   validResume2,
//   generateResponse
// } from "../common/mockAPI";
// import { Resume } from "./types";

import { injectMocks } from "../common/testUtils";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("true is true", () => {
  expect(true).toBe(true);
});

// test("add resume button appears", async () => {
//   await renderThisRoute();
//   const addResumeButton: HTMLElement = getAddResumeButton();
//   expect(addResumeButton).toBeInTheDocument();
// });

// test("resumes are initially fetched from the server", async () => {
//   mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//     url: "../api/resumes/",
//     data: [validResume1,validResume2],
//   }]));
//   await renderThisRoute();
//   expect(mockFunctions.fetchData).toHaveBeenCalledWith(
//     "../api/resumes/",
//     expect.objectContaining({
//       method: "GET",
//     })
//   );
//   const resumes: HTMLElement[] = queryResumes();
//   expect(resumes.length).toBe(2);
// });

// test("if there are no resumes fetched then none are displayed", async () => {
//   mockFunctions.fetchData.mockImplementation(generateResponse([]));
//   await renderThisRoute();
//   expect(mockFunctions.fetchData).toHaveBeenCalledWith(
//     "../api/resumes/",
//     expect.objectContaining({
//       method: "GET",
//     }),
//   );
//   const resumes: HTMLElement[] = queryResumes();
//   expect(resumes.length).toBe(0);
// });

// test("resumes are displayed with their names", async () => {
//   mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//     url: "../api/resumes/",
//     data: [validResume1,validResume2],
//   }]));
//   await renderThisRoute();
//   const resumes: HTMLElement[] = queryResumes();
//   expect(resumes[0]).toHaveTextContent(validResume1.name);
//   expect(resumes[1]).toHaveTextContent(validResume2.name);
// });

// test("resumes are displayed with their images", async () => {
//   mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//     url: "../api/resumes/",
//     data: [validResume1,validResume2],
//   }]));
//   await renderThisRoute();
//   const resumes: HTMLElement[] = queryResumes();
//   expect(resumes[0].querySelector("img")?.src).toBe(validResume1.png);
//   expect(resumes[1].querySelector("img")?.src).toBe(validResume2.png);
// });

// describe("resumes are displayed with edit, delete and download buttons", () => {
//   const validResumes: Resume[] = [validResume1,validResume2];
//   for (const buttonText of ["edit", "delete", "download"]) {
//     test(`resumes are displayed with ${buttonText} button`, async () => {
//       mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//         url: "../api/resumes/",
//         data: [validResume1,validResume2],
//       }]));
//       await renderThisRoute();
//       const resumes: HTMLElement[] = queryResumes();
//       for (let i = 0; i < resumes.length; i++) {
//         const resume: HTMLElement = resumes[i];
//         const button: HTMLElement = getByRole(resume, "button", {name: new RegExp(buttonText, "i")});
//         expect(button).toBeInTheDocument();
//         if (buttonText === "download") {
//           expect(button).toHaveAttribute("href", validResumes[i].docx);
//         }
//       }
//     });
//   }
// });

// test("confirm delete modal isn't visible before clicking delete button", async () => {
//   await renderThisRoute();
//   expect(screen.queryByRole("dialog", {name: new RegExp("confirm delete", "i")})).not.toBeInTheDocument();
// });

// describe("clicking every delete resume button shows delete confirmation modal within 1 second", () => {
//   const validResumes: Resume[] = [validResume1,validResume2];
//   for (const validResume of validResumes) {
//     test(`clicking delete button for ${validResume.name} shows delete confirmation modal within 1 second`, async () => {
//       mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//         url: "../api/resumes/",
//         data: validResumes,
//       }]));
//       await renderThisRoute();
//       const resume: HTMLElement = getResumeByName(validResume.name);
//       const deleteButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("delete", "i")});
//       const deleteConfirmationModal: HTMLElement = await openAndGetModal("confirm delete", 1000, deleteButton);
//       expect(deleteConfirmationModal).toBeInTheDocument();
//     });
//   }
// });

// describe("every delete resume confirmation modal has a delete button", () => {
//   const validResumes: Resume[] = [validResume1,validResume2];
//   for (const validResume of validResumes) {
//     test(`delete confirmation modal for ${validResume.name} has a delete button`, async () => {
//       mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//         url: "../api/resumes/",
//         data: validResumes,
//       }]));
//       await renderThisRoute();
//       const resume: HTMLElement = getResumeByName(validResume.name);
//       const deleteButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("delete", "i")});
//       const deleteConfirmationModal: HTMLElement = await openAndGetModal("confirm delete", 1000, deleteButton);
//       const deleteConfirmationButton: HTMLElement = getByRole(deleteConfirmationModal, "button", {name: new RegExp("delete", "i")});
//       expect(deleteConfirmationButton).toBeInTheDocument();
//     });
//   }
// });

// describe("every delete resume confirmation modal has a close button", () => {
//   const validResumes: Resume[] = [validResume1,validResume2];
//   for (const validResume of validResumes) {
//     test(`delete confirmation modal for ${validResume.name} has a delete button`, async () => {
//       mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//         url: "../api/resumes/",
//         data: validResumes,
//       }]));
//       await renderThisRoute();
//       const resume: HTMLElement = getResumeByName(validResume.name);
//       const deleteButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("delete", "i")});
//       const deleteConfirmationModal: HTMLElement = await openAndGetModal("confirm delete", 1000, deleteButton);
//       const closeButtons: HTMLElement[] = getAllByRole(deleteConfirmationModal, "button", {name: new RegExp("close", "i")});
//       expect(closeButtons.length).toBeGreaterThan(0);
//     });
//   }
// });

// describe("every delete confirmation modal asks are you sure", () => {
//   const validResumes: Resume[] = [validResume1,validResume2];
//   for (const validResume of validResumes) {
//     test(`delete confirmation modal for ${validResume.name} asks are you sure`, async () => {
//       mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//         url: "../api/resumes/",
//         data: validResumes,
//       }]));
//       await renderThisRoute();
//       const resume: HTMLElement = getResumeByName(validResume.name);
//       const deleteButton: HTMLElement = getByRole(resume, "button", {name: new RegExp("delete", "i")});
//       const deleteConfirmationModal: HTMLElement = await openAndGetModal("confirm delete", 1000, deleteButton);
//       expect(deleteConfirmationModal).toHaveTextContent(new RegExp("are you sure", "i"));
//     });
//   }
// });

// test("deleting a resume closes the confirmation modal and removes it from the list of resumes", async () => {
//   mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//     url: "../api/resumes/",
//     data: [validResume1,validResume2],
//   }]));
//   await renderThisRoute();
//   const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;

//   // delete validResumeTemplate2
//   mockFunctions.fetchData.mockImplementationOnce(generateResponse([], 204));
//   const matchingResume: HTMLElement = getResumeByName(validResume2.name);
//   const deleteButton: HTMLElement = getByRole(matchingResume, "button", {name: new RegExp("delete", "i")});
//   const deleteConfirmationModal: HTMLElement = await openAndGetModal("confirm delete", 1000, deleteButton);
//   const deleteConfirmationButton: HTMLElement = getByRole(deleteConfirmationModal, "button", {name: new RegExp("delete", "i")});
//   await act(async () => {
//     userEvent.click(deleteConfirmationButton);
//   });

//   // check that the modal was closed
//   expect(deleteConfirmationModal).not.toBeInTheDocument();

//   // check that the API was called again to delete the resume template
//   expect(mockFunctions.fetchData).toHaveBeenCalledTimes(initialFetchDataCalls + 1);
//   expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
//     `../api/resumes/${validResume2.id}/`,
//     expect.objectContaining({method: "DELETE"}
//   ));

//   // check that the only resume left is the one that wasn't deleted
//   const resumes: HTMLElement[] = queryResumes();
//   expect(resumes.length).toBe(1);
//   expect(resumes[0]).toHaveTextContent(validResume1.name);
// });