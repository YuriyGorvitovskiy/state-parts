import * as P from "./path";
import Path from "./path";

export interface Info {
    readonly schema: string;
    readonly table: string;
};

export default class Table<C extends string> extends Path {
    readonly $info: Info;
    readonly $columns: { [key in C]?: Path };

    constructor($steps: P.Steps, info: Info) {
        super($steps);
        this.$info = info;
        this.$columns = {};
    }

    get<T extends Path>(column: C, construct: ($steps: P.Steps) => T): T {
        return this.$columns[column] as T || (this.$columns[column] = construct(this.$steps.push({ ...this.$info, column })));
    }
}