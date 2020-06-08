import * as SQL from "./sql";
import { Field } from "./field";
import { Join } from "./join";
import { Predicate } from "./predicate";

export class Select implements SQL.Element {
    fields: Field<any>[];
    joins: Join[];
    where: Predicate;
    group: SQL.Expression<any>[];
    having: Predicate;
    sort: SQL.Sort[];
    page: SQL.Page;

    constructor(
        fields: Field<any>[],
        joins: Join[],
        where: Predicate,
        group: SQL.Expression<any>[],
        having: Predicate,
        sort: SQL.Sort[],
        page: SQL.Page
    ) {
        this.fields = fields;
        this.joins = joins;
        this.where = where;
        this.group = group;
        this.having = having;
        this.sort = sort;
        this.page = page;
    }

    public toSql(ctx: SQL.ToSqlContext): string {
        const subCtx = {
            ...ctx,
            indent: ctx.indent + "       ",
        };
        return (
            ctx.indent +
            "SELECT " +
            this.fields.map((f) => f.toSql(subCtx)).join(",\n" + subCtx.indent) +
            "\n" +
            ctx.indent +
            this.joins.map((j) => j.toSql(subCtx)).join("\n" + ctx.indent) +
            (this.where ? "\n" + ctx.indent + " WHERE " + this.where.toSql(subCtx) : "") +
            (this.group ? "\n" + ctx.indent + " GROUP BY " + this.group.map((g) => g.toSql(subCtx)).join(", ") : "") +
            (this.having ? "\n" + ctx.indent + "HAVING " + this.having.toSql(subCtx) : "") +
            (this.sort
                ? "\n" +
                  ctx.indent +
                  " ORDER BY " +
                  this.sort.map((s) => (s.value.toSql(subCtx) + s.descending ? " DESC" : " ASC")).join(", ")
                : "") +
            (this.page ? "\n" + ctx.indent + ctx.engine.pageMapping(this.page) : "")
        );
    }
}
