import './custom.scss';
import 'bootstrap/dist/js/bootstrap.min.js';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routesConfig, routesBasename }  from './routesConfig';

const router = createBrowserRouter(routesConfig, {
  basename: routesBasename,
});

export default function App(): JSX.Element {
  return <RouterProvider router={router} />
}