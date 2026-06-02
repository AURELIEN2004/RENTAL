// ============================================================
// 📁 src/pages/SearchMapPage.jsx
// Dépendances npm :
//   npm install leaflet react-leaflet leaflet.markercluster
//   npm install @react-leaflet/core
// CSS global (index.css / App.css) :
//   import 'leaflet/dist/leaflet.css';
//   import 'leaflet.markercluster/dist/MarkerCluster.css';
//   import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import './SearchMapPage.css';

// ─── API BASE ────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const LANG = localStorage.getItem('lang') || 'fr';

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-Language': LANG,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── FEATURE META ──────────────────────────────────────────
const FEAT = {
  wifi: { icon: 'fa-wifi', label: 'WiFi' },
  parking: { icon: 'fa-car', label: 'Parking' },
  gardien: { icon: 'fa-shield-halved', label: 'Gardien' },
  climatisation: { icon: 'fa-snowflake', label: 'Climatisation' },
  eau: { icon: 'fa-droplet', label: 'Eau 24h' },
  electricite: { icon: 'fa-bolt', label: 'Électricité' },
  piscine: { icon: 'fa-person-swimming', label: 'Piscine' },
  jardin: { icon: 'fa-leaf', label: 'Jardin' },
  balcon: { icon: 'fa-door-open', label: 'Balcon/Terrasse' },
  cuisine: { icon: 'fa-utensils', label: 'Cuisine équipée' },
  ascenseur: { icon: 'fa-elevator', label: 'Ascenseur' },
  vue: { icon: 'fa-binoculars', label: 'Vue panoramique' },
};

// ─── HAVERSINE ─────────────────────────────────────────────
function haversine(la1, lo1, la2, lo2) {
  const R = 6371, d2r = Math.PI / 180;
  const dLa = (la2 - la1) * d2r, dLo = (lo2 - lo1) * d2r;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * d2r) * Math.cos(la2 * d2r) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── FORMAT PRICE ──────────────────────────────────────────
function fmtPrice(p) {
  return p >= 1_000_000
    ? (p / 1_000_000).toFixed(1) + 'M'
    : Math.round(p / 1000) + 'k';
}

// ════════════════════════════════════════════════════════════
//  MapController — gère markers, clusters, routes
// ════════════════════════════════════════════════════════════
function MapController({ housings, selectedId, onSelectHousing, userLoc, route }) {
  const map = useMap();
  const clusterRef = useRef(null);
  const routeRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Init cluster group once
  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 60,
      iconCreateFunction: (c) =>
        L.divIcon({
          html: `<div class="smp-cluster">${c.getChildCount()}</div>`,
          className: '',
          iconSize: [36, 36],
        }),
    });
    map.addLayer(cluster);
    clusterRef.current = cluster;
    return () => map.removeLayer(cluster);
  }, [map]);

  // Render markers when housings or selectedId change
  useEffect(() => {
    if (!clusterRef.current) return;
    clusterRef.current.clearLayers();

    housings.forEach((h) => {
      if (!h.latitude || !h.longitude) return;
      const isSelected = h.id === selectedId;
      const icon = L.divIcon({
        html: `<div class="smp-marker${isSelected ? ' selected' : ''}" id="mk${h.id}">${fmtPrice(h.price)} FCFA</div>`,
        className: '',
        iconSize: null,
        iconAnchor: [44, 14],
      });
      const marker = L.marker([h.latitude, h.longitude], { icon });
      marker.on('click', () => onSelectHousing(h));
      clusterRef.current.addLayer(marker);
    });
  }, [housings, selectedId, onSelectHousing]);

  // Draw route
  useEffect(() => {
    if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }
    if (!route?.length) return;
    const poly = L.polyline(route, { color: '#F59E0B', weight: 5, opacity: 0.85, dashArray: '10,5' });
    poly.addTo(map);
    routeRef.current = poly;
    map.fitBounds(poly.getBounds(), { padding: [60, 60] });
  }, [route, map]);

  // User location marker
  useEffect(() => {
    if (userMarkerRef.current) { map.removeLayer(userMarkerRef.current); userMarkerRef.current = null; }
    if (!userLoc) return;
    const m = L.marker([userLoc.lat, userLoc.lng], {
      icon: L.divIcon({ html: '<div class="smp-user-dot"></div>', className: '', iconSize: [14, 14] }),
    }).addTo(map).bindTooltip('📍 Vous êtes ici');
    userMarkerRef.current = m;
  }, [userLoc, map]);

  return null;
}

