import { screen, getByRole, getAllByRole, waitFor } from "@testing-library/react";

import { injectMocks, renderRoute, mockFunctions, queryResources, getSection, openAndGetDeleteModal, clickCloseButton, getDeleteButton, clickDeleteButton, dragJob, getJobByTitleCompany, getColumnByName } from "../common/testUtils";
import { generateResponse, generateConditionalResponseByRoute } from "../api/mockApi";
import { validJob1, validJob2, validStatus1, validStatus2, errorMessage } from "../api/mockData";


const thisApiPath = `../api/jobs/`;
const thisAllMockData = {
  jobs: [validJob1, validJob2],
  statuses: [validStatus1, validStatus2],
}
const thisMockData = thisAllMockData.jobs;
const thisRoute = "/jobs";
const thisResource = "job";
const thisHeadingLabel = "job board";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: thisAllMockData.jobs,
  }, {
    url: "../api/statuses/",
    data: thisAllMockData.statuses,
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

test(`empty api call means no ${thisResource}s are displayed`, async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderRoute(thisRoute);
  const jobs: HTMLElement[] = queryResources(thisHeadingLabel)
  expect(jobs.length).toBe(0);
});

test(`api general error on fetching ${thisResource}s shows an error alert`, async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath, data: {error: [errorMessage]}, status: 500
  }]));
  await renderRoute(thisRoute);
  const listSection: HTMLElement = getSection(thisHeadingLabel);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});

test(`api network error on fetching ${thisResource}s shows an error alert`, async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath, reject: true
  }]));
  await renderRoute(thisRoute);
  const listSection: HTMLElement = getSection(thisHeadingLabel);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});

test(`all ${thisResource}s are initially fetched from the server`, async () => {
  await renderRoute(thisRoute);
  const jobs: HTMLElement[] = queryResources(thisHeadingLabel);
  expect(jobs.length).toBe(2);
});

test(`each ${thisResource} is displayed with its title`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
  resourceElements.forEach((resourceElement, index: number) => {
    expect(resourceElement).toHaveTextContent(thisMockData[index].title);
  });
});

test(`each ${thisResource} is displayed with its company`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
  resourceElements.forEach((resourceElement, index: number) => {
    expect(resourceElement).toHaveTextContent(thisMockData[index].company);
  });
});

test(`each ${thisResource} has a link to its url`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
  resourceElements.forEach((resourceElement, index: number) => {
    const link: HTMLElement = getByRole(resourceElement, "link");
    expect(link).toHaveAttribute("href", thisMockData[index].url);
  });
});

test(`each ${thisResource} is displayed with an edit button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
  resourceElements.forEach((resourceElement) => {
    const editButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("edit", "i")});
    expect(editButton).toBeInTheDocument();
  });
});

test(`each ${thisResource} is displayed with a delete button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
  resourceElements.forEach((resourceElement) => {
    const deleteButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("delete", "i")});
    expect(deleteButton).toBeInTheDocument();
  });
});

test(`confirm delete modal for ${thisRoute} isn't visible before clicking delete button`, async () => {
  await renderRoute(thisRoute);
  expect(screen.queryByRole("dialog", {name: new RegExp("confirm delete", "i")})).not.toBeInTheDocument();
});

describe(`clicking the delete button for each ${thisResource} displays the confirm delete modal within 1 second`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].title} displays the confirm delete modal within 1 second`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i], 1000);
      expect(deleteModal).toBeInTheDocument();
    });
  }
});

describe(`each ${thisResource} confirm delete modal asks are you sure`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].title} asks are you sure`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      expect(deleteModal).toHaveTextContent(new RegExp("are you sure", "i"));
    });
  }
});

describe(`confirm delete modal for each ${thisResource} has a close button`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].title} has a close button`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      const closeButtons: HTMLElement[] = getAllByRole(deleteModal, "button", {name: new RegExp("close", "i")});
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  }
});

describe(`clicking the close button for each ${thisResource} confirm delete modal closes the modal within 1 second`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the close button for ${thisMockData[i].title} closes the modal within 1 second`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickCloseButton(deleteModal);
      await waitFor(() => {expect(deleteModal).not.toBeInTheDocument();}, {timeout: 1000});
    });
  }
});

