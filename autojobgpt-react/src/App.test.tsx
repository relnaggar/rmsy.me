import { injectMocks, renderRoute, testRouteAndAllChildren } from "./testUtilities";
import { routesConfig }  from "./routesConfig";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});


describe("every route renders without errors", () => {
  const theTest: (routePath: string) => void = function(routePath: string): void {
    test(`route ${routePath} renders without errors`, async () => {
      await renderRoute(routePath);
    });
  } 
  for (const route of routesConfig) {
    testRouteAndAllChildren(route, theTest);
  }
});