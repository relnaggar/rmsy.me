import { useCallback, useState } from 'react';

import { CommonModalProps } from "../common/InputModal";
import { CommonEditModalProps } from '../common/EditModal';


interface UseEditModal extends CommonModalProps, Pick<CommonEditModalProps<never>, "editId"> {
  open: (id: number) => void,
  close: () => void,
};

const useEditModal = (): UseEditModal => {
  const [show, setShow] = useState<boolean>(false);
  const [editId, setEditId] = useState<number>(-1);

  const open = useCallback((id: number) => {
    setEditId(id);
    setShow(true);
  }, []);

  const close = useCallback(() => {
    setShow(false);
  }, []);

  return { show, setShow, editId, open, close };
};

export default useEditModal;