import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BASES = [
    { label: 'Tonbridge', postcode: 'TN9 1PP', lat: 51.1954, lng: 0.2733 },
    { label: 'Eltham', postcode: 'SE9 4HA', lat: 51.4522, lng: 0.0517 },
] as const;

/* Midpoint between the two bases – zone rings radiate from here */
const CENTER = {
    lat: (BASES[0].lat + BASES[1].lat) / 2,
    lng: (BASES[0].lng + BASES[1].lng) / 2,
};

/* Approximate radii in km – illustrative only, actual zones use live routing */
const ZONES = [
    { label: 'Zone C', radiusKm: 50, color: '#f59e0b', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4' },
    { label: 'Zone B', radiusKm: 35, color: '#38bdf8', fillOpacity: 0.08, weight: 1.5, dashArray: '' },
    { label: 'Zone A', radiusKm: 20, color: '#0ea5e9', fillOpacity: 0.12, weight: 2, dashArray: '' },
] as const;

const baseIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:#0ea5e9;border:2.5px solid #fff;
        box-shadow:0 0 8px rgba(14,165,233,0.6);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

export function CoverageMap() {
    return (
        <div className="relative">
            <div className="h-[480px] w-full overflow-hidden rounded-2xl border border-border-default shadow-xl">
                <MapContainer
                    center={[CENTER.lat, CENTER.lng]}
                    zoom={9}
                    className="h-full w-full"
                    scrollWheelZoom={true}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        subdomains="abcd"
                    />

                    {/* Zone rings from center */}
                    {ZONES.map((zone) => (
                        <Circle
                            key={zone.label}
                            center={[CENTER.lat, CENTER.lng]}
                            radius={zone.radiusKm * 1000}
                            pathOptions={{
                                color: zone.color,
                                fillColor: zone.color,
                                fillOpacity: zone.fillOpacity,
                                weight: zone.weight,
                                dashArray: zone.dashArray || undefined,
                            }}
                        />
                    ))}

                    {/* Base markers */}
                    {BASES.map((base) => (
                        <Marker key={base.label} position={[base.lat, base.lng]} icon={baseIcon}>
                            <Popup>
                                <span style={{ fontWeight: 600 }}>{base.label} Base</span>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-[1000] rounded-xl border border-border-default bg-surface/90 px-4 py-3 text-xs shadow-lg backdrop-blur-md">
                <p className="mb-2 font-semibold text-text-primary">Approximate zones</p>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-block h-0.5 w-5 rounded-full bg-[#0ea5e9]" />
                        <span className="text-text-secondary">Zone A &nbsp;0–25 min</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="inline-block h-0.5 w-5 rounded-full bg-[#38bdf8]" />
                        <span className="text-text-secondary">Zone B &nbsp;25–45 min</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="inline-block h-0.5 w-5 rounded-full bg-[#f59e0b]" style={{ borderTop: '1px dashed #f59e0b' }} />
                        <span className="text-text-secondary">Zone C &nbsp;45–60 min</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0ea5e9] border-2 border-white" />
                        <span className="text-text-secondary">Operating base</span>
                    </div>
                </div>
                <p className="mt-2 max-w-[180px] text-[10px] leading-tight text-text-muted">
                    Rings are illustrative. Actual zones use live routing at time of booking.
                </p>
            </div>
        </div>
    );
}
