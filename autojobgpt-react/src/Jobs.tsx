import { useState, useEffect, createContext, useContext } from 'react';
import { Modal } from 'bootstrap';

import { toPascalCase } from './utilities';


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

const LoadedContext: React.Context<boolean> = createContext<boolean>(false);
const RemoveJobContext: React.Context<(jobId: number) => void> = createContext<(jobId: number) => void>(() => {});

export default function Jobs({ fetchData }:
  { fetchData: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response> }
): JSX.Element {
  const [jobs, setJobs]: [Job[], React.Dispatch<React.SetStateAction<Job[]>>] = useState<Job[]>([]);
  const [loaded, setLoaded]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useState<boolean>(false);
  const [addedJob, setAddedJob]: [Job | null, React.Dispatch<React.SetStateAction<Job | null>>] = useState<Job | null>(null);
  const [removedJobId, setRemovedJobId]: [number, React.Dispatch<React.SetStateAction<number>>] = useState<number>(-1);

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
  }, []);

  useEffect(() => {
    async function postJob(): Promise<void> {
      return await fetchData('../api/jobs/', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "url": addedJob?.url,
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        // remove the placeholder job and add the new job
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
  }, [addedJob]);

  useEffect(() => {
    async function deleteJob(): Promise<void> {
      return await fetchData(`../api/jobs/${removedJobId}/`, { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => response.json())
      .then((data) => {
        setRemovedJobId(-1);
      })
      .catch((error) => console.error("Error:", error));
    }
    if (removedJobId >= 0) {
      deleteJob();
    }
  }, [removedJobId]);

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

  return (
    <>
      <main>
        <RemoveJobContext.Provider value={removeJob}>
          <LoadedContext.Provider value={loaded}>
            <Board jobs={jobs} setJobs={setJobs} />
          </LoadedContext.Provider>
        </RemoveJobContext.Provider>
      </main>
      <AddJobModal addJob={addJob} />
    </>
  );
}

function Board({ jobs, setJobs }: {
  jobs: Job[],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>,
}): JSX.Element {
  const [draggingJobId, setDraggingJobId]: [number, React.Dispatch<React.SetStateAction<number>>] = useState<number>(-1);

  function handleDragStart(jobId: number): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      setDraggingJobId(jobId);
      e.currentTarget.scrollIntoView({behavior: "smooth", block: "center"});
    };
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
  }

  function handleDrop(status: string): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setJobs(jobs.map((job) => {
        if (job.id === draggingJobId) {
          job.status = status;
        }
        return job;
      }));
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
}): JSX.Element {
  const loaded: boolean = useContext(LoadedContext);

  function handleAddJobClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const jobModal: HTMLElement | null = document.getElementById("addJobModal");
    jobModal?.addEventListener('shown.bs.modal', () => {
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
            >+ Add a job</button>
          : "" }
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onDragStart }: {
  job: Job,
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
}): JSX.Element {
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
          <button type="button" className="btn-close" aria-label="Remove" onClick={handleRemove(job.id)}></button>
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
}): JSX.Element {
  const [url, setUrl]: [string, React.Dispatch<React.SetStateAction<string>>] = useState<string>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const modalElement: HTMLElement | null = document.getElementById("addJobModal");
    if (modalElement) {
      Modal.getInstance(modalElement)?.toggle();

      // Bootstrap is supposed to remove the modal-backdrop but it's not working properly
      document.querySelector(".modal-backdrop")?.remove();
    }
    setUrl("");
    addJob(url);
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setUrl(e.target.value);
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
                  <input type="url" className="form-control" id="url" value={url} onChange={handleUrlChange} required />
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