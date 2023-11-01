import React, { createContext, useContext } from "react";


export const ModalContext = createContext<{modalId: string, modalFocusId: string}>({modalId: "", modalFocusId: ""});

export default function AddDocument({ buttonText }: {
  buttonText: string
}): React.JSX.Element {
  const {modalId, modalFocusId}: {modalId: string, modalFocusId: string} = useContext(ModalContext);

  // focus on name input when modal is shown
  function handleAddDocumentClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const modal: HTMLElement = document.getElementById(modalId)!;
    modal.addEventListener("shown.bs.modal", () => {
      document.getElementById(modalFocusId)?.focus();
    });
  }

  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target={`#${modalId}`}
          onClick={handleAddDocumentClick}
        >{`+ ${buttonText}`}</button>
      </div>
    </div>
  );
}