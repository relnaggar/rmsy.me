import { screen, getByRole, getAllByRole, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { generateConditionalResponseByRoute, generateResponse } from "../api/mockApi";
import { validResume1, validResume2, errorMessage } from "../api/mockData";
import { injectMocks, renderRoute, mockFunctions, queryResources, openAndGetDeleteModal, getSection, clickCloseButton, getDeleteButton, clickDeleteButton, getFilterByJobSelect } from "../common/testUtils";


const thisRoute = "/resumes";
const thisResource = "resume";
const thisApiPath = `../api/${thisResource}s/`;
const thisMockData = [validResume1,validResume2];

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: thisMockData,
  }]));
});

test(`api call is initially made to fetch the ${thisResource}s`, async () => {
  await renderRoute(thisRoute);
  expect(mockFunctions.fetchData).toHaveBeenCalledWith(thisApiPath,
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
    })
  );
});

test(`empty api call means no ${thisResource} list items are displayed`, async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderRoute(thisRoute);
  const resources: HTMLElement[] = queryResources(thisResource);
  expect(resources.length).toBe(0);
});


test(`api general error on fetching ${thisResource} list items shows an error alert within the list`, async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath, data: {error: [errorMessage]}, status: 500
  }]));
  await renderRoute(thisRoute);
  const listSection: HTMLElement = getSection(thisResource);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});

test(`api network error on fetching ${thisResource} list items shows an error alert within the list`, async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath, reject: true
  }]));
  await renderRoute(thisRoute);
  const listSection: HTMLElement = getSection(thisResource);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});

test(`all ${thisResource} list items are initially fetched from the server`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
  expect(resourceElements.length).toBe(thisMockData.length);
});

test(`each ${thisResource} list item is displayed with its name`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
  resourceElements.forEach((resourceElement, index: number) => {
    expect(resourceElement).toHaveTextContent(thisMockData[index].name);
  });
});

test(`each ${thisResource} list item is displayed with its image`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
  resourceElements.forEach((resourceElement, index: number) => {
    expect(resourceElement.querySelector("img")?.src).toBe(thisMockData[index].png);
  });
});

test(`each ${thisResource} list item is displayed with an edit button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
  resourceElements.forEach((resourceElement) => {
    const editButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("edit", "i")});
    expect(editButton).toBeInTheDocument();
  });
});

test(`each ${thisResource} list item is displayed with a delete button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
  resourceElements.forEach((resourceElement) => {
    const deleteButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("delete", "i")});
    expect(deleteButton).toBeInTheDocument();
  });
});

test(`each ${thisResource} list item is displayed with a download button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisResource);
  resourceElements.forEach((resourceElement, index: number) => {
    const downloadButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("download", "i")});
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute("href", thisMockData[index].docx);
    expect(downloadButton).toHaveAttribute("download");
  });
});

test(`confirm delete modal for ${thisRoute} isn't visible before clicking delete button`, async () => {
  await renderRoute(thisRoute);
  expect(screen.queryByRole("dialog", {name: new RegExp("confirm delete", "i")})).not.toBeInTheDocument();
});

describe(`clicking the delete button for each ${thisResource} list item displays the confirm delete modal within 1 second`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} displays the confirm delete modal within 1 second`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i], 1000);
      expect(deleteModal).toBeInTheDocument();
    });
  }
});

describe(`each ${thisResource} confirm delete modal asks are you sure`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].name} asks are you sure`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      expect(deleteModal).toHaveTextContent(new RegExp("are you sure", "i"));
    });
  }
});

describe(`confirm delete modal for each ${thisResource} list item has a close button`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].name} has a close button`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      const closeButtons: HTMLElement[] = getAllByRole(deleteModal, "button", {name: new RegExp("close", "i")});
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
});

describe(`clicking the close button for each ${thisResource} confirm delete modal closes the modal within 1 second`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the close button for ${thisMockData[i].name} closes the modal within 1 second`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickCloseButton(deleteModal);
      await waitFor(() => {expect(deleteModal).not.toBeInTheDocument();}, {timeout: 1000});
    });
  }
});

