import { List } from "immutable";
import * as PR from "./primitive";
import * as SQL from "./sql";

export type invert = 'not' | '';
export type comparison = 'equal' | 'in' | 'lesser' | 'greater' | 'between' | 'like' | 'is null' | 's';


export class Comparison<T extends PR.PrimitiveName> implements SQL.Expression<'boolean'> {
    readonly type = 'boolean';
    readonly not: boolean;
    readonly comp: comparison;
    readonly args: List<SQL.Expression<T>>;

    constructor(inv: invert, comp: comparison, ...args: SQL.Expression<T>[]) {
        this.not = 'not' === inv;
        this.comp = comp;
        this.args = List(args);
    }

    protected toSqlBetween(ctx: SQL.ToSqlContext): string {
        const subCtx = {
            ...ctx,
            inExpression: true
        }
        return this.args.get(0).toSql(subCtx) +
            (this.not ? " NOT BETWEEN " : " BETWEEN ") +
            SQL.toSqlOperator(ctx, 'AND', this.args.get(1), this.args.get(2));
    }

    protected toSqlIn(ctx: SQL.ToSqlContext): string {
        const subCtx = {
            ...ctx,
            inExpression: true
        }
        return this.args.get(0).toSql(subCtx) +
            (this.not ? " NOT IN " : " IN ") +
            SQL.toSqlArguments(ctx, this.args.shift());
    }

    protected toSqlIsNull(ctx: SQL.ToSqlContext): string {
        const subCtx = {
            ...ctx,
            inExpression: true
        }
        return this.args.get(0).toSql(subCtx) +
            (this.not ? " NOT IN " : " IN ") +
            SQL.toSqlArguments(ctx, this.args.shift());
    }

    protected toSqlComparison(ctx: SQL.ToSqlContext): string {
        switch (this.comp) {
            case 'between': return this.toSqlBetween(ctx);
            case 'equal': return SQL.toSqlOperator(ctx, this.not ? "!=" : "=", this.args.get(0), this.args.get(1));
            case 'greater': return SQL.toSqlOperator(ctx, this.not ? "<=" : ">", this.args.get(0), this.args.get(1));
            case 'in': return this.toSqlIn(ctx);
            case 'is null': return this.toSqlIsNull(ctx);
            case 'lesser': return SQL.toSqlOperator(ctx, this.not ? "=>" : "<", this.args.get(0), this.args.get(1));
            case 'like': return SQL.toSqlOperator(ctx, this.not ? "not like" : "like", this.args.get(0), this.args.get(1));
        }
    }

    public toSql(ctx: SQL.ToSqlContext): string {
        return SQL.toSqlBraceInExpression(ctx, this.toSqlComparison(ctx));
    }
}

export const isBetween = <T extends PR.NumericName>(left: SQL.Expression<T>, low: SQL.Expression<T>, high: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('', 'between', left, low, high);
}

export const notBetween = <T extends PR.NumericName>(left: SQL.Expression<T>, low: SQL.Expression<T>, high: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('not', 'between', left, low, high);
}

export const isEqual = <T extends PR.PrimitiveName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('', 'equal', left, right);
}

export const notEqual = <T extends PR.PrimitiveName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('not', 'equal', left, right);
}

export const isIn = <T extends PR.PrimitiveName>(left: SQL.Expression<T>, ...args: SQL.Expression<T>[]): Comparison<T> => {
    return new Comparison<T>('', 'in', left, ...args);
}

export const notIn = <T extends PR.PrimitiveName>(left: SQL.Expression<T>, ...args: SQL.Expression<T>[]): Comparison<T> => {
    return new Comparison<T>('not', 'in', left, ...args);
}

export const isGreater = <T extends PR.NumericName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('', 'greater', left, right);
}

export const notGreater = <T extends PR.NumericName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('not', 'greater', left, right);
}

export const isLesser = <T extends PR.NumericName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('', 'lesser', left, right);
}

export const notLesser = <T extends PR.NumericName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('not', 'lesser', left, right);
}

export const isNull = <T extends PR.PrimitiveName>(left: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('', 'is null', left);
}

export const notNull = <T extends PR.PrimitiveName>(left: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('not', 'is null', left);
}

export const isLike = <T extends PR.TextualName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('', 'like', left, right);
}

export const notLike = <T extends PR.TextualName>(left: SQL.Expression<T>, right: SQL.Expression<T>): Comparison<T> => {
    return new Comparison<T>('not', 'like', left, right);
}

