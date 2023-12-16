import React from 'react';


interface AddColumnModalProps {
  onClick: () => void,
  disabled: boolean,
};

const AddColumnButton = ({ onClick, disabled }: AddColumnModalProps): React.JSX.Element => {
  return (
    <div className="kanban-column me-2">
      <div className="card">
        <div className="card-body text-center">
          <button type="button" className="btn btn-primary" onClick={onClick} disabled={disabled}>
            + Add column
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddColumnButton;