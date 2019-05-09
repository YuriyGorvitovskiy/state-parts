import { InMemoryStorage } from "../in-memory/storage";
import { Table } from "../in-memory/table";
import { ModelReader, TYPE_ATTRIBUTE, TYPE_CLASS } from "./reader";

test("Test reader", () => {
    // Setup
    const storage: InMemoryStorage = new InMemoryStorage(new Table(TYPE_CLASS), new Table(TYPE_ATTRIBUTE, "class"));
    const subject: ModelReader = new ModelReader();

    // Execute
    const promise = subject.readAsPatch("./test-data/model", storage);

    // Verify
    return promise
        .then(() =>
            storage.select({
                attr: [],
                filter: {},
                sort: [{ attr: "id" }],
                type: "class"
            })
        )
        .then(e =>
            expect(e).toEqual([
                {
                    attr: {},
                    id: "task",
                    type: "class"
                },
                {
                    attr: {},
                    id: "user",
                    type: "class"
                }
            ])
        )
        .then(() =>
            storage.select({
                attr: ["name", "type", "target"],
                filter: {
                    class: ["task"]
                },
                sort: [{ attr: "id" }],
                type: "attribute"
            })
        )
        .then(e =>
            expect(e).toEqual([
                {
                    attr: {
                        name: "assignee",
                        target: "user",
                        type: "reference"
                    },
                    id: "task.assignee",
                    type: "attribute"
                },
                {
                    attr: {
                        name: "description",
                        target: null,
                        type: "text"
                    },
                    id: "task.description",
                    type: "attribute"
                },
                {
                    attr: {
                        name: "due",
                        target: null,
                        type: "timestamp"
                    },
                    id: "task.due",
                    type: "attribute"
                },
                {
                    attr: {
                        name: "name",
                        target: null,
                        type: "string"
                    },
                    id: "task.name",
                    type: "attribute"
                },
                {
                    attr: {
                        name: "state",
                        target: null,
                        type: "string"
                    },
                    id: "task.state",
                    type: "attribute"
                },
                {
                    attr: {
                        name: "subject",
                        target: "any",
                        type: "reference"
                    },
                    id: "task.subject",
                    type: "attribute"
                },
                {
                    attr: {
                        name: "subject_type",
                        target: "class",
                        type: "reference"
                    },
                    id: "task.subject_type",
                    type: "attribute"
                }
            ])
        );
});
