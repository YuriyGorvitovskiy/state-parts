import { IEntity, IPatch, PatchOp } from "state-glue";
import { Index } from "./index";
import { IRecord } from "./record";
import { Table } from "./table";

const TYPE_USER = "user";
const TYPE_TASK = "task";
const ATTR_ASSIGNEE = "assignee";
const ATTR_DESCRIPTION = "description";
const ATTR_TITLE = "title";

test("Test constructor", () => {
    // Execute
    const result = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);

    // Verify
    expect((result as any).type).toBe(TYPE_TASK);
    expect((result as any).records).toEqual({});
    expect((result as any).indexes).toEqual({
        assignee: new Index(ATTR_ASSIGNEE),
        title: new Index(ATTR_TITLE)
    });
    expect((result as any).totalCount).toBe(0);
});

test("Test apply insert patch", () => {
    // Setup
    const subject = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);
    const patch: IPatch = {
        attr: {
            assignee: "234",
            description: "write unit test to insert patch",
            title: "write the test"
        },
        id: "123",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    };

    // Execute
    subject.apply(patch);

    // Verify
    expect((subject as any).totalCount).toBe(1);
    expect((subject as any).indexes.assignee.keyCount).toBe(1);
    expect((subject as any).indexes.title.keyCount).toBe(1);
    const promise = subject.select({
        attr: [ATTR_ASSIGNEE, ATTR_DESCRIPTION, ATTR_TITLE],
        filter: {},
        type: TYPE_TASK
    });
    return promise.then(result =>
        expect(result).toEqual([
            {
                attr: {
                    assignee: "234",
                    description: "write unit test to insert patch",
                    title: "write the test"
                },
                id: "123",
                type: TYPE_TASK
            }
        ] as IEntity[])
    );
});

test("Test apply upsert patch", () => {
    // Setup
    const subject = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);
    const patchBefore: IPatch = {
        attr: {
            assignee: "234",
            description: "write unit test to insert patch",
            title: "write the test"
        },
        id: "123",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    };
    subject.apply(patchBefore);

    const patch: IPatch = {
        attr: {
            assignee: "234",
            description: "write unit test to upsert patch",
            title: "write another the test"
        },
        id: "123",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    };

    // Execute
    subject.apply(patch);

    // Verify
    expect((subject as any).totalCount).toBe(1);
    expect((subject as any).indexes.assignee.keyCount).toBe(1);
    expect((subject as any).indexes.title.keyCount).toBe(1);
    const promise = subject.select({
        attr: [ATTR_ASSIGNEE, ATTR_DESCRIPTION, ATTR_TITLE],
        filter: {},
        type: TYPE_TASK
    });
    return promise.then(result =>
        expect(result).toEqual([
            {
                attr: {
                    assignee: "234",
                    description: "write unit test to upsert patch",
                    title: "write another the test"
                },
                id: "123",
                type: TYPE_TASK
            }
        ] as IEntity[])
    );
});

test("Test apply upsert patch for wrong type", () => {
    // Setup
    const subject = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);
    const patch: IPatch = {
        attr: {
            name: "Tom"
        },
        id: "123",
        op: PatchOp.UPSERT,
        type: TYPE_USER
    };

    // Execute
    subject.apply(patch);

    // Verify
    expect((subject as any).totalCount).toBe(0);
    expect((subject as any).indexes.assignee.keyCount).toBe(0);
    expect((subject as any).indexes.title.keyCount).toBe(0);
    const promise = subject.select({
        attr: [ATTR_ASSIGNEE, ATTR_DESCRIPTION, ATTR_TITLE],
        filter: {},
        type: TYPE_TASK
    });
    return promise.then(result => expect(result).toEqual([]));
});

test("Test apply update patch", () => {
    // Setup
    const subject = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);
    const patchBefore: IPatch = {
        attr: {
            assignee: "234",
            description: "write unit test to insert patch",
            title: "write the test"
        },
        id: "123",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    };
    subject.apply(patchBefore);

    const patch: IPatch = {
        attr: {
            assignee: "234",
            description: "write unit test to update patch"
        },
        id: "123",
        op: PatchOp.UPDATE,
        type: TYPE_TASK
    };

    // Execute
    subject.apply(patch);

    // Verify
    expect((subject as any).totalCount).toBe(1);
    expect((subject as any).indexes.assignee.keyCount).toBe(1);
    expect((subject as any).indexes.title.keyCount).toBe(1);
    const promise = subject.select({
        attr: [ATTR_ASSIGNEE, ATTR_DESCRIPTION, ATTR_TITLE],
        filter: {},
        type: TYPE_TASK
    });
    return promise.then(result =>
        expect(result).toEqual([
            {
                attr: {
                    assignee: "234",
                    description: "write unit test to update patch",
                    title: "write the test"
                },
                id: "123",
                type: TYPE_TASK
            }
        ] as IEntity[])
    );
});

test("Test apply update patch of not existing record", () => {
    // Setup
    const subject = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);
    const patch: IPatch = {
        attr: {
            assignee: "234",
            description: "write unit test to update patch"
        },
        id: "123",
        op: PatchOp.UPDATE,
        type: TYPE_TASK
    };

    // Execute
    subject.apply(patch);

    // Verify
    expect((subject as any).totalCount).toBe(0);
    expect((subject as any).indexes.assignee.keyCount).toBe(0);
    expect((subject as any).indexes.title.keyCount).toBe(0);
    const promise = subject.select({
        attr: [ATTR_ASSIGNEE, ATTR_DESCRIPTION, ATTR_TITLE],
        filter: {},
        type: TYPE_TASK
    });
    return promise.then(result => expect(result).toEqual([]));
});

