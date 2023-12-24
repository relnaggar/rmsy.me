import React from "react";


export interface AddDocumentButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  buttonText: string;
}

const AddDocumentButton = ({
  onClick,
  buttonText,
}: AddDocumentButtonProps): React.JSX.Element => {
  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button type="button" className="btn btn-primary" onClick={onClick}>
          {`+ ${buttonText}`}
        </button>
      </div>
    </div>
  );
};

export default AddDocumentButton;