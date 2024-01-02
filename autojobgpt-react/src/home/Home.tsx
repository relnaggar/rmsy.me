import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';


const Home = (): React.JSX.Element => {
  return (
    <>
      <h2 className="mb-3">Home</h2>
      <p className="lead">Welcome to AutoJobGPT!</p>
      <figure className="figure my-3 ms-3 text-center col-md-5 float-end">
        <img src="/assets/img/autojobgpt/autojobgpt.png" className="figure-img img-fluid" alt="Futuristic image depicting an AI sewing machine amidst traditional tailoring tools." />
        <figcaption className="figure-caption text-center">
          An artist's rendition of AutoJobGPT tailoring your resume.
          (Okay, the artist was DALL-E 3, but I gave it a really good prompt.)
        </figcaption>
      </figure>
      <p>
        This is a demo application (for illustrative purposes only, I swear) that allows you to:
        <ul>
          <li>
            Keep track of and manage your <Link to="/jobs">job applications</Link>.
            Like a beautiful garden, your job board will grow with each gentle click of the "Add job" button.
          </li>
          <li>
            Upload .docx templates for 
            your <Link to="/resumes">resumes</Link> and <Link to="/coverLetters">cover letters</Link> with 
            "fill fields" for job-specific information.
            Fill fields are placeholders denoted by double curly braces, e.g. <code>{"{{SKILL_THAT_MAKES_ME_LOOK_GOOD}}"}</code>,
            and the special fill fields <code>{"{{JOB_TITLE}}"}</code> and <code>{"{{COMPANY}}"}</code> will automagically link to
            the info from the job board.
          </li>
          <li>
            Use AI to tailor your resumes and cover letters to each job you apply for (powered by the dark wizardy that
            is <a href="https://openai.com/product" target="_blank" rel="noreferrer">
              the OpenAI API <BoxArrowUpRightIcon className="ms-1" />
            </a>.)
          </li>
        </ul>
      </p>
      <p>
        As you judge my worthiness as a programmer, look out for the current version's known limitations:
        <li>
          There are no user accounts, so anyone can view, edit and delete the jobs and documents.
          Keep it safe for work, people.
        </li>
        <li>
          All data is reset regularly (aka whenever I feel like it).
        </li>
        <li>
          The app only supports .docx files for the resume and cover letter templates.
          This was much harder than it sounds so please be impressed.
        </li>
        <li>
          There's a limit on the number of API calls that can be made per day.
          In other words, there's a limit on my generosity / bank account balance.
        </li>
      </p>
      <p>
        Once you've pretended to read the thrilling disclaimer below, you have my permission to 
        start exploring -- why not check out the <Link to="/jobs">job board</Link>!
      </p>
      
      <h2>Disclaimer</h2>
      <p>
        This application is a demonstration and is provided as-is for illustrative purposes only.
      </p>
      <p>
        <dl>
          <dt>No Data Protection:</dt>
          <dd>
            This demo application does not implement comprehensive data protection measures.
            Therefore, it is not intended for the submission of personal or sensitive information.
          </dd>
          <dt>Intended Use:</dt>
          <dd>
            This demo application is designed to showcase functionality and should not be used as a tool for actual job applications or for storing any sensitive personal data.
          </dd>
          <dt>Data Handling:</dt>
          <dd>
            Any data entered into this demo application may not be secure and could be subject to unauthorized access, loss, or misuse.
            The developer takes no responsibility for the security or handling of data inputted into this demo application.
          </dd>
          <dt>API Data Privacy:</dt>
          <dd>
            Any data you enter into this demo application may be sent to OpenAI, and will therefore be subject to 
            their API Platform's <a href="https://openai.com/enterprise-privacy" target="_blank" rel="noreferrer">
              data privacy policy <BoxArrowUpRightIcon className="ms-1" />
            </a>.
          </dd>
          <dt>No Liability:</dt>
          <dd>
            The developer disclaims all liability for any loss, damage, or inconvenience arising as a result of the use of this demo application.
          </dd>
        </dl>
      </p>
      
      <div className="row">
        <div className="col-md-4"></div>
        <figure className="figure my-3 text-center col-md-4">
          <img src="/assets/img/autojobgpt/job-success.png" className="figure-img img-fluid" alt="Handshake after a successful hire." />
          <figcaption className="figure-caption text-center">
            You, after using AutoJobGPT to land your dream job.
          </figcaption>
        </figure>
      </div>
    </>
  );
};

export default Home;