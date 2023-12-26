import React from "react";
import { Link } from "react-router-dom";


const Home = (): React.JSX.Element => {
  return (
    <>
      <h2 className="mb-3">Home</h2>
      <p className="lead">Welcome to AutoJobGPT!</p>
      <p>
        This is a simple web app that allows you to automate the process of tailoring a resume or cover letter to a job description.
      </p>
      <p>
        To get started, go to the <Link to="/jobs">Jobs</Link> page.
      </p>
    </>
  );
};

export default Home;