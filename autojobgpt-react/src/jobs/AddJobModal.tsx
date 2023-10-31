import { closeModal } from "../common/utilities";

export default function AddJobModal({ addJob }: {
  addJob: (url: string) => void,
}): React.JSX.Element {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const modal: HTMLElement = document.getElementById("addJobModal")!;
    closeModal(modal);
    const url: string = (document.getElementById("url") as HTMLInputElement).value;
    addJob(url);
    e.currentTarget.reset();   
  }

  return (
    <div className="modal fade" id="addJobModal" tabIndex={-1} aria-labelledby="addJobModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="addJobModalLabel">Add Job</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="url" className="form-label">URL</label>
                <input type="url" className="form-control" id="url" name="url" required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}