import { screen, getByRole, getAllByRole, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { injectMocks, mockFunctions } from "../common/testUtils";
import { renderThisRoute, openAndGetAddJobModal, getBacklogColumn } from "./jobTestUtils";
import { getSubmitButton } from "../common/testUtils";
import { generateConditionalResponseByRoute, generateResponse, validJob1 } from "../common/mockAPI";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("add job modal isn't visible before clicking add button", async () => {
  await renderThisRoute();
  expect(screen.queryByRole("dialog", {name: new RegExp("add job", "i")})).not.toBeInTheDocument();
});

test("clicking add button shows add job modal within 1 second", async () => {
  await renderThisRoute();
  const addJobModal: HTMLElement = await openAndGetAddJobModal(1000);
  expect(addJobModal).toBeInTheDocument();
});

test("add job modal has a submit button", async () => {
  await renderThisRoute();
  const submitButton: HTMLElement = getSubmitButton(await openAndGetAddJobModal());  
  expect(submitButton).toBeInTheDocument();
});

test("add job modal has a close button", async () => {
  await renderThisRoute();
  const closeButtons: HTMLElement[] = getAllByRole(await openAndGetAddJobModal(), "button", {name: new RegExp("close", "i")});
  expect(closeButtons.length).toBeGreaterThan(0);
});

test("add job modal has a url input", async () => {
  await renderThisRoute();
  const urlInput: HTMLElement = getByRole(await openAndGetAddJobModal(), "textbox", {name: new RegExp("url", "i")});
  expect(urlInput).toBeInTheDocument();
});

test("add job modal puts url input in focus when opened within 1 second", async () => {
  await renderThisRoute();
  const urlInput: HTMLElement = getByRole(await openAndGetAddJobModal(), "textbox", {name: new RegExp("url", "i")});
  await waitFor(() => {
    expect(document.activeElement).toEqual(urlInput);
  }, { timeout: 1000 });
});

test("add job modal has a title input", async () => {
  await renderThisRoute();
  const titleInput: HTMLElement = getByRole(await openAndGetAddJobModal(), "textbox", {name: new RegExp("title", "i")});
  expect(titleInput).toBeInTheDocument();
});

test("add job modal has a company input", async () => {
  await renderThisRoute();
  const companyInput: HTMLElement = getByRole(await openAndGetAddJobModal(), "textbox", {name: new RegExp("company", "i")});
  expect(companyInput).toBeInTheDocument();
});

test("add job modal has a posting input", async () => {
  await renderThisRoute();
  const postingInput: HTMLElement = getByRole(await openAndGetAddJobModal(), "textbox", {name: new RegExp("posting", "i")});
  expect(postingInput).toBeInTheDocument();
});

test("add job modal has a fill button", async () => {
  await renderThisRoute();
  const fillButton: HTMLElement = getByRole(await openAndGetAddJobModal(), "button", {name: new RegExp("fill", "i")});
  expect(fillButton).toBeInTheDocument();
});

test("clicking fill button calls the API", async () => {
  await renderThisRoute();
  const fillButton: HTMLElement = getByRole(await openAndGetAddJobModal(), "button", {name: new RegExp("fill", "i")});
  await act(async () => {
    userEvent.click(fillButton);
  });
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
    expect.stringContaining("../api/jobs/extract-details-from-url?url="),
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
    })
  );
});

test("clicking the fill button when the API fails shows an error alert", async () => {
  await renderThisRoute();
  const addJobModal: HTMLElement = await openAndGetAddJobModal();
  mockFunctions.fetchData.mockRejectedValueOnce(new Error("Failed to fetch"));

  const fillButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("fill", "i")});
  await act(async () => {
    userEvent.click(fillButton);
  });

  const alert: HTMLElement = getByRole(addJobModal, "alert");
  expect(alert).toHaveTextContent("Failed to connect to server. Please check your internet connection and try again.");
});

type FillButtonTest = {
  test_description: string,
  url: string,
  data: Record<string, string | string[]>,
  status: number,
};

describe("clicking the fill button invalid URLs calls the API and shows an error alert", () => {
  const allTestData: FillButtonTest[] = [{
      "test_description": "an invalid URL",
      "url": "ab:cd",
      "data": {"url": ["Enter a valid URL."]},
      "status": 400,
    }, {
      "test_description": "a URL with no job details",
      "url": "https://www.notajobposting.com",
      "data": {"error": "The provided job posting text does not contain a job title or a company name."},
      "status": 400,
    }, {
      "test_description": "an empty URL",
      "url": "",
      "data": {"url": ["This field may not be blank."]},
      "status": 400,
    }, {
      "test_description": "a server error",
      "url": "https://www.validjobposting.com",
      "data": {"error": "An error occurred."},
      "status": 500,
    }
  ];

  for (const currentTestData of allTestData) {
    test(`clicking fill button with ${currentTestData["test_description"]} calls the API and shows an error alert`, async () => {
      await renderThisRoute();
      const addJobModal: HTMLElement = await openAndGetAddJobModal();
  
      // fill with an invalid URL
      if (currentTestData["url"] !== "") {
        await act(async () => {
          userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")}), currentTestData["url"]);
        });
      }
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: `../api/jobs/extract-details-from-url?url=${currentTestData["url"]}`,
        data: currentTestData["data"],
        status: currentTestData["status"],
      }]));
  
      // click fill button
      const fillButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("fill", "i")});
      await act(async () => {
        userEvent.click(fillButton);
      });
  
      // check that the error alert is shown
      const alert: HTMLElement = getByRole(addJobModal, "alert");
      if (currentTestData["data"]["error"]) {
        expect(alert).toHaveTextContent(currentTestData["data"]["error"] as string)
      } else {
        expect(alert).toHaveTextContent(Object.values(currentTestData["data"]).flat().join(" "));
      }
    });
  }
});

