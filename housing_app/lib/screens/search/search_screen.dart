// // // // ============================================
// // // // lib/screens/search/search_screen.dart
// // // // ============================================


// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import '../../core/constants/app_colors.dart';
// import '../../core/l10n/app_localizations.dart';
// import '../../data/models/housing_model.dart';
// import '../../data/providers/housing_provider.dart';
// import '../../data/providers/theme_provider.dart';
// import '../../data/services/api_service.dart';
// import '../../widgets/housing/housing_card.dart';

// class SearchScreen extends StatefulWidget {
//   const SearchScreen({super.key});
//   @override
//   State<SearchScreen> createState() => _SearchScreenState();
// }

// class _SearchScreenState extends State<SearchScreen> {
//   final _searchCtrl = TextEditingController();
//   final _api        = ApiService();

//   // État recherche
//   List<HousingModel> _results    = [];
//   bool   _loading    = false;
//   String _lastQuery  = '';
//   bool   _nlpMode    = true;   // NLP ou filtre classique
//   bool   _listening  = false;

//   // Filtres
//   int?    _catId;
//   int?    _cityId;
//   int?    _minPrice;
//   int?    _maxPrice;
//   int     _minRooms  = 0;
//   int?    _minArea;
//   String  _sortBy    = 'recent';
//   List<String> _equipment = [];

//   // Pour affichage
//   String? _catName;
//   String? _cityName;

//   @override
//   void initState() {
//     super.initState();
//     WidgetsBinding.instance.addPostFrameCallback((_) => _loadInitial());
//   }

//   @override
//   void dispose() {
//     _searchCtrl.dispose();
//     super.dispose();
//   }

//   Future<void> _loadInitial() async {
//     setState(() => _loading = true);
//     try {
//       _results = await _api.getHousings(filters: _buildFilters());
//     } catch (_) {}
//     if (mounted) setState(() => _loading = false);
//   }

//   Map<String, dynamic> _buildFilters() {
//     final f = <String, dynamic>{};
//     if (_catId   != null) f['category']   = _catId;
//     if (_cityId  != null) f['city']       = _cityId;
//     if (_minPrice != null) f['min_price'] = _minPrice;
//     if (_maxPrice != null) f['max_price'] = _maxPrice;
//     if (_minRooms > 0)    f['rooms__gte'] = _minRooms;
//     if (_minArea  != null) f['min_area']  = _minArea;
//     f['ordering'] = _sortBy == 'price_asc' ? 'price'
//         : _sortBy == 'price_desc' ? '-price'
//         : _sortBy == 'popular'    ? '-views_count'
//         : '-created_at';
//     return f;
//   }

//   int get _activeFiltersCount {
//     int n = 0;
//     if (_catId    != null) n++;
//     if (_cityId   != null) n++;
//     if (_minPrice != null || _maxPrice != null) n++;
//     if (_minRooms > 0)    n++;
//     if (_minArea  != null) n++;
//     if (_equipment.isNotEmpty) n++;
//     return n;
//   }

//   // ── Recherche NLP ─────────────────────────────────────────
//   Future<void> _performNlpSearch(String query) async {
//     if (query.trim().isEmpty) { _loadInitial(); return; }
//     setState(() { _loading = true; _lastQuery = query; });
//     try {
//       final lang = context.read<ThemeProvider>().language;
//       final res  = await _api.nlpSearch(query: query, language: lang);
//       final list = res['results'] as List? ?? [];
//       setState(() {
//         _results = list.map((j) => HousingModel.fromJson(j as Map<String, dynamic>)).toList();
//         _loading = false;
//       });
//     } catch (_) {
//       if (mounted) setState(() => _loading = false);
//     }
//   }

//   // ── Recherche classique avec filtres ─────────────────────
//   Future<void> _performFilterSearch() async {
//     setState(() => _loading = true);
//     try {
//       final filters = _buildFilters();
//       if (_searchCtrl.text.trim().isNotEmpty) {
//         filters['search'] = _searchCtrl.text.trim();
//       }
//       _results = await _api.getHousings(filters: filters);
//     } catch (_) {}
//     if (mounted) setState(() => _loading = false);
//   }

//   void _onSearchSubmit(String query) {
//     if (_nlpMode) {
//       _performNlpSearch(query);
//     } else {
//       _performFilterSearch();
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     final isDark    = context.watch<ThemeProvider>().isDarkMode;
//     final l10n      = context.l10n;
//     final bg        = isDark ? AppColors.bgDark : AppColors.bgLight;
//     final surface   = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
//     final border    = isDark ? AppColors.borderDark  : AppColors.borderLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

