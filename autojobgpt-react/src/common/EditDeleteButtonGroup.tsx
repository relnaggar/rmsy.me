import React from 'react';
import { ReactComponent as PencilSquareIcon } from "bootstrap-icons/icons/pencil-square.svg";
import { ReactComponent as Trash3Icon } from "bootstrap-icons/icons/trash3.svg";


export interface EditDeleteButtonGroupProps {
  onClickEdit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onClickRemove: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  beingRemoved: boolean;
  small?: boolean;
};

const EditDeleteButtonGroup = ({
  onClickEdit,
  onClickRemove,
  beingRemoved,
  small = false,
}: EditDeleteButtonGroupProps): React.JSX.Element => {
  const buttonClass: string = `btn btn-secondary${small ? " btn-sm" : ""}`;

  return (
    <div className="btn-group ms-1" role="group">
      <button aria-label="Edit"
        type="button" className={buttonClass} onClick={onClickEdit} disabled={beingRemoved}
      >
        <PencilSquareIcon />
      </button>
      <button aria-label="Delete"
        type="button" className={buttonClass} onClick={onClickRemove} disabled={beingRemoved}
      >
        {beingRemoved ?
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Removing...</span>
          </div>
        :
          <Trash3Icon />
        }
      </button>
    </div>
  );
};

export default EditDeleteButtonGroup;