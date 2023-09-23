import { JOBS, Job, STATUSES } from './api';

function capitaliseFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Jobs(): JSX.Element {
  return (
    <main>
      <Board columnTitles={STATUSES} jobs={JOBS}/>
    </main>
  );
}

function Board({ columnTitles, jobs }: {columnTitles: string[], jobs: Job[]}): JSX.Element {
  return (
    <div className="kanban-board border">
      {columnTitles.map((columnTitle) => {
        return (
          <Column key={columnTitle} title={columnTitle} jobs={
            jobs.filter((job) => (job.status === "" && columnTitle === "backlog") || (job.status === columnTitle))
          } />
        );
      })}
    </div>
  );
}

function Column({ title, jobs }: {title: string, jobs: Job[]}): JSX.Element {
  return (
    <div className="kanban-column me-2">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">{capitaliseFirstLetter(title)}</h5>
        </div>  
        <div className="card-body">          
          {jobs.map((job) => {
            return <JobCard job={job} key={job.id} />
          })}
        </div>
        <div className="card-footer">
          { title === "backlog" ? "+ add new job" : "" }
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: {job: Job}): JSX.Element {
  return (
    <div className="card mb-2 p-2">
      <h6 className="card-title">{job.title}</h6>
      <p className="card-subtitle">{job.company}</p>
    </div>
  );
}