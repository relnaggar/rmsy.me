import React from "react";


const PlaceholderJob = (): React.JSX.Element => {
  return (
    <div className="card mb-2 p-2" aria-hidden="true">
      <h6 className="card-title placeholder-glow">
        <span className="placeholder col-6"></span>
      </h6>
      <p className="card-subtitle placeholder-glow">
        <span className="placeholder col-7"></span>
      </p>
    </div>
  );
};

export default PlaceholderJob;