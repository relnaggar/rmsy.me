import { screen, getByRole } from "@testing-library/react";

import { routesConfig }  from "./routesConfig";
import { injectMocks, renderRoute, testRouteAndAllChildren } from "../common/testUtils";


beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  window.scrollTo = jest.fn();
});

const MENU_LINKS: string[] = ["Home", "Jobs", "Resumes", "Cover Letters", "API", "Admin"];

describe("every route displays the menu", () => {
  const theTest: (routePath: string) => void = function(routePath: string): void {
    for (const menuLink of MENU_LINKS) {
      test(`route ${routePath} displays the menu link ${menuLink}`, async () => {
        await renderRoute(routePath)      
        const links: HTMLElement[] = screen.getAllByRole("link", {name: RegExp(menuLink, "i")});
        expect(links.length).toBeGreaterThan(0);
      });
    }
  }
  for (const route of routesConfig) {
    if (route.path !== "*") {
      testRouteAndAllChildren(route, theTest);
    }
  }
});

describe("the 404 route displays the menu", () => {
  for (const menuLink of MENU_LINKS) {
    test(`route /404 displays the menu link ${menuLink}`, async () => {
      await renderRoute("/nonExistentRoute");
      const links: HTMLElement[] = screen.getAllByRole("link", {name: RegExp(menuLink, "i")});
      expect(links.length).toBeGreaterThan(0);
    });
  }
});

test("the 404 route displays a 404 message within main", async () => {
  await renderRoute("/nonExistentRoute");
  const main: HTMLElement = screen.getByRole("main");
  expect(main).toHaveTextContent(/404/);
});

test("the 404 route displays a link to the home page within main", async () => {
  await renderRoute("/nonExistentRoute");
  const main: HTMLElement = screen.getByRole("main");
  const link: HTMLElement = getByRole(main, "link", {name: RegExp("home", "i")});
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute("href");
});