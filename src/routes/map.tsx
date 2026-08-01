import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layers, Loader2, MapPin, Search, Star, X } from "lucide-react";
import { OjaLogo } from "@/components/OjaLogo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Lagos map · Find pros anywhere in Lagos · Ọjà" },
      {
        name: "description",
        content:
          "Search any address in Lagos and filter trusted Ọjà professionals by local government area on a live map.",
      },
      { property: "og:title", content: "Lagos map · Ọjà" },
      { property: "og:description", content: "Find pros anywhere in Lagos, filter by LGA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

// The 20 Lagos LGAs with approximate centroids (lat, lng)
const LAGOS_LGAS: { name: string; center: [number, number] }[] = [
  { name: "Agege", center: [6.6151, 3.3306] },
  { name: "Ajeromi-Ifelodun", center: [6.4425, 3.3286] },
  { name: "Alimosho", center: [6.6018, 3.2680] },
  { name: "Amuwo-Odofin", center: [6.4602, 3.2913] },
  { name: "Apapa", center: [6.4498, 3.3595] },
  { name: "Badagry", center: [6.4315, 2.8876] },
  { name: "Epe", center: [6.5844, 3.9829] },
  { name: "Eti-Osa", center: [6.4547, 3.5619] },
  { name: "Ibeju-Lekki", center: [6.4640, 3.7010] },
  { name: "Ifako-Ijaiye", center: [6.6685, 3.3221] },
  { name: "Ikeja", center: [6.6018, 3.3515] },
  { name: "Ikorodu", center: [6.6194, 3.5106] },
  { name: "Kosofe", center: [6.5836, 3.4076] },
  { name: "Lagos Island", center: [6.4531, 3.3958] },
  { name: "Lagos Mainland", center: [6.4970, 3.3841] },
  { name: "Mushin", center: [6.5320, 3.3540] },
  { name: "Ojo", center: [6.4585, 3.1583] },
  { name: "Oshodi-Isolo", center: [6.5545, 3.3115] },
  { name: "Shomolu", center: [6.5386, 3.3849] },
  { name: "Surulere", center: [6.4990, 3.3599] },
];

type Pro = {
  id: string;
  name: string;
  craft: string;
  rating: number;
  reviews: number;
  price: string;
  lga: string;
  lat: number;
  lng: number;
  verified: boolean;
  image: string;
};

// Small jitter helper so multiple real pros sharing an LGA centroid don't
// render as a single overlapping marker
function j(base: number, spread = 0.012) {
  return base + (Math.random() - 0.5) * spread * 2;
}

type ProviderRow = {
  id: string;
  business_name: string;
  area: string;
  rating: number;
  review_count: number;
  price_from: number;
  verified: boolean;
  categories: { name: string } | null;
};

// Real published providers only have a free-text `area` on file (no lat/lng
// yet), so each one is placed at the centroid of whichever LGA name appears
// in their area text. A provider whose area doesn't match any known LGA is
// left off the map rather than guessing a location for it.
function placeRealPros(rows: ProviderRow[]): Pro[] {
  const placed: Pro[] = [];
  for (const r of rows) {
    const areaLower = r.area?.toLowerCase() ?? "";
    const lga = LAGOS_LGAS.find((l) => areaLower.includes(l.name.toLowerCase()));
    if (!lga) continue;
    placed.push({
      id: r.id,
      name: r.business_name,
      craft: r.categories?.name ?? "Service provider",
      rating: r.rating,
      reviews: r.review_count,
      price: r.price_from > 0 ? `from ₦${Number(r.price_from).toLocaleString()}` : "Contact for pricing",
      lga: lga.name,
      lat: j(lga.center[0], 0.01),
      lng: j(lga.center[1], 0.01),
      verified: r.verified,
      image: "",
    });
  }
  return placed;
}

type GeoResult = { display_name: string; lat: string; lon: string };

function MapPage() {
  const [query, setQuery] = useState("");
  const [craftQuery, setCraftQuery] = useState("");
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [pros, setPros] = useState<Pro[]>([]);
  const [prosLoading, setProsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPros() {
      const { data } = await supabase
        .from("provider_profiles")
        .select("id, business_name, area, rating, review_count, price_from, verified, categories(name)")
        .eq("published", true);
      if (!active) return;
      setPros(placeRealPros((data as unknown as ProviderRow[]) ?? []));
      setProsLoading(false);
    }
    loadPros();
    return () => {
      active = false;
    };
  }, []);

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const lgaLayerRef = useRef<any>(null);
  const searchPinRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const filteredPros = useMemo(() => {
    const q = craftQuery.trim().toLowerCase();
    return pros.filter((p) => {
      if (selectedLga && p.lga !== selectedLga) return false;
      if (verifiedOnly && !p.verified) return false;
      if (q && !(`${p.name} ${p.craft}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [selectedLga, verifiedOnly, craftQuery]);

  // Load Leaflet from CDN on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    async function load() {
      try {
        // CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);
        }
        // JS
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
            s.crossOrigin = "";
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load Leaflet"));
            document.head.appendChild(s);
          });
        }
        if (cancelled) return;
        const L = (window as any).L;
        LRef.current = L;
        if (!mapDivRef.current || mapRef.current) return;

        const map = L.map(mapDivRef.current, {
          center: [6.5244, 3.3792],
          zoom: 11,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        // Lagos bounds outline (approx bounding box)
        const lagosBounds = L.rectangle(
          [
            [6.36, 2.70],
            [6.72, 4.35],
          ],
          { color: "#0B6E3C", weight: 1, fillOpacity: 0.03, dashArray: "4 6" },
        ).addTo(map);
        lgaLayerRef.current = lagosBounds;

        markerLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setMapReady(true);
      } catch (e: any) {
        setMapError(e?.message || "Could not load map");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Draw pro markers whenever filters change
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();

    const icon = (verified: boolean, active: boolean) =>
      L.divIcon({
        className: "oja-pin",
        iconSize: [30, 38],
        iconAnchor: [15, 36],
        popupAnchor: [0, -32],
        html: `
          <div style="position:relative;display:grid;place-items:center;width:30px;height:38px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.25));">
            <svg viewBox="0 0 30 38" width="30" height="38" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.7 23.3 0 15 0z"
                fill="${active ? "#F58220" : "#0B6E3C"}"/>
              <circle cx="15" cy="15" r="6.5" fill="white"/>
              ${verified ? '<circle cx="22" cy="8" r="4" fill="#FDB515" stroke="white" stroke-width="1.5"/>' : ""}
            </svg>
          </div>
        `,
      });

    filteredPros.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: icon(p.verified, p.id === selectedProId) })
        .addTo(layer)
        .bindPopup(
          `<div style="font-family:Inter,system-ui;min-width:200px">
            <div style="display:flex;gap:10px;align-items:center;">
              ${p.image
                ? `<img src="${p.image}" style="width:44px;height:44px;border-radius:12px;object-fit:cover"/>`
                : `<div style="width:44px;height:44px;border-radius:12px;background:#E8F3EC;color:#0B6E3C;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${p.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() ?? "")
                    .join("") || "?"}</div>`}
              <div>
                <div style="font-weight:600;color:#202124">${p.name}</div>
                <div style="font-size:12px;color:#5f6368">${p.craft} · ${p.lga}</div>
              </div>
            </div>
            <div style="margin-top:8px;display:flex;justify-content:space-between;font-size:12px;">
              <span style="color:#0B6E3C;font-weight:600">★ ${p.rating} (${p.reviews})</span>
              <span style="font-weight:600">${p.price}</span>
            </div>
          </div>`,
        );
      m.on("click", () => setSelectedProId(p.id));
    });
  }, [filteredPros, selectedProId, mapReady]);

  // Fly to LGA when selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedLga) {
      const lga = LAGOS_LGAS.find((l) => l.name === selectedLga);
      if (lga) map.flyTo(lga.center, 13, { duration: 0.6 });
    } else {
      map.flyTo([6.5244, 3.3792], 11, { duration: 0.6 });
    }
  }, [selectedLga]);

  // Fly to selected pro
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedProId) return;
    const pro = pros.find((p) => p.id === selectedProId);
    if (pro) map.flyTo([pro.lat, pro.lng], 15, { duration: 0.6 });
  }, [selectedProId]);

  async function doGeocode(text: string) {
    const q = text.trim();
    if (!q) {
      setGeoResults([]);
      return;
    }
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=6&countrycodes=ng&viewbox=2.70,6.72,4.35,6.36&bounded=1&q=${encodeURIComponent(
        q + ", Lagos, Nigeria",
      )}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data: GeoResult[] = await res.json();
      setGeoResults(data);
    } catch {
      setGeoResults([]);
    } finally {
      setGeocoding(false);
    }
  }

  function pickGeoResult(r: GeoResult) {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (searchPinRef.current) {
      map.removeLayer(searchPinRef.current);
    }
    const pin = L.circleMarker([lat, lng], {
      radius: 10,
      color: "#F58220",
      weight: 3,
      fillColor: "#FDB515",
      fillOpacity: 0.85,
    })
      .addTo(map)
      .bindPopup(`<b>Search location</b><br/>${r.display_name}`)
      .openPopup();
    searchPinRef.current = pin;
    map.flyTo([lat, lng], 15, { duration: 0.6 });
    setQuery(r.display_name.split(",").slice(0, 2).join(", "));
    setGeoResults([]);
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <OjaLogo size={32} />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/search" search={{ q: "" }} className="hover:text-foreground">Search</Link>
            <Link to="/map" className="text-foreground">Map</Link>
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          </nav>
          <Link
            to="/instant-match"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Instant Match
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
              <MapPin className="h-3.5 w-3.5" /> Lagos, Nigeria
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find pros anywhere in Lagos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search any address and filter by local government area — {pros.length} real {pros.length === 1 ? "pro" : "pros"} mapped so far.
            </p>
            {!prosLoading && pros.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Ọjà is early — no pros have a mappable area on file yet.{" "}
                <Link to="/signup" className="font-semibold text-primary hover:underline">Be the first to join</Link>.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Address search */}
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Search any address in Lagos
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doGeocode(query);
                  }}
                  placeholder="e.g. 15 Admiralty Way, Lekki"
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setGeoResults([]);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => doGeocode(query)}
                disabled={geocoding || !query.trim()}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {geocoding ? "Searching…" : "Search location"}
              </button>
              {geoResults.length > 0 && (
                <ul className="mt-3 max-h-56 overflow-auto rounded-2xl border border-border bg-background text-sm">
                  {geoResults.map((r, i) => (
                    <li key={i}>
                      <button
                        onClick={() => pickGeoResult(r)}
                        className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="line-clamp-2 text-xs">{r.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* LGA filter */}
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Filter by LGA
                </label>
                {selectedLga && (
                  <button
                    onClick={() => setSelectedLga(null)}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-3 flex max-h-56 flex-wrap gap-1.5 overflow-auto pr-1">
                {LAGOS_LGAS.map((l) => {
                  const active = selectedLga === l.name;
                  return (
                    <button
                      key={l.name}
                      onClick={() => setSelectedLga(active ? null : l.name)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-background text-foreground hover:border-primary/40"
                      }`}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Craft filter */}
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Filter results
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={craftQuery}
                  onChange={(e) => setCraftQuery(e.target.value)}
                  placeholder="e.g. electrician, chef…"
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Verified only</span>
              </label>
            </div>

            {/* Result list */}
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {filteredPros.length} pros{selectedLga ? ` in ${selectedLga}` : ""}
                </p>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              <ul className="mt-3 max-h-96 space-y-2 overflow-auto pr-1">
                {filteredPros.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedProId(p.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition ${
                        selectedProId === p.id
                          ? "border-primary bg-brand-soft"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {p.image ? (
                        <img src={p.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-xs font-bold text-brand">
                          {p.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {p.craft} · {p.lga}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
                        <Star className="h-3 w-3 fill-gold text-gold" /> {p.rating}
                      </span>
                    </button>
                  </li>
                ))}
                {filteredPros.length === 0 && (
                  <li className="py-6 text-center text-xs text-muted-foreground">
                    No pros match these filters. Clear the LGA or search.
                  </li>
                )}
              </ul>
            </div>
          </aside>

          {/* Map */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div ref={mapDivRef} className="h-[70vh] min-h-[520px] w-full" />
            {!mapReady && !mapError && (
              <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading Lagos map…
                </div>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-0 grid place-items-center bg-background/90 p-6 text-center">
                <p className="text-sm text-destructive">{mapError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
