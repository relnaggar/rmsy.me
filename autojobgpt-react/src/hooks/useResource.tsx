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
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  loaded: boolean,
  refetch: () => void,
  removeResource: (id: number) => void,
  removedID: number,
  addResource: (resourceUpload: ResourceUpload) => void,
  updateResource: (id: number, patch: Partial<Resource>) => void,
  updated: boolean,
  errors: {
    fetchError: string,
    deleteError: string,
    postError: string,
    patchError: string,
  }
} {
  const { resources, setResources, loaded, refetch, error: fetchError } = useFetch<Resource>(apiPath);
  const { removeResource, removedID, error: deleteError } = useDelete<Resource>(
    apiPath, resources, setResources
  );  
  const { addResource, error: postError } = usePost<Resource,ResourceUpload>(
    apiPath, resources, setResources, getPlaceholderResource
  );
  const { updateResource, updated, error: patchError } = usePatch<Resource>(apiPath, resources, setResources);

  return {
    resources, setResources, loaded, refetch,
    removeResource, removedID,
    addResource,
    updateResource, updated,
    errors: { fetchError, deleteError, postError, patchError }
  };
}