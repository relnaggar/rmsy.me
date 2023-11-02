import React, { createContext, useContext } from "react";


export const ShowModalButtonContext = createContext<{
  setShow: (show: boolean) => void,
  buttonText: string
}>({setShow: (_: boolean) => {}, buttonText: ""});

export default function AddDocument(): React.JSX.Element {
  const {setShow, buttonText} = useContext(ShowModalButtonContext);

  // focus on name input when modal is shown
  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setShow(true);
  }

  return (
    <div className="document">
      <div className="document-image img-thumbnail"></div>
      <div className="document-body">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleClick}
        >{`+ ${buttonText}`}</button>
      </div>
    </div>
  );
}