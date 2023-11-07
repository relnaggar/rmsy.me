import React from "react";

export default function AddDocument({ onClickAddDocument, buttonText }: {
  onClickAddDocument: () => void,
  buttonText: string,
}): React.JSX.Element {
  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => onClickAddDocument()}
        >{`+ ${buttonText}`}</button>
      </div>
    </div>
  );
}