//     return Scaffold(
//       backgroundColor: bg,
//       body: SafeArea(
//         child: Column(
//           children: [
//             // ── Barre de recherche ──────────────────────────
//             Padding(
//               padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
//               child: Column(
//                 children: [
//                   Row(
//                     children: [
//                       Expanded(
//                         child: Container(
//                           height: 50,
//                           decoration: BoxDecoration(
//                             color: surface,
//                             borderRadius: BorderRadius.circular(14),
//                             border: Border.all(color: border),
//                           ),
//                           child: Row(
//                             children: [
//                               const Padding(
//                                 padding: EdgeInsets.symmetric(horizontal: 12),
//                                 child: Icon(Icons.search, color: AppColors.textMutedDark, size: 20),
//                               ),
//                               Expanded(
//                                 child: TextField(
//                                   controller: _searchCtrl,
//                                   style: TextStyle(color: textColor, fontSize: 14),
//                                   decoration: InputDecoration(
//                                     hintText: _nlpMode
//                                         ? 'Ex: studio meublé à Bastos 100000 FCFA'
//                                         : l10n.searchHint,
//                                     hintStyle: const TextStyle(color: AppColors.textMutedDark, fontSize: 13),
//                                     border: InputBorder.none,
//                                   ),
//                                   onSubmitted: _onSearchSubmit,
//                                 ),
//                               ),
//                               // Bouton vocal
//                               GestureDetector(
//                                 onTap: _startVoiceSearch,
//                                 child: Container(
//                                   margin: const EdgeInsets.only(right: 6),
//                                   width: 36, height: 36,
//                                   decoration: BoxDecoration(
//                                     color: _listening
//                                         ? AppColors.danger.withOpacity(0.15)
//                                         : AppColors.primary.withOpacity(0.1),
//                                     shape: BoxShape.circle,
//                                   ),
//                                   child: Icon(
//                                     _listening ? Icons.stop_rounded : Icons.mic_rounded,
//                                     color: _listening ? AppColors.danger : AppColors.primary,
//                                     size: 18,
//                                   ),
//                                 ),
//                               ),
//                             ],
//                           ),
//                         ),
//                       ),
//                       const SizedBox(width: 10),
//                       // Bouton filtre
//                       GestureDetector(
//                         onTap: () => _showFilterSheet(isDark, l10n),
//                         child: Stack(
//                           clipBehavior: Clip.none,
//                           children: [
//                             Container(
//                               width: 50, height: 50,
//                               decoration: BoxDecoration(
//                                 color: _activeFiltersCount > 0 ? AppColors.primary : surface,
//                                 borderRadius: BorderRadius.circular(14),
//                                 border: Border.all(color: _activeFiltersCount > 0 ? AppColors.primary : border),
//                               ),
//                               child: Icon(Icons.tune_rounded,
//                                   color: _activeFiltersCount > 0 ? Colors.white : textColor, size: 22),
//                             ),
//                             if (_activeFiltersCount > 0)
//                               Positioned(
//                                 top: -4, right: -4,
//                                 child: Container(
//                                   width: 18, height: 18,
//                                   decoration: const BoxDecoration(color: AppColors.danger, shape: BoxShape.circle),
//                                   child: Center(
//                                     child: Text('$_activeFiltersCount',
//                                         style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
//                                   ),
//                                 ),
//                               ),
//                           ],
//                         ),
//                       ),
//                     ],
//                   ),
//                   const SizedBox(height: 10),

//                   // ── Toggle NLP / Filtre + Tri ──────────────
//                   Row(
//                     children: [
//                       // Toggle mode
//                       GestureDetector(
//                         onTap: () => setState(() => _nlpMode = !_nlpMode),
//                         child: Container(
//                           padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
//                           decoration: BoxDecoration(
//                             color: _nlpMode ? AppColors.secondary.withOpacity(0.15) : surface,
//                             borderRadius: BorderRadius.circular(20),
//                             border: Border.all(color: _nlpMode ? AppColors.secondary : border),
//                           ),
//                           child: Row(
//                             mainAxisSize: MainAxisSize.min,
//                             children: [
//                               Icon(Icons.auto_awesome_rounded,
//                                   size: 14, color: _nlpMode ? AppColors.secondary : subColor),
//                               const SizedBox(width: 4),
//                               Text(_nlpMode ? 'IA active' : 'Recherche classique',
//                                   style: TextStyle(
//                                       color: _nlpMode ? AppColors.secondary : subColor,
//                                       fontSize: 11, fontWeight: FontWeight.w500)),
//                             ],
//                           ),
//                         ),
//                       ),
//                       const Spacer(),
//                       // Tri
//                       _SortDropdown(
//                         value: _sortBy,
//                         isDark: isDark,
//                         onChanged: (v) { setState(() => _sortBy = v); _performFilterSearch(); },
//                       ),
//                     ],
//                   ),
//                 ],
//               ),
//             ),

