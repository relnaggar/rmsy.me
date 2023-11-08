import useFetch from './useFetch';
import useDelete from './useDelete';
import usePost from './usePost';
import usePatch from './usePatch';
import { WithID } from '../common/types';
import { FetchData } from '../routes/types';


export default function useResource<Resource extends WithID, ResourceUpload>(
  fetchData: FetchData,
  apiPath: string,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
): {
  resources: Resource[],
  loaded: boolean,
  removeResource: (id: number) => void,
  addResource: (resourceUpload: ResourceUpload) => void,
  updateResource: (id: number, patch: Partial<Resource>) => void,
  errors: {
    fetchError: string,
    deleteError: string,
    postError: string,
    patchError: string
  }
} {
  const { resources, setResources, loaded, error: fetchError } = useFetch<Resource>(fetchData, apiPath);
  const { removeResource, error: deleteError } = useDelete<Resource>(fetchData, apiPath, resources, setResources);  
  const { addResource, error: postError } = usePost<Resource,ResourceUpload>(
    fetchData, apiPath, resources, setResources, getPlaceholderResource);
  const { updateResource, error: patchError } = usePatch<Resource>(fetchData, apiPath, resources, setResources);

  return { resources, loaded, removeResource, addResource, updateResource, errors: {
    fetchError, deleteError, postError, patchError
  } };
}