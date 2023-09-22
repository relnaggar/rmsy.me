import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routesConfig, routesBasename }  from './routesConfig';

test('renders title', () => {
  const router = createMemoryRouter(routesConfig, {
    initialEntries: [routesBasename],
    basename: routesBasename,
  });
  render(<RouterProvider router={router} />);

  const linkElement = screen.getByText(/autojobgpt/i);
  expect(linkElement).toBeInTheDocument();
});