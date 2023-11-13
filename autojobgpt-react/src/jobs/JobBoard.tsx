import React, { useContext, useState } from "react";

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import JobColumn from "./JobColumn";
import EditJobModal from "./EditJobModal";
import AddJobModal from "./AddJobModal";
import { toPascalCase } from "../common/utils";
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
  const {
    setShow: setShowConfirmationModal,
    setAction: setConfirmationAction,
    setActionDescription: setConfirmationActionDescription,
    setActionVerb: setConfirmationActionVerb,
  } = useContext(ConfirmationModalContext);

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
    removedID: jobBeingRemovedID,
    addResource: addJob,
    updateResource: updateJob,
    errors: { fetchError, deleteError, postError, patchError }
  } = useResource<Job,JobUpload>("jobs/", generatePlaceholderJob);

  const [draggingJobId, setDraggingJobId] = useState<number>(-1);
  const [editJobID, setEditJobID] = useState<number>(-1);
  const [showEditJob, setShowEditJob] = useState<boolean>(false);
  const [showAddJob, setShowAddJob] = useState<boolean>(false);  

  function handleDragStart(id: number): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      setDraggingJobId(id);
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

  function handleClickEditJob(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      setEditJobID(id);
      setShowEditJob(true);
    };
  }

  function handleClickRemoveJob(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      setConfirmationAction(() => () => removeJob(id));
      const job: Job = jobs.find((job) => job.id === id)!;
      setConfirmationActionDescription(`delete job "${job.title}, ${job.company}"`);
      setConfirmationActionVerb("Delete");
      setShowConfirmationModal(true);
    };
  }

  function handleClickAddJob(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShowAddJob(true);
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
              onClickEditJob={handleClickEditJob}
              onClickRemoveJob={handleClickRemoveJob}
              jobBeingRemovedID={jobBeingRemovedID}
              onClickAddJob={status === "backlog" ? handleClickAddJob : undefined}
            />
          );
        })}
      </div>
      <EditJobModal show={showEditJob} setShow={setShowEditJob} id={editJobID} />
      <AddJobModal show={showAddJob} setShow={setShowAddJob} addJob={addJob} />
    </>
  );
}