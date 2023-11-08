import useFetch from './useFetch';
import useDelete from './useDelete';
import usePost from './usePost';
import usePatch from './usePatch';
import { WithID } from '../common/types';


export default function useResource<Resource extends WithID, ResourceUpload>(
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
  const { resources, setResources, loaded, error: fetchError } = useFetch<Resource>(apiPath);
  const { removeResource, error: deleteError } = useDelete<Resource>(apiPath, resources, setResources);  
  const { addResource, error: postError } = usePost<Resource,ResourceUpload>(
    apiPath, resources, setResources, getPlaceholderResource);
  const { updateResource, error: patchError } = usePatch<Resource>(apiPath, resources, setResources);

  return { resources, loaded, removeResource, addResource, updateResource, errors: {
    fetchError, deleteError, postError, patchError
  } };
}