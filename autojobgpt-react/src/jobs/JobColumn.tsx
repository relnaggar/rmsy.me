import React from "react";

import JobCard from "./JobCard";
import { Job } from "./types";


export default function Column({
  title,
  jobs,
  loaded,
  onDragStart,
  onDragOver,
  onDrop,
  onClickEditJob,
  onClickRemoveJob,
  jobBeingRemovedID,
  onClickAddJob,
}: {
  title: string,
  jobs: Job[],
  loaded: boolean,
  onDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void,
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
  onClickEditJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  jobBeingRemovedID: number,
  onClickAddJob?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}): React.JSX.Element {
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
          {jobs.map((job) =>
            <JobCard
              key={job.id}
              job={job}
              onDragStart={onDragStart(job.id)}
              onClickEditJob={onClickEditJob(job.id)}
              onClickRemoveJob={onClickRemoveJob(job.id)}
              beingRemoved={jobBeingRemovedID === job.id}
            />
          )}
        </div>
        <div className="card-footer">
          { onClickAddJob ?
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClickAddJob}
            >+ Add job</button>
          : "" }
        </div>
      </div>
    </div>
  );
}