// ════════════════════════════════════════════════════════════
//  HousingCard
// ════════════════════════════════════════════════════════════
function HousingCard({ h, selected, onSelect, onToggleFav, isFav, onToggleCompare, inCompare, userLoc }) {
  const STATUS = { disponible: ['s-dispo', 'Disponible'], reserve: ['s-res', 'Réservé'], occupe: ['s-occ', 'Occupé'] };
  const [scls, slabel] = STATUS[h.status] || STATUS.disponible;
  const dist = userLoc ? haversine(userLoc.lat, userLoc.lng, h.latitude, h.longitude).toFixed(1) : null;

  const mainImg = h.images?.find(i => i.is_main) || h.images?.[0];

  return (
    <div className={`smp-card${selected ? ' selected' : ''}`} onClick={() => onSelect(h)}>
      <div className="smp-card-img">
        {mainImg
          ? <img src={mainImg.image} alt={h.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span className="smp-card-emoji">{h.category === 'Villa' ? '🏡' : h.category === 'Studio' ? '🏠' : h.category === 'Chambre' ? '🛏️' : '🏢'}</span>
        }
        <div className="smp-card-ov" />
        <span className={`smp-status ${scls}`}>{slabel}</span>
        <button className={`smp-fav${isFav ? ' liked' : ''}`} onClick={e => { e.stopPropagation(); onToggleFav(h.id); }} title="Favoris">
          <i className="fas fa-heart" />
        </button>
        <button className={`smp-cmp${inCompare ? ' active' : ''}`} onClick={e => { e.stopPropagation(); onToggleCompare(h); }} title="Comparer">
          <i className="fas fa-scale-balanced" />
        </button>
      </div>
      <div className="smp-card-body">
        <div className="smp-price">{h.price.toLocaleString('fr-FR')} <span>FCFA/mois</span></div>
        <div className="smp-title">{h.title}</div>
        <div className="smp-loc">
          <i className="fas fa-location-dot" />
          {h.district_name || h.district}, {h.city_name || h.city}
          {dist && <span className="smp-dist"> · {dist} km</span>}
        </div>
        <div className="smp-meta">
          <span><i className="fas fa-bed" /> {h.rooms}ch</span>
          <span><i className="fas fa-bath" /> {h.bathrooms}sdb</span>
          <span><i className="fas fa-ruler-combined" /> {h.area}m²</span>
          <span style={{ marginLeft: 'auto' }}><i className="fas fa-eye" /> {h.views_count || 0}</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DetailPanel
// ════════════════════════════════════════════════════════════
function DetailPanel({ housing, onClose, onStartItin, isFav, onToggleFav, inCompare, onToggleCompare }) {
  if (!housing) return null;
  const STATUS = { disponible: ['s-dispo', 'Disponible'], reserve: ['s-res', 'Réservé'], occupe: ['s-occ', 'Occupé'] };
  const [scls, slabel] = STATUS[housing.status] || STATUS.disponible;
  const mainImg = housing.images?.find(i => i.is_main) || housing.images?.[0];
  const initials = housing.owner_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <div className="smp-detail-panel open">
      <div className="smp-dp-head">
        <span className="smp-dp-title"><i className="fas fa-house-chimney" /> Détails</span>
        <button className="smp-close-btn" onClick={onClose}><i className="fas fa-xmark" /></button>
      </div>
      <div className="smp-dp-body">
        {/* Image */}
        <div className="smp-dp-img">
          {mainImg
            ? <img src={mainImg.image} alt={housing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 65 }}>{housing.category === 'Villa' ? '🏡' : '🏢'}</span>
          }
          <div className="smp-dp-img-ov" />
          <div className="smp-dp-price-badge">
            {housing.price.toLocaleString('fr-FR')} FCFA<span>/mois</span>
          </div>
          <span className={`smp-status ${scls}`} style={{ position: 'absolute', top: 12, right: 12 }}>{slabel}</span>
        </div>

        {/* Info */}
        <div className="smp-dp-info">
          <h2 className="smp-dp-h1">{housing.title}</h2>
          <p className="smp-dp-loc"><i className="fas fa-location-dot" /> {housing.district_name}, {housing.city_name}</p>

          <div className="smp-dp-stats">
            {[
              { v: housing.rooms, l: 'Chambre(s)' },
              { v: housing.bathrooms, l: 'Salle(s) de bain' },
              { v: `${housing.area}m²`, l: 'Superficie' },
            ].map(({ v, l }) => (
              <div className="smp-dp-stat" key={l}>
                <div className="smp-dp-stat-v">{v}</div>
                <div className="smp-dp-stat-l">{l}</div>
              </div>
            ))}
          </div>

          <span className="smp-sect-lbl">Équipements</span>
          <div className="smp-feats">
            {(housing.features || []).map(f => (
              <span className="smp-feat-tag" key={f}>
                <i className={`fas ${FEAT[f]?.icon || 'fa-check'}`} />
                {FEAT[f]?.label || f}
              </span>
            ))}
          </div>

          <span className="smp-sect-lbl">Description</span>
          <p className="smp-desc">{housing.description}</p>

          <div className="smp-dp-meta-row">
            <span><i className="fas fa-eye" /> {housing.views_count || 0} vues</span>
            <span><i className="fas fa-heart" style={{ color: 'var(--red)' }} /> {housing.likes_count || 0} likes</span>
            <span style={{ marginLeft: 'auto' }}><i className="fas fa-calendar" /> {housing.created_at?.slice(0, 10)}</span>
          </div>
        </div>

        {/* Owner */}
        <div className="smp-owner-card">
          <div className="smp-owner-av">{initials}</div>
          <div>
            <div className="smp-owner-n">{housing.owner_name}</div>
            <div className="smp-owner-r"><i className="fas fa-phone" /> {housing.owner_phone}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="smp-actions">
          <button className={`smp-act-btn${isFav ? ' active' : ''}`} onClick={() => onToggleFav(housing.id)}>
            <i className="fas fa-heart" style={{ color: 'var(--red)' }} /> {isFav ? 'Retiré' : 'Favoris'}
          </button>
          <button className={`smp-act-btn${inCompare ? ' active' : ''}`} onClick={() => onToggleCompare(housing)}>
            <i className="fas fa-scale-balanced" style={{ color: 'var(--blue)' }} /> Comparer
          </button>
          <button className="smp-act-btn smp-itin-btn" onClick={() => onStartItin(housing)}>
            <i className="fas fa-route" /> Calculer l'itinéraire
          </button>
          <button className="smp-act-btn smp-primary-btn" onClick={() => alert(`Demande de visite pour : ${housing.title}`)}>
            <i className="fas fa-calendar-plus" /> Planifier une visite
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  ItineraryPanel
// ════════════════════════════════════════════════════════════
function ItineraryPanel({ open, status, distance, duration, destination, onClose, transportMode, onSetTransport, progress }) {
  if (!open) return null;
  return (
    <div className="smp-itin-panel">
      <div className="smp-itin-inner">
        <div className="smp-itin-hd">
          <span className="smp-itin-title"><i className="fas fa-route" /> Itinéraire</span>
          <button className="smp-close-btn" onClick={onClose}><i className="fas fa-xmark" /></button>
        </div>
        <div className="smp-trans-modes">
          {[
            { mode: 'driving', icon: 'fa-car', label: 'Voiture' },
            { mode: 'foot', icon: 'fa-person-walking', label: 'Pied' },
            { mode: 'bike', icon: 'fa-bicycle', label: 'Vélo' },
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              className={`smp-trans-btn${transportMode === mode ? ' active' : ''}`}
              onClick={() => onSetTransport(mode)}
            >
              <i className={`fas ${icon}`} /> {label}
            </button>
          ))}
        </div>
        <div className="smp-itin-prog"><div className="smp-itin-prog-fill" style={{ width: `${progress}%` }} /></div>
        {distance && (
          <div className="smp-itin-stats">
            {[
              { ico: 'fa-road', v: distance, l: 'Distance' },
              { ico: 'fa-clock', v: duration, l: 'Durée estimée' },
              { ico: 'fa-location-dot', v: destination, l: 'Destination' },
            ].map(({ ico, v, l }) => (
              <div className="smp-itin-s" key={l}>
                <div className="smp-itin-ico"><i className={`fas ${ico}`} /></div>
                <div><div className="smp-itin-sv">{v}</div><div className="smp-itin-sl">{l}</div></div>
              </div>
            ))}
          </div>
        )}
        <p className="smp-itin-status" dangerouslySetInnerHTML={{ __html: status }} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  CompareModal
// ════════════════════════════════════════════════════════════
function CompareModal({ list, onClose, onRemove }) {
  if (!list.length) return null;
  const rows = [
    { label: 'Prix/mois', fmt: h => h.price.toLocaleString('fr-FR') + ' FCFA', valFn: h => h.price, lowBest: true },
    { label: 'Catégorie', fmt: h => h.category },
    { label: 'Ville · Quartier', fmt: h => `${h.city_name} · ${h.district_name}` },
    { label: 'Chambres', fmt: h => h.rooms + '', valFn: h => h.rooms },
    { label: 'Salles de bain', fmt: h => h.bathrooms + '', valFn: h => h.bathrooms },
    { label: 'Superficie', fmt: h => h.area + 'm²', valFn: h => h.area },
    { label: 'Statut', fmt: h => h.status === 'disponible' ? '✅ Dispo' : h.status === 'reserve' ? '⏳ Réservé' : '❌ Occupé' },
    { label: 'Vues', fmt: h => (h.views_count || 0).toLocaleString(), valFn: h => h.views_count || 0 },
  ];

  return (
    <div className="smp-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="smp-modal-box">
        <div className="smp-modal-head">
          <h2><i className="fas fa-scale-balanced" style={{ color: 'var(--blue)', marginRight: 8 }} />Comparaison</h2>
          <button className="smp-close-btn" onClick={onClose}><i className="fas fa-xmark" /></button>
        </div>
        <div className="smp-cmp-table">
          {/* Header */}
          <div className="smp-cmp-row" style={{ borderBottom: '2px solid var(--sb3)' }}>
            <div className="smp-cmp-lbl" />
            {list.map(h => (
              <div key={h.id} className="smp-cmp-th">
                <div>{h.title}</div>
                <button onClick={() => onRemove(h.id)} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: 12 }}>
                  <i className="fas fa-xmark" /> Retirer
                </button>
              </div>
            ))}
          </div>
          {/* Rows */}
          {rows.map(({ label, fmt, valFn, lowBest }) => {
            let bestIdx = -1;
            if (valFn) {
              const vals = list.map(valFn);
              const best = lowBest ? Math.min(...vals) : Math.max(...vals);
              bestIdx = vals.indexOf(best);
            }
            return (
              <div className="smp-cmp-row" key={label}>
                <div className="smp-cmp-lbl">{label}</div>
                {list.map((h, i) => (
                  <div key={h.id} className={`smp-cmp-val${i === bestIdx ? ' best' : ''}`}>{fmt(h)}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  Toast hook
// ════════════════════════════════════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'inf') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, toast: add };
}

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function SearchMapPage() {
  const { toasts, toast } = useToast();

  // Data
  const [housings, setHousings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [view, setView] = useState('map'); // map | split | list
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedHousing, setSelectedHousing] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // Map
  const [userLoc, setUserLoc] = useState(null);
  const [route, setRoute] = useState(null);

  // Itinerary
  const [itinOpen, setItinOpen] = useState(false);
  const [itinStatus, setItinStatus] = useState('');
  const [itinDist, setItinDist] = useState('');
  const [itinTime, setItinTime] = useState('');
  const [itinDest, setItinDest] = useState('');
  const [itinProgress, setItinProgress] = useState(0);
  const [transportMode, setTransportMode] = useState('driving');

  // Filters
  const [filters, setFilters] = useState({
    search: '', category: '', city: '', status: '', maxPrice: 1000000, rooms: 0,
  });
  const [sort, setSort] = useState('recent');

  // ── Fetch housings from Django API ─────────────────────────
  useEffect(() => {
    setLoading(true);
    apiFetch('/housings/?is_visible=true&page_size=100')
      .then(data => {
        const list = data.results || data;
        setHousings(list);
        setFiltered(list);
      })
      .catch(() => toast('Erreur de chargement des logements', 'err'))
      .finally(() => setLoading(false));
  }, []);

  // ── Apply filters + sort ───────────────────────────────────
  useEffect(() => {
    let result = [...housings];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(h =>
        [h.title, h.description, h.city_name, h.district_name, h.category]
          .some(s => s?.toLowerCase().includes(q))
      );
    }
    if (filters.category) result = result.filter(h => h.category === filters.category);
    if (filters.city) result = result.filter(h => h.city_name === filters.city || h.city === filters.city);
    if (filters.status) result = result.filter(h => h.status === filters.status);
    result = result.filter(h => h.price <= filters.maxPrice);
    if (filters.rooms > 0) result = result.filter(h => h.rooms >= filters.rooms);

    // Sort
    result.sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'popular') return (b.views_count || 0) - (a.views_count || 0);
      if (sort === 'area') return b.area - a.area;
      if (sort === 'distance' && userLoc)
        return haversine(userLoc.lat, userLoc.lng, a.latitude, a.longitude)
             - haversine(userLoc.lat, userLoc.lng, b.latitude, b.longitude);
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setFiltered(result);
  }, [filters, sort, housings, userLoc]);

  // ── Locate user ────────────────────────────────────────────
  const locateMe = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast('📍 Position détectée', 'ok');
      },
      () => toast('Position non accessible', 'err')
    );
  }, [toast]);

  // ── Itinerary ──────────────────────────────────────────────
  const startItinerary = useCallback(async (h) => {
    setItinOpen(true);
    setItinDist('');
    setItinTime('');
    setItinDest('');
    setItinProgress(0);
    setItinStatus('<i class="fas fa-location-crosshairs fa-spin"></i> Détection de votre position…');

    const doCalc = async (loc) => {
      setItinProgress(55);
      setItinStatus('<i class="fas fa-route fa-spin"></i> Calcul de l\'itinéraire…');
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${loc.lng},${loc.lat};${h.longitude},${h.latitude}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.routes?.[0]) {
          const rt = data.routes[0];
          const coords = rt.geometry.coordinates.map(([ln, lt]) => [lt, ln]);
          setRoute(coords);
          const km = (rt.distance / 1000).toFixed(1);
          const mins = Math.round(rt.duration / 60);
          setItinDist(km + ' km');
          setItinTime(mins < 60 ? mins + ' min' : Math.floor(mins / 60) + 'h ' + (mins % 60) + 'min');
          setItinDest(`${h.district_name}, ${h.city_name}`);
          setItinProgress(100);
          setItinStatus(`<i class="fas fa-check-circle" style="color:var(--acc)"></i> Itinéraire calculé vers <b>${h.district_name}, ${h.city_name}</b>`);
        } else throw new Error('no route');
      } catch {
        // Straight line fallback
        setRoute([[loc.lat, loc.lng], [h.latitude, h.longitude]]);
        const d = haversine(loc.lat, loc.lng, h.latitude, h.longitude);
        setItinDist(d.toFixed(1) + ' km (approx.)');
        setItinTime(Math.round((d / 40) * 60) + ' min (approx.)');
        setItinDest(`${h.district_name}, ${h.city_name}`);
        setItinProgress(100);
        setItinStatus('<i class="fas fa-triangle-exclamation" style="color:var(--gold)"></i> Distance à vol d\'oiseau utilisée');
      }
    };

    if (userLoc) { doCalc(userLoc); return; }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setItinProgress(35);
        doCalc(loc);
      },
      () => {
        // Fallback: use center of Yaoundé
        const loc = { lat: 3.848, lng: 11.502 };
        setUserLoc(loc);
        setItinProgress(25);
        setItinStatus('<i class="fas fa-circle-info" style="color:var(--blue)"></i> Position approx. utilisée (accès refusé)');
        doCalc(loc);
      }
    );
  }, [userLoc]);

  const closeItin = () => {
    setItinOpen(false);
    setRoute(null);
    setItinProgress(0);
  };

  // ── Favorites ──────────────────────────────────────────────
  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast('Retiré des favoris', 'inf'); }
      else { next.add(id); toast('❤️ Ajouté aux favoris', 'ok'); }
      return next;
    });
  };

  // ── Compare ────────────────────────────────────────────────
  const toggleCompare = (h) => {
    setCompareList(prev => {
      if (prev.find(x => x.id === h.id)) return prev.filter(x => x.id !== h.id);
      if (prev.length >= 3) { toast('Maximum 3 logements à comparer', 'err'); return prev; }
      toast(`Ajouté à la comparaison: ${h.title}`, 'ok');
      return [...prev, h];
    });
  };

  // ── Filter helpers ─────────────────────────────────────────
  const setFilt = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const resetFilters = () => {
    setFilters({ search: '', category: '', city: '', status: '', maxPrice: 1000000, rooms: 0 });
    toast('Filtres réinitialisés', 'inf');
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    (k === 'maxPrice' && v < 1000000) || (k === 'rooms' && v > 0) || (k !== 'maxPrice' && k !== 'rooms' && v)
  ).length;

  // ── Stats ──────────────────────────────────────────────────
  const avg = filtered.length ? Math.round(filtered.reduce((s, h) => s + h.price, 0) / filtered.length) : 0;
  const min = filtered.length ? Math.min(...filtered.map(h => h.price)) : 0;

  const cities = [...new Set(housings.map(h => h.city_name || h.city).filter(Boolean))];
  const categories = ['Studio', 'Chambre', 'Appartement', 'Maison', 'Villa'];

  // ── Map center ─────────────────────────────────────────────
  const mapCenter = [3.848, 11.502];

  return (
    <div className="smp-layout">
      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside className={`smp-sidebar${view === 'list' ? ' full-w' : ''}`}>
        {/* Logo */}
        <div className="smp-sb-head">
          <div className="smp-logo">
            <div className="smp-logo-mark"><i className="fas fa-house-chimney" /></div>
            <div>
              <div className="smp-logo-name">HabitatCam</div>
              <div className="smp-logo-sub">Trouvez votre logement idéal</div>
            </div>
          </div>

          {/* Search */}
          <div className="smp-search-wrap">
            <i className="fas fa-magnifying-glass smp-search-ico" />
            <input
              className="smp-search-inp"
              placeholder="Bastos, villa, 300k, 3 chambres…"
              value={filters.search}
              onChange={e => setFilt('search', e.target.value)}
            />
            {filters.search && (
              <button className="smp-ico-btn" onClick={() => setFilt('search', '')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                <i className="fas fa-xmark" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="smp-view-toggle">
            {[['map', 'fa-map', 'Carte'], ['split', 'fa-table-columns', 'Mixte'], ['list', 'fa-list', 'Liste']].map(([v, ico, lbl]) => (
              <button key={v} className={`smp-view-btn${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
                <i className={`fas ${ico}`} /> {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="smp-filt-sec">
          <button className="smp-filt-toggle" onClick={() => setFiltersOpen(o => !o)}>
            <span>
              <i className="fas fa-sliders" style={{ marginRight: 7, color: 'var(--acc)' }} />
              Filtres avancés
              {activeFilterCount > 0 && <span className="smp-filt-badge">{activeFilterCount}</span>}
            </span>
            <i className="fas fa-chevron-down" style={{ fontSize: 11, transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
          </button>

          {filtersOpen && (
            <div className="smp-filt-inner">
              {/* Category */}
              <div className="smp-filt-grp">
                <span className="smp-filt-lbl">Catégorie</span>
                <div className="smp-chips">
                  <button className={`smp-chip${!filters.category ? ' active' : ''}`} onClick={() => setFilt('category', '')}>Tout</button>
                  {categories.map(c => (
                    <button key={c} className={`smp-chip${filters.category === c ? ' active' : ''}`} onClick={() => setFilt('category', c)}>{c}</button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div className="smp-filt-grp">
                <span className="smp-filt-lbl">Ville</span>
                <div className="smp-chips">
                  <button className={`smp-chip${!filters.city ? ' active' : ''}`} onClick={() => setFilt('city', '')}>Toutes</button>
                  {cities.map(c => (
                    <button key={c} className={`smp-chip${filters.city === c ? ' active' : ''}`} onClick={() => setFilt('city', c)}>{c}</button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="smp-filt-grp">
                <span className="smp-filt-lbl">
                  Budget max — <b style={{ color: 'var(--gold)' }}>{filters.maxPrice.toLocaleString('fr-FR')} FCFA</b>
                </span>
                <input
                  type="range" min={0} max={1000000} step={10000}
                  value={filters.maxPrice}
                  onChange={e => setFilt('maxPrice', +e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--acc)' }}
                />
              </div>

              {/* Rooms */}
              <div className="smp-filt-grp">
                <span className="smp-filt-lbl">Chambres minimum</span>
                <div className="smp-rooms-row">
                  {[0, 1, 2, 3, 4].map(n => (
                    <button key={n} className={`smp-room-btn${filters.rooms === n ? ' active' : ''}`} onClick={() => setFilt('rooms', n)}>
                      {n === 0 ? 'Tout' : n + '+'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="smp-filt-grp">
                <span className="smp-filt-lbl">Statut</span>
                <div className="smp-chips">
                  {[['', 'Tout'], ['disponible', 'Disponible'], ['reserve', 'Réservé']].map(([v, l]) => (
                    <button key={v} className={`smp-chip${filters.status === v ? ' active' : ''}`} onClick={() => setFilt('status', v)}>{l}</button>
                  ))}
                </div>
              </div>

              <button className="smp-reset-btn" onClick={resetFilters}>
                <i className="fas fa-rotate-left" style={{ marginRight: 6 }} />Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Results header */}
        <div className="smp-res-head">
          <div className="smp-res-count"><b>{filtered.length}</b> logements</div>
          <select className="smp-sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix ↑</option>
            <option value="price_desc">Prix ↓</option>
            <option value="popular">Populaires</option>
            <option value="area">Superficie</option>
            <option value="distance">Proximité</option>
          </select>
        </div>

        {/* Cards */}
        {(view === 'split' || view === 'list') && (
          <div className="smp-cards-list">
            {loading ? (
              <div className="smp-empty"><div className="smp-spinner" /></div>
            ) : !filtered.length ? (
              <div className="smp-empty">
                <i className="fas fa-house-circle-exclamation" />
                <p>Aucun logement trouvé.<br />Essayez d'élargir les filtres.</p>
              </div>
            ) : filtered.map(h => (
              <HousingCard
                key={h.id}
                h={h}
                selected={selectedHousing?.id === h.id}
                onSelect={setSelectedHousing}
                onToggleFav={toggleFav}
                isFav={favorites.has(h.id)}
                onToggleCompare={toggleCompare}
                inCompare={compareList.some(x => x.id === h.id)}
                userLoc={userLoc}
              />
            ))}
          </div>
        )}
      </aside>

      {/* ═══════════════ MAP ═══════════════ */}
      {view !== 'list' && (
        <main className="smp-map-area">
          {/* Stats bar */}
          <div className="smp-map-stats">
            <div><div className="smp-stat-n">{filtered.length}</div><div className="smp-stat-l">logements</div></div>
            <div className="smp-stat-sep" />
            <div><div className="smp-stat-v">{avg.toLocaleString('fr-FR')}</div><div className="smp-stat-l">prix moyen</div></div>
            <div className="smp-stat-sep" />
            <div><div className="smp-stat-v" style={{ color: 'var(--gold)' }}>{min.toLocaleString('fr-FR')}</div><div className="smp-stat-l">min FCFA</div></div>
          </div>

          {/* Map controls */}
          <div className="smp-map-ctrls">
            <button className="smp-mc-btn" title="Ma position" onClick={locateMe}><i className="fas fa-location-crosshairs" /></button>
          </div>

          <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />
            <MapController
              housings={filtered}
              selectedId={selectedHousing?.id}
              onSelectHousing={h => setSelectedHousing(h)}
              userLoc={userLoc}
              route={route}
            />
          </MapContainer>

          {/* Detail panel */}
          {selectedHousing && (
            <DetailPanel
              housing={selectedHousing}
              onClose={() => setSelectedHousing(null)}
              onStartItin={startItinerary}
              isFav={favorites.has(selectedHousing.id)}
              onToggleFav={toggleFav}
              inCompare={compareList.some(x => x.id === selectedHousing.id)}
              onToggleCompare={toggleCompare}
            />
          )}

          {/* Itinerary panel */}
          <ItineraryPanel
            open={itinOpen}
            status={itinStatus}
            distance={itinDist}
            duration={itinTime}
            destination={itinDest}
            onClose={closeItin}
            transportMode={transportMode}
            onSetTransport={setTransportMode}
            progress={itinProgress}
          />

          {/* Compare strip */}
          {compareList.length > 0 && (
            <div className="smp-cmp-strip">
              <i className="fas fa-scale-balanced" style={{ color: 'var(--blue)', flexShrink: 0 }} />
              <div className="smp-cmp-items">
                {compareList.map(h => (
                  <div key={h.id} className="smp-cmp-item">
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{h.title}</span>
                    <button onClick={() => toggleCompare(h)}><i className="fas fa-xmark" /></button>
                  </div>
                ))}
              </div>
              <button className="smp-cmp-launch-btn" onClick={() => setShowCompare(true)}>
                <i className="fas fa-chart-bar" style={{ marginRight: 5 }} />Comparer
              </button>
            </div>
          )}
        </main>
      )}

      {/* Compare modal */}
      {showCompare && (
        <CompareModal
          list={compareList}
          onClose={() => setShowCompare(false)}
          onRemove={id => setCompareList(p => p.filter(x => x.id !== id))}
        />
      )}

      {/* Toasts */}
      <div className="smp-toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`smp-toast ${t.type}`}>
            <i className={`fas ${t.type === 'ok' ? 'fa-circle-check' : t.type === 'err' ? 'fa-circle-exclamation' : 'fa-circle-info'}`}
              style={{ color: t.type === 'ok' ? 'var(--acc)' : t.type === 'err' ? 'var(--red)' : 'var(--blue)', flexShrink: 0 }} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
