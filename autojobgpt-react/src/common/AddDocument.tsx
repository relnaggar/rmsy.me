import React from "react";

export default function AddDocument({ onClickAddDocument, buttonText }: {
  onClickAddDocument: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  buttonText: string,
}): React.JSX.Element {
  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onClickAddDocument}
        >{`+ ${buttonText}`}</button>
      </div>
    </div>
  );
}