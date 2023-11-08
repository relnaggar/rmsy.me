import useFetchResumes from './useFetchResumes';
import useDeleteResume from './useDeleteResume';
import usePostResume from './usePostResume';
import { FetchData } from '../../routes/types';
import { Resume, ResumeUpload } from '../types';


export default function useResumes(fetchData: FetchData): {
  resumes: Resume[],
  resumesLoaded: boolean,
  removeResume: (id: number) => void,
  addResume: (resume: ResumeUpload) => void,
  errors: {
    fetchError: string,
    deleteError: string,
    postError: string,
  }
} {
  const { resumes, setResumes, resumesLoaded, error: fetchError } = useFetchResumes(fetchData);
  const { removeResume, error: deleteError } = useDeleteResume(fetchData, resumes, setResumes);
  const { addResume, error: postError } = usePostResume(fetchData, resumes, setResumes);
  return { resumes, resumesLoaded, removeResume, addResume, errors: { fetchError, deleteError, postError } };
}