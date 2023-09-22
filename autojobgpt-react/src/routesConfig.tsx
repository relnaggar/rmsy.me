import Layout from './Layout';
import Jobs from './Jobs';
import Resumes from './Resumes';
import { RouteObject } from 'react-router-dom';

export const routesBasename = "/autojobgpt/app";

export const routesConfig: RouteObject[] = [{
  path: "/",
  element: <Layout />,
  children: [{
    path: "/",
    element: <Jobs />,
  }, {
    path: "/resumes",
    element: <Resumes />,
  }],
}];
