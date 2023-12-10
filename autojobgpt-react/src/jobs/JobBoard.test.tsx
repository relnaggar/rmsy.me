import { screen, getByRole, getAllByRole, waitFor, queryByRole } from "@testing-library/react";

import { generateConditionalResponseByRoute, generateResponse } from "../api/mockApi";
import { errorMessage, validStatus1, validStatus2, validStatus3 } from "../api/mockData";
import { injectMocks, renderRoute, mockFunctions, queryResources, openAndGetDeleteModal, getSection, clickCloseButton, getDeleteButton, clickDeleteButton, getMoveRightButton, getMoveLeftButton, clickMoveRightButton, clickMoveLeftButton } from "../common/testUtils";


const thisRoute = "/jobs";
const thisResource = "job board column";
const thisHeadingLabel = "job board";
const thisApiPath = `../api/statuses/`;
const thisMockData = [validStatus1, validStatus2, validStatus3];

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

test(`empty api call means no ${thisResource}s are displayed`, async () => {
  mockFunctions.fetchData.mockImplementation(generateResponse([]));
  await renderRoute(thisRoute);
  const resources: HTMLElement[] = queryResources(thisHeadingLabel, "region");
  expect(resources.length).toBe(0);
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
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
  expect(resourceElements.length).toBe(thisMockData.length);
});

test(`each ${thisResource} is displayed with its name`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
  resourceElements.forEach((resourceElement, index: number) => {
    expect(resourceElement).toHaveTextContent(thisMockData[index].name);
  });
});

test(`each ${thisResource} is displayed with an edit button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
  resourceElements.forEach((resourceElement) => {
    const editButton: HTMLElement = getByRole(resourceElement, "button", {name: new RegExp("edit", "i")});
    expect(editButton).toBeInTheDocument();
  });
});

test(`each ${thisResource} is displayed with a delete button`, async () => {
  await renderRoute(thisRoute);
  const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
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
    test(`clicking the delete button for ${thisMockData[i].name} displays the confirm delete modal within 1 second`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i], 1000);
      expect(deleteModal).toBeInTheDocument();
    });
  }
});

describe(`each ${thisResource} confirm delete modal asks are you sure`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].name} asks are you sure`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      expect(deleteModal).toHaveTextContent(new RegExp("are you sure", "i"));
    });
  }
});

describe(`confirm delete modal for each ${thisResource} has a close button`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].name} has a close button`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
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
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickCloseButton(deleteModal);
      await waitFor(() => {expect(deleteModal).not.toBeInTheDocument();}, {timeout: 1000});
    });
  }
});

describe(`confirm delete modal for each ${thisResource} has a delete button`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`confirm delete modal for ${thisMockData[i].name} has a delete button`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
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
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
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
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
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
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      await waitFor(() => {expect(deleteModal).not.toBeInTheDocument();}, {timeout: 1000});
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal removes a ${thisResource}`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} removes the ${thisResource}`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      const resourceElementsAfterDelete: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      expect(resourceElementsAfterDelete.length).toBe(thisMockData.length - 1);
    });
  }
});

describe(`clicking the delete button for each ${thisResource} confirm delete modal removes the correct ${thisResource}`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`clicking the delete button for ${thisMockData[i].name} removes the correct ${thisResource}`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const deleteModal: HTMLElement = await openAndGetDeleteModal(resourceElements[i]);
      await clickDeleteButton(deleteModal);
      const resourceElementsAfterDelete: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      resourceElementsAfterDelete.forEach((resourceElement) => {
        expect(resourceElement).not.toHaveTextContent(thisMockData[i].name);
      });
    });
  }
});

describe(`api general error on clicking the delete button for each ${thisResource} confirm delete modal shows an error alert`, () => {
  for (let i = 0; i < thisMockData.length; i++) {
    test(`api general error on clicking the delete button for ${thisMockData[i].name} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
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
    test(`api general error on clicking the delete button for ${thisMockData[i].name} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
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

test(`first ${thisResource} has a move right button`, async () => {
  await renderRoute(thisRoute);
  const firstResource: HTMLElement = queryResources(thisHeadingLabel, "region")[0];
  const moveRightButton: HTMLElement = getMoveRightButton(firstResource);
  expect(moveRightButton).toBeInTheDocument();  
});

test(`first ${thisResource} doesn't have a move left button`, async () => {
  await renderRoute(thisRoute);
  const firstResource: HTMLElement = queryResources(thisHeadingLabel, "region")[0];
  expect(queryByRole(firstResource, "button", {name: new RegExp("left", "i")})).not.toBeInTheDocument();
});

