import { Index } from "./index";
import { IRecord } from "./record";

const attr: string = "name";
const unique: string = "Unique";
const double: string = "Double";
const record1: IRecord = {
    name: unique,
    value: "value1"
};
const record2: IRecord = {
    name: double,
    value: "value2"
};
const record3: IRecord = {
    name: double,
    value: "value3"
};

const record4: IRecord = {
    name: "",
    value: "value4"
};

const record5: IRecord = {
    name: null,
    value: "value5"
};

const record6: IRecord = {
    value: "value6"
};

let subject: Index = null;

beforeEach(() => {
    subject = new Index(attr);
});

test("Index.get() from empty Index", () => {
    // Execute
    const result = subject.get(unique);

    // Verify
    expect(result).toEqual([]);
});

test("Index.get() Not-Existing entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);

    // Execute
    const result = subject.get("Not-Existing");

    // Verify
    expect(result).toEqual([]);
});

test("Index.get() Unique entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);

    // Execute
    const result = subject.get(unique);

    // Verify
    expect(result).toEqual([record1]);
});

test("Index.get() Double entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);

    // Execute
    const result = subject.get(double);

    // Verify
    expect(result).toEqual([record2, record3]);
});

test("Index.get() null entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);
    subject.update(null, record4);
    subject.update(null, record5);
    subject.update(null, record6);

    // Execute
    const result = subject.get(null);

    // Verify
    expect(result).toEqual([record4, record5, record6]);
});

test("Index.getFirst() unique entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);

    // Execute
    const result = subject.getFirst(unique);

    // Verify
    expect(result).toEqual(record1);
});

test("Index.getFirst() double entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);

    // Execute
    const result = subject.getFirst(double);

    // Verify
    expect(result).toEqual(record2);
});

test("Index.getFirst() Not-Existing entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);

    // Execute
    const result = subject.getFirst("Not-Existing");

    // Verify
    expect(result).toBeNull();
});

test("Index.getForAll() unique entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);
    subject.update(null, record4);
    subject.update(null, record5);
    subject.update(null, record6);

    // Execute
    const result = subject.getForAll(["", unique]);

    // Verify
    expect(result).toEqual([record4, record5, record6, record1]);
});

test("Index.getKeyCount() after insert entry", () => {
    // Setup
    subject.update(null, record1);
    subject.update(null, record2);
    subject.update(null, record3);
    subject.update(null, record4);
    subject.update(null, record5);

    subject.update(record1, record1);
    subject.update(record2, record6);
    subject.update(record3, null);

    subject.update(record4, null);

    // Execute
    const result = subject.getKeyCount();

    // Verify
    expect(result).toBe(2);
});
