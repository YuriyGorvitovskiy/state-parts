import * as IM from "immutable";

import * as Q from "./query-common";
import * as QM from "./query-map";
import * as P from "./path";

import Path from "./path";

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
    readonly field: Field;
    readonly column: string;
    readonly join?: JoinTree;
    readonly aggr?: Q.AggregateOperator;
}

export type JoinTree = {
    readonly alias: string;
    readonly schema: string;
    readonly table: string;
    readonly fields: IM.List<JoinField>;
}

export interface Query {
    select: IM.List<Field>;
    join: JoinTree;
    where: Condition;
    groupBy: IM.List<Field>;
    having: Condition;
    orderBy: IM.List<Sort>;
    page: Page;
    subQuery: SubQuery;
}

export interface SubQuery extends Query {
    from: Field;
    link: Field;
}

interface Context {
    newJoinTree: (step: P.Step) => JoinTree;
    newJoinField: (table: JoinTree, step: P.Step, join: JoinTree) => JoinField;
}


export const add = (ctx: Context, tree: JoinTree, path: Path): [JoinTree, JoinField] => {
    let lastTree = tree;
    return path.$steps
        .map(s => {
            const t = lastTree || ctx.newJoinTree(s);
            const e = t.fields.findEntry(f => f.column === s.column);
            lastTree = e ? e[1].join : null;
            return [t, e, s] as [JoinTree, [number, JoinField], P.Step];
        })
        .reduceRight(([pt, ef], [ot, e, s]) => {
            if (null == e) {
                e = [-1, ctx.newJoinField(ot, s, pt)];
                pt = { ...ot, fields: ot.fields.push(e[1]) };
            } else if (null !== pt && pt !== e[1].join) {
                e[1] = { ...e[1], join: pt };
                pt = { ...ot, fields: ot.fields.set(...e) };
            } else {
                pt = ot;
            }
            return [pt, ef || e[1]];
        }, [null as JoinTree, null as JoinField]);
}


export const build = (query: QM.Query<any>): Query => {

    return null;
}

