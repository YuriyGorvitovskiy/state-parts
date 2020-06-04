import { Map } from "immutable";
import { escape } from "sqlstring";

import * as SQL from "./sql";
import { GeoLocation } from "./primitive";

const LITERAL_MAPPING: SQL.LiteralMappingDefinition = {
    binary: (v: ArrayBuffer) => {
        throw Error("Binary literal is not supported");
    },
    boolean: (v: boolean) => (v ? "TRUE" : "FALSE"),
    double: (v: number) => v.toString(10),
    geolocation: (v: GeoLocation) => {
        throw Error("Geolocation literal is not supported");
    },
    integer: (v: number) => Math.floor(v).toString(10),
    string: (v: string) => "E" + escape(v),
    timestamp: (v: Date) => "'" + v.toISOString() + "'",
};

export const engine: SQL.Engine = {
    literalMapping: Map(Object.entries(LITERAL_MAPPING)) as SQL.LiteralMapping,
    pageMapping: (page: SQL.Page) => " LIMIT " + page.limit + " OFFSET " + page.offset,
};
