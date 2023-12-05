import useFetch from './useFetch';
import useDelete from './useDelete';
import usePostResource from './usePostResource';
import usePatch from './usePatch';
import { WithID } from '../common/types';


export default function useResource<Resource extends WithID, ResourceUpload>(
  apiPath: string,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
  options?: {
    onFetchSuccess?: (resources: Resource[]) => void,
    onFetchFail?: (errors: Record<string,string>) => void,
    onPostSuccess?: (resource: Resource) => void,
    onPostFail?: (errors: Record<string,string>) => void,
    onDeleteSuccess?: () => void,
    onDeleteFail?: (errors: Record<string,string>) => void,
    onPatchSuccess?: (resource: Resource, resources: Resource[], setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onPatchFail?: (errors: Record<string,string>) => void,
  },
): {
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  fetching: boolean,
  refetch: () => void,
  posting: boolean,
  postResource: (resourceUpload: ResourceUpload) => void,
  deleteResource: (id: number) => void,
  idBeingDeleted: number,
  patching: boolean,
  patchResource: (id: number, patch: Partial<Resource>) => void,
} {
  let {
    onPostSuccess,
    onPostFail,
    onFetchSuccess,
    onFetchFail,
    onDeleteSuccess,
    onDeleteFail,
    onPatchSuccess,
    onPatchFail,
  } = options || {};

  const { resource: resources, setResource: setResources, fetching, refetch } = useFetch<Resource[]>(apiPath, {
    initialResource: [],
    onSuccess: onFetchSuccess,
    onFail: onFetchFail
  });

  const { posting, postResource } = usePostResource<Resource,ResourceUpload>(apiPath, resources, setResources,
    getPlaceholderResource, {
    onSuccess: onPostSuccess,
    onFail: onPostFail,
  });

  const { deleteResource, idBeingDeleted } = useDelete<Resource>(apiPath, resources, setResources, {
    onSuccess: onDeleteSuccess,
    onFail: onDeleteFail
  });

  const { patchResource, patching } = usePatch<Resource>(apiPath, resources, setResources, {
    onSuccess: onPatchSuccess,
    onFail: onPatchFail
  });

  return {
    resources, setResources, fetching, refetch,
    posting, postResource,
    deleteResource, idBeingDeleted,    
    patching, patchResource,
  };
}