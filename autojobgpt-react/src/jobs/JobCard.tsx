import React, { useContext } from 'react';
import { ReactComponent as BoxArrowUpRight } from 'bootstrap-icons/icons/box-arrow-up-right.svg';

import { RemoveJobContext } from './Jobs';
import { Job } from './types';

export default function JobCard({ job, onDragStart }: {
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
    <div
      className="card mb-2 p-2 text-bg-primary"
      role="listitem"
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
        <p className="card-subtitle">
          <a href={job.url} target="_blank" rel="noreferrer" className="link-light">
            {job.company}
            <BoxArrowUpRight className="ms-1" />
          </a>
        </p>
      :
        <span className="placeholder-glow">
          <span className="placeholder col-7"></span>
        </span>
      }
    </div>
  );
}