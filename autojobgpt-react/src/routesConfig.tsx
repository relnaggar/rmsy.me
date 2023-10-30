import { RouteObject } from "react-router-dom";

import Layout from "./Layout";
import Home from "./Home";
import JobsPage from "./JobsPage";
import ResumesPage from "./ResumesPage";


export const routesBasename = "/autojobgpt/app";

export const routesConfig: RouteObject[] = [{
  path: "/",
  element: <Layout />,
  children: [{
    path: "/",
    element: <Home />,
  }, {
    path: "/jobs",
    element: <JobsPage fetchData={fetch} />,
  }, {
    path: "/resumes",
    element: <ResumesPage fetchData={fetch} />,
  }],
}];
