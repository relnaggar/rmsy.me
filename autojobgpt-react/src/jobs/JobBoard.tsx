import React, { useCallback, useContext, useState } from "react";
import Alert from 'react-bootstrap/Alert';

import { ConfirmationModalContext } from "../routes/Layout";
import useResource from "../hooks/useResource";
import JobColumn from "./JobColumn";
import EditJobModal from "./EditJobModal";
import AddJobModal from "./AddJobModal";
import { Status, StatusUpload, generatePlaceholderStatus, Job, JobUpload, generatePlaceholderJob } from "./types";
import AddColumnModal from "./AddColumnModal";
import EditColumnModal from "./EditColumnModal";


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
    fetching: fetchingJobs,
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

  function handleDrop(endStatus: Status): (e: React.DragEvent<HTMLDivElement>) => void {
    return (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault(); // prevent page from reloading
      
      const job: Job = jobs.find((job) => job.id === draggingJobId)!;
      const jobStatus: Status = sortedStatuses.find((status) => status.id === job.status)!;
      if (jobStatus.order !== endStatus.order) {      
        updateJob(draggingJobId, {status: endStatus.id});
        setDraggingJobId(-1);
      }
    }
  }

  const handlePatchStatusSuccess = useCallback((newStatus: Status, statuses: Status[], setStatuses: React.Dispatch<React.SetStateAction<Status[]>>) => {
    const newStatuses: Status[] = [...statuses];
    let swappedOrder: number | undefined = undefined;
    for (const currentStatus of newStatuses) {
      if (currentStatus.id === newStatus.id && currentStatus.order !== newStatus.order) {
        swappedOrder = currentStatus.order;
        currentStatus.order = newStatus.order;
        break;
      }
    }
    if (swappedOrder !== undefined) {
      for (const currentStatus of newStatuses) {
        if (currentStatus.order === newStatus.order && currentStatus.id !== newStatus.id) {
          currentStatus.order = swappedOrder;
        }
      }
    }
    setStatuses(newStatuses);
  }, []);

  const [showAddColumn, setShowAddColumn] = useState<boolean>(false);
  const [addStatusErrors, setAddStatusErrors] = useState<Record<string,string>>({});
  const [showAddStatusErrorAlert, setShowAddStatusErrorAlert] = useState<boolean>(false);

  const handlePostStatusFail = useCallback((errors: Record<string,string>) => {
    setAddStatusErrors(errors);
    if (errors["error"]) {
      setShowAddStatusErrorAlert(true);
    }
    setShowAddColumn(true);
  }, []);

  const handlePostStatusSuccess = useCallback(() => {
    setAddStatusErrors({});
    setShowAddColumn(false);
  }, []);

  const handleDeleteStatusSuccess = useCallback((deletedStatus: Status, statuses: Status[], setStatuses: React.Dispatch<React.SetStateAction<Status[]>>) => {
    // decrease order of all statuses with order greater than the deleted status
    const newStatuses: Status[] = [...statuses];
    for (let i = 0; i < newStatuses.length; i++) {
      if (newStatuses[i].order > deletedStatus.order) {
        newStatuses[i].order--;
      }
    }
    setStatuses(newStatuses);
  }, []);

  const [editStatusID, setEditStatusID] = useState<number>(-1);
  const [showEditColumn, setShowEditColumn] = useState<boolean>(false);

  const statusAPIPath: string = "statuses/";
  const {
    resources: statuses,
    setResources: setStatuses,
    fetching: fetchingStatuses,
    posting: addingStatus,
    postResource: addStatus,
    deleteResource: removeStatus,
    idBeingDeleted: statusIDBeingRemoved,
    patchResource: updateStatus,
  } = useResource<Status,StatusUpload>(statusAPIPath, generatePlaceholderStatus, {
    onFetchFail: handleErrors,
    onPostFail: handlePostStatusFail,
    onPostSuccess: handlePostStatusSuccess,
    onDeleteSuccess: handleDeleteStatusSuccess,
    onDeleteFail: handleErrors,
    onPatchSuccess: handlePatchStatusSuccess,
    onPatchFail: handleErrors,
  });

  function handleClickEditStatus(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      setEditStatusID(id);
      setShowEditColumn(true);
    };
  }

  function handleClickRemoveColumn(id: number): (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void {
    return (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
      const status: Status = statuses.find((status) => status.id === id)!;
      openConfirmationModal(() => removeStatus(id), `delete column "${status.name}"`, "Delete");
    };
  }

  const sortedStatuses: Status[] = statuses.sort((a,b) => a.order - b.order);
  const loading: boolean = fetchingJobs || fetchingStatuses;
  return (
    <>
      { showErrorAlert &&
        <Alert variant="danger" onClose={() => setShowErrorAlert(false)} dismissible>
          {errorMessage}
        </Alert>
      }
      <div className="kanban-board border">
        { loading ? (
          [...Array(3)].map((_, index) =>
            <div className="kanban-column me-2" key={index}>
              <div className="card">
                <div className="card-header">
                  <h5 className="mt-2 card-title">
                    <span className="placeholder-glow">
                      <span className="placeholder col-6"></span>
                    </span>
                  </h5>
                </div>  
                <div className="card-body">
                  {[...Array(3)].map((_, index) => 
                    <div className="card mb-2 p-2" aria-hidden="true" key={index}>
                      <h6 className="card-title placeholder-glow">
                        <span className="placeholder col-6"></span>
                      </h6>
                      <p className="card-subtitle placeholder-glow">
                        <span className="placeholder col-7"></span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="card-footer"></div>
              </div>
            </div>
          )
        ) : (
          <>
            {sortedStatuses.map((status) => {
              return (
                status.id !== -1 && (
                  <JobColumn
                    key={status.id}
                    title={status.name}
                    jobs={jobs.filter((job) => (job.status === status.id))}
                    statusID={status.id}
                    sortedStatuses={sortedStatuses}
                    loading={loading}
                    onDrop={handleDrop(status)}
                    onDragOver={handleDragOver}
                    onDragStart={handleDragStart}
                    onClickEditJob={handleClickEditJob}
                    onClickRemoveJob={handleClickRemoveJob}
                    jobIDBeingRemoved={jobIDBeingRemoved}
                    onClickAddJob={status.order === sortedStatuses[0].order ? handleClickAddJob : undefined}
                    addDisabled={status.order === sortedStatuses[0].order ? addingJob: undefined}
                    updateStatus={updateStatus}
                    beingRemoved={statusIDBeingRemoved === status.id}
                    onClickRemoveColumn={handleClickRemoveColumn(status.id)}
                    onClickEditColumn={handleClickEditStatus(status.id)}
                  />
                )
              );
            })}
            {statuses.some((status) => status.id === -1) &&
              <div className="kanban-column me-2">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mt-2 card-title">
                      <span className="placeholder-glow">
                        <span className="placeholder col-6"></span>
                      </span>
                    </h5>
                  </div>  
                  <div className="card-body"></div>
                  <div className="card-footer"></div>
                </div>
              </div>
            }
          </>
        )}
        <div className="kanban-column me-2">
          <div className="card">
            <div className="card-body text-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddColumn(true)}
                disabled={false}
              >
                + Add column
              </button>
            </div>
          </div>
        </div>
      </div>
      <EditJobModal
        apiPath={jobAPIPath}
        show={showEditJob}
        setShow={setShowEditJob}
        jobs={jobs}
        setJobs={setJobs}
        id={editJobID}
        statuses={statuses}
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
      <EditColumnModal
        apiPath={statusAPIPath}
        show={showEditColumn}
        setShow={setShowEditColumn}
        statusID={editStatusID}
        statuses={statuses}
        setStatuses={setStatuses}
      />
      <AddColumnModal
        show={showAddColumn}
        setShow={setShowAddColumn}
        addColumn={addStatus}
        addingColumn={addingStatus}
        errors={addStatusErrors}
        showErrorAlert={showAddStatusErrorAlert}
        setShowErrorAlert={setShowAddStatusErrorAlert}
      />
    </>
  );
}