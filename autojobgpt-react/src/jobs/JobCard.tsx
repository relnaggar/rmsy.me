import React from 'react';
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';

import EditDeleteButtonGroup from '../common/EditDeleteButtonGroup';
import { Job } from '../api/types';


interface JobCardProps {
  job: Job,
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
  onClickEdit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  onClickRemove: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  beingRemoved: boolean
}

const JobCard = ({
  job,
  onDragStart,
  onClickEdit,
  onClickRemove,
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
          <EditDeleteButtonGroup
            onClickEdit={onClickEdit}
            onClickRemove={onClickRemove}
            beingRemoved={beingRemoved}
            small
          />
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