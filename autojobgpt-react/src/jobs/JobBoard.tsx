import React, { useCallback, useContext, useState } from "react";
import Alert from 'react-bootstrap/Alert';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import JobColumn from "./JobColumn";
import EditJobModal from "./EditJobModal";
import AddJobModal from "./AddJobModal";
import { toPascalCase } from "../common/utils";
import { Job, JobUpload, generatePlaceholderJob } from "./types";


export const STATUSES: string[] = [
  "backlog",
  "applying",
  "pending",
  "testing",
  "interviewing",
  "rejected",
  "accepted",
];

export default function JobBoard(): React.JSX.Element {
  const openConfirmationModal = useContext(ConfirmationModalContext);

  const [draggingJobId, setDraggingJobId] = useState<number>(-1);
  const [editJobID, setEditJobID] = useState<number>(-1);
  const [showEditJob, setShowEditJob] = useState<boolean>(false);
  const [showAddJob, setShowAddJob] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);

  const [addJobErrors, setAddJobErrors] = useState<Record<string,string>>({});
  const [showAddJobErrorAlert, setShowAddJobErrorAlert] = useState<boolean>(false);

  const handleErrors = useCallback((errors: Record<string,string>) => {
    setErrorMessage(Object.values(errors).join(" "));
    setShowErrorAlert(true);
  }, []);

  const handleAddJobSuccess = useCallback(() => {
    setAddJobErrors({});
    setShowAddJob(false);    
  }, []);

  const handleAddJobFail = useCallback((errors: Record<string,string>) => {
    setAddJobErrors(errors);
    if (errors["error"]) {
      setShowAddJobErrorAlert(true);
    }
  }, []);

  const jobAPIPath: string = "jobs/";
  const {
    resources: jobs,
    setResources: setJobs,
    fetching: loading,
    posting: addingJob,
    postResource: addJob,
    deleteResource: removeJob,
    idBeingDeleted: jobIDBeingRemoved,
    patchResource: updateJob,
  } = useResource<Job,JobUpload>(jobAPIPath, generatePlaceholderJob, {
    onPostSuccess: handleAddJobSuccess,
    onPostFail: handleAddJobFail,
    onFetchFail: handleErrors,
    onDeleteFail: handleErrors,
    onPatchFail: handleErrors,
  });

  function handleClickAddJob(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShowAddJob(true);
  }

  function handleClickRemoveJob(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      const job: Job = jobs.find((job) => job.id === id)!;
      openConfirmationModal(() => removeJob(id), `delete job "${job.title}, ${job.company}"`, "Delete");
    };
  }

  function handleClickEditJob(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      setEditJobID(id);
      setShowEditJob(true);
    };
  }

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
      e.preventDefault(); // prevent page from reloading
      
      updateJob(draggingJobId, {status: endStatus});
      setDraggingJobId(-1);
    }
  }

  return (
    <>
      { showErrorAlert &&
        <Alert variant="danger" onClose={() => setShowErrorAlert(false)} dismissible>
          {errorMessage}
        </Alert>
      }
      <div className="kanban-board border">
        {STATUSES.map((status) => {
          return (
            <JobColumn
              key={status}
              title={toPascalCase(status)}
              jobs={jobs.filter((job) => (job.status === status))}
              loading={loading}
              onDrop={handleDrop(status)}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onClickEditJob={handleClickEditJob}
              onClickRemoveJob={handleClickRemoveJob}
              jobIDBeingRemoved={jobIDBeingRemoved}
              onClickAddJob={status === "backlog" ? handleClickAddJob : undefined}
              addDisabled={status === "backlog"? addingJob: undefined}
            />
          );
        })}
      </div>
      <EditJobModal
        apiPath={jobAPIPath}
        show={showEditJob}
        setShow={setShowEditJob}
        jobs={jobs}
        setJobs={setJobs}
        id={editJobID}
      />
      <AddJobModal
        show={showAddJob}
        setShow={setShowAddJob}
        addJob={addJob}
        addingJob={addingJob}
        addJobErrors={addJobErrors}
        showAddJobErrorAlert={showAddJobErrorAlert}
        setShowAddJobErrorAlert={setShowAddJobErrorAlert}
      />
    </>
  );
}