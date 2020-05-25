import * as SQL from "./sql";
import * as PC from "./predicate";

type JoinType = 'from' | 'inner' | 'left' | 'right' | 'full';

export class Join implements SQL.Element {
    readonly join: JoinType;
    readonly table: string;
    readonly on: PC.Predicate;

    constructor(join: JoinType, table: string, on: PC.Predicate) {
        this.join = join;
        this.table = table;
        this.on = on;
    }

    public toSqlJoin(): string {
        switch (this.join) {
            case 'from': return "  FROM ";
            case 'inner': return " INNER JOIN";
            case 'left': return "  LEFT JOIN";
            case 'right': return " RIGHT JOIN";
            case 'full': return "  FULL JOIN";
        }
    }
    public toSql(ctx: SQL.ToSqlContext): string {
        return this.toSqlJoin() + " " + this.table +
            (this.on ? " ON " + this.on.toSql(ctx) : "");
    }
}