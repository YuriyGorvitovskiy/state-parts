import { IEntity, IEntityProvider, IPatch, IPatchConsumer, ISelector, PatchOp } from "state-glue";
import { InMemoryStorage } from "./storage";

const TYPE_CLASS = "class";
const TYPE_ATTRIBUTE = "attribute";
const TYPE_TASK = "task";
const TYPE_USER = "user";

let consumer: IPatchConsumer = null;
let provider: IEntityProvider = null;

beforeEach(() => {
    const storage = new InMemoryStorage();
    consumer = storage;
    provider = storage;

    consumer.apply({
        id: TYPE_CLASS,
        op: PatchOp.UPSERT,
        type: TYPE_CLASS,
    });
    consumer.apply({
        id: TYPE_ATTRIBUTE,
        op: PatchOp.UPSERT,
        type: TYPE_CLASS,
    });
    consumer.apply({
        id: TYPE_TASK,
        op: PatchOp.UPSERT,
        type: TYPE_CLASS,
    });
});

test("Upsert patch", () => {
    // Setup
    const patch: IPatch = {
        id: TYPE_USER,
        op: PatchOp.UPSERT,
        type: TYPE_CLASS,
    };

    // Execute
    consumer.apply(patch);

    // Verify
    const selector: ISelector = {
        attr: [],
        filter: {
            id: [TYPE_USER],
        },
        type: TYPE_CLASS,
    };

    return provider.select(selector).then((result) => {
        expect(result).toEqual([
            {
                attr: {},
                id: TYPE_USER,
                type: TYPE_CLASS,
            },
        ] as IEntity[]);
    });
});

test("Select 2 entities by id", () => {
    // Setup
    const selector: ISelector = {
        attr: ["id"],
        filter: {
            id: [TYPE_ATTRIBUTE, TYPE_TASK],
        },
        type: TYPE_CLASS,
    };

    // Execute
    const promise = provider.select(selector);

    // Verify
    return promise.then((result) => {
        expect(result).toEqual([
            {
                attr: {
                    id: TYPE_ATTRIBUTE,
                },
                id: TYPE_ATTRIBUTE,
                type: TYPE_CLASS,
            },
            {
                attr: {
                    id: TYPE_TASK,
                },
                id: TYPE_TASK,
                type: TYPE_CLASS,
            },
        ] as IEntity[]);
    });
});

test("Select non-existing type", () => {
    // Setup
    const selector: ISelector = {
        attr: ["id"],
        filter: {
            id: [TYPE_ATTRIBUTE, TYPE_TASK],
        },
        type: "Something Else",
    };

    // Execute
    const promise = provider.select(selector);

    // Verify
    return promise.then((result) => {
        expect(result).toEqual([]);
    });
});
