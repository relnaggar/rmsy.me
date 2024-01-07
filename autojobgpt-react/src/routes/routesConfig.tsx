import { createContext } from "react";
import { RouteObject } from "react-router-dom";

import Layout from "./Layout";
import HomePage from "./HomePage";
import JobsPage from "./JobsPage";
import ResumesPage from "./ResumesPage";
import CoverLettersPage from "./CoverLettersPage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import LegalPage from "./LegalPage";
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
    element: <HomePage />,
  }, {
    path: "/jobs",
    element: (      
      <JobsPage />      
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
    path: "/login",
    element: (
      <LoginPage />
    )
  }, {
    path: "/signup",
    element: (
      <SignupPage />
    )
  }, {
    path: "/legal",
    element: (
      <LegalPage />
    )
  }, {
    path: "*",
    element: (
      <PageNotFound />
    )
  }],
}];
