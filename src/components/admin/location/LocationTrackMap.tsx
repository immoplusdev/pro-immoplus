import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Popup, Source } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import { Typography } from "antd";
import "maplibre-gl/dist/maplibre-gl.css";
import { DEFAULT_MAP_STYLE, INITIAL_MAP_STATE } from "@/configs/map.config";
import type { LocationPoint } from "@/types/location.types";
import { computeBounds, FIT_BOUNDS_OPTIONS, formatCapturedAt } from "./format";

const { Text } = Typography;

const POINTS_LAYER_ID = "location-track-points";
const START_COLOR = "#52c41a";
const END_COLOR = "#f5222d";
const TRACK_COLOR = "#1677ff";

interface Props {
  /** Points déjà triés par `capturedAt`. */
  points: readonly LocationPoint[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  height?: number;
}

function EndpointMarker({ label, color, title }: { label: string; color: string; title: string }) {
  return (
    <div
      title={title}
      aria-label={title}
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: color,
        border: "2px solid #fff",
        boxShadow: "0 1px 4px rgba(0,0,0,.4)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {label}
    </div>
  );
}

/** Trajet d'un utilisateur : polyline chronologique, départ (D) / arrivée (A) distincts, popup par point. */
export function LocationTrackMap({ points, selectedIndex, onSelect, height = 450 }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [cursor, setCursor] = useState<string>("");

  const line = useMemo<Feature<LineString>>(
    () => ({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: points.map((p) => [p.longitude, p.latitude]) },
    }),
    [points]
  );

  const pointFeatures = useMemo<FeatureCollection<Point, { index: number }>>(
    () => ({
      type: "FeatureCollection",
      features: points.map((p, index) => ({
        type: "Feature",
        properties: { index },
        geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      })),
    }),
    [points]
  );

  // Cadrage automatique sur l'ensemble des points.
  useEffect(() => {
    const bounds = computeBounds(points);
    if (loaded && bounds) mapRef.current?.fitBounds(bounds, FIT_BOUNDS_OPTIONS);
  }, [loaded, points]);

  // Centrage sur le point sélectionné (clic sur une ligne de la table ou sur la carte).
  useEffect(() => {
    const point = selectedIndex !== null ? points[selectedIndex] : undefined;
    if (loaded && point) {
      mapRef.current?.flyTo({ center: [point.longitude, point.latitude], zoom: Math.max(mapRef.current.getZoom(), 15) });
    }
  }, [loaded, points, selectedIndex]);

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const index = e.features?.[0]?.properties?.index;
      onSelect(typeof index === "number" ? index : null);
    },
    [onSelect]
  );

  const first = points[0];
  const last = points.length > 1 ? points[points.length - 1] : undefined;
  const selected = selectedIndex !== null ? points[selectedIndex] : undefined;

  return (
    <Map
      ref={mapRef}
      initialViewState={INITIAL_MAP_STATE}
      style={{ width: "100%", height, borderRadius: 8 }}
      mapStyle={DEFAULT_MAP_STYLE}
      onLoad={() => setLoaded(true)}
      interactiveLayerIds={[POINTS_LAYER_ID]}
      onClick={handleClick}
      onMouseEnter={() => setCursor("pointer")}
      onMouseLeave={() => setCursor("")}
      cursor={cursor}
    >
      <NavigationControl position="top-right" />

      {points.length > 1 && (
        <Source id="location-track-line" type="geojson" data={line}>
          <Layer
            id="location-track-line"
            type="line"
            layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{ "line-color": TRACK_COLOR, "line-width": 3, "line-opacity": 0.8 }}
          />
        </Source>
      )}

      <Source id="location-track-points" type="geojson" data={pointFeatures}>
        <Layer
          id={POINTS_LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": 5,
            "circle-color": "#fff",
            "circle-stroke-color": TRACK_COLOR,
            "circle-stroke-width": 2,
          }}
        />
      </Source>

      {first && (
        <Marker
          longitude={first.longitude}
          latitude={first.latitude}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onSelect(0);
          }}
        >
          <EndpointMarker label="D" color={START_COLOR} title={`Départ — ${formatCapturedAt(first.capturedAt)}`} />
        </Marker>
      )}
      {last && (
        <Marker
          longitude={last.longitude}
          latitude={last.latitude}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onSelect(points.length - 1);
          }}
        >
          <EndpointMarker label="A" color={END_COLOR} title={`Arrivée — ${formatCapturedAt(last.capturedAt)}`} />
        </Marker>
      )}

      {selected && selectedIndex !== null && (
        <Popup
          longitude={selected.longitude}
          latitude={selected.latitude}
          offset={14}
          closeOnClick={false}
          onClose={() => onSelect(null)}
        >
          <Text strong>
            {selectedIndex === 0 ? "Départ · " : selectedIndex === points.length - 1 && points.length > 1 ? "Arrivée · " : ""}
            Point {selectedIndex + 1}/{points.length}
          </Text>
          <div>{formatCapturedAt(selected.capturedAt)}</div>
        </Popup>
      )}
    </Map>
  );
}
