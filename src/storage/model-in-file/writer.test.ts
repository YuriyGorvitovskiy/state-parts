import * as FS from "fs";
import { IPatch, IPatchConsumer, PatchOp } from "state-glue";
import { TYPE_ATTRIBUTE, TYPE_CLASS } from "./reader";
import { ModelWriter } from "./writer";

afterAll(() => {
    return FS.promises.unlink("./test-data/model/new_class.json").catch(() => null);
});

test("Upsert new class", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");

    // Execute
    const promise = subject.apply({
        id: "new_class",
        op: PatchOp.UPSERT,
        type: TYPE_CLASS
    });

    // Verify
    return promise
        .then(() => FS.promises.readFile("./test-data/model/new_class.json", "utf8"))
        .then(content => expect(JSON.parse(content)).toEqual({}));
});


test("Upsert existing class", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");

    // Execute
    const promise = subject.apply({
        id: "user",
        op: PatchOp.UPSERT,
        type: TYPE_CLASS
    });

    // Verify
    return promise
        .then(() => FS.promises.readFile("./test-data/model/user.json", "utf8"))
        .then(content => expect(JSON.parse(content)).toEqual({
            "email": {
                "type": "string"
            },
            "full_name": {
                "type": "string"
            }
        }));
});

test("Delete existing class", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");
    const prepare = subject.apply({
        id: "new_class",
        op: PatchOp.UPSERT,
        type: TYPE_CLASS
    });
    
    // Execute
    const promise = prepare.then(() => subject.apply({
        id: "new_class",
        op: PatchOp.DELETE,
        type: TYPE_CLASS
    }));

    // Verify
    return promise
        .then(() => FS.promises.access("./test-data/model/new_class.json"))
        .then(() => true)
        .catch(()=> false)
        .then((exists) => expect(exists).toBe(false));
});