describe(`confirm delete modal for each ${thisResource} list item has a delete button`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].name} has a delete button`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      const deleteButton: HTMLElement = getDeleteButton(deleteModal);
      expect(deleteButton).toBeInTheDocument();
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal makes an api call`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} makes an api call`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
      await clickDeleteButton(deleteModal);
      expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal makes an api call to delete the resource`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} makes an api call to delete the resource`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisApiPath}${thisMockData[i].id}/`,
        expect.objectContaining({
          method: "DELETE"
        }
      ));
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal closes the modal within 1 second`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} closes the modal within 1 second`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      await waitFor(() => {expect(deleteModal).not.toBeInTheDocument();}, {timeout: 1000});
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal removes a resource from the list`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} removes the resource from the list`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      const resourceElementsAfterDelete: HTMLElement[] = queryResources(thisResource);
      expect(resourceElementsAfterDelete.length).toBe(thisMockData.length - 1);
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal removes the correct resource from the list`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} removes the correct resource from the list`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      const resourceElementsAfterDelete: HTMLElement[] = queryResources(thisResource);
      resourceElementsAfterDelete.forEach((resourceElement) => {
        expect(resourceElement).not.toHaveTextContent(thisMockData[i].name);
      });
    });
  }
});

describe(`api general error on clicking the delete button for each ${thisResource} confirm delete modal an error alert within the list`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`api general error on clicking the delete button for ${thisMockData[i].name} an error alert within the list`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, data: {error: [errorMessage]}, status: 500
      }]));
      await clickDeleteButton(deleteModal);
      const listSection: HTMLElement = getSection(thisResource);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});

describe(`api general error on clicking the delete button for each ${thisResource} confirm delete modal an error alert within the list`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`api general error on clicking the delete button for ${thisMockData[i].name} an error alert within the list`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisResource);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, reject: true
      }]));
      await clickDeleteButton(deleteModal);
      const listSection: HTMLElement = getSection(thisResource);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});

test("filter by job select box doesn't appear when all resumes are linked to the same job", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: [validResume1, {
      ...validResume2,
      job: validResume1.job,
      name: validResume1.job.title + ", " + validResume1.job.company + ", " + 2
    }],
  }]));
  await renderRoute(thisRoute);
  expect(screen.queryByRole('combobox', {name: new RegExp("filter by job", "i")})).not.toBeInTheDocument();
});

test("filter by job select box appears when there are resumes linked to 2 different jobs", async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: [validResume1, validResume2],
  }]));
  await renderRoute(thisRoute);
  const filterByJob: HTMLElement = getFilterByJobSelect();
  expect(filterByJob).toBeInTheDocument();
});

test("filter by job select box has an option for each job", async () => {
  await renderRoute(thisRoute);
  const filterByJob: HTMLElement = getFilterByJobSelect();
  const filterByJobOptions: HTMLElement[] = getAllByRole(filterByJob, "option");
  expect(filterByJobOptions.length).toBe(thisMockData.length + 1);
});

test("filter by job select box has an option for each job with the correct name", async () => {
  const resumes = [validResume1, validResume2];
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: resumes,
  }]));
  await renderRoute(thisRoute);
  const filterByJob: HTMLElement = getFilterByJobSelect();
  const filterByJobOptions: HTMLElement[] = getAllByRole(filterByJob, "option");
  for (let i = 1; i < filterByJobOptions.length; i++) {
    expect(filterByJobOptions[i]).toHaveTextContent(resumes[i-1].job.title);
  }
});

test("clicking each filter by job select box option filters the list by job", async () => {
  await renderRoute(thisRoute);
  const filterByJob: HTMLElement = getFilterByJobSelect();
  const filterByJobOptions: HTMLOptionElement[] = getAllByRole(filterByJob, "option");
  for (let i = 1; i < filterByJobOptions.length; i++) {
    await act(async () => {
      userEvent.selectOptions(filterByJob, filterByJobOptions[i].value);
    });
    const resourceElements: HTMLElement[] = queryResources(thisResource);
    const filteredResumes = thisMockData.filter((resume) => resume.job.id === i);
    expect(resourceElements.length).toBe(filteredResumes.length);
  }
});