import { first, isEmpty } from "./container";

test("Check first(null)", () => {
    // Execute
    const result = first(null);

    // Verify
    expect(result).toBe(null);
});

test("Check first([])", () => {
    // Execute
    const result = first([]);

    // Verify
    expect(result).toBe(null);
});

test("Check first([2,1,3])", () => {
    // Execute
    const result = first([2, 1, 3]);

    // Verify
    expect(result).toBe(2);
});

test("Check isEmpty(null)", () => {
    // Execute
    const result = isEmpty(null);

    // Verify
    expect(result).toBe(true);
});

test("Check isEmpty([])", () => {
    // Execute
    const result = isEmpty([]);

    // Verify
    expect(result).toBe(true);
});

test("Check isEmpty([2,1,3])", () => {
    // Execute
    const result = isEmpty([null]);

    // Verify
    expect(result).toBe(false);
});
