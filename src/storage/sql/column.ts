import { Expression, Engine } from "./sql";
import { PrimitiveType, primitive } from "./primitive";

export class Column<T extends PrimitiveType> implements Expression<T> {
    readonly type: T;
    readonly table: string;
    readonly column: string;

    constructor(type: T, tableName: string, columnName: string) {
        this.type = type;
        this.table = tableName;
        this.column = columnName;
    }

    public toSql(): string {
        return this.table + "." + this.column;
    }
}

export const column = <T extends PrimitiveType>(type: T, tableName: string, columnName: string): Column<T> => {
    return new Column<T>(type, tableName, columnName);
};
