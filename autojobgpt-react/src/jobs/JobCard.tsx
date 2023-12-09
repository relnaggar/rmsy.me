import React from 'react';
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';
import { ReactComponent as PencilSquareIcon } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as Trash3Icon } from 'bootstrap-icons/icons/trash3.svg';

import { Job } from './types';


interface JobCardProps {
  job: Job,
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
  onClickEditJob: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  onClickRemoveJob: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  beingRemoved: boolean
}

const JobCard = ({
  job,
  onDragStart,
  onClickEditJob,
  onClickRemoveJob,
  beingRemoved
}: JobCardProps): React.JSX.Element => {
  return (
    <div
      className="card mb-2 p-2 text-bg-primary"
      role="listitem"
      onDragStart={job.title ? onDragStart : ()=>{}}
      draggable={job.title ? true : false}  
      aria-busy={job.title ? false : true}
    >
      {job.title ?
        <span className="d-flex">
          <h6 className="mt-2 card-title flex-grow-1">{job.title}</h6>
          <div className="btn-group ms-1" role="group">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                aria-label="Edit"
                onClick={onClickEditJob}
                disabled={beingRemoved}
              >
                <PencilSquareIcon />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                aria-label="Delete"
                onClick={onClickRemoveJob}
                disabled={beingRemoved}
              >
                { beingRemoved ?
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                :
                  <Trash3Icon />
                }
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
          {job.url ?
            <a href={job.url} target="_blank" rel="noreferrer" className="link-light">
              {job.company}
              <BoxArrowUpRightIcon className="ms-1" />
            </a>
          :
            job.company
          }
        </p>
      :
        <span className="placeholder-glow">
          <span className="placeholder col-7"></span>
        </span>
      }
    </div>
  );
};

export default JobCard;