import { createContext } from "react";
import { RouteObject } from "react-router-dom";

import Layout from "./Layout";
import Home from "../home/Home";
import Jobs from "./Jobs";
import ResumesPage from "./ResumesPage";
import CoverLettersPage from "./CoverLettersPage";
import PageNotFound from "./PageNotFound";


export const FetchDataContext = createContext(
  (input: RequestInfo, init?: RequestInit | undefined) => Promise.resolve(new Response())
);

export const routesBasename = "/autojobgpt/app";

export const routesConfig: RouteObject[] = [{
  path: "/",
  element: (
    <FetchDataContext.Provider value={fetch}>
      <Layout />
    </FetchDataContext.Provider>
  ),
  children: [{
    path: "/",
    element: <Home />,
  }, {
    path: "/jobs",
    element: (      
      <Jobs />      
    )
  }, {
    path: "/resumes",
    element: (
      <ResumesPage />
    )
  }, {
    path: "/coverLetters",
    element: (
      <CoverLettersPage />
    )
  }, {
    path: "*",
    element: (
      <PageNotFound />
    )
  }],
}];
