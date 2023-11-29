import React from "react";

export default function AddDocument({ onClickAddDocument, buttonText, disabled }: {
  onClickAddDocument: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  buttonText: string,
  disabled: boolean,
}): React.JSX.Element {
  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onClickAddDocument}
          disabled={disabled}
        >{`+ ${buttonText}`}</button>
      </div>
    </div>
  );
}