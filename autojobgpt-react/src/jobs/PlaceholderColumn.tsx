import React from 'react';

import PlaceholderJob from './PlaceholderJob';


interface PlaceholderColumnProps {
  jobs: number,
};

const PlaceholderColumn = ({ jobs }: PlaceholderColumnProps): React.JSX.Element => {
  return (
    <div className="kanban-column me-2">
      <div className="card">
        <div className="card-header">
          <h5 className="mt-2 card-title">
            <span className="placeholder-glow">
              <span className="placeholder col-6"></span>
            </span>
          </h5>
        </div>  
        <div className="card-body">
          {[...Array(jobs)].map((_, index) => <PlaceholderJob key={index} />)}
        </div>
        <div className="card-footer"></div>
      </div>
    </div>
  );
};

export default PlaceholderColumn;