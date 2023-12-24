import { WithId } from "../api/types";


export const sortByIdPlaceholdersAtTheEnd = (array: WithId[]): void => {
  array.sort((a, b) => {
    if (a.id === -1) {
      return 1;
    } else if (b.id === -1) {
      return -1;
    } else {
      return a.id - b.id;
    }
  });
};

export const removeOnePlaceholderResource = <Resource extends WithId>(
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>
): void => {
  setResources(resources => {
    const indexToRemove = resources.map(resource => resource.id).lastIndexOf(-1);
    if (indexToRemove !== -1) {
      return [...resources.slice(0, indexToRemove), ...resources.slice(indexToRemove + 1)];
    } else {
      return resources;
    }
  });
};