import React, { useContext } from "react";

import { LoadedContext } from "./Jobs";
import JobCard from "./JobCard";
import { SetShowContext } from "./Jobs";
import { Job } from "./types";


export default function Column({ title, jobs, onDragStart, onDragOver, onDrop }: {
  title: string,
  jobs: Job[],
  onDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void,
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
}): React.JSX.Element {
  const loaded: boolean = useContext(LoadedContext);
  const setShowAddJob: (show: boolean) => void = useContext(SetShowContext);

  function handleAddJobClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShowAddJob(true);
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
          {jobs.map((job) => <JobCard key={job.id} job={job} onDragStart={onDragStart(job.id)} />)}
        </div>
        <div className="card-footer">
          { title.toLowerCase() === "backlog" ?
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddJobClick}
            >+ Add job</button>
          : "" }
        </div>
      </div>
    </div>
  );
}