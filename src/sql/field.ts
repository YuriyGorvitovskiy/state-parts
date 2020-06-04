import * as PV from "./primitive";
import * as SQL from "./sql";

export class Field<T extends PV.PrimitiveType> implements SQL.Element {
    readonly type: T;
    readonly name: string;
    readonly value: SQL.Expression<T>;

    constructor(type: T, name: string, value: SQL.Expression<T>) {
        this.type = value.type;
        this.name = name;
        this.value = value;
    }

    public toSql(ctx: SQL.ToSqlContext): string {
        return this.value.toSql(ctx) + " AS " + this.name;
    }
}

export const field = <T extends PV.PrimitiveType>(name: string, value: SQL.Expression<T>): Field<T> => {
    return new Field<T>(value.type, name, value);
};
