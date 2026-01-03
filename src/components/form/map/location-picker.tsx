import Map from 'react-map-gl/maplibre';
import {DEFAULT_MAP_STYLE, INITIAL_MAP_STATE} from "@/configs/map.config";
import {useCallback, useState} from "react";
import {Marker, MarkerDragEvent} from "react-map-gl";
import {MapPin} from "@/components/form/map/pin";
import 'maplibre-gl/dist/maplibre-gl.css';
import {GeoJsonPoint, GeoJsonType} from "@/core/domain/map/geo-json-point.model";


type Props = {
    height?: number | string;
    width?: number | string;
    readonly?: boolean;
    onChange?: (value: GeoJsonPoint) => void;
}


export function LocationPicker({height, width, onChange, readonly}: Props) {

    const [marker, setMarker] = useState({
        latitude: INITIAL_MAP_STATE.latitude,
        longitude: INITIAL_MAP_STATE.longitude
    });

    const updateMarker = (value: GeoJsonPoint) => {
        if (!readonly) {
            setMarker({
                longitude: value.coordinates[0],
                latitude: value.coordinates[1]
            });

            if (onChange) onChange({
                type: GeoJsonType.Point,
                coordinates: [value.coordinates[0], value.coordinates[1]]
            });
            // if (onChange) onChange({type: GeoJsonType.Point, coordinates: [event.lngLat.lng, event.lngLat.lat]});
        }
    }
    //
    // const [events, logEvents] = useState<Record<string, any>>({});

    // const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    //     logEvents(_events => ({..._events, onDragStart: event.lngLat}));
    // }, []);

    // const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    //     logEvents(_events => ({..._events, onDrag: event.lngLat}));
    //
    //     setMarker({
    //         longitude: event.lngLat.lng,
    //         latitude: event.lngLat.lat
    //     });
    // }, []);

    // const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
    //     logEvents(_events => ({..._events, onDragEnd: event.lngLat}));
    // }, []);

    const onClick = useCallback((event: any) => {
        console.log(event)
        const feature = event.features && event.features[0];

        if (feature) {
            window.alert(`Clicked layer ${feature.layer.id}`); // eslint-disable-line no-alert
        }

        updateMarker({type: GeoJsonType.Point, coordinates: [event.lngLat.lng, event.lngLat.lat]});
    }, []);

    return <Map
        initialViewState={INITIAL_MAP_STATE}
        style={{position: "relative", width: width || "100%", height: height || 400}}
        mapStyle={DEFAULT_MAP_STYLE}
        onClick={onClick}
    >
        <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
        >
            <MapPin size={20}/>
        </Marker>
    </Map>;
}