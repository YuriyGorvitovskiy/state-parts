import * as QC from "./query-common";
import Path from "./path";
import Table from "./table";

export type Field = Path;

export interface ComparisonCondition<F> {
    field: Field;
    cmp: QC.ComparisonOperator;
    value: QC.Primitive | QC.Primitive[];
}

export interface BooleanCondition<F> {
    op: QC.BooleanOperator;
    conditions: Condition<F>[];
}

export type Condition<F> = BooleanCondition<F> | ComparisonCondition<F>;

export interface Aggregate {
    field: Field;
    func: QC.AggregateOperator;
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

export interface Query<S extends Select> {
    select: S
    table?: Table<any>;
    where?: Condition<Field>;
    having?: Condition<Aggregate | Field>;
    orderBy?: Sort[]
    page?: Page;
}

export interface SubQuery<S extends Select> extends Query<S> {
    join?: Join;
}

export interface Collect<S extends Select> {
    select: S
    orderBy?: Sort[];
}

export type Select = { [key: string]: Field | Aggregate | SubQuery<any> | Collect<any> };

export type Result<S extends Select> = { [key in keyof S]:
    S[key] extends Field | Aggregate ? QC.Primitive
    : S[key] extends SubQuery<any> ? Result<S[key]['select']>
    : S[key] extends Collect<any> ? Result<S[key]['select']>
    : void
}[];

export const exec = <S extends Select>(qry: Query<S>): Result<S> => {
    const q = qry;
    qry = q;
    return null;
}

export const query = <S extends Select, Q extends Query<S>, T extends Table<any>>(table: T, builder: (t: T) => Q): Q => {
    const q = builder(table);
    q.table = table;
    return q;
};

export const and = <F>(...conditions: Condition<F>[]): BooleanCondition<F> => {
    return null;
};

export const or = <F>(...conditions: Condition<F>[]): BooleanCondition<F> => {
    return null;
};
