export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export type primitive = boolean | number | string | Date | ArrayBuffer | GeoLocation;

export type BooleanType = "boolean";
export type NumericType = "double" | "integer" | "timestamp";
export type TextualType = "string";

export type PrimitiveType = BooleanType | NumericType | TextualType | "binary" | "geolocation";

export type primitiveOf<T extends PrimitiveType> = T extends "binary"
    ? ArrayBuffer
    : T extends "boolean"
    ? boolean
    : T extends "double"
    ? number
    : T extends "geolocation"
    ? GeoLocation
    : T extends "integer"
    ? number
    : T extends "string"
    ? string
    : T extends "timestamp"
    ? Date
    : null;
