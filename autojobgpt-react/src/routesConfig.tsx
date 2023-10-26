import { RouteObject } from 'react-router-dom';

import Layout from './Layout';
import Home from './Home';
import Jobs from './Jobs';
import Resumes from './Resumes';


export const routesBasename = "/autojobgpt/app";

export const routesConfig: RouteObject[] = [{
  path: "/",
  element: <Layout />,
  children: [{
    path: "/",
    element: <Home />,
  }, {
    path: "/jobs",
    element: <Jobs fetchData={fetch} />,
  }, {
    path: "/resumes",
    element: <Resumes fetchData={fetch} />,
  }],
}];
