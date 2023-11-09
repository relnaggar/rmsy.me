import React from 'react';
import { ReactComponent as BoxArrowUpRight } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as PencilSquare } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as Trash3 } from 'bootstrap-icons/icons/trash3.svg';

import { Job } from './types';


export default function JobCard({ job, onDragStart, onClickEditJob, onClickRemoveJob }: {
  job: Job,
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
  onClickEditJob: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  onClickRemoveJob: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}): React.JSX.Element {

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
          <h6 className="pt-2 card-title">{job.title}</h6>
          <div className="btn-group ms-1" role="group">
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Edit"
                onClick={onClickEditJob}
              >
                <PencilSquare />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Delete"
                onClick={onClickRemoveJob}
              >
                <Trash3 />
              </button>
            </div>
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