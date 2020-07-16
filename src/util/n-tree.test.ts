import * as IM from "immutable";
import * as NT from "./n-tree";

interface N {
    column: string;
    column_alias: string;
    table: string,
    table_alias: string;
}

test("add to tree function", () => {
    const relations = {
        "attribute": {
            "class": "class",
            "target": "class"
        },
        "class": {
            "schema": "schema"
        },
        "schema": {}
    }

    let tableCount = 1;
    let fieldCount = 1;
    const nb = (parent: N, column: string) => {
        const table = relations[parent.table][column];
        return {
            column: parent.table_alias + "." + column,
            column_alias: "f" + fieldCount++,
            table,
            table_alias: table ? "t" + tableCount++ : undefined,
        }
    };

    // Setup 
    const path1 = IM.List.of("class");
    const path2 = IM.List.of("class", "schema");
    const path3 = IM.List.of("class", "schema", "label");
    const path4 = IM.List.of("class", "label");
    const path5 = IM.List.of("target", "schema");
    const path6 = IM.List.of("target");

    // Execute 
    let tree = NT.Tree.of(nb, { table: "attribute", table_alias: "t" + tableCount++ } as N);
    tree = tree.add(path1).tree;
    tree = tree.add(path2).tree;
    tree = tree.add(path3).tree;
    tree = tree.add(path4).tree;
    tree = tree.add(path5).tree;
    tree = tree.add(path6).tree;

    // Verify
    console.log(JSON.stringify(tree));

    expect(JSON.parse(JSON.stringify(tree))).toEqual({
        root: {
            n: { table: "attribute", table_alias: "t1" },
            child: {
                "class": {
                    n: {
                        column: "t1.class",
                        column_alias: "f1",
                        table: "class",
                        table_alias: "t2",
                    },
                    child: {
                        "schema": {
                            n: {
                                column: "t2.schema",
                                column_alias: "f2",
                                table: "schema",
                                table_alias: "t3",
                            },
                            child: {
                                "label": {
                                    n: {
                                        column: "t3.label",
                                        column_alias: "f3",
                                    },
                                    child: {}
                                }
                            }
                        },
                        "label": {
                            n: {
                                column: "t2.label",
                                column_alias: "f4",
                            },
                            child: {}
                        }
                    }
                },
                "target": {
                    n: {
                        column: "t1.target",
                        column_alias: "f5",
                        table: "class",
                        table_alias: "t4",
                    },
                    child: {
                        "schema": {
                            n: {
                                column: "t4.schema",
                                column_alias: "f6",
                                table: "schema",
                                table_alias: "t5",
                            },
                            child: {}
                        }
                    }
                }
            }
        }
    });
});