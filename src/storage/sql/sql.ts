import { List, Map } from "immutable";
import * as PR from "./primitive";

export type ToLiteral<T extends PR.PrimitiveType> = (value: PR.primitiveOf<T>) => string;

export type LiteralMappingDefinition = {
    [key in PR.PrimitiveType]: ToLiteral<key>;
};

export type LiteralMapping = Map<PR.PrimitiveType, ToLiteral<any>>;

export interface Sort {
    readonly value: Expression<any>;
    readonly descending: boolean;
}

export interface Page {
    readonly offset: number;
    readonly limit: number;
}

export type PageMapping = (page: Page) => string;

export interface Engine {
    readonly literalMapping: LiteralMapping;
    readonly pageMapping: PageMapping;
}

export interface ToSqlContext {
    readonly engine: Engine;
    readonly indent: string;
    readonly inExpression: boolean;
}

export interface Element {
    readonly toSql: (ctx: ToSqlContext) => string;
}

export interface Expression<T extends PR.PrimitiveType> extends Element {
    readonly type: T;
}

export const toSqlOperator = (
    ctx: ToSqlContext,
    sqlOperator: string,
    left: Expression<any>,
    right: Expression<any>
): string => {
    const subCtx = {
        ...ctx,
        inExpression: true,
    };
    return left.toSql(subCtx) + " " + sqlOperator + " " + right.toSql(subCtx);
};

export const toSqlChainOperator = (ctx: ToSqlContext, sqlOperator: string, args: List<Expression<any>>): string => {
    return args.map((a) => a.toSql(ctx)).join(" " + sqlOperator + " ");
};

export const toSqlArguments = (ctx: ToSqlContext, args: List<Expression<any>>): string => {
    const subCtx = {
        ...ctx,
        inExpression: false
    }
    return "(" + args.map(a => a.toSql(subCtx)).join(", ") + ")";
}

export const toSqlBraceInExpression = (ctx: ToSqlContext, sql: string): string => {
    return ctx.inExpression ? "(" + sql + ")" : sql;
};
