import usePost from "./usePost";
import { UseErrorAlert } from "./useErrorAlert";
import { removeOnePlaceholderResource } from "../common/utils";
import { WithId } from "../api/types";
import { UseResource } from "./useResource";


interface UseDuplicateParams<Resource extends WithId> extends
  Pick<UseResource<Resource, unknown>, "apiPath" | "setResources">,
  UseErrorAlert
{};

interface UseDuplicate<Resource extends WithId> {
  duplicate: (id: number, placeholderResource: Resource) => Promise<void>;
};

const useDuplicate = <Resource extends WithId>({
  apiPath,
  setResources,
  ...errorAlert
}: UseDuplicateParams<Resource>): UseDuplicate<Resource> => {  
  const handleDuplicateSuccess = (resource: Resource) => {
    removeOnePlaceholderResource(setResources);
    setResources(resources => [...resources, resource]);
    errorAlert.clearErrors();
  };

  const handleDuplicateFail = (errors: Record<string,string[]>) => {
    removeOnePlaceholderResource(setResources);
    errorAlert.showErrors(errors);
  };

  const { post } = usePost<Resource>({
    onSuccess: handleDuplicateSuccess,
    onFail: handleDuplicateFail,
  });

  const duplicate = async (id: number, placeholderResource: Resource): Promise<void> => {
    setResources(resources => [...resources, placeholderResource]);
    await post({ apiPath: `${apiPath}${id}/duplicate/` });
  }

  return { duplicate };
};

export default useDuplicate;