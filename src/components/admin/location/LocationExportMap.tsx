import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Map, { Layer, NavigationControl, Popup, Source } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import type { FeatureCollection, Point } from "geojson";
import { Space, Typography } from "antd";
import "maplibre-gl/dist/maplibre-gl.css";
import { DEFAULT_MAP_STYLE, INITIAL_MAP_STATE } from "@/configs/map.config";
import {
  getLocationActionHexColor,
  isKnownLocationAction,
  LOCATION_ACTIONS,
  locationActionHexColor,
  locationActionMap,
  locationRoleMap,
  UNKNOWN_ACTION_HEX_COLOR,
} from "@/types/location.types";
import type { LocationExportRow } from "./LocationExportTable";
import { LocationActionTag } from "./LocationActionTag";
import { computeBounds, FIT_BOUNDS_OPTIONS, formatCapturedAt, userLocationTabPath } from "./format";

const { Text } = Typography;
const LAYER_ID = "location-export-points";

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Space size={6}>
      <span
        aria-hidden
        style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: color }}
      />
      <Text>{label}</Text>
    </Space>
  );
}

/** Marqueurs des items de la page courante, colorés selon l'action. */
export function LocationExportMap({ rows, height = 520 }: { rows: LocationExportRow[]; height?: number }) {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [cursor, setCursor] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const features = useMemo<FeatureCollection<Point, { index: number; color: string }>>(
    () => ({
      type: "FeatureCollection",
      features: rows.map((r, index) => ({
        type: "Feature",
        properties: { index, color: getLocationActionHexColor(r.action) },
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
      })),
    }),
    [rows]
  );

  useEffect(() => {
    setSelectedIndex(null);
    const bounds = computeBounds(rows);
    if (loaded && bounds) mapRef.current?.fitBounds(bounds, FIT_BOUNDS_OPTIONS);
  }, [loaded, rows]);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const index = e.features?.[0]?.properties?.index;
    setSelectedIndex(typeof index === "number" ? index : null);
  }, []);

  const hasUnknownAction = rows.some((r) => !isKnownLocationAction(r.action));
  const selected = selectedIndex !== null ? rows[selectedIndex] : undefined;

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Space size={16} wrap aria-label="Légende">
        {LOCATION_ACTIONS.map((a) => (
          <LegendDot key={a} color={locationActionHexColor[a]} label={locationActionMap[a].label} />
        ))}
        {hasUnknownAction && <LegendDot color={UNKNOWN_ACTION_HEX_COLOR} label="Autre action" />}
      </Space>

      <Map
        ref={mapRef}
        initialViewState={INITIAL_MAP_STATE}
        style={{ width: "100%", height, borderRadius: 8 }}
        mapStyle={DEFAULT_MAP_STYLE}
        onLoad={() => setLoaded(true)}
        interactiveLayerIds={[LAYER_ID]}
        onClick={handleClick}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("")}
        cursor={cursor}
      >
        <NavigationControl position="top-right" />
        <Source id={LAYER_ID} type="geojson" data={features}>
          <Layer
            id={LAYER_ID}
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": ["get", "color"],
              "circle-stroke-color": "#fff",
              "circle-stroke-width": 2,
            }}
          />
        </Source>

        {selected && (
          <Popup
            longitude={selected.longitude}
            latitude={selected.latitude}
            offset={10}
            closeOnClick={false}
            onClose={() => setSelectedIndex(null)}
          >
            <Space direction="vertical" size={4}>
              <LocationActionTag action={selected.action} />
              <Text>{formatCapturedAt(selected.capturedAt)}</Text>
              <Text type="secondary">
                {locationRoleMap[selected.role]?.label ?? selected.role}
                {selected.city ? ` · ${selected.city}` : ""}
              </Text>
              <Link to={userLocationTabPath(selected.userId)}>Voir la fiche</Link>
            </Space>
          </Popup>
        )}
      </Map>
    </Space>
  );
}