test("Test apply delete patch", () => {
    // Setup
    const subject = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);
    const patchBefore: IPatch = {
        attr: {
            assignee: "234",
            description: "write unit test to insert patch",
            title: "write the test"
        },
        id: "123",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    };
    subject.apply(patchBefore);

    const patch: IPatch = {
        id: "123",
        op: PatchOp.DELETE,
        type: TYPE_TASK
    };

    // Execute
    subject.apply(patch);

    // Verify
    expect((subject as any).totalCount).toBe(0);
    expect((subject as any).indexes.assignee.keyCount).toBe(0);
    expect((subject as any).indexes.title.keyCount).toBe(0);
    const promise = subject.select({
        attr: [ATTR_ASSIGNEE, ATTR_DESCRIPTION, ATTR_TITLE],
        filter: {},
        type: TYPE_TASK
    });
    return promise.then(result => expect(result).toEqual([]));
});

test("Test apply delete patch of not existing record", () => {
    // Setup
    const subject = new Table(TYPE_TASK, ATTR_ASSIGNEE, ATTR_TITLE);
    const patch: IPatch = {
        id: "123",
        op: PatchOp.DELETE,
        type: TYPE_TASK
    };

    // Execute
    subject.apply(patch);

    // Verify
    expect((subject as any).totalCount).toBe(0);
    expect((subject as any).indexes.assignee.keyCount).toBe(0);
    expect((subject as any).indexes.title.keyCount).toBe(0);
    const promise = subject.select({
        attr: [ATTR_ASSIGNEE, ATTR_DESCRIPTION, ATTR_TITLE],
        filter: {},
        type: TYPE_TASK
    });
    return promise.then(result => expect(result).toEqual([]));
});

function prepareTableForSelect(): Table {
    const subject = new Table(TYPE_TASK, ATTR_TITLE);
    subject.apply({
        attr: {
            description: "Desription C",
            title: "task1"
        },
        id: "1",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    });
    subject.apply({
        attr: {
            description: "Desription A",
            title: "task2"
        },
        id: "2",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    });
    subject.apply({
        attr: {
            description: "Desription B",
            title: "task3"
        },
        id: "3",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    });
    subject.apply({
        attr: {
            description: "Desription E",
            title: "task4"
        },
        id: "4",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    });
    subject.apply({
        attr: {
            description: "Desription D",
            title: "task5"
        },
        id: "5",
        op: PatchOp.UPSERT,
        type: TYPE_TASK
    });

    return subject;
}

test("Test select by id", () => {
    // Setup
    const subject = prepareTableForSelect();

    // Execute
    const promise = subject.select({
        attr: [ATTR_TITLE],
        filter: { id: [null, "2", "1", "wrong"] },
        type: TYPE_TASK
    });

    // Verify
    return promise.then(result =>
        expect(result).toEqual([
            {
                attr: {
                    title: "task2"
                },
                id: "2",
                type: TYPE_TASK
            },
            {
                attr: {
                    title: "task1"
                },
                id: "1",
                type: TYPE_TASK
            }
        ] as IEntity[])
    );
});

test("Test select by index", () => {
    // Setup
    const subject = prepareTableForSelect();

    // Execute
    const promise = subject.select({
        attr: [ATTR_TITLE],
        filter: { title: ["task2", "task4", "wrong"] },
        type: TYPE_TASK
    });

    // Verify
    return promise.then(result =>
        expect(result).toEqual([
            {
                attr: {
                    title: "task2"
                },
                id: "2",
                type: TYPE_TASK
            },
            {
                attr: {
                    title: "task4"
                },
                id: "4",
                type: TYPE_TASK
            }
        ] as IEntity[])
    );
});

test("Test select by non index value", () => {
    // Setup
    const subject = prepareTableForSelect();

    // Execute
    const promise = subject.select({
        attr: [ATTR_TITLE],
        filter: { description: ["wrong", "Desription B", "Desription C"] },
        sort: [
            {
                attr: "id",
                desc: true
            }
        ],
        type: TYPE_TASK
    });

    // Verify
    return promise.then(result =>
        expect(result).toEqual([
            {
                attr: {
                    title: "task3"
                },
                id: "3",
                type: TYPE_TASK
            },
            {
                attr: {
                    title: "task1"
                },
                id: "1",
                type: TYPE_TASK
            }
        ] as IEntity[])
    );
});

test("Test select by index with sorting and pagination", () => {
    // Setup
    const subject = prepareTableForSelect();

    // Execute
    const promise = subject.select({
        attr: [ATTR_DESCRIPTION],
        filter: { title: ["task1", "task2", "task3", "task4", "task5"] },
        page: {
            from: 2,
            max: 2
        },
        sort: [{ attr: ATTR_DESCRIPTION }],
        type: TYPE_TASK
    });

    // Verify
    return promise.then(result =>
        expect(result).toEqual([
            {
                attr: {
                    description: "Desription C"
                },
                id: "1",
                type: TYPE_TASK
            },
            {
                attr: {
                    description: "Desription D"
                },
                id: "5",
                type: TYPE_TASK
            }
        ] as IEntity[])
    );
});

test("Test select nothing with sorting and pagination", () => {
    // Setup
    const subject = prepareTableForSelect();

    // Execute
    const promise = subject.select({
        attr: [ATTR_DESCRIPTION, ATTR_TITLE],
        filter: { id: [null, undefined, "wrong"] },
        page: {
            from: 2,
            max: 2
        },
        sort: [{ attr: ATTR_DESCRIPTION }],
        type: TYPE_TASK
    });

    // Verify
    return promise.then(result => expect(result).toEqual([]));
});
