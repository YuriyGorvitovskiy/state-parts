import { List, Map } from "immutable";
import * as PR from "./primitive";

export type ToLiteral<T extends PR.PrimitiveName> = (value: PR.primitiveOf<T>) => string;

export type LiteralMappingDefinition = {
    [key in PR.PrimitiveName]: ToLiteral<key>
};

export type LiteralMapping = Map<PR.PrimitiveName, ToLiteral<any>>

export interface Engine {
    readonly literalMapping: LiteralMapping;
}

export interface ToSqlContext {
    readonly engine: Engine,
    readonly indent: string,
    readonly inExpression: boolean;
}

export interface Element {
    readonly toSql: (ctx: ToSqlContext) => string;
}

export interface Expression<T extends PR.PrimitiveName> extends Element {
    readonly type: T;
}


export const toSqlOperator = (ctx: ToSqlContext, sqlOperator: string, left: Expression<any>, right: Expression<any>): string => {
    const subCtx = {
        ...ctx,
        inExpression: true
    }
    return left.toSql(subCtx) + " " + sqlOperator + " " + right.toSql(subCtx);
}

export const toSqlArguments = (ctx: ToSqlContext, args: List<Expression<any>>): string => {
    const subCtx = {
        ...ctx,
        inExpression: false
    }
    return "(" + args.map(a => a.toSql(subCtx)).join(", ") + ")";
}

export const toSqlBraceInExpression = (ctx: ToSqlContext, sql: string): string => {
    return ctx.inExpression ? "(" + sql + ")" : sql;
}

