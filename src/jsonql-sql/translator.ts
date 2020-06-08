import * as SG from "state-glue";
import * as SQL from "../sql/sql";
import { column, Column } from "../sql/column";
import { Join, from, inner, left } from "../sql/join";
import * as PC from "../sql/predicate";
import { Select } from "../sql/select";
import { field } from "../sql/field";
import { PrimitiveType, primitiveOf, TextualType, NumericType } from "../sql/primitive";
import * as LT from "../sql/literal";

interface Builder {
    readonly model: SG.IModel;
    readonly clazz: SG.IClass;
    readonly select: Select;
    readonly tableAlias: string;
    readonly nextTableAlias: () => string;
}

const emptyBuilder = (model: SG.IModel): Builder => {
    let tableCounter = 0;
    const nextTableAlias = () => "t" + ++tableCounter;
    return {
        model,
        clazz: null,
        select: new Select([], [], null, null, null, null, null),
        tableAlias: null,
        nextTableAlias,
    };
};

const addJoin = (parent: Builder, joinCall: (parent, child) => Join): Builder => {
    const child = {
        ...parent,
        tableAlias: parent.nextTableAlias(),
    };
    const join = joinCall(parent.tableAlias, child.tableAlias);
    child.select.joins.push(join);
    child.clazz = child.model.classes[join.table];
    return child;
};

export const toSQL = <R>(model: SG.IModel, implicitQuery: SG.IQuery<R>): Select => {
    const query = SG.injectDefaults(implicitQuery);
    let builder = addJoin(emptyBuilder(model), (p, c) => from(query.$type, c));
    builder = addChildren(builder, query as SG.ISelect<R>);
    console.log(JSON.stringify(builder));

    return builder.select;
};

const addChildren = <R>(builder: Builder, query: SG.ISelect<R>): Builder => {
    return Object.entries(query)
        .filter(([k]) => !k.startsWith("$"))
        .reduce((s, [k, v]) => addChild(builder, k, v), builder);
};

const addChild = <R>(builder: Builder, name: string, query: SG.ISelect<R>): Builder => {
    return "$type" in query
        ? addSubQuery(builder, name, query as SG.ISubQuery<R>)
        : addField(builder, name, query as SG.IField);
};

const addSubQuery = <R>(parent: Builder, name: string, query: SG.ISubQuery<R>): Builder => {
    const builder = addJoin(parent, (p, c) => {
        const predicate =
            "forward" === query.$dir
                ? PC.isEqual(column("integer", c, "id"), column("integer", p, query.$field))
                : PC.isEqual(column("integer", c, query.$field), column("integer", p, "id"));
        return "exist" === query.$cmp ? inner(query.$type, c, predicate) : left(query.$type, c, predicate);
    });
    const id = column("integer", builder.tableAlias, "id");
    if ("!exist" === query.$cmp) {
        builder.select.where = builder.select.where
            ? builder.select.where.and(PC.isNull(id))
            : PC.isNull(id);
    }
    if (query.$return) {
        builder.select.fields.push(field(name, id));
    }
    addChildren(builder, query as SG.ISelect<R>);
    return parent;
};

const addField = <R>(builder: Builder, name: string, fld: SG.IField): Builder => {
    const type = builder.clazz.attributes[fld.$field].type as PrimitiveType;
    const col = column(type, builder.tableAlias, fld.$field);
    const pred = cmpTopredicate(type, col, fld);
    if (pred) {
        builder.select.where = builder.select.where
            ? builder.select.where.and(pred)
            : pred;
    }
    if (fld.$return) {
        builder.select.fields.push(field(name, col));
    }
    return builder;
};
const cmpTopredicate = <T extends PrimitiveType>(type: T, col: Column<T>, fld: SG.IField): PC.Predicate => {
    switch (fld.$cmp) {
        case "=":
            return PC.isEqual(col, new LT.Literal(type, fld.$value as primitiveOf<T>));
        case "!=":
            return PC.notEqual(col, new LT.Literal(type, fld.$value as primitiveOf<T>));
        case "in":
            return PC.isIn(col, ...(fld.$value as primitiveOf<T>[]).map((v) => new LT.Literal(type, v)));
        case "!in":
            return PC.notIn(col, ...(fld.$value as primitiveOf<T>[]).map((v) => new LT.Literal(type, v)));
        case "><":
            return PC.isBetween(
                col as SQL.Expression<NumericType>,
                new LT.Literal(type as NumericType, fld.$value[0] as primitiveOf<NumericType>),
                new LT.Literal(type as NumericType, fld.$value[1] as primitiveOf<NumericType>)
            );
        case "<>":
            return PC.notBetween(
                col as SQL.Expression<NumericType>,
                new LT.Literal(type as NumericType, fld.$value[0] as primitiveOf<NumericType>),
                new LT.Literal(type as NumericType, fld.$value[1] as primitiveOf<NumericType>)
            );
        case "<":
            return PC.isLesser(
                col as SQL.Expression<NumericType>,
                new LT.Literal(type as NumericType, fld.$value as primitiveOf<NumericType>)
            );
        case ">":
            return PC.isGreater(
                col as SQL.Expression<NumericType>,
                new LT.Literal(type as NumericType, fld.$value as primitiveOf<NumericType>)
            );
        case "<=":
            return PC.notGreater(
                col as SQL.Expression<NumericType>,
                new LT.Literal(type as NumericType, fld.$value as primitiveOf<NumericType>)
            );
        case ">=":
            return PC.notLesser(
                col as SQL.Expression<NumericType>,
                new LT.Literal(type as NumericType, fld.$value as primitiveOf<NumericType>)
            );
        case "like":
            return PC.isLike(
                col as SQL.Expression<TextualType>,
                new LT.Literal(type as TextualType, fld.$value as primitiveOf<TextualType>)
            );
        case "!like":
            return PC.notLike(
                col as SQL.Expression<TextualType>,
                new LT.Literal(type as TextualType, fld.$value as primitiveOf<TextualType>)
            );
    }
    return null;
};
