import { screen } from '@testing-library/react';

import { routesConfig }  from './routesConfig';
import { renderRoute, testRouteAndAllChildren } from './testUtilities';


const MENU_LINKS: string[] = ['Jobs', 'Resumes'];

describe('every route displays the menu', () => {
  const theTest: (routePath: string) => void = function(routePath: string): void {
    for (const menuLink of MENU_LINKS) {
      test(`route ${routePath} displays the menu link ${menuLink}`, () => {
        renderRoute(routePath)      
        const link: HTMLElement | null = screen.queryByRole("link", {name: menuLink});
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href");
      });
    }
  }
  for (const route of routesConfig) {
    testRouteAndAllChildren(route, theTest); 
  }
});