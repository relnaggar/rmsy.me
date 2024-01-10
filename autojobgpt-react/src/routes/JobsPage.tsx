import React from "react";

import JobBoard from "../jobs/JobBoard";
import useScrollToTop from "../hooks/useScrollToTop";


const JobsPage = (): React.JSX.Element => {
  useScrollToTop();
  return (
    <JobBoard />
  );
};

export default JobsPage;