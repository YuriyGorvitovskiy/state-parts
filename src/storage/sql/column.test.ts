import * as SB from "./column";

test("Column", () => {
    // Execute
    const result = SB.column("boolean", "user", "name").toSql();

    // Success
    expect(result).toEqual("user.name");
});
