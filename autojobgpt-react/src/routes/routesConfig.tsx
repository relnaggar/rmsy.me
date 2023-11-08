import { createContext } from "react";
import { RouteObject } from "react-router-dom";

import Layout from "./Layout";
import Home from "../home/Home";
import Jobs from "../jobs/Jobs";
import Resumes from "../resumes/Resumes";


export const FetchDataContext = createContext(
  (input: RequestInfo, init?: RequestInit | undefined) => Promise.resolve(new Response())
);

export const routesBasename = "/autojobgpt/app";

export const routesConfig: RouteObject[] = [{
  path: "/",
  element: <Layout />,
  children: [{
    path: "/",
    element: <Home />,
  }, {
    path: "/jobs",
    element: (
      <FetchDataContext.Provider value={fetch}>
        <Jobs />
      </FetchDataContext.Provider>
    )
  }, {
    path: "/resumes",
    element: (
      <FetchDataContext.Provider value={fetch}>
        <Resumes />
      </FetchDataContext.Provider>
    )
  }],
}];
