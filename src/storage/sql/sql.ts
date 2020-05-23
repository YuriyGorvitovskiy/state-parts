import { Map } from "immutable";
import { primitive, PrimitiveName, GeoLocation } from "./primitive";

export type ToLiteral<T extends primitive> = (value: T) => string;

type PrimitiveMapping<T> = {
    readonly [key in PrimitiveName]: T
};

export interface LiteralMappingDefinition extends PrimitiveMapping<ToLiteral<any>> {
    readonly boolean: ToLiteral<boolean>;
    readonly binary: ToLiteral<ArrayBuffer>;
    readonly integer: ToLiteral<number>;
    readonly double: ToLiteral<number>;
    readonly geolocation: ToLiteral<GeoLocation>;
    readonly string: ToLiteral<string>;
    readonly timestamp: ToLiteral<Date>;
};

export type LiteralMapping = Map<PrimitiveName, ToLiteral<any>>

export interface Engine {
    readonly literalMapping: LiteralMapping;
}

export interface Element {
    readonly toSql: (engine: Engine) => string;
}