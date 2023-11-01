import { injectMocks } from "../common/testUtilities";

beforeEach(() => {
  jest.clearAllMocks();
  injectMocks();
});

test("dummy test", () => {
  expect(true).toBeTruthy();
});