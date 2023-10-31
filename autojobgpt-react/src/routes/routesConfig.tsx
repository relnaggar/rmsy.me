import { RouteObject } from "react-router-dom";

import Layout from "./Layout";
import Home from "../home/Home";
import Jobs from "../jobs/Jobs";
import Resumes from "../resumes/Resumes";


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
