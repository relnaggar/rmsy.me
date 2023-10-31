import React, { useState } from "react";

import JobColumn from "./JobColumn";
import { toPascalCase } from "../common/utilities";
import { Job } from "./types";


export const STATUSES: string[] = [
  "backlog",
  "applying",
  "pending",
  "testing",
  "interviewing",
  "rejected",
  "accepted",
];

export const ALLOWED_TRANSITIONS: string[][] = [
  ["backlog", "applying"],
  ["applying", "backlog"],
  ["applying", "pending"],
  ["pending", "testing"],
  ["pending", "interviewing"],
  ["pending", "rejected"],
  ["pending", "accepted"],
  ["testing", "pending"],
  ["testing", "interviewing"],
  ["testing", "rejected"],
  ["testing", "accepted"],
  ["interviewing", "pending"],
  ["interviewing", "rejected"],
  ["interviewing", "accepted"],
];

export default function JobBoard({ jobs, updateJobStatus }: {
  jobs: Job[],
  updateJobStatus: (jobId: number, status: string) => void,
}): React.JSX.Element {
  const [draggingJobId, setDraggingJobId] = useState<number>(-1);

  function handleDragStart(jobId: number): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      setDraggingJobId(jobId);
      try { // e.currentTarget not supported in jsdom
        e.currentTarget.scrollIntoView({behavior: "smooth", block: "center"});
      } catch (error) {}
    };
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
  }

  function handleDrop(endStatus: string): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();

      // get the job that is being dragged
      const currentJob: Job = jobs.find((job) => job.id === draggingJobId)!;
      const startStatus: string = currentJob.status || "backlog";
      
      // check if the transition is allowed
      const allowedTransitions: string[] = ALLOWED_TRANSITIONS.filter(
        (transition) => {
          return transition[0] === startStatus;
        }
      ).map((transition) => transition[1]);

      // if the transition is allowed, move the job by updating its status
      if (allowedTransitions.includes(endStatus)) {
        updateJobStatus(draggingJobId, endStatus);
      }

      // stop dragging
      setDraggingJobId(-1);
    }
  }

  return (
    <div className="kanban-board border">
      {STATUSES.map((status) => {
        return (
          <JobColumn
            key={status}
            title={toPascalCase(status)}
            jobs={jobs.filter((job) => (job.status === "" && status === "backlog") || (job.status === status))}
            onDrop={handleDrop(status)}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
          />
        );
      })}
    </div>
  );
}