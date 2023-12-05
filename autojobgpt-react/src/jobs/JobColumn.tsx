import React from "react";
import { ReactComponent as PencilSquare } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as Trash3 } from 'bootstrap-icons/icons/trash3.svg';
import { ReactComponent as CaretLeft } from 'bootstrap-icons/icons/caret-left.svg';
import { ReactComponent as CaretRight } from 'bootstrap-icons/icons/caret-right.svg';

import JobCard from "./JobCard";
import { Status, Job } from "./types";


export default function Column({
  title,
  jobs,
  statusID,
  sortedStatuses,
  loading,
  onDragStart,
  onDragOver,
  onDrop,
  onClickEditJob,
  onClickRemoveJob,
  jobIDBeingRemoved,
  onClickAddJob,
  addDisabled,
  updateStatus,
  beingRemoved,
  onClickRemoveColumn,
  onClickEditColumn,
}: {
  title: string,
  jobs: Job[],
  statusID: number,
  sortedStatuses: Status[],
  loading: boolean,
  onDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void,
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void,
  onClickEditJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickRemoveJob: (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  jobIDBeingRemoved: number,
  onClickAddJob?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  addDisabled?: boolean,
  updateStatus: (id: number, data: Partial<Status>) => void,
  beingRemoved: boolean,
  onClickRemoveColumn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickEditColumn: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
}): React.JSX.Element {
  function moveStatus(direction: "left" | "right"): void {
    let previousStatus: Status | null = null;
    for (const currentStatus of sortedStatuses) {
      if (previousStatus) {
        if (direction === "left" && currentStatus.id === statusID) {
          updateStatus(currentStatus.id, {order: previousStatus.order});
        } else if (direction === "right" && previousStatus.id === statusID) {
          updateStatus(currentStatus.id, {order: previousStatus.order});
        }
      }
      previousStatus = currentStatus;
    }
  }

  function onClickMoveLeft(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    moveStatus("left");    
  }

  function onClickMoveRight(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    moveStatus("right");
  }

  return (
    <div className="kanban-column me-2" onDragOver={onDragOver} onDrop={onDrop}>
      <div className="card">
        <div className="card-header">
          <span className="d-flex">
            <h5 className="mt-2 card-title flex-grow-1">{title}</h5>
            <div className="btn-group ms-1" role="group">
              {statusID !== sortedStatuses[0].id && <button
                type="button"
                className="btn btn-secondary"
                aria-label="Move Left"
                onClick={onClickMoveLeft}
                disabled={beingRemoved}
              >
                <CaretLeft />
              </button>}
              {statusID !== sortedStatuses[sortedStatuses.length-1].id && <button
                type="button"
                className="btn btn-secondary"
                aria-label="Move Right"
                onClick={onClickMoveRight}
                disabled={beingRemoved}
              >
                <CaretRight />
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
                <PencilSquare />
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
                  <Trash3 />
                }
              </button>
            </div>
          </span>
        </div>  
        <div className="card-body">
          { loading && (
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
              beingRemoved={jobIDBeingRemoved === job.id}
            />
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
}