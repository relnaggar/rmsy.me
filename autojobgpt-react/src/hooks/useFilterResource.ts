import useInputControl from "./useInputControl";
import { WithId } from "../api/types";
import { CommonFilterResourceProps } from "../common/FilterResourceSelect";


interface UseFilterResource<Resource extends WithId, FilterByOption extends WithId>
    extends CommonFilterResourceProps<FilterByOption> {
  filteredResources: Resource[],
};

const useFilterResource = <Resource extends WithId, FilterByOption extends WithId>(
  resources: Resource[],
  filterByKey: keyof Resource,
): UseFilterResource<Resource,FilterByOption > => {
  const inputControl = useInputControl("0");

  const filterByOptionIds: number[] = [];
  const filterByOptions: FilterByOption[] = [];
  resources.forEach((resource) => {
    if (resource.id !== -1 && !filterByOptionIds.includes((resource[filterByKey] as FilterByOption).id)) {
      filterByOptionIds.push((resource[filterByKey] as FilterByOption).id);
      
      // add filterByOption to filterByOptions in order of id
      let i: number = 0;
      while (i < filterByOptions.length && filterByOptions[i].id < (resource[filterByKey] as FilterByOption).id) {
        i++;
      }
      filterByOptions.splice(i, 0, (resource[filterByKey] as FilterByOption));      
    }
  });

  let filteredResources: Resource[]
  if (inputControl.value === "0") {
    filteredResources = resources;
  } else {
    filteredResources = resources.filter(
      (resource) => (resource[filterByKey] as FilterByOption).id === parseInt(inputControl.value)
    );
  }

  return { inputControl, filterByOptions, filteredResources };
};

export default useFilterResource;