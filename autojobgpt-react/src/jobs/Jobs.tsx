import React, { useState, useEffect, createContext } from "react";

import JobBoard from "./JobBoard";
import AddJobModal from "./AddJobModal";
import { Job } from "./types";


export const LoadedContext = createContext<boolean>(false);
export const RemoveJobContext = createContext<(jobId: number) => void>(() => {});

export default function Jobs({ fetchData }: {
  fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
}): React.JSX.Element {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [addedJob, setAddedJob] = useState<Job | null>(null);
  const [removedJobId, setRemovedJobId] = useState<number>(-1);
  const [updatedJobId, setUpdatedJobId] = useState<number>(-1);
  const [updatedJobStatus, setUpdatedJobStatus] = useState<string>("");

  useEffect(() => {
    async function getJobs(): Promise<void> {
      await fetchData("../api/jobs/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => response.json())
        .then((data) => setJobs(data))
        .catch((error) => console.error("Error:", error))
        .finally(() => setLoaded(true));
    }
    getJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addJob(url: string): void {
    const placeholderJob: Job = {
      "id": -1,
      "url": url,
      "title": "",
      "company": "",
      "text": "",
      "chat_messages": [],
      "date_applied": null,
      "status": "",
      "resume_template": null,
      "chosen_resume": null,
    }
    setJobs([...jobs, placeholderJob]);
    setAddedJob(placeholderJob);
  };

  useEffect(() => {
    async function postJob(): Promise<void> {
      return await fetchData("../api/jobs/", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "url": addedJob?.url,
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        setJobs([
          ...jobs.filter((job) => job.id !== -1),
          data
        ]);
        setAddedJob(null);
      })
      .catch((error) => console.error("Error:", error));
    }
    if (addedJob) {
      postJob();
    }
  }, [addedJob]); // eslint-disable-line react-hooks/exhaustive-deps

  function removeJob(jobId: number): void {
    setJobs(jobs.filter((job) => job.id !== jobId));
    setRemovedJobId(jobId);
  }

  useEffect(() => {
    async function deleteJob(): Promise<void> {
      return await fetchData(`../api/jobs/${removedJobId}/`, { 
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        if (response.status === 204) {
          setRemovedJobId(-1);
        }
      })
      .catch((error) => console.error("Error:", error));
    }
    if (removedJobId >= 0) {
      deleteJob();
    }
  }, [removedJobId]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateJobStatus(jobId: number, status: string): void {
    setJobs(jobs.map((job) => {
      if (job.id === jobId) {
        job.status = status;
      }
      return job;
    }));    
    setUpdatedJobStatus(status);
    setUpdatedJobId(jobId);
  }

  useEffect(() => {
    async function updateJob(updatedJobId: number, updatedJobStatus: string): Promise<void> {
      await fetchData(`../api/jobs/${updatedJobId}/`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "status": updatedJobStatus,
        }),
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => {
        setUpdatedJobId(-1);
        setUpdatedJobStatus("");
      });
    }
    if (updatedJobId >= 0) {
      updateJob(updatedJobId, updatedJobStatus);
    }
  }, [updatedJobId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <main>
        <RemoveJobContext.Provider value={removeJob}>
          <LoadedContext.Provider value={loaded}>
            <JobBoard jobs={jobs} updateJobStatus={updateJobStatus} />
          </LoadedContext.Provider>
        </RemoveJobContext.Provider>
      </main>
      <AddJobModal addJob={addJob} />
    </>
  );
}