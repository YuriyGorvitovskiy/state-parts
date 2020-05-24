export interface GeoLocation {
    latitude: number,
    longitude: number,
}

export type primitive = boolean | number | string | Date | ArrayBuffer | GeoLocation;

export type NumericName = 'double' | 'integer' | 'timestamp';
export type TextualName = 'string';

export type PrimitiveName = NumericName | TextualName | 'binary' | 'boolean' | 'geolocation';


export type primitiveOf<T extends PrimitiveName> =
    T extends 'binary' ? ArrayBuffer :
    T extends 'boolean' ? boolean :
    T extends 'double' ? number :
    T extends 'geolocation' ? GeoLocation :
    T extends 'integer' ? number :
    T extends 'string' ? string :
    T extends 'timestamp' ? Date : null;
