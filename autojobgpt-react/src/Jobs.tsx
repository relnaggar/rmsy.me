import { useState, useEffect } from 'react';

import { toPascalCase } from './utilities';
import { JOBS, Job, STATUSES } from './api';


export default function Jobs(): JSX.Element {
  return (
    <main>
      <Board />
    </main>
  );
}

function Board(): JSX.Element {
  const [jobs, setJobs]: [Job[], React.Dispatch<React.SetStateAction<Job[]>>] = useState<Job[]>([]);
  const [draggingJobId, setDraggingJobId]: [number, React.Dispatch<React.SetStateAction<number>>] = useState<number>(-1);

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

  function handleDragStart(jobId: number): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      setDraggingJobId(jobId);
      // set cursor to grabbing while dragging

    };
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
            onDragStart={handleDragStart}
            />
        );
      })}
    </div>
  );
}

function Column({ title, jobs, onDrop, onDragStart }: {
  title: string,
  jobs: Job[],
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
  onDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void,
}): JSX.Element {

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
  }

  return (
    <div className="kanban-column me-2" onDragOver={handleDragOver} onDrop={onDrop}>
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
          { title.toLowerCase() === "backlog" ? "+ add new job" : "" }
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
    <div className="card mb-2 p-2" onDragStart={onDragStart} draggable="true">
      <h6 className="card-title">{job.title}</h6>
      <p className="card-subtitle">{job.company}</p>
    </div>
  );
}