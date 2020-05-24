import { List } from "immutable";
import { PrimitiveName } from "./primitive";
import * as SQL from "./sql";

export type invert = 'not' | '';
export type comparison = 'equal' | 'in' | 'lesser' | 'greater' | 'between' | 'like' | 'is null' | 's';

export class Comparison<T extends PrimitiveName> implements SQL.Expression<'boolean'> {
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
            case 'equal': return SQL.toSqlOperator(ctx, this.not ? "!=" : "=", this.args.get(0), this.args.get(1));
            case 'greater': return SQL.toSqlOperator(ctx, this.not ? "<=" : ">", this.args.get(0), this.args.get(1));
            case 'lesser': return SQL.toSqlOperator(ctx, this.not ? "=>" : "<", this.args.get(0), this.args.get(1));
            case 'like': return SQL.toSqlOperator(ctx, this.not ? "not like" : "like", this.args.get(0), this.args.get(1));
            case 'between': return this.toSqlBetween(ctx);
            case 'in': return this.toSqlIn(ctx);
            case 'is null': return this.toSqlIsNull(ctx);
        }
    }

    public toSql(ctx: SQL.ToSqlContext): string {
        return SQL.toSqlBraceInExpression(ctx, this.toSqlComparison(ctx));
    }
}