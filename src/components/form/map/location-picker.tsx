import Map from 'react-map-gl/maplibre';
import {DEFAULT_MAP_STYLE, INITIAL_MAP_STATE} from "@/configs/map.config";
import {useCallback, useState} from "react";
import {Marker, MarkerDragEvent} from "react-map-gl";
import {MapPin} from "@/components/form/map/pin";

type Props = {
    height?: number | string;
    width?: number | string;
}


export function LocationPicker({height, width}: Props) {

    const [marker, setMarker] = useState({
        latitude: 0,
        longitude: 0
    });

    const [events, logEvents] = useState<Record<string, any>>({});

    const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
        logEvents(_events => ({..._events, onDragStart: event.lngLat}));
    }, []);

    const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
        logEvents(_events => ({..._events, onDrag: event.lngLat}));

        setMarker({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat
        });
    }, []);

    const onMarkerDragEnd = useCallback((event: MarkerDragEvent) => {
        logEvents(_events => ({..._events, onDragEnd: event.lngLat}));
    }, []);

    const onClick = useCallback((event: any) => {
        console.log(event)
        const feature = event.features && event.features[0];

        if (feature) {
            window.alert(`Clicked layer ${feature.layer.id}`); // eslint-disable-line no-alert
        }

        setMarker({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat
        });
    }, []);

    return <Map
        initialViewState={INITIAL_MAP_STATE}
        style={{width: width || "100%", height: height || 400}}
        mapStyle={DEFAULT_MAP_STYLE}
        onClick={onClick}
    >
      <div className="flex w-full h-full items-center justify-around">
          {
              marker.latitude != 0 ?
                  <Marker
                      longitude={marker.longitude}
                      latitude={marker.latitude}
                      anchor={'center'}
                      className={"relative top-0 left-0 right-0 bottom-0"}
                      // anchor="bottom"
                      // draggable
                      // onDragStart={onMarkerDragStart}
                      // onDrag={onMarkerDrag}
                      // onDragEnd={onMarkerDragEnd}
                  >
                      <MapPin className="absolute top-0 left-0 right-0 bottom-0" size={20}/>
                  </Marker> :
                  null
          }
      </div>
    </Map>;
}