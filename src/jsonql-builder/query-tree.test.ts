import * as IM from "immutable";

import ATTR from "./model/attribute";
import * as QT from "./query-tree";
import * as P from "./path";

test("add to tree function", () => {
    let fieldCount = 1;
    let tableCount = 1;
    const ctx = {
        newJoinField: (step: P.Step, join: QT.JoinTree): QT.JoinField => ({
            field: "f" + fieldCount++,
            column: step.column,
            join,
        }),
        newJoinTree: (step: P.Step) => ({
            alias: "t" + tableCount++,
            schema: step.schema,
            table: step.table,
            fields: IM.List.of() as IM.List<QT.JoinField>,
        }),
    }

    // Setup 
    const path1 = ATTR.class;
    const path2 = ATTR.class.schema;
    const path3 = ATTR.class.schema.label;
    const path4 = ATTR.class.label;
    const path5 = ATTR.target.schema;
    const path6 = ATTR.target;
    let tree = null;

    // Execute 
    tree = QT.add(ctx, tree, path1)[0];
    tree = QT.add(ctx, tree, path2)[0];
    tree = QT.add(ctx, tree, path3)[0];
    tree = QT.add(ctx, tree, path4)[0];
    tree = QT.add(ctx, tree, path5)[0];
    tree = QT.add(ctx, tree, path6)[0];
    // console.log(JSON.stringify(tree));

    expect(tree).toEqual({
        alias: "t1",
        schema: "model",
        table: "attribute",
        fields: IM.List.of({
            field: "f1",
            column: "class",
            join: {
                alias: "t2",
                schema: "model",
                table: "class",
                fields: IM.List.of({
                    field: "f2",
                    column: "schema",
                    join: {
                        alias: "t3",
                        schema: "model",
                        table: "schema",
                        fields: IM.List.of({
                            field: "f3",
                            column: "label",
                            join: null
                        })
                    }
                }, {
                    field: "f4",
                    column: "label",
                    join: null
                })
            }
        }, {
            field: "f6",
            column: "target",
            join: {
                alias: "t4",
                schema: "model",
                table: "class",
                fields: IM.List.of({
                    field: "f5",
                    column: "schema",
                    join: null
                })
            }
        })
    });
})