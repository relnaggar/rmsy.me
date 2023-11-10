import { queryByRole } from "@testing-library/react";

import { STATUSES } from "./JobBoard";
import { renderThisRoute, getKanbanColumn, getAddJobButton } from "./jobTestUtils";
import { injectMocks } from "../common/testUtils";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

describe("columns except the backlog column do not have an add job button", () => {
  for (const status of STATUSES) {
    if (status.toLowerCase() !== "backlog") {
      test(`column ${status} does not have an add job button`, async () => {
        await renderThisRoute();
        const column: HTMLElement = getKanbanColumn(status);
        expect(queryByRole(column, "button", {name: new RegExp("add job", "i")})).not.toBeInTheDocument();
      });
    }
  }
});
  
test("backlog column has an add job button", async () => {
  await renderThisRoute();
  const addJobButton: HTMLElement = getAddJobButton();
  expect(addJobButton).toBeInTheDocument();
});