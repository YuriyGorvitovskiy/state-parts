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
        type: TYPE_CLASS
    });
    consumer.apply({
        id: TYPE_ATTRIBUTE,
        op: PatchOp.UPSERT,
        type: TYPE_CLASS
    });
    consumer.apply({
        id: TYPE_TASK,
        op: PatchOp.UPSERT,
        type: TYPE_CLASS
    });
});

test("Upsert patch", () => {
    // Setup
    const patch: IPatch = {
        id: TYPE_USER,
        op: PatchOp.UPSERT,
        type: TYPE_CLASS
    };

    // Execute
    consumer.apply(patch);

    // Verify
    expect(
        provider.select({
            attr: [],
            filter: {
                id: [TYPE_USER]
            },
            type: TYPE_CLASS
        })
    ).toEqual([
        {
            attr: {},
            id: TYPE_USER,
            type: TYPE_CLASS
        }
    ] as IEntity[]);
});

test("Select 2 entities by id", () => {
    const selector: ISelector = {
        attr: ["id"],
        filter: {
            id: [TYPE_ATTRIBUTE, TYPE_TASK]
        },
        type: TYPE_CLASS
    };

    // Execute
    const result = provider.select(selector);

    // Verify
    expect(result).toEqual([
        {
            attr: {
                id: TYPE_ATTRIBUTE
            },
            id: TYPE_ATTRIBUTE,
            type: TYPE_CLASS
        },
        {
            attr: {
                id: TYPE_TASK
            },
            id: TYPE_TASK,
            type: TYPE_CLASS
        }
    ] as IEntity[]);
});

test("Select non-existing type", () => {
    const selector: ISelector = {
        attr: ["id"],
        filter: {
            id: [TYPE_ATTRIBUTE, TYPE_TASK]
        },
        type: "Something Else"
    };

    // Execute
    const result = provider.select(selector);

    // Verify
    expect(result).toEqual([]);
});
