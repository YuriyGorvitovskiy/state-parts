export interface GeoLocation {
    latitude: number,
    longitude: number,
}

export type primitive = boolean | number | string | Date | ArrayBuffer | GeoLocation;

export type PrimitiveName = 'binary' | 'boolean' | 'double' | 'geolocation' | 'integer' | 'string' | 'timestamp';
