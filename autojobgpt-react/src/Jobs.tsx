import { useState, useEffect } from 'react';
import { Modal } from 'bootstrap';

import { toPascalCase } from './utilities';
import { JOBS } from './mockAPI';


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


export default function Jobs(): JSX.Element {
  const [jobs, setJobs]: [Job[], React.Dispatch<React.SetStateAction<Job[]>>] = useState<Job[]>([]);

  useEffect(() => {
    // fetch("/api/jobs")
    //    .then((response) => response.json())
    //    .then((data) => {
    //       console.log(data);
    //       setPosts(data);
    //    })
    //    .catch((err) => {
    //       console.log(err.message);
    //    });
    setJobs(JOBS);
  }, []);

  function addJob(url: string): void {
    setJobs([...jobs, {
      "id": jobs.length + 1,
      "url": url,
      "title": "???",
      "company": "???",
      "text": "",
      "chat_messages": [],
      "date_applied": null,
      "status": "backlog",
      "resume_template": null,
      "chosen_resume": null,
    }]);
  };

  return (
    <>
      <main>
        <Board jobs={jobs} setJobs={setJobs} />
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
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void,
}): JSX.Element {
  return (
    <div className="card mb-2 p-2 text-bg-primary" onDragStart={onDragStart} draggable="true">
      <h6 className="card-title">{job.title}</h6>
      <p className="card-subtitle">{job.company}</p>
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
                  <input type="url" className="form-control" id="url" value={url} onChange={handleUrlChange} />
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