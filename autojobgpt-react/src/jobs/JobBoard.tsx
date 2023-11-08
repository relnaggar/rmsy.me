import React, { useState } from "react";

import useResource from "../hooks/useResource";
import JobColumn from "./JobColumn";
import AddJobModal from "./AddJobModal";
import { toPascalCase } from "../common/utilities";
import { Job, JobUpload } from "./types";


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

export default function JobBoard(): React.JSX.Element {
  function generatePlaceholderJob(jobUpload: JobUpload): Job {
    return {
      "id": -1,
      "url": jobUpload.url,
      "title": "",
      "company": "",
      "text": "",
      "chat_messages": [],
      "date_applied": null,
      "status": "",
      "resume_template": null,
      "chosen_resume": null,
    }
  }
  const {
    resources: jobs,
    loaded,
    removeResource: removeJob,
    addResource: addJob,
    updateResource: updateJob,
    errors
  } = useResource<Job,JobUpload>("../api/jobs/", generatePlaceholderJob);

  const [showAddJob, setShowAddJob] = useState<boolean>(false);
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
        updateJob(draggingJobId, {status: endStatus});
      }

      // stop dragging
      setDraggingJobId(-1);
    }
  }

  function handleClickAddJob(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShowAddJob(true);
  }

  function handleClickRemoveJob(jobId: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      removeJob(jobId);
    };
  }

  return (
    <>
      <div className="kanban-board border">
        {STATUSES.map((status) => {
          return (
            <JobColumn
              key={status}
              title={toPascalCase(status)}
              jobs={jobs.filter((job) => (job.status === "" && status === "backlog") || (job.status === status))}
              loaded={loaded}
              onDrop={handleDrop(status)}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onClickAddJob={status === "backlog" ? handleClickAddJob : undefined}
              onClickRemoveJob={handleClickRemoveJob}
            />
          );
        })}
      </div>
      <AddJobModal show={showAddJob} setShow={setShowAddJob} addJob={addJob} />
    </>
  );
}