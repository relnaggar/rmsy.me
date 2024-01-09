import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';

import useAuthControl from "../hooks/useAuthControl";


const HomePage = (): React.JSX.Element => {
  const { loggedIn } = useAuthControl();

  return (
    <section>
      <h2 className="mb-3">Home</h2>
      <p className="lead">Welcome to AutoJobGPT!</p>
      <figure className="figure my-3 ms-3 text-center col-md-5 float-end">
        <img src="/assets/img/autojobgpt/autojobgpt.png" className="figure-img img-fluid" alt="Futuristic sewing machine amidst traditional tailoring tools." />
        <figcaption className="figure-caption text-center">
          The future of job applications.
        </figcaption>
      </figure>
      <p>
        This is a demo application (for illustrative purposes only, I swear) that allows you to:
      </p>
      <ul>
        <li>
          Keep track of and manage your job applications.
          Like a beautiful garden, your job board will grow with each gentle click of the "Add job" button.
        </li>
        <li>
          Upload .docx templates for your resumes and cover letters with "fill fields" for job-specific information.
          Fill fields are placeholders denoted by double curly braces, e.g. <code>{"{{SKILL_THAT_MAKES_ME_LOOK_GOOD}}"}</code>,
          and the special fill fields <code>{"{{JOB_TITLE}}"}</code> and <code>{"{{COMPANY}}"}</code> will automagically link to
          the info from the job board.
        </li>
        <li>
          Use AI to tailor your resumes and cover letters to each job you apply for (powered by dark magic 
          and <a href="https://openai.com/product" target="_blank" rel="noreferrer">
            the OpenAI API <BoxArrowUpRightIcon className="ms-1" />
          </a>.)
        </li>
      </ul>

      { loggedIn ?
        <p>
          Check out the <Link to="/jobs">job board</Link> to get started!
        </p>
      :        
        <p>
        <Link to="/login">Log in</Link> or <Link to="/signup">sign up for free</Link> to get started!
      </p>
      }
      
      <div className="row">
        <div className="col-md-4"></div>
        <figure className="figure my-3 text-center col-md-4">
          <img src="/assets/img/autojobgpt/job-success.png" className="figure-img img-fluid" alt="Handshake after a successful hire." />
          <figcaption className="figure-caption text-center">
            You, after using AutoJobGPT to land your dream job.
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

export default HomePage;