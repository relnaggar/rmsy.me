import React, { useCallback, useContext, useState } from "react";

import { ConfirmationModalContext } from "../routes/Layout";
import useAddModal from "../hooks/useAddModal";
import useResource from "../hooks/useResource";
import useErrorAlert from "../hooks/useErrorAlert";
import JobColumn from "./JobColumn";
import EditJobModal from "./EditJobModal";
import AddJobModal from "./AddJobModal";
import { Status, StatusUpload, Job, JobUpload } from '../api/types';
import AddColumnModal from "./AddColumnModal";
import EditColumnModal from "./EditColumnModal";
import ErrorAlert from "../common/ErrorAlert";


const generatePlaceholderStatus = (statusUpload: StatusUpload): Status => {
  return {
    "id": -1,
    "name": statusUpload.name,
    "order": -1
  }
};

const generatePlaceholderJob = (jobUpload: JobUpload): Job => {
  return {
    "id": -1,
    "url": jobUpload.url,
    "title": jobUpload.title,
    "company": jobUpload.company,
    "posting": jobUpload.posting,
    "status": -1, // status should be the id of the first column
  }
};

const JobBoard = (): React.JSX.Element => {  
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const errorAlert = useErrorAlert();
  const addColumnModal = useAddModal();
  const addJobModal = useAddModal();  

  const [draggingJobId, setDraggingJobId] = useState<number>(-1);
  const [editJobId, setEditJobId] = useState<number>(-1);
  const [showEditJob, setShowEditJob] = useState<boolean>(false);

  const jobs = useResource<Job,JobUpload>("jobs/", generatePlaceholderJob, {
    onPostSuccess: addJobModal.handleAddSuccess,
    onPostFail: addJobModal.handleAddFail,
    onFetchFail: errorAlert.showErrors,
    onDeleteFail: errorAlert.showErrors,
    onPatchFail: errorAlert.showErrors,
  });

  const handleClickRemoveJob = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const job: Job = jobs.resources.find((job) => job.id === id)!;
    openConfirmationModal(() => jobs.deleteResource(id), `delete job "${job.title}, ${job.company}"`, "Delete");
  };

  const handleClickEditJob = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    setEditJobId(id);
    setShowEditJob(true);
  };

  const handleDragStart = (id: number) => (e: React.DragEvent<HTMLDivElement>): void => {
    setDraggingJobId(id);
    try { // e.currentTarget not supported in jsdom
      e.currentTarget.scrollIntoView({behavior: "smooth", block: "center"});
    } catch (error) {}
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  }

  const handleDrop = (endStatus: Status) => (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault(); // prevent page from reloading
    
    const job: Job = jobs.resources.find((job) => job.id === draggingJobId)!;
    const jobStatus: Status = sortedStatuses.find((status) => status.id === job.status)!;
    if (jobStatus.order !== endStatus.order) {      
      jobs.patchResource(draggingJobId, {status: endStatus.id});
      setDraggingJobId(-1);
    }
  };

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

  const [editStatusId, setEditStatusId] = useState<number>(-1);
  const [showEditColumn, setShowEditColumn] = useState<boolean>(false);

  const statuses = useResource<Status,StatusUpload>("statuses/", generatePlaceholderStatus, {
    onFetchFail: errorAlert.showErrors,
    onPostFail: addColumnModal.handleAddFail,
    onPostSuccess: addColumnModal.handleAddSuccess,
    onDeleteSuccess: handleDeleteStatusSuccess,
    onDeleteFail:  errorAlert.showErrors,
    onPatchSuccess: handlePatchStatusSuccess,
    onPatchFail:  errorAlert.showErrors,
  });

  const handleClickEditStatus = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    setEditStatusId(id);
    setShowEditColumn(true);
  };

  const handleClickRemoveColumn = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const status: Status = statuses.resources.find((status) => status.id === id)!;
    openConfirmationModal(() => statuses.deleteResource(id), `delete column "${status.name}"`, "Delete");
  };

  const sortedStatuses: Status[] = statuses.resources.sort((a,b) => a.order - b.order);
  const loading: boolean = jobs.fetching || statuses.fetching;
  return (
    <section>
      <h2>Job Board</h2>
      <ErrorAlert {...errorAlert} />
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
            {sortedStatuses.map((status, index) => {
              return (
                status.id !== -1 && (
                  <JobColumn
                    key={`${status.id}-${index}`}
                    title={status.name}
                    jobs={jobs.resources.filter((job) => (job.status === status.id || (job.status === -1 && status.order === sortedStatuses[0].order)))}
                    statusId={status.id}
                    sortedStatuses={sortedStatuses}
                    loading={loading}
                    onDrop={handleDrop(status)}
                    onDragOver={handleDragOver}
                    onDragStart={handleDragStart}
                    onClickEditJob={handleClickEditJob}
                    onClickRemoveJob={handleClickRemoveJob}
                    jobIdBeingRemoved={jobs.idBeingDeleted}
                    onClickAddJob={status.order === sortedStatuses[0].order ? addJobModal.open : undefined}
                    addDisabled={status.order === sortedStatuses[0].order ? jobs.posting: undefined}
                    updateStatus={statuses.patchResource}
                    beingRemoved={statuses.idBeingDeleted === status.id}
                    onClickRemoveColumn={handleClickRemoveColumn(status.id)}
                    onClickEditColumn={handleClickEditStatus(status.id)}
                  />
                )
              );
            })}
            {sortedStatuses.map((status, index) =>
              status.id === -1 && (
                <div className="kanban-column me-2" key={`${status.id}-${index}`}>
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
              )
            )}
          </>
        )}
        <div className="kanban-column me-2">
          <div className="card">
            <div className="card-body text-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={addColumnModal.open}
                disabled={false}
              >
                + Add column
              </button>
            </div>
          </div>
        </div>
      </div>
      <EditJobModal
        apiPath={jobs.apiPath}
        show={showEditJob}
        setShow={setShowEditJob}
        jobs={jobs.resources}
        setJobs={jobs.setResources}
        id={editJobId}
        statuses={statuses.resources}
      />
      <AddJobModal {...addJobModal} addJob={jobs.postResource} />
      <EditColumnModal
        apiPath={statuses.apiPath}
        show={showEditColumn}
        setShow={setShowEditColumn}
        statusId={editStatusId}
        statuses={statuses.resources}
        setStatuses={statuses.setResources}
      />
      <AddColumnModal {...addColumnModal} addColumn={statuses.postResource} />
    </section>
  );
};

export default JobBoard;