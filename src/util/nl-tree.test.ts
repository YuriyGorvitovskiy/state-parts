import * as IM from "immutable";
import * as NL from "./nl-tree";
import Table from "../jsonql-builder/table";

interface N {
    alias: string;
    table: string,
}
interface L {
    alias: string;
    column: string;
    target: string;
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
    const nb = (l: L) => ({
        alias: "t" + tableCount++,
        table: l.target,
    });
    const lb = (n: N, s: string) => ({
        alias: "f" + fieldCount++,
        column: n.alias + "." + s,
        target: relations[n.table][s],
    });

    // Setup 
    const path1 = IM.List.of("class");
    const path2 = IM.List.of("class", "schema");
    const path3 = IM.List.of("class", "schema", "label");
    const path4 = IM.List.of("class", "label");
    const path5 = IM.List.of("target", "schema");
    const path6 = IM.List.of("target");

    // Execute 
    let tree = NL.Tree.of({ alias: "t" + tableCount++, table: "attribute" });
    let leaf = null;
    [tree, leaf] = tree.add(path1, nb, lb);
    [tree, leaf] = tree.add(path2, nb, lb);
    [tree, leaf] = tree.add(path3, nb, lb);
    [tree, leaf] = tree.add(path4, nb, lb);
    [tree, leaf] = tree.add(path5, nb, lb);
    [tree, leaf] = tree.add(path6, nb, lb);


    // Verify
    console.log(JSON.stringify(tree));

    expect(JSON.parse(JSON.stringify(tree))).toEqual({
        root: {
            n: { alias: "t1", table: "attribute" },
            links: {
                "class": {
                    l: {
                        alias: "f1",
                        column: "t1.class",
                        target: "class",
                    },
                    node: {
                        n: { alias: "t2", table: "class" },
                        links: {
                            "schema": {
                                l: {
                                    alias: "f2",
                                    column: "t2.schema",
                                    target: "schema",
                                },
                                node: {
                                    n: { alias: "t3", table: "schema" },
                                    links: {
                                        "label": {
                                            l: {
                                                alias: "f3",
                                                column: "t3.label",
                                            },
                                        }
                                    }
                                }
                            },
                            "label": {
                                l: {
                                    alias: "f4",
                                    column: "t2.label",
                                },
                            }
                        }
                    }
                },
                "target": {
                    l: {
                        alias: "f5",
                        column: "t1.target",
                        target: "class",
                    },
                    node: {
                        n: { alias: "t4", table: "class" },
                        links: {
                            "schema": {
                                l: {
                                    alias: "f6",
                                    column: "t4.schema",
                                    target: "schema",
                                },
                            }
                        }
                    }
                }
            }
        }
    });
});