//             // ── Message vocal ───────────────────────────────
//             if (_listening)
//               Container(
//                 margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
//                 padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
//                 decoration: BoxDecoration(
//                   color: AppColors.danger.withOpacity(0.1),
//                   borderRadius: BorderRadius.circular(12),
//                   border: Border.all(color: AppColors.danger.withOpacity(0.3)),
//                 ),
//                 child: Row(
//                   children: [
//                     const Icon(Icons.mic_rounded, color: AppColors.danger, size: 18),
//                     const SizedBox(width: 8),
//                     Text('Parlez maintenant…',
//                         style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w500)),
//                   ],
//                 ),
//               ),

//             // ── Compteur résultats + Effacer filtres ────────
//             Padding(
//               padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
//               child: Row(
//                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                 children: [
//                   Text(
//                     _loading ? 'Recherche…' : '${_results.length} résultat${_results.length > 1 ? 's' : ''}',
//                     style: TextStyle(color: subColor, fontSize: 12),
//                   ),
//                   if (_activeFiltersCount > 0)
//                     GestureDetector(
//                       onTap: () { setState(() {
//                         _catId = _cityId = _minPrice = _maxPrice = _minArea = null;
//                         _minRooms = 0; _equipment.clear(); _sortBy = 'recent';
//                         _catName = _cityName = null;
//                       }); _loadInitial(); },
//                       child: const Text('Effacer les filtres',
//                           style: TextStyle(color: AppColors.danger, fontSize: 12)),
//                     ),
//                 ],
//               ),
//             ),

