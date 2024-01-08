import "@testing-library/jest-dom";


jest.setTimeout(10000);

const localStorageMock = {
  getItem: (key: string) => {
    return "";
  },
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'scrollTo', {
  value: () => {}
});