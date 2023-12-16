import React from "react";
import { ReactComponent as CaretLeftIcon } from 'bootstrap-icons/icons/caret-left.svg';
import { ReactComponent as CaretRightIcon } from 'bootstrap-icons/icons/caret-right.svg';

import JobCard from "./JobCard";
import { Status, Job } from '../api/types';
import EditDeleteButtonGroup from "../common/EditDeleteButtonGroup";


interface JobColumnProps {
  status: Status,
  allStatuses: Status[],
  jobs: Job[],
  jobIdBeingDeleted: number,  
  postingJob: boolean,
  beingRemoved: boolean,
  patchStatus: (id: number, data: Partial<Status>) => void,
  onClickAddJob: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickEditJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,  
  onClickRemoveJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickEditColumn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveColumn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void,
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
};

const JobColumn = ({
  status,
  allStatuses,
  jobs,
  jobIdBeingDeleted,
  postingJob,
  beingRemoved,
  patchStatus,
  onClickAddJob,
  onClickEditJob,
  onClickRemoveJob,
  onClickEditColumn,
  onClickRemoveColumn,
  onDragStart,
  onDragOver,
  onDrop,
}: JobColumnProps): React.JSX.Element => {
  const columnId = `column${status.order}`;

  const moveStatus = (direction: "left" | "right"): void => {
    for (let i = 0; i < allStatuses.length; i++) {
      if (direction === "left" && status.id === allStatuses[i].id) {
        patchStatus(status.id, {order: allStatuses[i-1].order});
      } else if (direction === "right" && status.id === allStatuses[i].id) {
        patchStatus(status.id, {order: allStatuses[i+1].order});
      }
    }
  };

  const onClickMoveLeft = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    moveStatus("left");    
  };

  const onClickMoveRight = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    moveStatus("right");
  };

  // sort jobs by id, putting placeholders with id -1 at the end
  jobs.sort((a, b) => {
    if (a.id === -1) {
      return 1;
    } else if (b.id === -1) {
      return -1;
    } else {
      return a.id - b.id;
    }
  });

  return (
    <div aria-labelledby={`${columnId}Title`}
      role="region" className="kanban-column me-2" onDragOver={onDragOver} onDrop={onDrop}
    >
      <div className="card">
        <div className="card-header">
          <span className="d-flex">
            <h5 id={`${columnId}Title`} className="mt-2 card-title flex-grow-1">{status.name}</h5>
            <div className="btn-group ms-1" role="group">
              {status.id !== allStatuses[0].id &&
                <button aria-label="Move Left"
                  type="button"
                  className="btn btn-secondary"                  
                  onClick={onClickMoveLeft}
                  disabled={beingRemoved}
                >
                  <CaretLeftIcon />
                </button>
              }
              {status.id !== allStatuses[allStatuses.length-1].id &&
                <button aria-label="Move Right"
                  type="button"
                  className="btn btn-secondary"                
                  onClick={onClickMoveRight}
                  disabled={beingRemoved}
                >
                  <CaretRightIcon />
                </button>
              }
            </div>
            <EditDeleteButtonGroup
              onClickEdit={onClickEditColumn}
              onClickRemove={onClickRemoveColumn}
              beingRemoved={beingRemoved}
            />
          </span>
        </div>  
        <div className="card-body">
          {jobs.map((job) =>
            <JobCard key={job.id}
              job={job}
              onDragStart={onDragStart(job.id)}
              onClickEdit={onClickEditJob(job.id)}
              onClickRemove={onClickRemoveJob(job.id)}
              beingRemoved={jobIdBeingDeleted === job.id}
            />
          )}
        </div>
        <div className="card-footer">
          { status.id === allStatuses[0].id &&
            <button type="button" className="btn btn-primary" onClick={onClickAddJob} disabled={postingJob}>
              + Add job
            </button>
          }
        </div>
      </div>
    </div>
  );
};

export default JobColumn;