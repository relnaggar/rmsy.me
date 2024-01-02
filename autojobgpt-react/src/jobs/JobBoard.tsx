import React, { useContext } from "react";

import { ConfirmationModalContext } from "../routes/Layout";
import useAddModal from "../hooks/useAddModal";
import useEditModal from "../hooks/useEditModal";
import useResource from "../hooks/useResource";
import useErrorAlert from "../hooks/useErrorAlert";
import useDrag from "../hooks/useDrag";
import useFetchResource from "../hooks/useFetchResource";
import ErrorAlert from "../common/ErrorAlert";
import JobColumn from "./JobColumn";
import EditJobModal from "./EditJobModal";
import AddJobModal from "./AddJobModal";
import EditColumnModal from "./EditColumnModal";
import AddColumnModal from "./AddColumnModal";
import PlaceholderColumn from "./PlaceholderColumn";
import AddColumnButton from "./AddColumnButton";
import { Status, StatusUpload, Job, JobUpload, TailoredDocument } from '../api/types';


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
    "url": "",
    "title": "",
    "company": "",
    "posting": "",
    "status": -1,
    "chosen_resume": null,
    "notes": "",
  }
};

const JobBoard = (): React.JSX.Element => {
  const openConfirmationModal = useContext(ConfirmationModalContext);
  const errorAlert = useErrorAlert();
  const addJobModal = useAddModal();  
  const editJobModal = useEditModal();
  const addColumnModal = useAddModal();
  const editColumnModal = useEditModal();

  const jobManager = useResource<Job,JobUpload>("jobs/", generatePlaceholderJob, {
    onPostSuccess: addJobModal.handleAddSuccess,
    onPostFail: addJobModal.handleAddFail,
    onFetchFail: errorAlert.showErrors,
    onDeleteFail: errorAlert.showErrors,
    onPatchFail: errorAlert.showErrors,
  });
  const {resources: jobs, deleteResource: deleteJob, patchResource: patchJob} = jobManager;

  const handleClickEditJob = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    editJobModal.open(id);
  };

  const handleClickRemoveJob = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const job: Job = jobs.find((job) => job.id === id)!;
    openConfirmationModal(() => deleteJob(id), `delete job "${job.title}, ${job.company}"`, "Delete");
  };  

  const handlePatchStatusSuccess = (
    oldStatus: Status,
    setStatuses: React.Dispatch<React.SetStateAction<Status[]>>
  ) => {    
    setStatuses((statuses: Status[]) => {
      // swap order of status with the same order as the new status
      const newStatuses: Status[] = [...statuses];
      let swappedOrder: number | undefined = undefined;
      for (const currentStatus of newStatuses) {
        if (currentStatus.id === oldStatus.id && currentStatus.order !== oldStatus.order) {
          swappedOrder = currentStatus.order;
          break;
        }
      }
      // decrease order of all statuses with order greater than the new status
      if (swappedOrder !== undefined) {
        for (const currentStatus of newStatuses) {
          if (currentStatus.order === swappedOrder && currentStatus.id !== oldStatus.id) {
            currentStatus.order = oldStatus.order;
          }
        }
      }
      return newStatuses;
    });
  };

  const handleDeleteStatusSuccess = (
    deletedStatus: Status,
    setStatuses: React.Dispatch<React.SetStateAction<Status[]>>
  ) => {
    setStatuses((statuses: Status[]) => {
      // decrease order of all statuses with order greater than the deleted status
      const newStatuses: Status[] = [...statuses];
      for (let i = 0; i < newStatuses.length; i++) {
        if (newStatuses[i].order > deletedStatus.order) {
          newStatuses[i].order--;
        }
      }
      return newStatuses;
    });
  };

  const statusManager = useResource<Status,StatusUpload>("statuses/", generatePlaceholderStatus, {
    onFetchFail: errorAlert.showErrors,
    onPostFail: addColumnModal.handleAddFail,
    onPostSuccess: addColumnModal.handleAddSuccess,
    onDeleteSuccess: handleDeleteStatusSuccess,
    onDeleteFail: errorAlert.showErrors,
    onPatchSuccess: handlePatchStatusSuccess,
    onPatchFail: errorAlert.showErrors,
  });
  const {resources: statuses, deleteResource: deleteStatus } = statusManager;

  const handleClickEditStatus = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    editColumnModal.open(id);
  };

  const handleClickRemoveColumn = (id: number) => (_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const status: Status = statuses.find((status) => status.id === id)!;
    openConfirmationModal(() => deleteStatus(id), `delete column "${status.name}"`, "Delete");
  };

  const {handleDragStart, handleDragOver, handleDrop} = useDrag(jobs, statuses, patchJob);

  // sort statuses by order, putting placeholders with id -1 at the end
  statuses.sort((a, b) => {
    if (a.id === -1) {
      return 1;
    } else if (b.id === -1) {
      return -1;
    } else {
      return a.order - b.order;
    }
  });

  const { resources: resumes } = useFetchResource<TailoredDocument>("tailoredDocuments/?type=resume", {
    onFail: errorAlert.showErrors,
  });

  const loading: boolean = jobManager.fetching || statusManager.fetching;
  return (
    <section>
      <h2 className="mb-3">Job Board</h2>
      <ErrorAlert {...errorAlert} />
      <div className="kanban-board border">
        {loading ?
          [...Array(3)].map((_, index) => <PlaceholderColumn jobs={3} key={index} />)
        :
          <>
            {statuses.map((status, index) =>
              status.id === -1 ?
                <PlaceholderColumn jobs={0} key={`${status.id}-${index}`} />
              :
                <JobColumn key={`${status.id}-${index}`}
                  status={status} allStatuses={statuses}
                  jobs={jobs.filter((job) => (job.status === status.id || (job.status === -1 && status.order === statuses[0].order)))}
                  jobIdsBeingDeleted={jobManager.idsBeingDeleted}
                  beingMoved={statusManager.idsBeingPatched.includes(status.id)}
                  beingRemoved={statusManager.idsBeingDeleted.includes(status.id)}
                  patchStatus={statusManager.patchResource}                  
                  onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop(status)}
                  onClickAddJob={addJobModal.open} onClickEditJob={handleClickEditJob} onClickRemoveJob={handleClickRemoveJob}
                  onClickEditColumn={handleClickEditStatus(status.id)} onClickRemoveColumn={handleClickRemoveColumn(status.id)}                  
                />
            )}
            <AddColumnButton onClick={addColumnModal.open} />
          </>
        }
      </div>
      <EditJobModal editId={editJobModal.editId}
        show={editJobModal.show}
        setShow={editJobModal.setShow}
        apiPath={jobManager.apiPath}        
        resources={jobManager.resources}
        setResources={jobManager.setResources}        
        statuses={statusManager.resources}
        resumes={resumes}
      />
      <AddJobModal {...addJobModal} postResource={jobManager.postResource} />
      <EditColumnModal editId={editColumnModal.editId}
        show={editColumnModal.show}
        setShow={editColumnModal.setShow}
        apiPath={statusManager.apiPath}              
        resources={statusManager.resources}
        setResources={statusManager.setResources}
      />
      <AddColumnModal {...addColumnModal} postResource={statusManager.postResource} />
    </section>
  );
};

export default JobBoard;