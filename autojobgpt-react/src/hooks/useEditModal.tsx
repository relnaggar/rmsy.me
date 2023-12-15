import React, { useCallback, useState } from 'react';


interface EditModalMixin {
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  editId: number,
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