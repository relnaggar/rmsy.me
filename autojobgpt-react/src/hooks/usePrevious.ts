import { useEffect, useRef } from 'react';


const usePrevious = (value: any): any => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default usePrevious;