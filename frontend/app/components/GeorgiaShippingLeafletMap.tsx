"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Fragment } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ShippingWizardCity } from "@/lib/utils/delivery";

/** საქართველოს ჩარჩო — მიწოდების რუკის საზღვარი (გადაადგილება შეზღუდული). */
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [40.88, 39.65],
  [43.82, 46.95],
];

const INITIAL_CENTER: [number, number] = [42.25, 43.35];
const INITIAL_ZOOM = 7;

type Props = {
  cities: ShippingWizardCity[];
  selected: ShippingWizardCity | null;
  onSelect: (c: ShippingWizardCity) => void;
  className?: string;
};

function MapResizeAndBounds({ selected }: { selected: ShippingWizardCity | null }) {
  const map = useMap();

  const fitGeorgia = useCallback(() => {
    map.invalidateSize();
    map.fitBounds(MAP_BOUNDS, { padding: [18, 18], maxZoom: 8, animate: false });
  }, [map]);

  useEffect(() => {
    const id = requestAnimationFrame(fitGeorgia);
    return () => cancelAnimationFrame(id);
  }, [fitGeorgia]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const el = map.getContainer();
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);

  useEffect(() => {
    if (!selected) return;
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 7.5), {
      duration: 0.45,
      animate: true,
    });
  }, [selected, map]);

  return null;
}

export default function GeorgiaShippingLeafletMap({
  cities,
  selected,
  onSelect,
  className = "",
}: Props) {
  const selectedId = selected?.id ?? null;

  const tileUrl = useMemo(
    () =>
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    []
  );

  return (
    <div
      className={`shipping-leaflet-map relative z-0 overflow-hidden rounded-xl border border-slate-600/80 ${className}`.trim()}>
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        className="h-full min-h-[280px] w-full outline-none [&_.leaflet-tile-pane]:opacity-95"
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        maxBounds={MAP_BOUNDS}
        maxBoundsViscosity={0.9}
        zoomControl={false}
        attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
          subdomains="abcd"
        />
        <ZoomControl position="topright" />
        <MapResizeAndBounds selected={selected} />

        {cities.map((c) => {
          const isSel = selectedId === c.id;
          return (
            <Fragment key={c.id}>
              <CircleMarker
                key={`${c.id}-halo`}
                center={[c.lat, c.lng]}
                radius={isSel ? 20 : 17}
                pathOptions={{
                  color: "transparent",
                  fillColor: isSel ? "#fb923c" : "#94a3b8",
                  fillOpacity: isSel ? 0.18 : 0.1,
                  weight: 0,
                }}
                eventHandlers={{
                  click: () => onSelect(c),
                }}
              />
              <CircleMarker
                key={c.id}
                center={[c.lat, c.lng]}
                radius={isSel ? 13 : 11}
                pathOptions={{
                  color: isSel ? "#f97316" : "#94a3b8",
                  fillColor: isSel ? "#f97316" : "#1e293b",
                  fillOpacity: 0.96,
                  weight: isSel ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => onSelect(c),
                }}>
                <Tooltip permanent direction="top" offset={[0, -10]} opacity={1}>
                  {c.name}
                </Tooltip>
              </CircleMarker>
            </Fragment>
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute left-2 top-2 z-400 rounded-lg border border-orange-500/40 bg-slate-900/85 px-2.5 py-1.5 text-[10px] text-orange-200 sm:text-xs">
        1) აირჩიეთ ქალაქი წერტილზე დაჭერით
      </div>
      <p className="pointer-events-none absolute bottom-1 left-1 right-16 z-400 text-[9px] text-slate-500 sm:text-[10px]">
        დააჭირეთ წერტილს ან აირჩიეთ სიიდან · გადიდება +/- ან ჟესტით
      </p>
    </div>
  );
}
