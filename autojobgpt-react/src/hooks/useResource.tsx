import useFetchResource, { UseFetchResource } from './useFetchResource';
import useDeleteResource, { UseDeleteResource } from './useDeleteResource';
import usePostResource, { UsePostResource} from './usePostResource';
import usePatchResource, { UsePatchResource } from './usePatchResource';
import { WithId } from '../api/types';


export interface UseResource<Resource extends WithId, ResourceUpload> extends
  UseFetchResource<Resource>,
  UsePostResource<ResourceUpload>,
  UseDeleteResource,
  UsePatchResource<Resource>
{
  apiPath: string,
};

const useResource = <Resource extends WithId, ResourceUpload>(
  apiPath: string,
  getPlaceholderResource: (resourceUpload: ResourceUpload) => Resource,
  options?: {
    onFetchSuccess?: (resources: Resource[]) => void,
    onFetchFail?: (errors: Record<string,string[]>) => void,
    onPostSuccess?: (resource: Resource) => void,
    onPostFail?: (errors: Record<string,string[]>) => void,
    onDeleteSuccess?: (deletedResource: Resource, setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onDeleteFail?: (errors: Record<string,string[]>) => void,
    onPatchSuccess?: (resource: Resource, setResources: React.Dispatch<React.SetStateAction<Resource[]>>) => void,
    onPatchFail?: (errors: Record<string,string[]>) => void,
  },
): UseResource<Resource,ResourceUpload> => {
  const {
    onPostSuccess,
    onPostFail,
    onFetchSuccess,
    onFetchFail,
    onDeleteSuccess,
    onDeleteFail,
    onPatchSuccess,
    onPatchFail,
  } = options || {};

  const fetchResource = useFetchResource<Resource>(apiPath, {
    onSuccess: onFetchSuccess,
    onFail: onFetchFail
  });

  const { resources, setResources } = fetchResource;

  const postResource = usePostResource<Resource,ResourceUpload>(apiPath, resources, setResources, getPlaceholderResource, {
    onSuccess: onPostSuccess,
    onFail: onPostFail,
  });

  const deleteResource = useDeleteResource<Resource>(apiPath, resources, setResources, {
    onSuccess: onDeleteSuccess,
    onFail: onDeleteFail
  });

  const patchResource = usePatchResource<Resource>(apiPath, resources, setResources, {
    onSuccess: onPatchSuccess,
    onFail: onPatchFail
  });

  return { apiPath, ...fetchResource, ...postResource, ...deleteResource, ...patchResource };
};

export default useResource;