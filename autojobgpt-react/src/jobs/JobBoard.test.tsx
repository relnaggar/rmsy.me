// import { screen, queryAllByRole } from "@testing-library/react";

// import { renderThisRoute, getKanbanColumn, getBacklogJobByTitle, queryBacklogJobs, dragJob } from "./jobTestUtils";
// import { renderThisRoute } from "./jobTestUtils";
import { injectMocks } from "../common/testUtils";
// import { injectMocks, mockFunctions } from "../common/testUtils";
// import { generateConditionalResponseByRoute, validJob1, validJob2, generateResponse } from "../common/mockAPI";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("true is true", () => {
  expect(true).toBe(true);
});

// test("job board has an add column button", async () => {
//   await renderThisRoute();
//   expect(getAddColumnButton()).toBeInTheDocument();
// });

// describe("every status (column title) appears in the kanban board", () => {
//   for (const status of STATUSES) {
//     test(`column ${status} appears in the kanban board`, async () => {
//       await renderThisRoute();
//       expect(screen.getByRole("heading", {name: new RegExp(status, "i")})).toBeInTheDocument();
//     });
//   }  
// });

// describe("every status (column title) has a kanban column", () => {
//   for (const status of STATUSES) {
//     test(`column ${status} has a kanban column`, async () => {
//       await renderThisRoute();
//       const column: HTMLElement = getKanbanColumn(status);
//       expect(column).toBeInTheDocument();
//     });
//   }  
// });

// test("backlog jobs are initially fetched from the server if there are any", async () => {
//   mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//     url: "../api/jobs/",
//     data: [validJob1,validJob2],
//   }]));
//   await renderThisRoute();
//   expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/jobs/", expect.objectContaining({
//     method: "GET"
//   }));
//   const jobs: HTMLElement[] = queryBacklogJobs();
//   expect(jobs.length).toBe(2);
// });

// test("if there are no backlog jobs fetched then none are displayed", async () => {
//   mockFunctions.fetchData.mockImplementation(generateResponse([]));
//   await renderThisRoute();
//   expect(mockFunctions.fetchData).toHaveBeenCalledWith("../api/jobs/", expect.objectContaining({
//     method: "GET"
//   }));
//   const jobs: HTMLElement[] = queryBacklogJobs();
//   expect(jobs.length).toBe(0);
// });

// test("dragging a job from the backlog column to the applying column results in the job being moved", async () => {
//   mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//     url: "../api/jobs/",
//     data: [validJob1,validJob2],
//   }]));
//   await renderThisRoute();

//   // drag validJob2 from backlog to applying
//   mockFunctions.fetchData.mockImplementationOnce(generateResponse({...validJob2, status: "applying"}));
//   const matchingJob: HTMLElement = getBacklogJobByTitle(validJob2.title);
//   await dragJob(matchingJob, "applying");

//   // check that the job was moved to the applying column
//   const applyingJobs: HTMLElement[] = queryAllByRole(getKanbanColumn("applying"), "listitem");
//   expect(applyingJobs.length).toBe(1);
//   const movedJob: HTMLElement = applyingJobs[0];
//   expect(movedJob).toHaveTextContent(validJob2.title);
//   expect(movedJob).toHaveTextContent(validJob2.company);

//   // check that the job was removed from the backlog column
//   const backlogJobs: HTMLElement[] = queryBacklogJobs();
//   expect(backlogJobs.length).toBe(1);
//   const remainingJob: HTMLElement = backlogJobs[0];
//   expect(remainingJob).toHaveTextContent(validJob1.title);
//   expect(remainingJob).toHaveTextContent(validJob1.company);
// });

// test("dragging a job from the backlog column to the applying column calls the API to update the job", async () => {  
//   mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
//     url: "../api/jobs/",
//     data: [validJob1,validJob2],
//   }]));
//   await renderThisRoute();

//   // drag validJob2 from backlog to applying
//   mockFunctions.fetchData.mockImplementationOnce(generateResponse({...validJob2, status: "applying"}));
//   const matchingJob: HTMLElement = getBacklogJobByTitle(validJob2.title);    
//   await dragJob(matchingJob, "applying");

//   // check that the API was called again to update the job
//   expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`../api/jobs/${validJob2.id}/`, expect.objectContaining({
//     method: "PATCH",
//     body: expect.stringContaining("applying")
//   }));
// });