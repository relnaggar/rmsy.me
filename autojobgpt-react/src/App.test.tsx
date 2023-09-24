import { renderRoute, testRouteAndAllChildren } from './testUtilities';
import { routesConfig }  from './routesConfig';


describe('every route renders without errors', () => {
  const theTest: (routePath: string) => void = function(routePath: string): void {
    test(`route ${routePath} renders without errors`, () => {
      renderRoute(routePath)
    });
  } 
  for (const route of routesConfig) {
    testRouteAndAllChildren(route, theTest);
  }
});