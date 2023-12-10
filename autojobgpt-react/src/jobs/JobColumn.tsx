import React from "react";
import { ReactComponent as PencilSquareIcon } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as Trash3Icon } from 'bootstrap-icons/icons/trash3.svg';
import { ReactComponent as CaretLeftIcon } from 'bootstrap-icons/icons/caret-left.svg';
import { ReactComponent as CaretRightIcon } from 'bootstrap-icons/icons/caret-right.svg';

import JobCard from "./JobCard";
import { Status, Job } from '../api/types';


interface JobColumnProps {
  title: string,
  jobs: Job[],
  statusId: number,
  sortedStatuses: Status[],
  loading: boolean,
  onDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void,
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
  onClickEditJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  jobIdBeingRemoved: number,
  onClickAddJob?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  addDisabled?: boolean,
  updateStatus: (id: number, data: Partial<Status>) => void,
  beingRemoved: boolean,
  onClickRemoveColumn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickEditColumn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
};

const JobColumn = ({
  title,
  jobs,
  statusId,
  sortedStatuses,
  loading,
  onDragStart,
  onDragOver,
  onDrop,
  onClickEditJob,
  onClickRemoveJob,
  jobIdBeingRemoved,
  onClickAddJob,
  addDisabled,
  updateStatus,
  beingRemoved,
  onClickRemoveColumn,
  onClickEditColumn,
}: JobColumnProps): React.JSX.Element => {
  const status: Status = sortedStatuses.find((status) => status.id === statusId)!;
  const columnId = `column${status.order}`;

  const moveStatus = (direction: "left" | "right"): void => {
    for (let i = 0; i < sortedStatuses.length; i++) {
      if (direction === "left" && statusId === sortedStatuses[i].id) {
        updateStatus(statusId, {order: sortedStatuses[i-1].order});
      } else if (direction === "right" && statusId === sortedStatuses[i].id) {
        updateStatus(statusId, {order: sortedStatuses[i+1].order});
      }
    }
  };

  const onClickMoveLeft = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    moveStatus("left");    
  };

  const onClickMoveRight = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    moveStatus("right");
  };

  return (
    <div
      className="kanban-column me-2" onDragOver={onDragOver} onDrop={onDrop}
      role="region" aria-labelledby={`${columnId}Title`}
    >
      <div className="card">
        <div className="card-header">
          <span className="d-flex">
            <h5 id={`${columnId}Title`}
              className="mt-2 card-title flex-grow-1"
            >{title}</h5>
            <div className="btn-group ms-1" role="group">
              {statusId !== sortedStatuses[0].id && <button
                type="button"
                className="btn btn-secondary"
                aria-label="Move Left"
                onClick={onClickMoveLeft}
                disabled={beingRemoved}
              >
                <CaretLeftIcon />
              </button>}
              {statusId !== sortedStatuses[sortedStatuses.length-1].id && <button
                type="button"
                className="btn btn-secondary"
                aria-label="Move Right"
                onClick={onClickMoveRight}
                disabled={beingRemoved}
              >
                <CaretRightIcon />
              </button>}
            </div>
            <div className="btn-group ms-1" role="group">
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Edit"
                onClick={onClickEditColumn}
                disabled={beingRemoved}
              >
                <PencilSquareIcon />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                aria-label="Delete"
                onClick={onClickRemoveColumn}
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
        </div>  
        <div className="card-body">
          { loading && (
            [...Array(3)].map((_, index) => <div className="card mb-2 p-2" aria-hidden="true" key={index}>
              <h6 className="card-title placeholder-glow">
                <span className="placeholder col-6"></span>
              </h6>
              <p className="card-subtitle placeholder-glow">
                <span className="placeholder col-7"></span>
              </p>
            </div>)
          )}
          {jobs.map((job) =>
            job.id !== -1 && (
              <JobCard
                key={job.id}
                job={job}
                onDragStart={onDragStart(job.id)}
                onClickEditJob={onClickEditJob(job.id)}
                onClickRemoveJob={onClickRemoveJob(job.id)}
                beingRemoved={jobIdBeingRemoved === job.id}
              />
            )
          )}
          {jobs.map((job) =>
            job.id === -1 && (
              <JobCard
                key={job.id}
                job={job}
                onDragStart={onDragStart(job.id)}
                onClickEditJob={onClickEditJob(job.id)}
                onClickRemoveJob={onClickRemoveJob(job.id)}
                beingRemoved={jobIdBeingRemoved === job.id}
              />
            )
          )}
        </div>
        <div className="card-footer">
          { onClickAddJob ?
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClickAddJob}
              disabled={addDisabled}
            >+ Add job</button>
          : "" }
        </div>
      </div>
    </div>
  );
};

export default JobColumn;