test("clicking the fill button with a valid URL calls the API and fills the job detail inputs", async () => {
  await renderThisRoute();
  const addJobModal: HTMLElement = await openAndGetAddJobModal();

  // fill with a valid URL
  await act(async () => {
    userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")}), validJob1.url);
  });
  mockFunctions.fetchData.mockImplementation(generateResponse({
    "title": validJob1.title,
    "company": validJob1.company,
    "posting": validJob1.posting,
  }));

  // click fill button
  const fillButton: HTMLElement = getByRole(addJobModal, "button", {name: new RegExp("fill", "i")});
  await act(async () => {
    userEvent.click(fillButton);
  });

  // check that the job detail inputs were filled
  expect(getByRole(addJobModal, "textbox", {name: new RegExp("title", "i")})).toHaveValue(validJob1.title);
  expect(getByRole(addJobModal, "textbox", {name: new RegExp("company", "i")})).toHaveValue(validJob1.company);
  expect(getByRole(addJobModal, "textbox", {name: new RegExp("posting", "i")})).toHaveValue(validJob1.posting);
});

type SubmitButtonTest = {
  url: string,
  title: string,
  company: string,
  posting: string,
  data: Record<string, string | string[]>,
  status: number,
};

describe("clicking the submit button with invalid inputs shows an error alert", () => {
  const allTestData: SubmitButtonTest[] = [
    {
      "url": "ab:cd",
      "title": validJob1.title,
      "company": validJob1.company,
      "posting": validJob1.posting,
      "data": {"url": ["Enter a valid URL."]},
      "status": 400,
    }, {
      "url": validJob1.url,
      "title": validJob1.title,
      "company": validJob1.company,
      "posting": validJob1.posting,
      "data": {"error": "An error occurred."},
      "status": 500,
    }, {
      "url": "",
      "title": validJob1.title,
      "company": validJob1.company,
      "posting": validJob1.posting,
      "data": {"error": "duplicate key value violates unique constraint"},
      "status": 400,
    }
  ];

  for (const currentTestData of allTestData) {
    test(`clicking the submit button with ${JSON.stringify(currentTestData)} shows an error alert`, async () => {
      await renderThisRoute();
      const addJobModal: HTMLElement = await openAndGetAddJobModal();

      const fields: ("url" | "title" | "company" | "posting")[] = ["url", "title", "company", "posting"]
      for (const field of fields) {
        if (currentTestData[field] !== "") {
          await act(async () => {
            userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp(field, "i")}), currentTestData[field]);
          });
        }
      }

      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: `../api/jobs/`,
        data: currentTestData["data"],
        status: currentTestData["status"],
      }]));
      const submitButton: HTMLElement = getSubmitButton(addJobModal);
      await act(async () => {
        userEvent.click(submitButton);
      });

      const alert: HTMLElement = getByRole(addJobModal, "alert");
      if (currentTestData["data"]["error"]) {
        expect(alert).toHaveTextContent(currentTestData["data"]["error"] as string)
      } else {
        expect(alert).toHaveTextContent(Object.values(currentTestData["data"]).flat().join(" "));
      }
    });
  }
});

test("adding a valid job adds the same job to the backlog column, closes the modal within 1 second, and calls the API", async () => {
  await renderThisRoute();

  // add a job
  mockFunctions.fetchData.mockImplementationOnce(generateResponse(validJob1));
  const addJobModal: HTMLElement = await openAndGetAddJobModal();
  userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("url", "i")}), validJob1.url);
  userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("title", "i")}), validJob1.title);
  userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("company", "i")}), validJob1.company);
  userEvent.type(getByRole(addJobModal, "textbox", {name: new RegExp("posting", "i")}), validJob1.posting);

  const submitButton: HTMLElement = getSubmitButton(addJobModal);
  await act(async () => {
    userEvent.click(submitButton);
  });

  // check that the modal was closed within 1 second
  await waitFor(() => {
    expect(addJobModal).not.toBeInTheDocument();
  }, { timeout: 1000 });

  // check that the API was called again to add the job
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith("../api/jobs/", expect.objectContaining({
    method: "POST",
    body: expect.stringContaining(validJob1.url)
  }));

  // check that the job was added to the backlog column
  const backlogJobs: HTMLElement[] = getAllByRole(getBacklogColumn(), "listitem");
  expect(backlogJobs.length).toBe(1);
  const addedJob: HTMLElement = backlogJobs[0];
  expect(addedJob).toHaveTextContent(validJob1.title);
  expect(addedJob).toHaveTextContent(validJob1.company);
});