test(`last ${thisResource} has a move left button`, async () => {
  await renderRoute(thisRoute);
  const lastResource: HTMLElement = queryResources(thisHeadingLabel, "region")[thisMockData.length - 1];
  const moveLeftButton: HTMLElement = getByRole(lastResource, "button", {name: new RegExp("left", "i")});
  expect(moveLeftButton).toBeInTheDocument();  
});

test(`last ${thisResource} doesn't have a move right button`, async () => {
  await renderRoute(thisRoute);
  const lastResource: HTMLElement = queryResources(thisHeadingLabel, "region")[thisMockData.length - 1];
  expect(queryByRole(lastResource, "button", {name: new RegExp("right", "i")})).not.toBeInTheDocument(); 
});

describe(`middle ${thisResource}s have a move right button`, () => {
  for (let i = 1; i < thisMockData.length - 1; i++) {
    test(`middle ${thisResource} ${i+1} has a move right button`, async () => {
      await renderRoute(thisRoute);
      const middleResource: HTMLElement = queryResources(thisHeadingLabel, "region")[i];
      const moveRightButton: HTMLElement = getMoveRightButton(middleResource);
      expect(moveRightButton).toBeInTheDocument();  
    });
  }
});

describe(`middle ${thisResource}s have a move left button`, () => {
  for (let i = 1; i < thisMockData.length - 1; i++) {
    test(`middle ${thisResource} ${i+1} has a move left button`, async () => {
      await renderRoute(thisRoute);
      const middleResource: HTMLElement = queryResources(thisHeadingLabel, "region")[i];
      const moveLeftButton: HTMLElement = getMoveLeftButton(middleResource);
      expect(moveLeftButton).toBeInTheDocument();  
    });
  }
});

describe(`clicking the move right button for each ${thisResource} makes an api call`, () => {
  for (let i = 0; i < thisMockData.length - 1; i++) {
    test(`clicking the move right button for ${thisMockData[i].name} makes an api call`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
      await clickMoveRightButton(resourceElements[i]);
      expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
    });
  }
});

describe(`clicking the move left button for each ${thisResource} makes an api call`, () => {
  for (let i = 1; i < thisMockData.length; i++) {
    test(`clicking the move left button for ${thisMockData[i].name} makes an api call`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      const initialFetchDataCalls: number = mockFunctions.fetchData.mock.calls.length;
      await clickMoveLeftButton(resourceElements[i]);
      expect(mockFunctions.fetchData.mock.calls.length).toBe(initialFetchDataCalls + 1);
    });
  }
});

describe(`clicking the move right button for each ${thisResource} makes an api call to move the ${thisResource} right`, () => {
  for (let i = 0; i < thisMockData.length - 1; i++) {
    test(`clicking the move right button for ${thisMockData[i].name} makes an api call to move the ${thisResource} right`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      await clickMoveRightButton(resourceElements[i]);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisApiPath}${thisMockData[i].id}/`,
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining(`\"order\":${thisMockData[i].order + 1}`),
        }
      ));
    });
  }
});

describe(`clicking the move left button for each ${thisResource} makes an api call to move the ${thisResource} left`, () => {
  for (let i = 1; i < thisMockData.length; i++) {
    test(`clicking the move left button for ${thisMockData[i].name} makes an api call to move the ${thisResource} left`, async () => {
      await renderRoute(thisRoute);
      const resourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      await clickMoveLeftButton(resourceElements[i]);
      expect(mockFunctions.fetchData).toHaveBeenLastCalledWith(`${thisApiPath}${thisMockData[i].id}/`,
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining(`\"order\":${thisMockData[i].order - 1}`),
        }
      ));
    });
  }
});

