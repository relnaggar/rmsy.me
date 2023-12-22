import { useState, useCallback } from "react";

import { Job, Status } from '../api/types';


export interface UseDrag {
  handleDragStart: (jobId: number) => (e: React.DragEvent<HTMLDivElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (endStatus: Status) => (e: React.DragEvent<HTMLDivElement>) => void
};

const useDrag = (
  jobs: Job[],
  statuses: Status[],
  patchJob: (id: number, data: Partial<Job>) => void
): UseDrag => {
  const [draggingJobId, setDraggingJobId] = useState<number>(-1);

  const handleDragStart = useCallback((jobId: number) => (e: React.DragEvent<HTMLDivElement>): void => {
    setDraggingJobId(jobId);
    try { // e.currentTarget not supported in jsdom
      e.currentTarget.scrollIntoView({behavior: "smooth", block: "center"});
    } catch (error) {}
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((endStatus: Status) => (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault(); // prevent page from reloading    
    const job: Job = jobs.find((job) => job.id === draggingJobId)!;
    const jobStatus: Status = statuses.find((status) => status.id === job.status)!;
    if (jobStatus.order !== endStatus.order) {      
      patchJob(draggingJobId, {status: endStatus.id});
      setDraggingJobId(-1);
    }
  }, [jobs, statuses, draggingJobId, patchJob]);

  return {handleDragStart, handleDragOver, handleDrop};
};

export default useDrag;