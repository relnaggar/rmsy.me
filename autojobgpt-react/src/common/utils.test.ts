import { toPascalCase } from "./utils";


test("toPascalCase", () => {
    expect(toPascalCase("test")).toBe("Test");
    expect(toPascalCase("Test")).toBe("Test");
    expect(toPascalCase("TEST")).toBe("Test");
    expect(toPascalCase("tEST")).toBe("Test");    
});