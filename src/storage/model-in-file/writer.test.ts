import * as FS from "fs";
import { IPatch, IPatchConsumer, PatchOp, SMPrimitive } from "state-glue";
import { TYPE_ATTRIBUTE, TYPE_CLASS } from "./reader";
import { ModelWriter } from "./writer";

afterAll(() => {
    return FS.promises.unlink("./test-data/model/new_class.json").catch(() => null)
        .then(()=> FS.promises.unlink("./test-data/model/no_class.json")).catch(() => null)
        .then(()=> FS.promises.unlink("./test-data/model/no_class2.json")).catch(() => null)
        .then(()=> FS.promises.unlink("./test-data/model/exist_class.json")).catch(() => null)
        .then(()=> FS.promises.unlink("./test-data/model/exist_class2.json")).catch(() => null)
        .then(()=> FS.promises.unlink("./test-data/model/exist_class3.json")).catch(() => null);;
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
        .then(content =>
            expect(JSON.parse(content)).toEqual({
                email: "string",
                full_name:  "string"
            })
        );
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
    const promise = prepare.then(() =>
        subject.apply({
            id: "new_class",
            op: PatchOp.DELETE,
            type: TYPE_CLASS
        })
    );

    // Verify
    return promise
        .then(() => FS.promises.access("./test-data/model/new_class.json"))
        .then(() => true)
        .catch(() => false)
        .then(exists => expect(exists).toBe(false));
});

test("Add attribute to non-existing class", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");

    // Execute
    const promise = subject.apply({
        attr: {
            type: SMPrimitive.STRING
        },
        id: "no_class:name",
        op: PatchOp.UPSERT,
        type: TYPE_ATTRIBUTE,
    });

    // Verify
    return promise 
        .then(() => FS.promises.readFile("./test-data/model/no_class.json", "utf8"))
        .then((content) => expect(JSON.parse(content)).toEqual(
            {
                name: "string"
            }
        ));
});

test("Add attribute to existing class", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");
    const prepare = subject.apply({
        attr: {
            type: SMPrimitive.STRING
        },
        id: "exist_class:name",
        op: PatchOp.UPSERT,
        type: TYPE_ATTRIBUTE,
    });

    // Execute
    const promise = prepare.then(() => subject.apply({
        attr: {
            target: "no_class",
            type: SMPrimitive.REFERENCE,
        },
        id: "exist_class:ref",
        op: PatchOp.UPDATE,
        type: TYPE_ATTRIBUTE,
    }));

    // Verify
    return promise 
        .then(() => FS.promises.readFile("./test-data/model/exist_class.json", "utf8"))
        .then((content) => expect(JSON.parse(content)).toEqual(
            {
                name:  "string",
                ref: "no_class"
            }
        ));
});

test("Update attribute target", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");
    const prepare = subject.apply({
        attr: {
            target: "no_class",
            type: SMPrimitive.REFERENCE,
        },
        id: "exist_class3:ref",
        op: PatchOp.UPSERT,
        type: TYPE_ATTRIBUTE,
    });

    // Execute
    const promise = prepare.then(() => subject.apply({
        attr: {
            target: "other"
        },
        id: "exist_class3:ref",
        op: PatchOp.UPDATE,
        type: TYPE_ATTRIBUTE,
    }));

    // Verify
    return promise 
        .then(() => FS.promises.readFile("./test-data/model/exist_class3.json", "utf8"))
        .then((content) => expect(JSON.parse(content)).toEqual(
            {
                ref: "other"
            }
        ));
});

test("Delete attribute from existing class", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");
    const prepare = subject.apply({
        attr: {
            type: SMPrimitive.STRING
        },
        id: "exist_class2:name",
        op: PatchOp.UPSERT,
        type: TYPE_ATTRIBUTE,
    }).then(() => subject.apply({
        attr: {
            target: "no_class",
            type: SMPrimitive.REFERENCE,
        },
        id: "exist_class2:ref",
        op: PatchOp.UPDATE,
        type: TYPE_ATTRIBUTE,
    }));

    // Execute
    const promise = prepare.then(() => subject.apply({
        id: "exist_class2:name",
        op: PatchOp.DELETE,
        type: TYPE_ATTRIBUTE,
    }));

    // Verify
    return promise 
        .then(() => FS.promises.readFile("./test-data/model/exist_class2.json", "utf8"))
        .then((content) => expect(JSON.parse(content)).toEqual({
                ref: "no_class"
            }));
});

test("Delete attribute from non-existing class", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");

    // Execute
    const promise = subject.apply({
        attr: {
            type: SMPrimitive.STRING
        },
        id: "no_class2:name",
        op: PatchOp.DELETE,
        type: TYPE_ATTRIBUTE,
    });

    // Verify
    return promise 
        .then(() => FS.promises.access("./test-data/model/no_class2.json"))
        .then(() => true)
        .catch(() => false)
        .then((exists) => expect(exists).toBe(false));
});


test("Patch of wrong type", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");

    // Execute
    const promise = subject.apply({
        id: "exists_class:name",
        op: PatchOp.DELETE,
        type: "WrongType",
    });

    // Verify
    return promise.then((v) => expect(v).toBeNull());
});

test("Patch of wrong attribute patch", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");

    // Execute
    const promise = subject.apply({
        id: "exists_class:name",
        op: "bad" as PatchOp,
        type: TYPE_ATTRIBUTE
    });

    // Verify
    return promise.then((v) => expect(v).toBeNull());
});

test("Patch of wrong class patch", () => {
    // Setup
    const subject = new ModelWriter("./test-data/model");

    // Execute
    const promise = subject.apply({
        id: "exists_class",
        op: "bad" as PatchOp,
        type: TYPE_CLASS
    });

    // Verify
    return promise.then((v) => expect(v).toBeNull());
});