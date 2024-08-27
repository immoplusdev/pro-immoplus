export interface GeoJsonPoint {
    type: GeoJsonType;
    coordinates: Array<number>;
}

export enum GeoJsonType {
    Point = "Point",
    MultiPoint = "MultiPoint",
    Feature = "Feature",
}