//             // ── Résultats ────────────────────────────────────
//             Expanded(
//               child: _loading
//                   ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
//                   : _results.isEmpty
//                       ? _buildEmpty(isDark, l10n)
//                       : RefreshIndicator(
//                           onRefresh: _loadInitial,
//                           color: AppColors.primary,
//                           child: ListView.builder(
//                             padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
//                             itemCount: _results.length,
//                             itemBuilder: (_, i) => Padding(
//                               padding: const EdgeInsets.only(bottom: 16),
//                               child: HousingCard(housing: _results[i]),
//                             ),
//                           ),
//                         ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   // ── Recherche vocale ─────────────────────────────────────
//   Future<void> _startVoiceSearch() async {
//     if (_listening) { setState(() => _listening = false); return; }
//     setState(() => _listening = true);
//     // Simulation d'une écoute vocale (intégrer speech_to_text si le package est dispo)
//     await Future.delayed(const Duration(seconds: 3));
//     if (mounted) {
//       setState(() => _listening = false);
//       // Exemple de résultat
//       _searchCtrl.text = 'Studio meublé Yaoundé';
//       _performNlpSearch(_searchCtrl.text);
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(
//           content: Text('💡 Ajoutez speech_to_text dans pubspec.yaml pour la vraie reconnaissance vocale'),
//           backgroundColor: AppColors.warning,
//           behavior: SnackBarBehavior.floating,
//           duration: Duration(seconds: 4),
//         ),
//       );
//     }
//   }

//   // ── Sheet filtres avancés ─────────────────────────────────
//   void _showFilterSheet(bool isDark, AppL10n l10n) {
//     showModalBottomSheet(
//       context: context,
//       isScrollControlled: true,
//       backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
//       shape: const RoundedRectangleBorder(
//           borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
//       builder: (_) => _FilterSheet(
//         isDark: isDark, l10n: l10n,
//         categories: context.read<HousingProvider>().categories,
//         cities: context.read<HousingProvider>().cities,
//         initialCatId: _catId, initialCityId: _cityId,
//         initialMinPrice: _minPrice, initialMaxPrice: _maxPrice,
//         initialMinRooms: _minRooms, initialMinArea: _minArea,
//         initialEquipment: List.from(_equipment),
//         onApply: (catId, catName, cityId, cityName, minP, maxP, rooms, area, equip) {
//           setState(() {
//             _catId = catId; _catName = catName;
//             _cityId = cityId; _cityName = cityName;
//             _minPrice = minP; _maxPrice = maxP;
//             _minRooms = rooms; _minArea = area;
//             _equipment
//               ..clear()
//               ..addAll(equip);
//           });
//           _performFilterSearch();
//         },
//       ),
//     );
//     // Charger les données de filtres si besoin
//     final hp = context.read<HousingProvider>();
//     if (hp.categories.isEmpty) hp.fetchCategories();
//     if (hp.cities.isEmpty)    hp.fetchCities();
//   }

//   Widget _buildEmpty(bool isDark, AppL10n l10n) {
//     return Center(
//       child: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         children: [
//           Icon(Icons.search_off_rounded, size: 64,
//               color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
//           const SizedBox(height: 16),
//           Text(l10n.noResults,
//               style: TextStyle(fontSize: 16,
//                   color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
//           if (_nlpMode) ...[
//             const SizedBox(height: 8),
//             Text('Essayez : "studio Yaoundé 80000"',
//                 style: const TextStyle(color: AppColors.primary, fontSize: 12)),
//           ],
//         ],
//       ),
//     );
//   }
// }

// // ── Sort Dropdown ─────────────────────────────────────────────
// class _SortDropdown extends StatelessWidget {
//   final String value;
//   final bool isDark;
//   final ValueChanged<String> onChanged;

//   const _SortDropdown({required this.value, required this.isDark, required this.onChanged});

//   @override
//   Widget build(BuildContext context) {
//     final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
//     final surface  = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border   = isDark ? AppColors.borderDark : AppColors.borderLight;

//     return Container(
//       padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
//       decoration: BoxDecoration(
//         color: surface, borderRadius: BorderRadius.circular(20),
//         border: Border.all(color: border),
//       ),
//       child: DropdownButtonHideUnderline(
//         child: DropdownButton<String>(
//           value: value,
//           icon: Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: subColor),
//           style: TextStyle(color: subColor, fontSize: 12),
//           dropdownColor: isDark ? AppColors.cardDark : AppColors.surfaceLight,
//           items: const [
//             DropdownMenuItem(value: 'recent',     child: Text('Plus récent')),
//             DropdownMenuItem(value: 'price_asc',  child: Text('Prix ↑')),
//             DropdownMenuItem(value: 'price_desc', child: Text('Prix ↓')),
//             DropdownMenuItem(value: 'popular',    child: Text('Populaire')),
//           ],
//           onChanged: (v) => v != null ? onChanged(v) : null,
//         ),
//       ),
//     );
//   }
// }

// // ── Sheet filtres avancés ─────────────────────────────────────
// class _FilterSheet extends StatefulWidget {
//   final bool isDark;
//   final AppL10n l10n;
//   final List<CategoryModel> categories;
//   final List<CityModel> cities;
//   final int? initialCatId;
//   final int? initialCityId;
//   final int? initialMinPrice;
//   final int? initialMaxPrice;
//   final int  initialMinRooms;
//   final int? initialMinArea;
//   final List<String> initialEquipment;
//   final Function(int?, String?, int?, String?, int?, int?, int, int?, List<String>) onApply;

//   const _FilterSheet({
//     required this.isDark, required this.l10n,
//     required this.categories, required this.cities,
//     this.initialCatId, this.initialCityId,
//     this.initialMinPrice, this.initialMaxPrice,
//     required this.initialMinRooms, this.initialMinArea,
//     required this.initialEquipment, required this.onApply,
//   });

//   @override
//   State<_FilterSheet> createState() => _FilterSheetState();
// }

// class _FilterSheetState extends State<_FilterSheet> {
//   int?   _catId;
//   String? _catName;
//   int?   _cityId;
//   String? _cityName;
//   int?   _minPrice;
//   int?   _maxPrice;
//   int    _rooms = 0;
//   int?   _area;
//   List<String> _equip = [];

//   final _minPCtrl = TextEditingController();
//   final _maxPCtrl = TextEditingController();
//   final _areaCtrl = TextEditingController();

//   final _equipOptions = ['WiFi', 'Parking', 'Piscine', 'Sécurité 24h', 'Groupe électrogène', 'Climatisation'];

//   @override
//   void initState() {
//     super.initState();
//     _catId   = widget.initialCatId;
//     _cityId  = widget.initialCityId;
//     _minPrice = widget.initialMinPrice;
//     _maxPrice = widget.initialMaxPrice;
//     _rooms   = widget.initialMinRooms;
//     _area    = widget.initialMinArea;
//     _equip   = List.from(widget.initialEquipment);
//     if (_minPrice != null) _minPCtrl.text = _minPrice.toString();
//     if (_maxPrice != null) _maxPCtrl.text = _maxPrice.toString();
//     if (_area != null)     _areaCtrl.text = _area.toString();
//   }

//   @override
//   void dispose() {
//     _minPCtrl.dispose(); _maxPCtrl.dispose(); _areaCtrl.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     final isDark   = widget.isDark;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
//     final surface   = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;

//     return DraggableScrollableSheet(
//       expand: false, initialChildSize: 0.88, maxChildSize: 0.95,
//       builder: (_, sc) => Column(
//         children: [
//           // Handle
//           Container(margin: const EdgeInsets.symmetric(vertical: 12), width: 40, height: 4,
//               decoration: BoxDecoration(color: isDark ? AppColors.borderDark : AppColors.borderLight,
//                   borderRadius: BorderRadius.circular(2))),
//           Padding(
//             padding: const EdgeInsets.symmetric(horizontal: 20),
//             child: Row(
//               mainAxisAlignment: MainAxisAlignment.spaceBetween,
//               children: [
//                 Text('Filtres & Recherche',
//                     style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold)),
//                 TextButton(
//                   onPressed: () => setState(() {
//                     _catId = _cityId = _minPrice = _maxPrice = _area = null;
//                     _rooms = 0; _equip.clear();
//                     _minPCtrl.clear(); _maxPCtrl.clear(); _areaCtrl.clear();
//                   }),
//                   child: const Text('Réinitialiser', style: TextStyle(color: AppColors.danger, fontSize: 13)),
//                 ),
//               ],
//             ),
//           ),
//           Expanded(
//             child: ListView(
//               controller: sc,
//               padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
//               children: [
//                 // Catégorie
//                 if (widget.categories.isNotEmpty) ...[
//                   _label('Type de logement', textColor),
//                   Wrap(spacing: 8, runSpacing: 8,
//                     children: widget.categories.map((c) {
//                       final sel = _catId == c.id;
//                       return _Chip(label: c.name, selected: sel, isDark: isDark,
//                           onTap: () => setState(() { _catId = sel ? null : c.id; _catName = sel ? null : c.name; }));
//                     }).toList(),
//                   ),
//                   const SizedBox(height: 20),
//                 ],

//                 // Ville
//                 if (widget.cities.isNotEmpty) ...[
//                   _label('Ville', textColor),
//                   Wrap(spacing: 8, runSpacing: 8,
//                     children: widget.cities.take(8).map((c) {
//                       final sel = _cityId == c.id;
//                       return _Chip(label: c.name, selected: sel, isDark: isDark,
//                           onTap: () => setState(() { _cityId = sel ? null : c.id; _cityName = sel ? null : c.name; }));
//                     }).toList(),
//                   ),
//                   const SizedBox(height: 20),
//                 ],

//                 // Prix
//                 _label('Gamme de prix (FCFA)', textColor),
//                 Row(children: [
//                   Expanded(child: _input(_minPCtrl, 'Min', isDark, (v) => _minPrice = int.tryParse(v))),
//                   Padding(padding: const EdgeInsets.symmetric(horizontal: 10),
//                       child: Text('–', style: TextStyle(color: subColor))),
//                   Expanded(child: _input(_maxPCtrl, 'Max', isDark, (v) => _maxPrice = int.tryParse(v))),
//                 ]),
//                 const SizedBox(height: 20),

//                 // Chambres
//                 _label('Nombre de chambres min.', textColor),
//                 Row(
//                   children: [0,1,2,3,4,5].map((n) {
//                     final sel = _rooms == n;
//                     return Padding(
//                       padding: const EdgeInsets.only(right: 8),
//                       child: _Chip(label: n == 0 ? 'Tous' : '$n+', selected: sel, isDark: isDark,
//                           onTap: () => setState(() => _rooms = n)),
//                     );
//                   }).toList(),
//                 ),
//                 const SizedBox(height: 20),

//                 // Surface min
//                 _label('Surface minimum (m²)', textColor),
//                 _input(_areaCtrl, 'Ex: 30', isDark, (v) => _area = int.tryParse(v)),
//                 const SizedBox(height: 20),

//                 // Équipements
//                 _label('Équipements', textColor),
//                 Wrap(spacing: 8, runSpacing: 8,
//                   children: _equipOptions.map((e) {
//                     final sel = _equip.contains(e);
//                     return _Chip(label: e, selected: sel, isDark: isDark,
//                         onTap: () => setState(() => sel ? _equip.remove(e) : _equip.add(e)));
//                   }).toList(),
//                 ),
//                 const SizedBox(height: 32),
//               ],
//             ),
//           ),
//           Padding(
//             padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
//             child: SizedBox(
//               width: double.infinity,
//               child: ElevatedButton(
//                 onPressed: () {
//                   Navigator.pop(context);
//                   widget.onApply(_catId, _catName, _cityId, _cityName,
//                       _minPrice, _maxPrice, _rooms, _area, _equip);
//                 },
//                 style: ElevatedButton.styleFrom(
//                   backgroundColor: AppColors.primary,
//                   padding: const EdgeInsets.symmetric(vertical: 16),
//                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
//                 ),
//                 child: const Text('Afficher les logements →',
//                     style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _label(String t, Color c) => Padding(
//     padding: const EdgeInsets.only(bottom: 10),
//     child: Text(t, style: TextStyle(color: c, fontWeight: FontWeight.w600, fontSize: 14)),
//   );

//   Widget _input(TextEditingController ctrl, String hint, bool isDark, ValueChanged<String> onChange) {
//     return TextField(
//       controller: ctrl,
//       keyboardType: TextInputType.number,
//       onChanged: onChange,
//       style: TextStyle(color: isDark ? AppColors.textDark : AppColors.textLight, fontSize: 14),
//       decoration: InputDecoration(
//         hintText: hint,
//         hintStyle: const TextStyle(color: AppColors.textMutedDark, fontSize: 13),
//         filled: true,
//         fillColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
//         contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
//         border: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
//             borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
//         enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
//             borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
//         focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
//             borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
//       ),
//     );
//   }
// }

// class _Chip extends StatelessWidget {
//   final String label;
//   final bool selected;
//   final bool isDark;
//   final VoidCallback onTap;
//   const _Chip({required this.label, required this.selected, required this.isDark, required this.onTap});

//   @override
//   Widget build(BuildContext context) => GestureDetector(
//     onTap: onTap,
//     child: Container(
//       padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
//       decoration: BoxDecoration(
//         color: selected ? AppColors.primary : (isDark ? AppColors.cardDark : AppColors.cardLight),
//         borderRadius: BorderRadius.circular(20),
//         border: Border.all(color: selected ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight)),
//       ),
//       child: Text(label,
//           style: TextStyle(
//               color: selected ? Colors.white : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
//               fontSize: 13, fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
//     ),
//   );
// }



// lib/screens/search/search_screen.dart
//
// ✅ FIX LANGUE TEMPS RÉEL (même méthode que home_screen) :
//    addListener() sur ThemeProvider → re-exécute la recherche courante
//    avec le nouveau header X-Language
//
// ✅ BILINGUE COMPLET :
//    • Titre, placeholder, sorts, badges, états vides → l10n
//    • Résultats dynamiques → rechargés via API (X-Language header)
//
// Architecture :
//   • Recherche NLP → api.post('/recherche/nlp/')
//   • Recherche classique → HousingProvider.fetchHousings(filters)
//   • Mode détecté : 'nlp' | 'default' | 'geo'

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/housing_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';
import '../housing/housing_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchCtrl = TextEditingController();
  final _api        = ApiService();

  // ✅ Référence directe pour addListener/removeListener
  late ThemeProvider _themeProvider;
  String _currentLanguage = '';

  // État local de la recherche
  List<HousingModel> _results   = [];
  bool   _loading = false;
  String _error   = '';
  String _mode    = 'default'; // 'default' | 'nlp'
  String _sortBy  = 'recent';
  bool   _iaActive = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _themeProvider = context.read<ThemeProvider>();
      _currentLanguage = _themeProvider.language;
      // ✅ S'abonner aux changements de ThemeProvider
      _themeProvider.addListener(_onLanguageChange);
      _loadDefault();
    });
  }

  // ✅ Déclenchée à chaque changement de langue
  void _onLanguageChange() {
    final newLang = _themeProvider.language;
    if (newLang != _currentLanguage && mounted) {
      setState(() => _currentLanguage = newLang);
      // Re-exécuter la recherche courante avec la nouvelle langue
      if (_mode == 'nlp' && _searchCtrl.text.isNotEmpty) {
        _doNlpSearch(_searchCtrl.text);
      } else {
        _loadDefault();
      }
    }
  }

  @override
  void dispose() {
    _themeProvider.removeListener(_onLanguageChange);
    _searchCtrl.dispose();
    super.dispose();
  }

  // ── Chargement par défaut (liste standard) ──────────────────────────────
  Future<void> _loadDefault() async {
    if (!mounted) return;
    setState(() {
      _loading  = true;
      _error    = '';
      _mode     = 'default';
      _iaActive = false;
    });
    try {
      final housings = await _api.getHousings(
          filters: {'ordering': _sortOrder()});
      if (mounted) {
        setState(() {
          _results = housings;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error   = e.toString();
          _loading = false;
        });
      }
    }
  }

  // ── Recherche NLP ────────────────────────────────────────────────────────
  Future<void> _doNlpSearch(String query) async {
    if (query.trim().isEmpty) { _loadDefault(); return; }
    if (!mounted) return;
    setState(() {
      _loading  = true;
      _error    = '';
      _mode     = 'nlp';
      _iaActive = true;
    });
    try {
      final lang = _themeProvider.language;
      final res  = await _api.nlpSearch(query: query, language: lang);
      final list = (res['results'] as List? ?? [])
          .map((j) => HousingModel.fromJson(j as Map<String, dynamic>))
          .toList();
      if (mounted) {
        setState(() {
          _results = list;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error   = e.toString();
          _loading = false;
        });
      }
    }
  }

  String _sortOrder() {
    switch (_sortBy) {
      case 'price_asc':  return 'price';
      case 'price_desc': return '-price';
      case 'popular':    return '-views_count';
      default:           return '-created_at';
    }
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Rebuild automatique quand isDarkMode change
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final l10n   = context.l10n;
    final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Column(children: [
          _buildTopBar(isDark, l10n),
          _buildSubBar(isDark, l10n),
          Expanded(child: _buildResults(isDark, l10n)),
        ]),
      ),
    );
  }

  // ── Barre de recherche ──────────────────────────────────────────────────
  Widget _buildTopBar(bool isDark, AppL10n l10n) {
    final surface   = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border    = isDark ? AppColors.borderDark  : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark    : AppColors.textLight;
    final hint      = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      color: bg(isDark),
      child: Row(children: [
        // Bouton retour
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(
            width: 44, height: 44,
            margin: const EdgeInsets.only(right: 10),
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: border),
            ),
            child: Icon(Icons.arrow_back_ios_rounded,
                size: 18, color: textColor),
          ),
        ),
        // Champ de recherche
        Expanded(
          child: Container(
            height: 48,
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: border),
            ),
            child: Row(children: [
              const SizedBox(width: 14),
              Icon(Icons.search, size: 20, color: hint),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _searchCtrl,
                  style: TextStyle(color: textColor, fontSize: 14),
                  decoration: InputDecoration(
                    // ✅ Traduit
                    hintText: l10n.searchHint,
                    hintStyle: TextStyle(color: hint, fontSize: 14),
                    border: InputBorder.none,
                  ),
                  onSubmitted: _doNlpSearch,
                ),
              ),
              if (_searchCtrl.text.isNotEmpty)
                GestureDetector(
                  onTap: () {
                    _searchCtrl.clear();
                    _loadDefault();
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Icon(Icons.close, size: 18, color: hint),
                  ),
                ),
            ]),
          ),
        ),
        // Bouton recherche / filtre
        GestureDetector(
          onTap: () {
            if (_searchCtrl.text.isNotEmpty) {
              _doNlpSearch(_searchCtrl.text);
            }
          },
          child: Container(
            width: 48, height: 48,
            margin: const EdgeInsets.only(left: 10),
            decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(14)),
            child: const Icon(Icons.search, color: Colors.white, size: 22),
          ),
        ),
      ]),
    );
  }

  // ── Sous-barre (résultats + tri) ─────────────────────────────────────────
  Widget _buildSubBar(bool isDark, AppL10n l10n) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(children: [
        // Badge IA active
        if (_iaActive)
          Container(
            margin: const EdgeInsets.only(right: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color: AppColors.secondary.withOpacity(0.4)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.auto_awesome_rounded,
                  color: AppColors.secondary, size: 12),
              const SizedBox(width: 4),
              // ✅ Traduit
              Text(l10n.iaActive,
                  style: const TextStyle(
                      color: AppColors.secondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w600)),
            ]),
          ),
        // Compteur résultats
        Expanded(
          child: Text(
            // ✅ Traduit
            '${_results.length} ${l10n.results}',
            style: TextStyle(color: subColor, fontSize: 13),
          ),
        ),
        // Sélecteur de tri
        GestureDetector(
          onTap: () => _showSortMenu(l10n),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color: isDark
                      ? AppColors.borderDark
                      : AppColors.borderLight),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text(_sortLabel(l10n),
                  style: TextStyle(color: textColor, fontSize: 12)),
              const SizedBox(width: 4),
              Icon(Icons.keyboard_arrow_down_rounded,
                  size: 16, color: textColor),
            ]),
          ),
        ),
      ]),
    );
  }

  // ── Résultats ────────────────────────────────────────────────────────────
  Widget _buildResults(bool isDark, AppL10n l10n) {
    if (_loading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppColors.primary),
            const SizedBox(height: 16),
            // ✅ Traduit
            Text(l10n.searchLoading,
                style: TextStyle(
                    color: isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondaryLight)),
          ],
        ),
      );
    }

    if (_error.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.wifi_off_rounded,
                size: 56,
                color: isDark
                    ? AppColors.textMutedDark
                    : AppColors.textMutedLight),
            const SizedBox(height: 16),
            // ✅ Traduit
            Text(l10n.searchError,
                style: TextStyle(
                    color: isDark ? AppColors.textDark : AppColors.textLight,
                    fontSize: 15)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loadDefault,
              icon: const Icon(Icons.refresh_rounded),
              // ✅ Traduit
              label: Text(l10n.retry),
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary),
            ),
          ],
        ),
      );
    }

    if (_results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off_rounded,
                size: 72,
                color: isDark
                    ? AppColors.textMutedDark
                    : AppColors.textMutedLight),
            const SizedBox(height: 16),
            // ✅ Traduit
            Text(l10n.noHousing,
                style: TextStyle(
                    color: isDark ? AppColors.textDark : AppColors.textLight,
                    fontSize: 15,
                    fontWeight: FontWeight.w600)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadDefault,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        itemCount: _results.length,
        itemBuilder: (_, i) => _buildCard(_results[i], isDark, l10n),
      ),
    );
  }

  // ── Carte logement (style search) ────────────────────────────────────────
  Widget _buildCard(HousingModel h, bool isDark, AppL10n l10n) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    // Badge statut traduit
    Color statusColor;
    String statusLabel;
    switch (h.status) {
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

    // Date relative
    final days = DateTime.now().difference(h.createdAt).inDays;
    final String dateLabel;
    if (days == 0) {
      dateLabel = l10n.today;
    } else if (days == 1) {
      dateLabel = l10n.yesterday;
    } else if (days < 30) {
      dateLabel = l10n.daysAgo(days);
    } else {
      dateLabel = l10n.monthsAgo((days / 30).floor());
    }

    return GestureDetector(
      onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => HousingDetailScreen(housingId: h.id))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Stack(children: [
              ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(16)),
                child: h.mainImage != null
                    ? CachedNetworkImage(
                        imageUrl: h.mainImage!,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          height: 200,
                          color: AppColors.surfaceDark,
                          child: const Center(
                              child: CircularProgressIndicator(
                                  color: AppColors.primary)),
                        ),
                        errorWidget: (_, __, ___) => Container(
                          height: 200,
                          color: AppColors.surfaceDark,
                          child: const Icon(Icons.home_work_outlined,
                              size: 48,
                              color: AppColors.textMutedDark),
                        ),
                      )
                    : Container(
                        height: 200,
                        color: AppColors.surfaceDark,
                        child: const Icon(Icons.home_work_outlined,
                            size: 48, color: AppColors.textMutedDark)),
              ),
              // Badge statut
              Positioned(
                top: 12, left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.85),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(statusLabel,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold)),
                ),
              ),
              // Prix en bas de l'image
              Positioned(
                bottom: 0, left: 0, right: 0,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(12, 30, 12, 10),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black.withOpacity(0.75),
                        Colors.transparent,
                      ],
                    ),
                  ),
                  child: Text(
                    // ✅ perMonth traduit
                    '${_fmt(h.price)} FCFA${l10n.perMonth}',
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18),
                  ),
                ),
              ),
            ]),

            // Infos
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(h.displayName,
                      style: TextStyle(
                          color: textColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 15),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 5),
                  Row(children: [
                    const Icon(Icons.location_on_outlined,
                        size: 14, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(h.locationStr,
                        style:
                            TextStyle(color: subColor, fontSize: 12)),
                  ]),
                  const SizedBox(height: 10),
                  // Caractéristiques
                  Row(children: [
                    _feat(Icons.bed_outlined,
                        // ✅ Traduit
                        '${h.rooms} ${l10n.rooms}',
                        subColor),
                    const SizedBox(width: 14),
                    _feat(Icons.bathtub_outlined,
                        '${h.bathrooms} ${l10n.bathrooms}',
                        subColor),
                    const SizedBox(width: 14),
                    _feat(Icons.square_foot_outlined,
                        '${h.area} ${l10n.area}',
                        subColor),
                  ]),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(children: [
                        Icon(Icons.visibility_outlined,
                            size: 13, color: subColor),
                        Text(' ${h.viewsCount}',
                            style:
                                TextStyle(color: subColor, fontSize: 11)),
                        const SizedBox(width: 10),
                        Icon(Icons.favorite_outline_rounded,
                            size: 13, color: subColor),
                        Text(' ${h.likesCount}',
                            style:
                                TextStyle(color: subColor, fontSize: 11)),
                      ]),
                      Text(dateLabel,
                          style:
                              TextStyle(color: subColor, fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _feat(IconData icon, String label, Color color) {
    return Row(children: [
      Icon(icon, size: 14, color: color),
      const SizedBox(width: 4),
      Text(label, style: TextStyle(color: color, fontSize: 11)),
    ]);
  }

  // ── Menu de tri ──────────────────────────────────────────────────────────
  void _showSortMenu(AppL10n l10n) {
    final isDark = _themeProvider.isDarkMode;
    showModalBottomSheet(
      context: context,
      backgroundColor:
          isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.sortBy,
                style: TextStyle(
                    color: isDark
                        ? AppColors.textDark
                        : AppColors.textLight,
                    fontSize: 16,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            for (final (val, lbl) in [
              ('recent', l10n.sortRecent),
              ('price_asc', l10n.sortPriceAsc),
              ('price_desc', l10n.sortPriceDesc),
              ('popular', l10n.sortPopular),
            ])
              ListTile(
                title: Text(lbl,
                    style: TextStyle(
                        color: isDark
                            ? AppColors.textDark
                            : AppColors.textLight,
                        fontWeight: _sortBy == val
                            ? FontWeight.w600
                            : FontWeight.normal)),
                trailing: _sortBy == val
                    ? const Icon(Icons.check_rounded,
                        color: AppColors.primary)
                    : null,
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _sortBy = val);
                  _loadDefault();
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  // ✅ Label du bouton de tri traduit
  String _sortLabel(AppL10n l10n) {
    switch (_sortBy) {
      case 'price_asc':  return l10n.sortPriceAsc;
      case 'price_desc': return l10n.sortPriceDesc;
      case 'popular':    return l10n.sortPopular;
      default:           return l10n.sortRecent;
    }
  }

  Color bg(bool isDark) =>
      isDark ? AppColors.bgDark : AppColors.bgLight;

  String _fmt(int price) {
    if (price >= 1000000) {
      return '${(price / 1000000).toStringAsFixed(1)}M';
    }
    final s = price.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }
}