describe(`clicking the move right button for each ${thisResource} moves the ${thisResource} right`, () => {
  for (let i = 0; i < thisMockData.length - 1; i++) {
    test(`clicking the move right button for ${thisMockData[i].name} moves the ${thisResource} right`, async () => {
      await renderRoute(thisRoute);
      const initialResourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...thisMockData[i], order: thisMockData[i].order + 1}));
      await clickMoveRightButton(initialResourceElements[i]);
      const resourceElementsAfterMove: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      expect(resourceElementsAfterMove[i]).toHaveTextContent(thisMockData[i+1].name);
      expect(resourceElementsAfterMove[i+1]).toHaveTextContent(thisMockData[i].name);
    });
  }
});

describe(`clicking the move left button for each ${thisResource} moves the ${thisResource} left`, () => {
  for (let i = 1; i < thisMockData.length; i++) {
    test(`clicking the move left button for ${thisMockData[i].name} moves the ${thisResource} left`, async () => {
      await renderRoute(thisRoute);
      const initialResourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      mockFunctions.fetchData.mockImplementationOnce(generateResponse({...thisMockData[i], order: thisMockData[i].order - 1}));
      await clickMoveLeftButton(initialResourceElements[i]);
      const resourceElementsAfterMove: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      expect(resourceElementsAfterMove[i]).toHaveTextContent(thisMockData[i-1].name);
      expect(resourceElementsAfterMove[i-1]).toHaveTextContent(thisMockData[i].name);
    });
  }
});

describe(`api general error on clicking the move right button for each ${thisResource} shows an error alert`, () => {
  for (let i = 0; i < thisMockData.length - 1; i++) {
    test(`api general error on clicking the move right button for ${thisMockData[i].name} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const initialResourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      mockFunctions.fetchData.mockImplementationOnce(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, data: {error: [errorMessage]}, status: 500
      }]));
      await clickMoveRightButton(initialResourceElements[i]);
      const listSection: HTMLElement = getSection(thisHeadingLabel);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});

describe(`api network error on clicking the move right button for each ${thisResource} shows an error alert`, () => {
  for (let i = 0; i < thisMockData.length - 1; i++) {
    test(`api network error on clicking the move right button for ${thisMockData[i].name} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const initialResourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      mockFunctions.fetchData.mockImplementationOnce(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, reject: true
      }]));
      await clickMoveRightButton(initialResourceElements[i]);
      const listSection: HTMLElement = getSection(thisHeadingLabel);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});

describe(`api general error on clicking the move left button for each ${thisResource} shows an error alert`, () => {
  for (let i = 1; i < thisMockData.length; i++) {
    test(`api general error on clicking the move left button for ${thisMockData[i].name} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const initialResourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      mockFunctions.fetchData.mockImplementationOnce(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, data: {error: [errorMessage]}, status: 500
      }]));
      await clickMoveLeftButton(initialResourceElements[i]);
      const listSection: HTMLElement = getSection(thisHeadingLabel);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});

describe(`api network error on clicking the move left button for each ${thisResource} shows an error alert`, () => {
  for (let i = 1; i < thisMockData.length; i++) {
    test(`api network error on clicking the move left button for ${thisMockData[i].name} shows an error alert`, async () => {
      await renderRoute(thisRoute);
      const initialResourceElements: HTMLElement[] = queryResources(thisHeadingLabel, "region");
      mockFunctions.fetchData.mockImplementationOnce(generateConditionalResponseByRoute([{
        url: `${thisApiPath}${thisMockData[i].id}/`, reject: true
      }]));
      await clickMoveLeftButton(initialResourceElements[i]);
      const listSection: HTMLElement = getSection(thisHeadingLabel);
      const errorAlert: HTMLElement = getByRole(listSection, "alert");
      expect(errorAlert).toBeInTheDocument();
    });
  }
});