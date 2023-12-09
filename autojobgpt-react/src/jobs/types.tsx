export type Status = {
  id: number,
  name: string,
  order: number,
};

export type StatusUpload = Pick<
  Status,
  "name"
>;

export function generatePlaceholderStatus(): Status {
  return {
    "id": -1,
    "name": "",
    "order": -1
  }
}

export type Job = {
  id: number,
  url: string,
  title: string,
  company: string,
  posting: string,
  status: number,
};

export type JobUpload = Pick<
  Job,
  "url" |
  "title" |
  "company" |
  "posting"
>;

export type JobDetails = Pick<
  JobUpload,
  "title" |
  "company" |
  "posting"
>;

export const generatePlaceholderJob = (): Job => {
  return {
    "id": -1,
    "url": "",
    "title": "",
    "company": "",
    "posting": "",
    "status": -1,
  }
};