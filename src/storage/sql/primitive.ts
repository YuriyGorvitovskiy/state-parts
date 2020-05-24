export interface GeoLocation {
    latitude: number,
    longitude: number,
}

export type primitive = boolean | number | string | Date | ArrayBuffer | GeoLocation;

export type PrimitiveName = 'binary' | 'boolean' | 'double' | 'geolocation' | 'integer' | 'string' | 'timestamp';

export type primitiveOf<T extends PrimitiveName> =
    T extends 'binary' ? ArrayBuffer :
    T extends 'boolean' ? boolean :
    T extends 'double' ? number :
    T extends 'geolocation' ? GeoLocation :
    T extends 'integer' ? number :
    T extends 'string' ? string :
    T extends 'timestamp' ? Date : null;
