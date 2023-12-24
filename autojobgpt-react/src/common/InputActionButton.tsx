import React from "react";


interface InputActionButtonProps {
  controlsId: string,
  label: string,
  loading: boolean,
  disabled?: boolean,
  onClickAction: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  onClickCancel: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
  icon: React.JSX.Element,
};

const InputActionButton = ({
  controlsId,
  label,
  loading,
  disabled = false,
  onClickAction,
  onClickCancel,
  icon,
}: InputActionButtonProps): React.JSX.Element => {
  return (
    <button aria-controls={controlsId}
      className="btn btn-outline-primary" type="button" onClick={loading ? onClickCancel : onClickAction }
      disabled={disabled}
    >
      {loading ? <>
        <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
        Cancel
      </>:<>
        <span className="me-1">{icon}</span>
        {label}
      </>}
    </button>
  );
};

export default InputActionButton;