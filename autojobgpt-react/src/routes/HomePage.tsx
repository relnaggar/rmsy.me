import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { LoggedInContext } from "./Layout";
import useScrollToTop from "../hooks/useScrollToTop";


const HomePage = (): React.JSX.Element => {
  useScrollToTop();
  const loggedIn = useContext(LoggedInContext);

  return (
    <section>
      <h2 className="mb-3">Home</h2>
      <p className="lead">🚀 Welcome to AutoJobGPT, Your Job-Application Superhero!</p>
      <figure className="figure my-3 ms-3 text-center col-md-5 float-end">
        <img src="/assets/img/autojobgpt/autojobgpt.png" className="figure-img img-fluid" alt="Futuristic sewing machine amidst traditional tailoring tools." />
        <figcaption className="figure-caption text-center">
          The future of job applications.
        </figcaption>
      </figure>
      <p>
        Optimise your job-hunting adventure!
        AutoJobGPT uses cutting-edge AI to help you automate the tedious parts of the job application process.
        Let the machines lend a hand so you can focus more on what matters: getting hired.
      </p>
      <dl>
        <dt>🌱 Cultivate Your Job Board</dt>
        <dd>
          Keep track of and manage your job applications with ease.
          Like a beautiful garden, your job board will grow with each gentle click of the "Add job" button.
        </dd>
        <dt>📝 Resume & Cover Letter Alchemy</dt>
        <dd>
          Spending hours tailoring your application to each job you apply for?
          Or even worse, spamming the same generic application and hoping for the best?
          Upload your .docx templates and use our 'fill field' magic to streamline the whole process.
          Just sprinkle in a few placeholders
          like <code>{"{{RELEVANT_SKILL}}"}</code> or <code>{"{{QUANTIFIED_ACHIEVEMENT}}"}</code> and
          our alchemy engine will do the rest.
        </dd>
        <dt>🧙‍♂️ AI-Powered Tailoring</dt>
        <dd>
          Wave goodbye to application anxiety.
          Powered by the dark sorcery of OpenAI, AutoJobGPT will generate a unique resume and cover letter for each job you apply for.
          Never worry about a job application again!
        </dd>
        { loggedIn ?
          <>
            <dt>🌟 Ready to get started?</dt>
            <dd>
              Head over to your <Link to="/jobs">job board</Link> to begin!
            </dd>
          </>
        :  
          <>
            <dt>🌟 100% Free, No Email Required</dt>      
            <dd>
              <Link to="/signup" className="btn btn-success text-white">
                Sign up for free
              </Link> and transform the way you apply for jobs!
            </dd>
          </>
        }
      </dl>
      
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