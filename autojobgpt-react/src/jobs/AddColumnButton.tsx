import React from 'react';


interface AddColumnModalProps {
  onClick: () => void,
};

const AddColumnButton = ({ onClick }: AddColumnModalProps): React.JSX.Element => {
  return (
    <div className="kanban-column me-2">
      <div className="card">
        <div className="card-body text-center">
          <button type="button" className="btn btn-primary" onClick={onClick}>
            + Add column
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddColumnButton;