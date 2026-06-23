// lib/screens/search/search_map_screen.dart
// ============================================================
// Écran de recherche avec carte interactive.
//
// Fonctionnalités :
//   ✅ Carte flutter_map (OpenStreetMap, gratuit)
//   ✅ Markers prix personnalisés avec couleur statut
//   ✅ Recherche NLP (texte libre en FR/EN)
//   ✅ Recherche vocale (speech_to_text)
//   ✅ Géolocalisation "Autour de moi"
//   ✅ Itinéraire OSRM (voiture/pied/vélo)
//   ✅ Panel aperçu logement (slide from bottom)
//   ✅ Barre de stats (nb, prix moyen, minimum)
//   ✅ Vue Liste / Carte
//   ✅ Dark / Light mode
//   ✅ Navigation vers HousingDetailScreen
// ============================================================

import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http/http.dart' as http;

import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';
import '../../widgets/housing/housing_card.dart';
import '../../widgets/housing/housing_map_marker.dart';
import '../housing/housing_detail_screen.dart';
import '../../widgets/common/map_search_button.dart';
import 'package:housing_app/data/services/housing_service.dart'; // Ajustez le chemin si nécessaire

// ─── OSRM transport profiles ─────────────────────────────────
enum _TransportMode { driving, walking, cycling }

extension _TransportExt on _TransportMode {
  String get osrmProfile {
    switch (this) {
      case _TransportMode.driving:  return 'driving';
      case _TransportMode.walking:  return 'foot';
      case _TransportMode.cycling:  return 'bike';
    }
  }

  IconData get icon {
    switch (this) {
      case _TransportMode.driving:  return Icons.directions_car_rounded;
      case _TransportMode.walking:  return Icons.directions_walk_rounded;
      case _TransportMode.cycling:  return Icons.directions_bike_rounded;
    }
  }

  String label(AppL10n l10n) {
    switch (this) {
      case _TransportMode.driving:  return l10n.drivingMode;
      case _TransportMode.walking:  return l10n.walkingMode;
      case _TransportMode.cycling:  return l10n.cyclingMode;
    }
  }
}

// ─── View mode ───────────────────────────────────────────────
enum _ViewMode { map, list }

// ═════════════════════════════════════════════════════════════
class SearchMapScreen extends StatefulWidget {
  const SearchMapScreen({super.key});

  @override
  State<SearchMapScreen> createState() => _SearchMapScreenState();
}

class _SearchMapScreenState extends State<SearchMapScreen>
    with TickerProviderStateMixin {

  // ── Services ──────────────────────────────────────────────
  final _api       = ApiService();
  final _mapCtrl   = MapController();
  final _searchCtrl= TextEditingController();
  final _speech    = stt.SpeechToText();

  // ── Data ──────────────────────────────────────────────────
  List<HousingModel> _housings = [];
  HousingModel? _selected;

  // ── Map state ─────────────────────────────────────────────
  LatLng? _userLatLng;
  List<LatLng> _routePoints = [];
  String?  _itinDist;
  String?  _itinTime;
  _TransportMode _transport = _TransportMode.driving;

  // ── UI state ──────────────────────────────────────────────
  bool       _loading       = false;
  bool       _voiceActive   = false;
  bool       _voiceInit     = false;
  bool       _showFilters   = false;
  bool       _itinLoading   = false;
  _ViewMode  _viewMode      = _ViewMode.map;
  String     _sortBy        = 'recent';

  // ── Language ──────────────────────────────────────────────
  late ThemeProvider _themeProvider;
  String _lang = 'fr';

  // ── Animation ─────────────────────────────────────────────
  late AnimationController _panelCtrl;
  late Animation<double>   _panelAnim;
  late AnimationController _searchCtrlAnim;

  // ── Cluster / group markers (simple grouping) ─────────────
  static const double _clusterRadius = 60.0; // pixels
  final List<_MarkerGroup> _groups = [];

  // ── Initial map center (Yaoundé) ──────────────────────────
  static const LatLng _defaultCenter = LatLng(3.848, 11.502);

  @override
  void initState() {
    super.initState();

    // Animations
    _panelCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _panelAnim = CurvedAnimation(
      parent: _panelCtrl,
      curve:  Curves.easeOutCubic,
    );

    _searchCtrlAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    // Load data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _themeProvider = context.read<ThemeProvider>();
      _lang = _themeProvider.language;
      _themeProvider.addListener(_onLangChange);
      _initVoice();
      _load();
    });
  }

  @override
  void dispose() {
    _themeProvider.removeListener(_onLangChange);
    _panelCtrl.dispose();
    _searchCtrlAnim.dispose();
    _searchCtrl.dispose();
    _mapCtrl.dispose();
    _speech.stop();
    super.dispose();
  }

  void _onLangChange() {
    final newLang = _themeProvider.language;
    if (newLang != _lang && mounted) {
      setState(() => _lang = newLang);
      _load();
    }
  }

  // ── Voice init ────────────────────────────────────────────
  Future<void> _initVoice() async {
    _voiceInit = await _speech.initialize(
      onError:  (_) => setState(() => _voiceActive = false),
      onStatus: (s) {
        if (s == 'done' || s == 'notListening') {
          setState(() => _voiceActive = false);
        }
      },
    );
  }

  // ── Load housings ─────────────────────────────────────────
  Future<void> _load() async {
    if (!mounted) return;
    setState(() { _loading = true; });
    try {
      final list = await _api.getHousings(
        filters: {'status': 'disponible', 'ordering': _sortOrder()},
      );
      if (mounted) {
        setState(() {
          _housings = list;
          _loading  = false;
        });
        _buildGroups();
      }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── NLP search ────────────────────────────────────────────
  Future<void> _doNlpSearch(String query) async {
    if (query.trim().isEmpty) { _load(); return; }
    if (!mounted) return;
    setState(() { _loading = true; });
   try {
  // Remplacer l'appel _api.nlpSearch par celui du service configuré
  final res = await _housingService.nlpSearch(
    query:     query.trim(),
    language:  _lang,
    latitude:  _userLatLng?.latitude,  // 👈 Paramètre mis à jour
    longitude: _userLatLng?.longitude, // 👈 Paramètre mis à jour
  );
      final results = (res['results'] as List? ?? [])
          .map((j) => HousingModel.fromJson(j as Map<String, dynamic>))
          .toList();
      if (mounted) {
        setState(() {
          _housings = results;
          _loading  = false;
        });
        _buildGroups();
        // Fit map to results
        if (results.any((h) => h.hasCoords)) _fitToHousings(results);
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Géolocalisation ───────────────────────────────────────
  Future<void> _locateMe() async {
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.deniedForever) {
        _showSnack(context.l10n.locationDenied, isError: true);
        return;
      }

      // final pos = await Geolocator.getCurrentPosition(
      //   locationSettings: const LocationSettings(
      //     accuracy: LocationAccuracy.high,
      //     timeLimit: Duration(seconds: 10),
      //   ),
      // );
      final pos = await Geolocator.getCurrentPosition(
  desiredAccuracy: LocationAccuracy.high,
  timeLimit: const Duration(seconds: 10),
);

      if (!mounted) return;
      final ll = LatLng(pos.latitude, pos.longitude);
      setState(() => _userLatLng = ll);

      _mapCtrl.move(ll, 14);
      _showSnack(context.l10n.locationDetected);

      // Re-sort by distance
      setState(() {
        _housings.sort((a, b) {
          if (!a.hasCoords || !b.hasCoords) return 0;
          final dA = _haversine(ll, LatLng(a.latitude!, a.longitude!));
          final dB = _haversine(ll, LatLng(b.latitude!, b.longitude!));
          return dA.compareTo(dB);
        });
      });
    } catch (e) {
      if (mounted) _showSnack(context.l10n.locationError, isError: true);
    }
  }

  // ── Itinéraire OSRM ──────────────────────────────────────
  Future<void> _calcItinerary(HousingModel h) async {
    if (!h.hasCoords) return;

    if (_userLatLng == null) {
      await _locateMe();
      if (_userLatLng == null) return;
    }

    setState(() {
      _itinLoading = true;
      _routePoints = [];
      _itinDist    = null;
      _itinTime    = null;
    });

    final start = _userLatLng!;
    final end   = LatLng(h.latitude!, h.longitude!);

    try {
      final url = 'https://router.project-osrm.org/route/v1/'
          '${_transport.osrmProfile}/'
          '${start.longitude},${start.latitude};'
          '${end.longitude},${end.latitude}'
          '?overview=full&geometries=geojson';

      final resp = await http.get(Uri.parse(url))
          .timeout(const Duration(seconds: 15));

      if (resp.statusCode == 200) {
        final data  = json.decode(resp.body);
        final route = data['routes'][0];
        final coords = (route['geometry']['coordinates'] as List)
            .map((c) => LatLng(
                  (c[1] as num).toDouble(),
                  (c[0] as num).toDouble(),
                ))
            .toList();

        final distKm = (route['distance'] as num) / 1000;
        final timeSec= (route['duration'] as num).toInt();
        final mins   = timeSec ~/ 60;

        if (mounted) {
          setState(() {
            _routePoints = coords;
            _itinDist    = '${distKm.toStringAsFixed(1)} km';
            _itinTime    = mins < 60
                ? '$mins min'
                : '${mins ~/ 60}h ${mins % 60}min';
            _itinLoading = false;
          });
          _fitToRoute();
        }
      } else {
        _fallbackRoute(start, end);
      }
    } catch (_) {
      _fallbackRoute(start, end);
    }
  }

  void _fallbackRoute(LatLng start, LatLng end) {
    final distKm = _haversine(start, end);
    final mins   = (distKm / (_transport == _TransportMode.walking ? 5 : 40) * 60).round();
    setState(() {
      _routePoints = [start, end];
      _itinDist    = '${distKm.toStringAsFixed(1)} km';
      _itinTime    = mins < 60 ? '$mins min' : '${mins ~/ 60}h ${mins % 60}min';
      _itinLoading = false;
    });
    _fitToRoute();
  }

  void _fitToRoute() {
    if (_routePoints.isEmpty) return;
    try {
      _mapCtrl.fitCamera(
        CameraFit.bounds(
          bounds:  LatLngBounds.fromPoints(_routePoints),
          padding: const EdgeInsets.fromLTRB(60, 120, 60, 300),
        ),
      );
    } catch (_) {}
  }

  void _fitToHousings(List<HousingModel> list) {
    final pts = list
        .where((h) => h.hasCoords)
        .map((h) => LatLng(h.latitude!, h.longitude!))
        .toList();
    if (pts.isEmpty) return;
    try {
      _mapCtrl.fitCamera(
        CameraFit.bounds(
          bounds:  LatLngBounds.fromPoints(pts),
          padding: const EdgeInsets.all(80),
        ),
      );
    } catch (_) {}
  }

  // ── Voice search ─────────────────────────────────────────
  Future<void> _toggleVoice() async {
    if (!_voiceInit) {
      _showSnack(context.l10n.voiceNotAvailable, isError: true);
      return;
    }
    if (_voiceActive) {
      await _speech.stop();
      setState(() => _voiceActive = false);
    } else {
      setState(() => _voiceActive = true);
      await _speech.listen(
        localeId:  _lang == 'fr' ? 'fr_FR' : 'en_US',
        onResult:  (r) {
          if (r.finalResult) {
            final text = r.recognizedWords;
            _searchCtrl.text = text;
            _doNlpSearch(text);
            setState(() => _voiceActive = false);
          }
        },
      );
    }
  }

  // ── Select / deselect housing ────────────────────────────
  void _selectHousing(HousingModel h) {
    setState(() => _selected = h);
    _panelCtrl.forward();
    // Center map slightly above (to account for panel)
    if (h.hasCoords) {
      _mapCtrl.move(
        LatLng(h.latitude! - 0.005, h.longitude!),
        math.max(_mapCtrl.camera.zoom, 14),
      );
    }
  }

  void _deselect() {
    _panelCtrl.reverse().then((_) {
      if (mounted) setState(() => _selected = null);
    });
  }

  void _clearRoute() {
    setState(() {
      _routePoints = [];
      _itinDist    = null;
      _itinTime    = null;
    });
  }

  // ── Simple grouping for clusters ─────────────────────────
  void _buildGroups() {
    // Simple approach: just use markers directly (no visual cluster)
    // for production, use flutter_map_marker_cluster package
    _groups.clear();
    for (final h in _housings) {
      if (h.hasCoords) {
        _groups.add(_MarkerGroup(
          housing: h,
          point:   LatLng(h.latitude!, h.longitude!),
          count:   1,
        ));
      }
    }
  }

  // ── Haversine ────────────────────────────────────────────
  double _haversine(LatLng a, LatLng b) {
    const R = 6371.0;
    final dLat = _deg2rad(b.latitude  - a.latitude);
    final dLng = _deg2rad(b.longitude - a.longitude);
    final x = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_deg2rad(a.latitude)) *
            math.cos(_deg2rad(b.latitude)) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);
    return R * 2 * math.atan2(math.sqrt(x), math.sqrt(1 - x));
  }

  double _deg2rad(double d) => d * math.pi / 180;

  String _sortOrder() {
    switch (_sortBy) {
      case 'price_asc':  return 'price';
      case 'price_desc': return '-price';
      case 'popular':    return '-views_count';
      default:           return '-created_at';
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content:          Text(msg),
      backgroundColor:  isError ? AppColors.danger : AppColors.success,
      behavior:         SnackBarBehavior.floating,
      duration:         const Duration(seconds: 2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  // ═══════════════════════════════════════════════════════
  // BUILD
  // ═══════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final l10n   = context.l10n;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark
          ? SystemUiOverlayStyle.light
          : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
        body: Stack(
          children: [
            // ── 1. Carte (plein écran) ─────────────────────
            if (_viewMode == _ViewMode.map)
              _buildMap(isDark, l10n),

            // ── 2. Vue Liste ───────────────────────────────
            if (_viewMode == _ViewMode.list)
              _buildListView(isDark, l10n),

            // ── 3. Overlay top (search + controls) ─────────
            _buildTopOverlay(isDark, l10n),

            // ── 4. Barre stats (sous search bar) ───────────
            if (_viewMode == _ViewMode.map)
              _buildStatsBar(isDark, l10n),

            // ── 5. Boutons contrôle carte (droite) ─────────
            if (_viewMode == _ViewMode.map)
              _buildMapControls(isDark, l10n),

            // ── 6. Info itinéraire ─────────────────────────
            if (_itinDist != null)
              _buildItinInfoBar(isDark, l10n),

            // ── 7. Panel logement sélectionné ──────────────
            _buildSelectedPanel(isDark, l10n),

            // ── 8. Loading overlay ─────────────────────────
            if (_loading)
              _buildLoadingOverlay(isDark),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // 1. CARTE
  // ─────────────────────────────────────────────────────────
  Widget _buildMap(bool isDark, AppL10n l10n) {
    final withCoords = _housings.where((h) => h.hasCoords).toList();

    return FlutterMap(
      mapController: _mapCtrl,
      options: MapOptions(
        initialCenter: _userLatLng ?? _defaultCenter,
        initialZoom:   13,
        minZoom:       5,
        maxZoom:       18,
        interactionOptions: const InteractionOptions(
          flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
        ),
        onTap: (_, __) {
          if (_selected != null) _deselect();
        },
      ),
      children: [
        // ── Tuiles CartoDB Positron (clair) / Dark Matter (sombre) ──
        TileLayer(
          urlTemplate: isDark
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          subdomains:  const ['a', 'b', 'c', 'd'],
          userAgentPackageName: 'com.habitatcam.app',
          retinaMode:  true,
        ),

        // ── Trace itinéraire ────────────────────────────────────────
        if (_routePoints.isNotEmpty)
          PolylineLayer(
            polylines: [
              Polyline(
                points:      _routePoints,
                color:       AppColors.warning,
                strokeWidth: 5,
              ),
              // Bordure blanche (effet premium)
              Polyline(
                points:      _routePoints,
                color:       Colors.white.withOpacity(0.35),
                strokeWidth: 8,
              ),
              Polyline(
                points:      _routePoints,
                color:       AppColors.warning,
                strokeWidth: 4,
              ),
            ],
          ),

        // ── Position utilisateur (pulse) ────────────────────────────
        if (_userLatLng != null) ...[
          CircleLayer(
            circles: [
              CircleMarker(
                point:       _userLatLng!,
                radius:      22,
                color:       AppColors.primary.withOpacity(0.18),
                borderColor: AppColors.primary.withOpacity(0.6),
                borderStrokeWidth: 2,
                useRadiusInMeter: false,
              ),
              CircleMarker(
                point:            _userLatLng!,
                radius:           8,
                color:            AppColors.primary,
                borderColor:      Colors.white,
                borderStrokeWidth: 2.5,
                useRadiusInMeter: false,
              ),
            ],
          ),
        ],

        // ── Markers logements ───────────────────────────────────────
        MarkerLayer(
          markers: withCoords.map((h) {
            final isSel = _selected?.id == h.id;
            return Marker(
              point:  LatLng(h.latitude!, h.longitude!),
              width:  isSel ? 100 : 88,
              height: isSel ? 52  : 44,
              alignment: Alignment.bottomCenter,
              child: GestureDetector(
                onTap: () => _selectHousing(h),
                child: HousingMapMarker(
                  housing:    h,
                  isSelected: isSel,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────────────────
  // 2. VUE LISTE
  // ─────────────────────────────────────────────────────────
  Widget _buildListView(bool isDark, AppL10n l10n) {
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    return Container(
      color: bg,
      padding: const EdgeInsets.only(top: 130),
      child: _housings.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.search_off_rounded, size: 64,
                      color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
                  const SizedBox(height: 12),
                  Text(l10n.noHousing,
                      style: TextStyle(
                        color: isDark ? AppColors.textDark : AppColors.textLight,
                        fontSize: 15,
                      )),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              itemCount: _housings.length,
              itemBuilder: (_, i) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: HousingCard(housing: _housings[i]),
              ),
            ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // 3. TOP OVERLAY (Search + toggles)
  // ─────────────────────────────────────────────────────────
  Widget _buildTopOverlay(bool isDark, AppL10n l10n) {
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildSearchBar(isDark, l10n),
          _buildViewAndSortRow(isDark, l10n),
        ],
      ),
    );
  }

  Widget _buildSearchBar(bool isDark, AppL10n l10n) {
    final cardBg = isDark ? AppColors.surfaceDark : Colors.white;
    final border = isDark ? AppColors.borderDark  : AppColors.borderLight;
    final hint   = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;
    final text   = isDark ? AppColors.textDark : AppColors.textLight;

    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          color:        cardBg,
          borderRadius: BorderRadius.circular(16),
          border:       Border.all(color: border),
          boxShadow: [
            BoxShadow(
              color:     Colors.black.withOpacity(isDark ? 0.4 : 0.1),
              blurRadius: 16,
              offset:    const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Back button
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                width: 52, height: 52,
                alignment: Alignment.center,
                child: Icon(Icons.arrow_back_ios_rounded,
                    size: 18, color: text),
              ),
            ),

            // Search input
            Expanded(
              child: TextField(
                controller: _searchCtrl,
                style: TextStyle(color: text, fontSize: 14),
                decoration: InputDecoration(
                  hintText:  l10n.searchHint,
                  hintStyle: TextStyle(color: hint, fontSize: 14),
                  border:    InputBorder.none,
                  isDense:   true,
                  contentPadding: EdgeInsets.zero,
                ),
                onSubmitted: _doNlpSearch,
                textInputAction: TextInputAction.search,
              ),
            ),

            // Voice button
            GestureDetector(
              onTap: _toggleVoice,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 40, height: 40,
                margin: const EdgeInsets.only(right: 4),
                decoration: BoxDecoration(
                  color:  _voiceActive
                      ? AppColors.danger.withOpacity(0.15)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _voiceActive ? Icons.mic_rounded : Icons.mic_none_rounded,
                  color:  _voiceActive ? AppColors.danger : hint,
                  size:   20,
                ),
              ),
            ),

            // Clear / Search button
            if (_searchCtrl.text.isNotEmpty)
              GestureDetector(
                onTap: () {
                  _searchCtrl.clear();
                  _load();
                },
                child: Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: Icon(Icons.close_rounded, size: 18, color: hint),
                ),
              ),

            // Search button
            GestureDetector(
              onTap: () => _doNlpSearch(_searchCtrl.text),
              child: Container(
                width: 44, height: 44,
                margin: const EdgeInsets.only(right: 4),
                decoration: BoxDecoration(
                  color:        AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.search_rounded,
                    color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildViewAndSortRow(bool isDark, AppL10n l10n) {
    final bg     = isDark ? AppColors.surfaceDark.withOpacity(0.92) : Colors.white.withOpacity(0.92);
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final text   = isDark ? AppColors.textDark   : AppColors.textLight;
    final sub    = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          // ── View toggle ─────────────────────────────────
          Container(
            decoration: BoxDecoration(
              color:        bg,
              borderRadius: BorderRadius.circular(12),
              border:       Border.all(color: border),
              boxShadow: [
                BoxShadow(
                  color:     Colors.black.withOpacity(isDark ? 0.3 : 0.06),
                  blurRadius: 8,
                  offset:    const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _viewToggleBtn(
                  icon:    Icons.map_rounded,
                  label:   l10n.mapView,
                  mode:    _ViewMode.map,
                  isDark:  isDark,
                ),
                _viewToggleBtn(
                  icon:    Icons.view_list_rounded,
                  label:   l10n.listView,
                  mode:    _ViewMode.list,
                  isDark:  isDark,
                ),
              ],
            ),
          ),

          const Spacer(),

          // ── Sort / Near Me buttons ──────────────────────
          Row(
            children: [
              // Near Me
              _actionChip(
                icon:   Icons.my_location_rounded,
                label:  l10n.nearMe,
                color:  AppColors.info,
                bg:     bg,
                border: border,
                onTap:  _locateMe,
              ),
              const SizedBox(width: 6),
              // Sort
              _actionChip(
                icon:   Icons.sort_rounded,
                label:  _sortLabel(l10n),
                color:  text,
                bg:     bg,
                border: border,
                onTap:  () => _showSortSheet(isDark, l10n),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _viewToggleBtn({
    required IconData icon,
    required String   label,
    required _ViewMode mode,
    required bool     isDark,
  }) {
    final sel = _viewMode == mode;
    return GestureDetector(
      onTap: () => setState(() => _viewMode = mode),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding:  const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color:        sel ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size:  16,
                color: sel
                    ? Colors.white
                    : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                color:      sel ? Colors.white : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                fontSize:   12,
                fontWeight: sel ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _actionChip({
    required IconData icon,
    required String   label,
    required Color    color,
    required Color    bg,
    required Color    border,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color:        bg,
          borderRadius: BorderRadius.circular(12),
          border:       Border.all(color: border),
          boxShadow: [
            BoxShadow(
              color:     Colors.black.withOpacity(0.06),
              blurRadius: 6,
              offset:    const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 5),
            Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // 4. BARRE DE STATS
  // ─────────────────────────────────────────────────────────
  Widget _buildStatsBar(bool isDark, AppL10n l10n) {
    final withCoords = _housings.where((h) => h.hasCoords).toList();
    final count = withCoords.length;
    final avg   = count > 0
        ? (withCoords.map((h) => h.price).reduce((a, b) => a + b) / count).round()
        : 0;
    final min   = count > 0
        ? withCoords.map((h) => h.price).reduce(math.min)
        : 0;

    return Positioned(
      top:  126,
      left: 12,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color:        isDark
              ? AppColors.surfaceDark.withOpacity(0.92)
              : Colors.white.withOpacity(0.92),
          borderRadius: BorderRadius.circular(12),
          border:       Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color:     Colors.black.withOpacity(isDark ? 0.35 : 0.1),
              blurRadius: 12,
              offset:    const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _statItem('$count', l10n.onMap, AppColors.primary),
            _statDivider(isDark),
            _statItem(_fmtPrice(avg), l10n.avgPrice,
                isDark ? AppColors.textDark : AppColors.textLight),
            _statDivider(isDark),
            _statItem(_fmtPrice(min), l10n.fromPrice, AppColors.warning),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String val, String label, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(val,
            style: TextStyle(
                color: color, fontSize: 13, fontWeight: FontWeight.bold)),
        Text(label,
            style: const TextStyle(
                color: AppColors.textMutedDark, fontSize: 9)),
      ],
    );
  }

  Widget _statDivider(bool isDark) => Container(
    width: 1, height: 28,
    margin: const EdgeInsets.symmetric(horizontal: 10),
    color: isDark ? AppColors.borderDark : AppColors.borderLight,
  );

  // ─────────────────────────────────────────────────────────
  // 5. CONTRÔLES CARTE
  // ─────────────────────────────────────────────────────────
  Widget _buildMapControls(bool isDark, AppL10n l10n) {
    final bg     = isDark ? AppColors.surfaceDark : Colors.white;
    final border = isDark ? AppColors.borderDark  : AppColors.borderLight;

    // Move controls up when panel is visible
    final bottomPad = _selected != null ? 340.0 : 24.0;

    return AnimatedPositioned(
      duration: const Duration(milliseconds: 300),
      curve:    Curves.easeInOut,
      right:    12,
      bottom:   bottomPad,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Locate me
          _mapCtrlBtn(
            icon:   Icons.my_location_rounded,
            color:  AppColors.info,
            bg:     bg,
            border: border,
            onTap:  _locateMe,
            isDark: isDark,
          ),
          const SizedBox(height: 8),
          // Zoom in
          _mapCtrlBtn(
            icon:   Icons.add_rounded,
            color:  isDark ? AppColors.textDark : AppColors.textLight,
            bg:     bg,
            border: border,
            onTap:  () => _mapCtrl.move(
              _mapCtrl.camera.center,
              _mapCtrl.camera.zoom + 1,
            ),
            isDark: isDark,
          ),
          const SizedBox(height: 4),
          // Zoom out
          _mapCtrlBtn(
            icon:   Icons.remove_rounded,
            color:  isDark ? AppColors.textDark : AppColors.textLight,
            bg:     bg,
            border: border,
            onTap:  () => _mapCtrl.move(
              _mapCtrl.camera.center,
              _mapCtrl.camera.zoom - 1,
            ),
            isDark: isDark,
          ),
          if (_routePoints.isNotEmpty) ...[
            const SizedBox(height: 8),
            _mapCtrlBtn(
              icon:   Icons.route_rounded,
              color:  AppColors.warning,
              bg:     AppColors.warning.withOpacity(0.15),
              border: AppColors.warning.withOpacity(0.4),
              onTap:  _clearRoute,
              isDark: isDark,
              tooltip: l10n.clearRoute,
            ),
          ],
        ],
      ),
    );
  }

  Widget _mapCtrlBtn({
    required IconData icon,
    required Color    color,
    required Color    bg,
    required Color    border,
    required VoidCallback onTap,
    required bool     isDark,
    String?           tooltip,
  }) {
    return Tooltip(
      message: tooltip ?? '',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 42, height: 42,
          decoration: BoxDecoration(
            color:        bg,
            borderRadius: BorderRadius.circular(12),
            border:       Border.all(color: border),
            boxShadow: [
              BoxShadow(
                color:     Colors.black.withOpacity(isDark ? 0.35 : 0.1),
                blurRadius: 8,
                offset:    const Offset(0, 3),
              ),
            ],
          ),
          child: Icon(icon, color: color, size: 20),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // 6. BARRE INFO ITINÉRAIRE
  // ─────────────────────────────────────────────────────────
  Widget _buildItinInfoBar(bool isDark, AppL10n l10n) {
    final panelH = _selected != null ? 340.0 : 24.0;

    return AnimatedPositioned(
      duration: const Duration(milliseconds: 300),
      curve:    Curves.easeInOut,
      bottom:   panelH,
      left:     12,
      right:    60,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color:        AppColors.warning,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color:     AppColors.warning.withOpacity(0.45),
              blurRadius: 12,
              offset:    const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(_transport.icon, color: Colors.white, size: 18),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize:       MainAxisSize.min,
              children: [
                Text(
                  '${_itinDist ?? '—'}  •  ${_itinTime ?? '—'}',
                  style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(l10n.itinToDestination,
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.8), fontSize: 11)),
              ],
            ),
            const Spacer(),
            GestureDetector(
              onTap: _clearRoute,
              child: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color:        Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.close_rounded,
                    color: Colors.white, size: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // 7. PANEL LOGEMENT SÉLECTIONNÉ
  // ─────────────────────────────────────────────────────────
  Widget _buildSelectedPanel(bool isDark, AppL10n l10n) {
    return AnimatedBuilder(
      animation: _panelAnim,
      builder: (_, child) {
        final offset = 1.0 - _panelAnim.value;
        return Transform.translate(
          offset: Offset(0, 320 * offset),
          child:  child,
        );
      },
      child: Align(
        alignment: Alignment.bottomCenter,
        child:     _selected == null
            ? const SizedBox.shrink()
            : _buildPanelContent(isDark, l10n),
      ),
    );
  }

  Widget _buildPanelContent(bool isDark, AppL10n l10n) {
    final h      = _selected!;
    final bg     = isDark ? AppColors.surfaceDark : Colors.white;
    final border = isDark ? AppColors.borderDark  : AppColors.borderLight;
    final text   = isDark ? AppColors.textDark    : AppColors.textLight;
    final sub    = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      decoration: BoxDecoration(
        color:        bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border:       Border(top: BorderSide(color: border)),
        boxShadow: [
          BoxShadow(
            color:     Colors.black.withOpacity(isDark ? 0.5 : 0.15),
            blurRadius: 24,
            offset:    const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Center(
            child: Container(
              width:  40, height: 4,
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              decoration: BoxDecoration(
                color:        isDark ? AppColors.borderDark : AppColors.borderLight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // ── Header panel ────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Row(
              children: [
                Icon(Icons.location_on_rounded,
                    size: 16, color: AppColors.primary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    h.displayName,
                    style: TextStyle(
                      color:      text,
                      fontWeight: FontWeight.bold,
                      fontSize:   15,
                    ),
                    maxLines:  1,
                    overflow:  TextOverflow.ellipsis,
                  ),
                ),
                // Close
                GestureDetector(
                  onTap: _deselect,
                  child: Container(
                    width: 30, height: 30,
                    decoration: BoxDecoration(
                      color:        isDark ? AppColors.cardDark : AppColors.bgLight,
                      borderRadius: BorderRadius.circular(8),
                      border:       Border.all(color: border),
                    ),
                    child: Icon(Icons.close_rounded,
                        size: 16, color: sub),
                  ),
                ),
              ],
            ),
          ),

          // ── Preview card ────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => HousingDetailScreen(housingId: h.id),
                ),
              ),
              child: _HousingPreviewCard(housing: h, isDark: isDark, l10n: l10n),
            ),
          ),

          // ── Actions ─────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 16),
            child: Row(
              children: [
                // Transport mode
                ..._TransportMode.values.map((m) => Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: GestureDetector(
                    onTap: () => setState(() => _transport = m),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 7),
                      decoration: BoxDecoration(
                        color:        _transport == m
                            ? AppColors.warning.withOpacity(0.15)
                            : (isDark ? AppColors.cardDark : AppColors.bgLight),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: _transport == m
                              ? AppColors.warning
                              : border,
                        ),
                      ),
                      child: Icon(
                        m.icon,
                        size:  16,
                        color: _transport == m ? AppColors.warning : sub,
                      ),
                    ),
                  ),
                )),

                const Spacer(),

                // Itinerary button
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _itinLoading
                        ? null
                        : () => _calcItinerary(h),
                    icon: _itinLoading
                        ? const SizedBox(
                            width: 14, height: 14,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.route_rounded, size: 16),
                    label: Text(
                      _itinDist != null ? l10n.recalculate : l10n.calcRoute,
                      style: const TextStyle(fontSize: 12),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.warning,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Visit button
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => HousingDetailScreen(housingId: h.id),
                      ),
                    ),
                    icon:  const Icon(Icons.calendar_today_rounded, size: 16),
                    label: Text(l10n.planVisit,
                        style: const TextStyle(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Safe area bottom padding
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // 8. LOADING OVERLAY
  // ─────────────────────────────────────────────────────────
  Widget _buildLoadingOverlay(bool isDark) {
    return Positioned(
      top: 130, left: 0, right: 0,
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color:        isDark ? AppColors.surfaceDark : Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color:     Colors.black.withOpacity(0.2),
                blurRadius: 12,
              ),
            ],
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 18, height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color:       AppColors.primary,
                ),
              ),
              SizedBox(width: 12),
              Text('Recherche…',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────
  // SORT SHEET
  // ─────────────────────────────────────────────────────────
  void _showSortSheet(bool isDark, AppL10n l10n) {
    showModalBottomSheet(
      context:         context,
      backgroundColor: isDark ? AppColors.surfaceDark : Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.sortBy,
                style: TextStyle(
                  color: isDark ? AppColors.textDark : AppColors.textLight,
                  fontSize: 16, fontWeight: FontWeight.bold,
                )),
            const SizedBox(height: 12),
            for (final (val, lbl) in [
              ('recent',     l10n.sortRecent),
              ('price_asc',  l10n.sortPriceAsc),
              ('price_desc', l10n.sortPriceDesc),
              ('popular',    l10n.sortPopular),
            ])
              ListTile(
                title: Text(lbl,
                    style: TextStyle(
                      color: isDark ? AppColors.textDark : AppColors.textLight,
                      fontWeight: _sortBy == val
                          ? FontWeight.w600 : FontWeight.normal,
                    )),
                trailing: _sortBy == val
                    ? const Icon(Icons.check_rounded, color: AppColors.primary)
                    : null,
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _sortBy = val);
                  _load();
                },
              ),
          ],
        ),
      ),
    );
  }

  // ── Helpers ──────────────────────────────────────────────
  String _sortLabel(AppL10n l10n) {
    switch (_sortBy) {
      case 'price_asc':  return l10n.sortPriceAsc;
      case 'price_desc': return l10n.sortPriceDesc;
      case 'popular':    return l10n.sortPopular;
      default:           return l10n.sortRecent;
    }
  }

  String _fmtPrice(int p) {
    if (p >= 1_000_000) return '${(p / 1_000_000).toStringAsFixed(1)}M';
    if (p >= 1_000)     return '${(p / 1_000).round()}k';
    return '$p';
  }
}

// ═════════════════════════════════════════════════════════════
// Preview Card (compact, dans le panel de sélection)
// ═════════════════════════════════════════════════════════════
class _HousingPreviewCard extends StatelessWidget {
  final HousingModel housing;
  final bool         isDark;
  final AppL10n      l10n;

  const _HousingPreviewCard({
    required this.housing,
    required this.isDark,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    final bg     = isDark ? AppColors.cardDark  : AppColors.bgLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    final text   = isDark ? AppColors.textDark   : AppColors.textLight;
    final sub    = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    Color statusColor;
    String statusLabel;
    switch (housing.status) {
      case 'disponible':
        statusColor = AppColors.success;
        statusLabel = l10n.available;
        break;
      case 'reserve':
        statusColor = AppColors.warning;
        statusLabel = l10n.reserved;
        break;
      default:
        statusColor = AppColors.danger;
        statusLabel = l10n.occupied;
    }

    return Container(
      height: 110,
      decoration: BoxDecoration(
        color:        bg,
        borderRadius: BorderRadius.circular(14),
        border:       Border.all(color: border),
      ),
      child: Row(
        children: [
          // ── Image ──────────────────────────────────────
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(14)),
            child: SizedBox(
              width: 120, height: 110,
              child: housing.mainImage != null
                  ? CachedNetworkImage(
                      imageUrl:    housing.mainImage!,
                      fit:         BoxFit.cover,
                      placeholder: (_, __) => Container(
                          color: isDark
                              ? AppColors.surfaceDark
                              : AppColors.bgLight,
                          child: const Icon(Icons.home_work_outlined,
                              color: AppColors.textMutedDark)),
                      errorWidget: (_, __, ___) => Container(
                          color: isDark
                              ? AppColors.surfaceDark
                              : AppColors.bgLight,
                          child: const Icon(Icons.home_work_outlined,
                              color: AppColors.textMutedDark)),
                    )
                  : Container(
                      color: isDark
                          ? AppColors.surfaceDark
                          : AppColors.bgLight,
                      child: const Icon(Icons.home_work_outlined,
                          size: 36, color: AppColors.textMutedDark),
                    ),
            ),
          ),

          // ── Info ───────────────────────────────────────
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment:  MainAxisAlignment.spaceBetween,
                children: [
                  // Status badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color:        statusColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border:       Border.all(
                          color: statusColor.withOpacity(0.4)),
                    ),
                    child: Text(statusLabel,
                        style: TextStyle(
                          color:      statusColor,
                          fontSize:   10,
                          fontWeight: FontWeight.w600,
                        )),
                  ),

                  // Title
                  Text(housing.displayName,
                      style: TextStyle(
                        color:      text,
                        fontSize:   13,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines:  1,
                      overflow:  TextOverflow.ellipsis),

                  // Location
                  Row(children: [
                    Icon(Icons.location_on_rounded,
                        size: 12, color: AppColors.primary),
                    const SizedBox(width: 3),
                    Expanded(
                      child: Text(housing.locationStr,
                          style: TextStyle(color: sub, fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ),
                  ]),

                  // Price + Features
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${_fmt(housing.price)} FCFA',
                        style: const TextStyle(
                          color:      AppColors.primary,
                          fontSize:   13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Row(children: [
                        Icon(Icons.bed_outlined, size: 12, color: sub),
                        Text(' ${housing.rooms}',
                            style: TextStyle(color: sub, fontSize: 11)),
                        const SizedBox(width: 6),
                        Icon(Icons.square_foot_outlined, size: 12, color: sub),
                        Text(' ${housing.area}m²',
                            style: TextStyle(color: sub, fontSize: 11)),
                      ]),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Arrow ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.only(right: 10),
            child: Icon(Icons.arrow_forward_ios_rounded,
                size: 14, color: sub),
          ),
        ],
      ),
    );
  }

  String _fmt(int p) {
    if (p >= 1_000_000) return '${(p / 1_000_000).toStringAsFixed(1)}M';
    final s = p.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }
}

// ─── Marker group (for future clustering) ────────────────────
class _MarkerGroup {
  final HousingModel? housing;
  final LatLng        point;
  final int           count;
  const _MarkerGroup({this.housing, required this.point, required this.count});
  bool get isSingle => count == 1;
} 