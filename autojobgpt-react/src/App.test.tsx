import { injectMocks, renderRoute, testRouteAndAllChildren } from "./common/testUtils";
import { routesConfig }  from "./routes/routesConfig";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
  window.scrollTo = jest.fn();
});


describe("every route renders without errors", () => {
  const theTest: (routePath: string) => void = function(routePath: string): void {
    test(`route ${routePath} renders without errors`, async () => {
      await renderRoute(routePath);
    });
  } 
  for (const route of routesConfig) {
    if (route.path !== "*") {
      testRouteAndAllChildren(route, theTest);
    }
  }
});