import * as Q from "./query-common";

export type Field = string;

export interface ComparisonCondition {
    field: Field;
    cmp: Q.ComparisonOperator;
    value: Q.Primitive | Q.Primitive[];
}

export interface BooleanCondition {
    op: Q.BooleanOperator;
    conditions: Condition[];
}

export type Condition = BooleanCondition | ComparisonCondition;

export interface Aggregate {
    field: Field;
    func: Q.AggregateOperator;
}

export interface Sort {
    field: Field;
    desc: boolean;
}

export interface Page {
    from: number;
    max: number;
}

export interface JoinField {
    field: Field;
    column: string;
    join: JoinTree;
    aggr?: Q.AggregateOperator;
}

export type JoinTree = {
    table: string;
    fields: JoinField[];
}

export interface Query {
    select: Field[];
    join: JoinTree;
    where: Condition;
    groupBy: Field[];
    having: Condition;
    orderBy: Sort[];
    page: Page;
    subQuery: SubQuery;
}

export interface SubQuery extends Query {
    from: Field;
    link: Field;
}
