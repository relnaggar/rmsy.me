import React, { useState, createContext, useContext } from "react";

import { FetchDataContext } from "../routes/routesConfig";
import useResource from "../hooks/useResource";
import JobBoard from "./JobBoard";
import AddJobModal from "./AddJobModal";
import { Job, JobUpload } from "./types";


export const LoadedContext = createContext<boolean>(false);
export const RemoveJobContext = createContext<(jobId: number) => void>(() => {});
export const SetShowContext = createContext<(show: boolean) => void>(() => {});

export default function Jobs(): React.JSX.Element {
  const fetchData = useContext(FetchDataContext);

  function generatePlaceholderJob(jobUpload: JobUpload): Job {
    return {
      "id": -1,
      "url": jobUpload.url,
      "title": "",
      "company": "",
      "text": "",
      "chat_messages": [],
      "date_applied": null,
      "status": "",
      "resume_template": null,
      "chosen_resume": null,
    }
  }
  const {
    resources: jobs,
    loaded,
    removeResource: removeJob,
    addResource: addJob,
    updateResource: updateJob,
    errors
  } = useResource<Job,JobUpload>(fetchData, "../api/jobs/", generatePlaceholderJob);

  const [showAddJob, setShowAddJob] = useState<boolean>(false);

  return (
    <>
      <main>
        <RemoveJobContext.Provider value={removeJob}>
          <LoadedContext.Provider value={loaded}>
            <SetShowContext.Provider value={setShowAddJob}>
              <JobBoard jobs={jobs} updateJob={updateJob} />
            </SetShowContext.Provider>
          </LoadedContext.Provider>
        </RemoveJobContext.Provider>
      </main>
      <AddJobModal show={showAddJob} setShow={setShowAddJob} addJob={addJob} />
    </>
  );
}