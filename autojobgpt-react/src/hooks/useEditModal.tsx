import { useCallback, useState } from 'react';

import { ModalMixin } from "../common/InputModal";
import { EditResourceMixin } from '../common/EditModal';


interface EditModalMixin extends ModalMixin, Pick<EditResourceMixin<never>, "editId"> {
  open: (id: number) => void,
};

const useEditModal = (): EditModalMixin => {
  const [show, setShow] = useState<boolean>(false);
  const [editId, setEditId] = useState<number>(-1);

  const open = useCallback((id: number) => {
    setEditId(id);
    setShow(true);
  }, []);

  return { show, setShow, editId, open };
};

export default useEditModal;