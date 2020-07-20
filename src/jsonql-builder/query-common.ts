import * as QC from "immutable";

export type Primitive = boolean | number | string | Date;
export type ComparisonOperator = "=" | "!=" | "in" | "!in" | "><" | "<>" | "<=" | "<" | ">" | ">=" | "like" | "!like";
export type BooleanOperator = "and" | "or" | "not";
export type AggregateOperator = "max" | "min" | "sum" | "count" | "avg" | "stddiv";



