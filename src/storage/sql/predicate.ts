import { List } from "immutable";
import * as PT from "./primitive";
import * as SQL from "./sql";

export type comparison = "and" | "between" | "equal" | "greater" | "in" | "is null" | "lesser" | "like" | "or";

export class Predicate implements SQL.Expression<PT.BooleanType> {
    readonly type = "boolean";
    readonly invert: boolean;
    readonly comp: comparison;
    readonly args: List<SQL.Expression<any>>;

    constructor(invert: boolean, comp: comparison, args: List<SQL.Expression<any>>) {
        this.invert = invert;
        this.comp = comp;
        this.args = args;
    }

    public not(): Predicate {
        return new Predicate(!this.invert, this.comp, this.args);
    }

    public and(...args: SQL.Expression<PT.BooleanType>[]): Predicate {
        const flatArgs = [this, ...args].flatMap((p) => {
            if (p instanceof Predicate && "and" === p.comp && !p.invert) {
                return p.args.toArray() as SQL.Expression<PT.BooleanType>[];
            }
            return p;
        });
        return new Predicate(false, "and", List(flatArgs));
    }

    public or(...args: SQL.Expression<PT.BooleanType>[]): Predicate {
        const flatArgs = [this, ...args].flatMap((p) => {
            if (p instanceof Predicate && "or" === p.comp && !p.invert) {
                return p.args.toArray() as SQL.Expression<PT.BooleanType>[];
            }
            return p;
        });
        return new Predicate(false, "or", List(flatArgs));
    }

    protected toSqlBetween(ctx: SQL.ToSqlContext): string {
        const subCtx = {
            ...ctx,
            inExpression: true,
        };
        return (
            this.args.get(0).toSql(subCtx) +
            (this.invert ? " NOT BETWEEN " : " BETWEEN ") +
            SQL.toSqlOperator(ctx, "AND", this.args.get(1), this.args.get(2))
        );
    }

    protected toSqlIn(ctx: SQL.ToSqlContext): string {
        const subCtx = {
            ...ctx,
            inExpression: true,
        };
        return (
            this.args.get(0).toSql(subCtx) +
            (this.invert ? " NOT IN " : " IN ") +
            SQL.toSqlArguments(ctx, this.args.shift())
        );
    }

    protected toSqlIsNull(ctx: SQL.ToSqlContext): string {
        const subCtx = {
            ...ctx,
            inExpression: true,
        };
        return this.args.get(0).toSql(subCtx) + (this.invert ? " IS NOT NULL" : " IS NULL");
    }

    protected toSqlBoolean(ctx: SQL.ToSqlContext, sqlOperator: string): string {
        const andCtx = {
            ...ctx,
            inExpression: this.args.size > 1 || this.invert,
        };
        const sqlChain = SQL.toSqlChainOperator(andCtx, sqlOperator, this.args);
        if (!this.invert) {
            return sqlChain;
        }
        const notCtx = {
            ...ctx,
            inExpression: this.args.size > 1,
        };
        return "NOT " + SQL.toSqlBraceInExpression(notCtx, sqlChain);
    }

    protected toSqlComparison(ctx: SQL.ToSqlContext): string {
        switch (this.comp) {
            case "and":
                return this.toSqlBoolean(ctx, "AND");
            case "between":
                return this.toSqlBetween(ctx);
            case "equal":
                return SQL.toSqlOperator(ctx, this.invert ? "!=" : "=", this.args.get(0), this.args.get(1));
            case "greater":
                return SQL.toSqlOperator(ctx, this.invert ? "<=" : ">", this.args.get(0), this.args.get(1));
            case "in":
                return this.toSqlIn(ctx);
            case "is null":
                return this.toSqlIsNull(ctx);
            case "lesser":
                return SQL.toSqlOperator(ctx, this.invert ? ">=" : "<", this.args.get(0), this.args.get(1));
            case "like":
                return SQL.toSqlOperator(ctx, this.invert ? "NOT LIKE" : "LIKE", this.args.get(0), this.args.get(1));
            case "or":
                return this.toSqlBoolean(ctx, "OR");
        }
    }

    public toSql(ctx: SQL.ToSqlContext): string {
        return SQL.toSqlBraceInExpression(ctx, this.toSqlComparison(ctx));
    }
}

export const isBetween = <T extends PT.NumericType>(
    left: SQL.Expression<T>,
    low: SQL.Expression<T>,
    high: SQL.Expression<T>
): Predicate => {
    return new Predicate(false, "between", List([left, low, high]));
};

export const notBetween = <T extends PT.NumericType>(
    left: SQL.Expression<T>,
    low: SQL.Expression<T>,
    high: SQL.Expression<T>
): Predicate => {
    return new Predicate(true, "between", List([left, low, high]));
};

export const isEqual = <T extends PT.PrimitiveType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(false, "equal", List([left, right]));
};

export const notEqual = <T extends PT.PrimitiveType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(true, "equal", List([left, right]));
};

export const isIn = <T extends PT.PrimitiveType>(left: SQL.Expression<T>, ...args: SQL.Expression<T>[]): Predicate => {
    return new Predicate(false, "in", List([left, ...args]));
};

export const notIn = <T extends PT.PrimitiveType>(left: SQL.Expression<T>, ...args: SQL.Expression<T>[]): Predicate => {
    return new Predicate(true, "in", List([left, ...args]));
};

export const isGreater = <T extends PT.NumericType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(false, "greater", List([left, right]));
};

export const notGreater = <T extends PT.NumericType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(true, "greater", List([left, right]));
};

export const isLesser = <T extends PT.NumericType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(false, "lesser", List([left, right]));
};

export const notLesser = <T extends PT.NumericType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(true, "lesser", List([left, right]));
};

export const isNull = <T extends PT.PrimitiveType>(left: SQL.Expression<T>): Predicate => {
    return new Predicate(false, "is null", List([left]));
};

export const notNull = <T extends PT.PrimitiveType>(left: SQL.Expression<T>): Predicate => {
    return new Predicate(true, "is null", List([left]));
};

export const isLike = <T extends PT.TextualType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(false, "like", List([left, right]));
};

export const notLike = <T extends PT.TextualType>(left: SQL.Expression<T>, right: SQL.Expression<T>): Predicate => {
    return new Predicate(true, "like", List([left, right]));
};

export const and = (...args: SQL.Expression<PT.BooleanType>[]): Predicate => {
    return new Predicate(false, "and", List(args));
};

export const or = (...args: SQL.Expression<PT.BooleanType>[]): Predicate => {
    return new Predicate(false, "or", List(args));
};

export const not = (arg: SQL.Expression<PT.BooleanType>): Predicate => {
    return new Predicate(true, "and", List([arg]));
};
