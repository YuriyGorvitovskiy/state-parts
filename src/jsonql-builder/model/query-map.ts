import * as Q from "./query-common";
import Path from "./path";

export type Field = Path;

export interface ComparisonCondition<F> {
    field: Field;
    cmp: Q.ComparisonOperator;
    value: Q.Primitive | Q.Primitive[];
}

export interface BooleanCondition<F> {
    op: Q.BooleanOperator;
    conditions: Condition<F>[];
}

export type Condition<F> = BooleanCondition<F> | ComparisonCondition<F>;

export interface Aggregate {
    field: Field;
    func: Q.AggregateOperator;
}

export interface Sort {
    field: Field | Aggregate;
    desc: boolean;
}

export interface Page {
    from: number;
    max: number;
}

export interface Join {
    from: Field;
    to: Field;
}

export type Query<S> = { [key in keyof S | "$table" | "$where" | "$having" | "$orderBy" | "$page"]?:
    key extends "$table" ? string
    : key extends "$where" ? Condition<Field>
    : key extends "$having" ? Condition<Aggregate | Field>
    : key extends "$orderBy" ? Sort[]
    : key extends "$page" ? Page
    : key extends keyof S ? Field | Aggregate | SubQuery<S[key]>
    : void
};

export type SubQuery<S> = { [key in keyof S | "$table" | "$join" | "$where" | "$having" | "$orderBy" | "$page"]?:
    key extends "$table" ? string
    : key extends "$join" ? Join
    : key extends "$where" ? Condition<Field>
    : key extends "$having" ? Condition<Aggregate | Field>
    : key extends "$orderBy" ? Sort
    : key extends "$page" ? Page
    : key extends keyof S ? Field | Aggregate | SubQuery<S[key]>
    : void
};

export type Collect<S> = { [key in keyof S | "$orderBy"]?:
    key extends "$orderBy" ? Sort
    : key extends keyof S ? Field | Aggregate | SubQuery<S[key]>
    : void
};

export const query = <R, T>(table: T, builder: (t: T) => R): Query<R> => {
    return null;
};

export const collect = <R>(r: R): Collect<R> => {
    return null;
};

export const and = <F>(...conditions: Condition<F>[]): BooleanCondition<F> => {
    return null;
};

export const or = <F>(...conditions: Condition<F>[]): BooleanCondition<F> => {
    return null;
};