describe(`confirm delete modal for each ${thisResource} has a delete button`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].title} has a delete button`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      const deleteButton: HTMLElement = getDeleteButton(deleteModal);
      expect(deleteButton).toBeInTheDocument();
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal makes an api call`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].title} makes an api call`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
      await clickDeleteButton(deleteModal);
      expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal makes an api call to delete the resource`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].title} makes an api call to delete the resource`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
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
    test(`clicking the delete button for ${thisMockData[i].title} closes the modal within 1 second`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      await waitFor(() => {expect(deleteModal).not.toBeInTheDocument();}, {timeout: 1000});
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal removes a ${thisResource}`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].title} removes the ${thisResource}`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      const resourceElementsAfterDelete: HTMLElement[] = queryResources(thisHeadingLabel);
      expect(resourceElementsAfterDelete.length).toBe(thisMockData.length - 1);
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal removes the correct ${thisResource}`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].title} removes the correct ${thisResource}`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      const resourceElementsAfterDelete: HTMLElement[] = queryResources(thisHeadingLabel);
      resourceElementsAfterDelete.forEach((resourceElement) => {
        expect(resourceElement).not.toHaveTextContent(thisMockData[i].title);
      });
    });
  }
});

describe(`api general error on clicking the delete button for each ${thisResource} confirm delete modal shows an error alert`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`api general error on clicking the delete button for ${thisMockData[i].title} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, data: {error: [errorMessage]}, status: 500
      }]));
      await clickDeleteButton(deleteModal);
      const listSection: HTMLElement = getSection(thisHeadingLabel);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});

describe(`api general error on clicking the delete button for each ${thisResource} confirm delete modal shows an error alert`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`api general error on clicking the delete button for ${thisMockData[i].title} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel);
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, reject: true
      }]));
      await clickDeleteButton(deleteModal);
      const listSection: HTMLElement = getSection(thisHeadingLabel);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});

test(`each ${thisResource} is displayed under the correct column`, async () => {
  await renderRoute(thisRoute);
  thisMockData.forEach((job) => {
    const status = thisAllMockData.statuses.find((status) => status.id === job.status)!;
    const columnElement: HTMLElement = getColumnByName(status.name);
    const jobElement: HTMLElement = getJobByTitleCompany(job.title, job.company);
    expect(columnElement).toContainElement(jobElement);
  });
});

test(`each ${thisResource} is displayed under the correct column when the column order is changed`, async () => {
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: thisApiPath,
    data: thisAllMockData.jobs.reverse(),
  }, {
    url: "../api/statuses/",
    data: thisAllMockData.statuses,
  }]));
  await renderRoute(thisRoute);
  thisMockData.forEach((job) => {
    const status = thisAllMockData.statuses.find((status) => status.id === job.status)!;
    const columnElement: HTMLElement = getColumnByName(status.name);
    const jobElement: HTMLElement = getJobByTitleCompany(job.title, job.company);
    expect(columnElement).toContainElement(jobElement);
  });
});

test(`dragging a ${thisResource} from one column to makes an api call`, async () => {
  await renderRoute(thisRoute);
  const jobElement: HTMLElement = getJobByTitleCompany(validJob1.title, validJob1.company);
  const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
  await dragJob(jobElement, validStatus2.name);
  expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
});

test(`dragging a ${thisResource} from one column to makes an api call to update the ${thisResource}`, async () => {
  await renderRoute(thisRoute);
  const jobElement: HTMLElement = getJobByTitleCompany(validJob1.title, validJob1.company);
  await dragJob(jobElement, validStatus2.name);
  expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisApiPath}${validJob1.id}/`,
    expect.objectContaining({
      method: "PATCH",
      body: expect.stringContaining(`\"status\":${validStatus2.id}`)
    }
  ));
});

test(`dragging a ${thisResource} from one column to another column moves the ${thisResource}`, async () => {
  await renderRoute(thisRoute);
  const jobElement: HTMLElement = getJobByTitleCompany(validJob1.title, validJob1.company);
  mockFunctions.fetchData.mockImplementationOnce(generateResponse({...validJob1, status: validStatus2.id}));
  await dragJob(jobElement, validStatus2.name);
  const newColumnElement: HTMLElement = getColumnByName(validStatus2.name);
  const jobElementAfterDrag: HTMLElement = getJobByTitleCompany(validJob1.title, validJob1.company);
  expect(newColumnElement).toContainElement(jobElementAfterDrag);
});

test(`api general error on dragging a ${thisResource} shows an error alert`, async () => {
  await renderRoute(thisRoute);
  const jobElement: HTMLElement = getJobByTitleCompany(validJob1.title, validJob1.company);
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: `${thisApiPath}${validJob1.id}/`, data: {error: [errorMessage]}, status: 500
  }]));
  await dragJob(jobElement, validStatus2.name);
  const listSection: HTMLElement = getSection(thisHeadingLabel);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});

test(`api network error on dragging a ${thisResource} shows an error alert`, async () => {
  await renderRoute(thisRoute);
  const jobElement: HTMLElement = getJobByTitleCompany(validJob1.title, validJob1.company);
  mockFunctions.fetchData.mockImplementation(generateConditionalResponseByRoute([{
    url: `${thisApiPath}${validJob1.id}/`, reject: true
  }]));
  await dragJob(jobElement, validStatus2.name);
  const listSection: HTMLElement = getSection(thisHeadingLabel);
  const errorAlert: HTMLElement = getByRole(listSection, "alert");
  expect(errorAlert).toBeInTheDocument();
});