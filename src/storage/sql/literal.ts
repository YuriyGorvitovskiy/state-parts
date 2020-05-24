import { Expression, Engine, ToSqlContext } from "./sql";
import { PrimitiveType, primitive, primitiveOf } from "./primitive";

export class Literal<T extends PrimitiveType> implements Expression<T> {
    readonly type: T;
    readonly value: primitive;

    public constructor(type: T, value: primitiveOf<T>) {
        this.type = type;
        this.value = value;
    }

    public toSql(ctx: ToSqlContext): string {
        return ctx.engine.literalMapping.get(this.type)(this.value);
    }
}

export const booleanLiteral = (v: boolean): Literal<"boolean"> => {
    return new Literal("boolean", v);
};

export const doubleLiteral = (v: number): Literal<"double"> => {
    return new Literal("double", v);
};

export const integerLiteral = (v: number): Literal<"integer"> => {
    return new Literal("integer", v);
};

export const stringLiteral = (v: string): Literal<"string"> => {
    return new Literal("string", v);
};

export const timestampLiteral = (v: Date): Literal<"timestamp"> => {
    return new Literal("timestamp", v);
};
