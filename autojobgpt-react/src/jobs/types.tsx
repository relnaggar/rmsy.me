export type Job = {
  id: number,
  url: string,
  title: string,
  company: string,
  posting: string,
  status: string,
};

export type JobUpload = Pick<
  Job,
  "url" |
  "title" |
  "company" |
  "posting" |
  "status"
>;

export type JobDetails = Pick<
  JobUpload,
  "title" |
  "company" |
  "posting"
>;

export function generatePlaceholderJob(jobUpload: JobUpload): Job {
  return {
    "id": -1,
    "url": jobUpload.url,
    "title": "",
    "company": "",
    "posting": "",
    "status": "",
  }
}