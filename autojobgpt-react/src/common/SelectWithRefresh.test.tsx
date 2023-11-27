import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SelectWithRefresh from "./SelectWithRefresh";
import { FetchDataContext } from "../routes/routesConfig";
import { generateResponse, validJob1, validJob2 } from "./mockAPI";
import { mockFunctions } from "./testUtils";
import { Job } from "../jobs/types";
import { WithID } from "./types";


beforeEach(() => {
  jest.clearAllMocks();
});

async function renderSelectWithRefresh<Option extends WithID>({ apiPath, id, label, optionToString }: {
  apiPath: string,
  id: string,
  label: string,
  optionToString: (option: Option) => string,
}) {
  await act(async () => {
    render(
      <FetchDataContext.Provider value={mockFunctions.fetchData}>
        <SelectWithRefresh<Option> apiPath={apiPath} id={id} label={label} optionToString={optionToString} />
      </FetchDataContext.Provider>
    )
  });
}

async function renderJobSelectWithRefresh() {
  await renderSelectWithRefresh<Job>({
    apiPath: "../api/jobs/",
    id: "job",
    label: "Job",
    optionToString: (job) => job.title + ", " + job.company,
  });
}

test("API is called when component is rendered", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1, validJob2]));
  await renderJobSelectWithRefresh();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
    "../api/jobs/",
    expect.objectContaining({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
});

test("select is rendered", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1, validJob2]));
  await renderJobSelectWithRefresh();

  const select: HTMLElement = screen.getByRole("combobox");
  expect(select).toBeInTheDocument();  
});

test("refresh button is rendered", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1, validJob2]));
  await renderJobSelectWithRefresh();

  const refreshButton: HTMLElement = screen.getByRole("button", { name: "Refresh" });
  expect(refreshButton).toBeInTheDocument();
});

test("select options are rendered", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1, validJob2]));
  await renderJobSelectWithRefresh();

  const allOptions: HTMLElement[] = screen.getAllByRole("option");
  expect(allOptions.length).toBe(3);
  const option1: HTMLElement = screen.getByRole("option", { name: validJob1.title + ", " + validJob1.company });
  expect(option1).toBeInTheDocument();
  const option2: HTMLElement = screen.getByRole("option", { name: validJob2.title + ", " + validJob2.company });
  expect(option2).toBeInTheDocument();
});

async function clickRefreshButton() {
  const refreshButton: HTMLElement = screen.getByRole("button", { name: "Refresh" });
  await act(async () => {
    userEvent.click(refreshButton);
  });
}

test("refresh button makes additional API call", async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([validJob1, validJob2]));
  await renderJobSelectWithRefresh();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(1);

  await clickRefreshButton();
  expect(mockFunctions.fetchData).toHaveBeenCalledTimes(2);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(
    "../api/jobs/",
    expect.objectContaining({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  );
});

test("clicking refresh button updates select options if API call returns new data", async () => {
  mockFunctions.fetchData.mockImplementationOnce(generateResponse([validJob1, validJob2]));
  await renderJobSelectWithRefresh();
  const allOptionsBefore: HTMLElement[] = screen.getAllByRole("option");
  expect(allOptionsBefore.length).toBe(3);
  const option1: HTMLElement = screen.getByRole("option", { name: validJob1.title + ", " + validJob1.company });
  expect(option1).toBeInTheDocument();
  const option2: HTMLElement = screen.getByRole("option", { name: validJob2.title + ", " + validJob2.company });
  expect(option2).toBeInTheDocument();

  mockFunctions.fetchData.mockImplementationOnce(generateResponse([validJob2]));
  await clickRefreshButton();

  const allOptionsAfter: HTMLElement[] = screen.getAllByRole("option");
  expect(allOptionsAfter.length).toBe(2);
  expect(option1).not.toBeInTheDocument();
  expect(option2).toBeInTheDocument();
});