import * as IM from "immutable";
import * as Q from "./query-common";
import * as QM from "./query-map";
import Table from "./table";

export interface Step {
    schema: string;
    table: string;
    column: string;
};

export type Steps = IM.List<Step>;

export const EMPTY: Steps = IM.List.of();

export default class Path {

    public readonly $steps: Steps;

    constructor($steps: Steps) {
        this.$steps = $steps;
    }

    $join<R, T extends Table<any>>($table: T, builder: (t: T) => [Path, QM.SubQuery<R>]): QM.SubQuery<R> {
        const [to, query] = builder($table);
        query.$table = $table;
        query.$join = {
            from: this,
            to
        };
        return query;
    }

    $isNull(): QM.ComparisonCondition<Path> {
        return null;
    }

    $isNotNull(): QM.ComparisonCondition<Path> {
        return null;
    }

    $eq(value: Q.Primitive): QM.ComparisonCondition<Path> {
        return null;
    }

    $asc(): QM.Sort {
        return null;
    }
}