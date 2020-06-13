import * as SG from "state-glue";
import * as SQL from "../sql/sql";
import { column, Column } from "../sql/column";
import { Join, from, inner, left } from "../sql/join";
import * as PC from "../sql/predicate";
import { Select } from "../sql/select";
import { field } from "../sql/field";
import { PrimitiveType, primitiveOf, TextualType, NumericType } from "../sql/primitive";
import * as LT from "../sql/literal";
import { OrderedMap, List, Map } from "immutable";

type QueryHandler<R> = (rows: any[]) => List<Map<string, any>>;
type ResultHandler = (result: Map<string, any>, row: any) => any;

interface Builder {
    readonly model: SG.IModel;
    readonly clazz: SG.IClass;
    readonly select: Select;
    readonly tableAlias: string;
    readonly nextTableAlias: () => string;
    readonly nextColumnAlias: () => string;
    readonly resultBuilder: ResultHandler;
}

const emptyBuilder = (model: SG.IModel): Builder => {
    let tableCounter = 0;
    let columnCounter = 0;
    const nextTableAlias = () => "t" + ++tableCounter;
    const nextColumnAlias = () => "c" + ++columnCounter;
    const resultBuilder = () => ({});
    return {
        model,
        clazz: null,
        select: new Select([], [], null, null, null, null, null),
        tableAlias: null,
        nextTableAlias,
        nextColumnAlias,
        resultBuilder
    };
};

export const toSQL = <R>(model: SG.IModel, implicitQuery: SG.IQuery<R>): [Select, QueryHandler<R>] => {
    const query = SG.injectDefaults(implicitQuery);
    let builder = addJoin(emptyBuilder(model), (p, c) => from(query.$type, c));
    const id = column("integer", builder.tableAlias, "id");
    const columnAlias = builder.nextColumnAlias();
    builder.select.fields.push(field(columnAlias, id));

    builder = addChildren(builder, query as SG.ISelect<R>);

    return [
        builder.select,
        (rows) => {
            return listifyOrderedMaps(
                rows.reduce(
                    (a, r) => {
                        const rowId = r[columnAlias] as number;
                        const beginRecord = a.get(rowId);
                        const argRecord = beginRecord || Map([["id", rowId]]);
                        const endRecord = builder.resultBuilder(argRecord, r);
                        if (beginRecord === endRecord) {
                            return a;
                        }
                        return a.set(rowId, endRecord);
                    },
                    OrderedMap<number, Map<string, any>>()
                )
            );
        }
    ];
};

const listifyOrderedMaps = (r: OrderedMap<number, Map<string, any>>): List<Map<string, any>> => {

    return List(r.toList().map(e =>
        e.mapEntries(([k, v]) =>
            [k, OrderedMap.isOrderedMap(v) ? listifyOrderedMaps(v as OrderedMap<number, Map<string, any>>) : v])));
}

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

const addChildren = <R>(builder: Builder, query: SG.ISelect<R>): Builder => {
    const resultBuilders = Object.entries(query)
        .filter(([k]) => !k.startsWith("$"))
        .reduce((s, [k, v]) => s.push(addChild(builder, k, v)), List<ResultHandler>());

    return {
        ...builder,
        resultBuilder: (res, row) => resultBuilders.reduce((r, h) => h(r, row), res)
    }
};

const addChild = <R>(builder: Builder, name: string, query: SG.ISelect<R>): ResultHandler => {
    return "$type" in query
        ? addSubQuery(builder, name, query as SG.ISubQuery<R>)
        : addField(builder, name, query as SG.IField);
};

const addSubQuery = <R>(parent: Builder, name: string, query: SG.ISubQuery<R>): ResultHandler => {
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

    if (!query.$return) {
        addChildren(builder, query as SG.ISelect<R>);
        return (res) => res;
    }

    const columnAlias = builder.nextColumnAlias();
    builder.select.fields.push(field(columnAlias, id));
    const childResultBuilder = addChildren(builder, query as SG.ISelect<R>).resultBuilder;
    return "forward" === query.$dir
        ? (res, row) => { // Single row per field
            const rowId = row[columnAlias] as number;
            if (null == rowId) {
                return res.set(name, null);
            }

            const beginRecord = res.get(name) as Map<string, any>;
            const argRecord = beginRecord || Map([["id", rowId]]);
            const endRecord = childResultBuilder(argRecord, row);
            if (beginRecord === endRecord) {
                return res;
            }
            return res.set(name, endRecord);
        }
        : (res, row) => { // Multiple rows per fiield
            const rowId = row[columnAlias] as number;
            const queryRecords = res.get(name) as OrderedMap<number, Map<string, any>>;
            if (null == rowId) {
                return queryRecords || res.set(name, OrderedMap());
            }
            const beginRecord = queryRecords?.get(rowId);
            const argRecord = beginRecord || Map([["id", rowId]]);
            const endRecord = childResultBuilder(argRecord, row);
            if (beginRecord === endRecord) {
                return res;
            }
            return res.set(name, (queryRecords || OrderedMap()).set(rowId, endRecord));
        }
};

const addField = <R>(builder: Builder, name: string, fld: SG.IField): ResultHandler => {
    const type = builder.clazz.attributes[fld.$field].type as PrimitiveType;
    const col = column(type, builder.tableAlias, fld.$field);
    const pred = cmpTopredicate(type, col, fld);
    if (pred) {
        builder.select.where = builder.select.where
            ? builder.select.where.and(pred)
            : pred;
    }

    let resultBuilder: ResultHandler = (res) => res;
    if (fld.$return && 'id' !== fld.$field) {
        const columnAlias = builder.nextColumnAlias();
        builder.select.fields.push(field(columnAlias, col));
        resultBuilder = (res, row) => res.set(name, row[columnAlias]);
    }
    return resultBuilder;
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
