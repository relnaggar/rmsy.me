import React, { useState, useEffect, createContext, useContext } from "react";
import { Modal } from "bootstrap";

import { toPascalCase } from "./utilities";


export type Job = {
  "id": number;
  "url": string;
  "title": string;
  "company": string;
  "text": string;
  "chat_messages": {
    "role": string;
    "content": string;
  }[];
  "date_applied": string | null;
  "status": string;
  "resume_template": string | null;
  "chosen_resume": string | null;
};

export const STATUSES: string[] = [
  "backlog",
  "applying",
  "pending",
  "testing",
  "interviewing",
  "rejected",
  "accepted",
]

export const ALLOWED_TRANSITIONS: string[][] = [
  ["backlog", "applying"],
  ["applying", "backlog"],
  ["applying", "pending"],
  ["pending", "testing"],
  ["pending", "interviewing"],
  ["pending", "rejected"],
  ["pending", "accepted"],
  ["testing", "pending"],
  ["testing", "interviewing"],
  ["testing", "rejected"],
  ["testing", "accepted"],
  ["interviewing", "pending"],
  ["interviewing", "rejected"],
  ["interviewing", "accepted"],
];

const LoadedContext = createContext<boolean>(false);
const RemoveJobContext = createContext<(jobId: number) => void>(() => {});

export default function Jobs({ fetchData }:
  { fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response> }
): React.JSX.Element {
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

  function removeJob(jobId: number): void {
    setJobs(jobs.filter((job) => job.id !== jobId));
    setRemovedJobId(jobId);
  }

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

  return (
    <>
      <main>
        <RemoveJobContext.Provider value={removeJob}>
          <LoadedContext.Provider value={loaded}>
            <Board jobs={jobs} updateJobStatus={updateJobStatus} />
          </LoadedContext.Provider>
        </RemoveJobContext.Provider>
      </main>
      <AddJobModal addJob={addJob} />
    </>
  );
}

function Board({ jobs, updateJobStatus }: {
  jobs: Job[],
  updateJobStatus: (jobId: number, status: string) => void,
}): React.JSX.Element {
  const [draggingJobId, setDraggingJobId] = useState<number>(-1);

  function handleDragStart(jobId: number): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      setDraggingJobId(jobId);
      try { // e.currentTarget not supported in jsdom
        e.currentTarget.scrollIntoView({behavior: "smooth", block: "center"});
      } catch (error) {}
    };
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
  }

  function handleDrop(endStatus: string): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();

      // get the job that is being dragged
      const currentJob: Job = jobs.find((job) => job.id === draggingJobId)!;
      const startStatus: string = currentJob.status || "backlog";
      
      // check if the transition is allowed
      const allowedTransitions: string[] = ALLOWED_TRANSITIONS.filter((transition) => {
        return transition[0] === startStatus;
      }).map((transition) => transition[1]);

      // if the transition is allowed, move the job by updating its status
      if (allowedTransitions.includes(endStatus)) {
        updateJobStatus(draggingJobId, endStatus);
      }

      // stop dragging
      setDraggingJobId(-1);
    }
  }

  return (
    <div className="kanban-board border">
      {STATUSES.map((status) => {
        return (
          <Column
            key={status}
            title={toPascalCase(status)}
            jobs={
              jobs.filter((job) => (job.status === "" && status === "backlog") || (job.status === status))
            }
            onDrop={handleDrop(status)}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            />
        );
      })}
    </div>
  );
}

function Column({ title, jobs, onDragStart, onDragOver, onDrop }: {
  title: string,
  jobs: Job[],
  onDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void,
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
}): React.JSX.Element {
  const loaded: boolean = useContext(LoadedContext);

  function handleAddJobClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const jobModal: HTMLElement | null = document.getElementById("addJobModal");
    jobModal?.addEventListener("shown.bs.modal", () => {
      document.getElementById("url")?.focus();
    });
  }

  return (
    <div className="kanban-column me-2" onDragOver={onDragOver} onDrop={onDrop}>
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">{title}</h5>
        </div>  
        <div className="card-body">
          { !loaded && (
            <div className="card mb-2 p-2" aria-hidden="true">
              <h6 className="card-title placeholder-glow">
                <span className="placeholder col-6"></span>
              </h6>
              <p className="card-subtitle placeholder-glow">
                <span className="placeholder col-7"></span>
              </p>
            </div>
          )}
          {jobs.map((job) => {
            return <JobCard
              key={job.id}
              job={job}
              onDragStart={onDragStart(job.id)}
            />;
          })}
        </div>
        <div className="card-footer">
          { title.toLowerCase() === "backlog" ?
            <button
              type="button"
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addJobModal"
              onClick={handleAddJobClick}
            >+ Add job</button>
          : "" }
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onDragStart }: {
  job: Job,
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
}): React.JSX.Element {
  const removeJob: (jobId: number) => void = useContext(RemoveJobContext);

  function handleRemove(jobId: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      removeJob(jobId);
    }
  }

  return (
    <div className="card mb-2 p-2 text-bg-primary" role="listitem"
      onDragStart={job.title ? onDragStart : ()=>{}}
      draggable={job.title ? true : false}  
      aria-busy={job.title ? false : true}
    >
      {job.title ?
        <span className="d-flex justify-content-between">
          <h6 className="card-title">{job.title}</h6>
          <button type="button" className="btn-close" aria-label="Delete" onClick={handleRemove(job.id)}></button>
        </span>
      :
        <span className="placeholder-glow">
          <span className="placeholder col-6"></span>
        </span>
      }
      {job.company ?
        <p className="card-subtitle">{job.company}</p>
      :
        <span className="placeholder-glow">
          <span className="placeholder col-7"></span>
        </span>
      }
    </div>
  );
}

function AddJobModal({ addJob }: {
  addJob: (url: string) => void,
}): React.JSX.Element {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const modalElement: HTMLElement | null = document.getElementById("addJobModal");
    if (modalElement) {
      Modal.getInstance(modalElement)?.toggle();

      // Bootstrap is supposed to remove the modal-backdrop but it's not working properly
      document.querySelector(".modal-backdrop")?.remove();
    }
    const url: string = (document.getElementById("url") as HTMLInputElement).value;
    addJob(url);
    e.currentTarget.reset();   
  }

  return (
    <div className="modal fade" id="addJobModal" tabIndex={-1} aria-labelledby="addJobModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addJobModalLabel">Add Job</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="url" className="form-label">URL</label>
                <input type="url" className="form-control" id="url" name="url" required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}