import {
    compareBoolean,
    compareCaseInsensitive,
    compareCaseSensitive,
    compareDate,
    compareNumber,
    comparePrimitive,
    joinComparator,
    recordComparator
} from "./comparator";

test("Check compareBoolean(true, true)", () => {
    // Execute
    const result = compareBoolean(true, true);

    // Verify
    expect(result).toBe(0);
});

test("Check compareBoolean(true, false)", () => {
    // Execute
    const result = compareBoolean(true, false);

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check compareBoolean(false, true)", () => {
    // Execute
    const result = compareBoolean(false, true);

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check compareNumber(1, 1)", () => {
    // Execute
    const result = compareNumber(1, 1);

    // Verify
    expect(result).toBe(0);
});

test("Check compareNumber(3.3, 3.2)", () => {
    // Execute
    const result = compareNumber(3.3, 3.2);

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check compareNumber(-3.3, -3.2)", () => {
    // Execute
    const result = compareNumber(-3.3, -3.2);

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check compareCaseInsensitive('HeLLo', 'HELLO')", () => {
    // Execute
    const result = compareCaseInsensitive("Hello", "HELLO");

    // Verify
    expect(result).toBe(0);
});

test("Check compareCaseInsensitive('welcome', 'HOME')", () => {
    // Execute
    const result = compareCaseInsensitive("welcome", "HOME");

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check compareCaseInsensitive('HELLO', 'world')", () => {
    // Execute
    const result = compareCaseInsensitive("HELLO", "world");

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check compareCaseSensitive('HeLLo', 'HeLLo')", () => {
    // Execute
    const result = compareCaseSensitive("HeLLo", "HeLLo");

    // Verify
    expect(result).toBe(0);
});

test("Check compareCaseSensitive('welcome', 'WELCOME')", () => {
    // Execute
    const result = compareCaseSensitive("welcome", "WELCOME");

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check compareCaseSensitive('HELLO', 'hello')", () => {
    // Execute
    const result = compareCaseSensitive("HELLO", "hello");

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check compareDate(...) same", () => {
    // Setup
    const a = new Date(1234567890);
    const b = new Date(1234567890);

    // Execute
    const result = compareDate(a, b);

    // Verify
    expect(result).toBe(0);
});

test("Check compareDate(...) greater", () => {
    // Setup
    const a = new Date(1234567890);
    const b = new Date(1234567800);

    // Execute
    const result = compareDate(a, b);

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check compareDate(...) less", () => {
    // Setup
    const a = new Date(1234567890);
    const b = new Date(1234567900);

    // Execute
    const result = compareDate(a, b);

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check comparePrimitive(number, date)", () => {
    // Setup
    const a = 1234567890;
    const b = new Date(1234567890);

    // Execute
    const result = comparePrimitive(a, b);

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check comparePrimitive(date, string)", () => {
    // Setup
    const a = new Date(1234567890);
    const b = "1234567890";

    // Execute
    const result = comparePrimitive(a, b);

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check comparePrimitive(null, boolean)", () => {
    // Setup
    const a = null;
    const b = true;

    // Execute
    const result = comparePrimitive(a, b);

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check comparePrimitive(false, false)", () => {
    // Execute
    const result = comparePrimitive(false, false);

    // Verify
    expect(result).toBe(0);
});

test("Check comparePrimitive(321, 123)", () => {
    // Execute
    const result = comparePrimitive(321, 123);

    // Verify
    expect(result).toBeGreaterThan(0);
});

test("Check comparePrimitive('Hello', 'World')", () => {
    // Execute
    const result = comparePrimitive("Hello", "World");

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check comparePrimitive(321, 123)", () => {
    // Setup
    const a = new Date();

    // Execute
    const result = comparePrimitive(a, a);

    // Verify
    expect(result).toBe(0);
});

test("Check comparePrimitive(null, undefined)", () => {
    // Execute
    const result = comparePrimitive(null, undefined);

    // Verify
    expect(result).toBe(0);
});

test("Check joinComparator(...)", () => {
    // Setup
    const v1 = 123;
    const v2 = 321;

    // Execute
    const result = joinComparator(
        (a, b) => (a === v1 && b === v2 ? 0 : 100),
        (a, b) => (a === v1 && b === v2 ? -1 : 100),
        (a, b) => (a === v1 && b === v2 ? 1 : 100)
    )(v1, v2);

    // Verify
    expect(result).toBe(-1);
});

test("Check recordComparator('num')", () => {
    // Setup
    const r1 = {
        num: 123,
        str: "hello"
    };
    const r2 = {
        num: 321,
        str: "alien"
    };

    // Execute
    const result = recordComparator("num")(r1, r2);

    // Verify
    expect(result).toBeLessThan(0);
});

test("Check recordComparator('str', true)", () => {
    // Setup
    const r1 = {
        num: 123,
        str: "hello"
    };
    const r2 = {
        num: 321,
        str: "world"
    };

    // Execute
    const result = recordComparator("str", true)(r1, r2);

    // Verify
    expect(result).toBeGreaterThan(0);
});
