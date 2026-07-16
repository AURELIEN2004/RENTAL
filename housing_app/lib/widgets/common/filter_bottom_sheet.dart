// lib/widgets/common/filter_bottom_sheet.dart
// ============================================================
// Bottom sheet de filtres réutilisable.
// Usage dans n'importe quel écran :
//
//   FilterBottomSheet.show(context);
//
// Le widget lit/écrit directement dans HousingProvider.
// Compatible avec search_screen.dart et search_map_screen.dart.
// ============================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/housing_provider.dart';
import '../../data/providers/theme_provider.dart';

class FilterBottomSheet extends StatefulWidget {
  const FilterBottomSheet({super.key});

  /// Ouvre le bottom sheet depuis n'importe quel contexte.
  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context:          context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:         (_) => const FilterBottomSheet(),
    );
  }

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {

  // ── État local (copie des filtres actifs) ─────────────────
  int?    _categoryId;
  int?    _cityId;
  int?    _housingTypeId;
  String? _status;
  int     _minPrice   = 0;
  int     _maxPrice   = 2_000_000;
  int     _minRooms   = 0;
  int     _minArea    = 0;

  // Sliders
  static const int _kMaxPrice = 2_000_000;
  static const int _kMaxRooms = 10;
  static const int _kMaxArea  = 500;

  @override
  void initState() {
    super.initState();
    // Pré-remplir avec les filtres actifs dans le provider
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final hp = context.read<HousingProvider>();
      final f  = hp.activeFilters;
      setState(() {
        _categoryId    = f['category']     as int?;
        _cityId        = f['city']         as int?;
        _housingTypeId = f['housing_type'] as int?;
        _status        = f['status'] == 'disponible' ? null : f['status'] as String?;
        _minPrice      = (f['min_price'] as int?) ?? 0;
        _maxPrice      = (f['max_price'] as int?) ?? _kMaxPrice;
        _minRooms      = (f['rooms__gte'] as int?) ?? 0;
        _minArea       = (f['min_area'] as int?) ?? 0;
      });
    });
  }

  void _apply() {
    context.read<HousingProvider>().setFilters(
      categoryId:    _categoryId,
      cityId:        _cityId,
      housingTypeId: _housingTypeId,
      status:        _status ?? 'disponible',
      minPrice:      _minPrice > 0         ? _minPrice : null,
      maxPrice:      _maxPrice < _kMaxPrice ? _maxPrice : null,
      minRooms:      _minRooms > 0         ? _minRooms : null,
      minArea:       _minArea  > 0         ? _minArea  : null,
      fetch:         true,
    );
    Navigator.pop(context);
  }

  void _reset() {
    context.read<HousingProvider>().clearFilters();
    Navigator.pop(context);
  }

  // ── Helpers ───────────────────────────────────────────────
  int get _activeCount {
    int n = 0;
    if (_categoryId != null)         n++;
    if (_cityId != null)             n++;
    if (_housingTypeId != null)      n++;
    if (_status != null)             n++;
    if (_minPrice > 0)               n++;
    if (_maxPrice < _kMaxPrice)      n++;
    if (_minRooms > 0)               n++;
    if (_minArea  > 0)               n++;
    return n;
  }

  String _fmtPrice(int p) {
    if (p >= 1_000_000) return '${(p/1_000_000).toStringAsFixed(1)}M';
    if (p >= 1_000)     return '${(p/1_000).round()}k';
    return '$p';
  }

  // ═════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final l10n   = context.l10n;
    final hp     = context.watch<HousingProvider>();

    final bg     = isDark ? AppColors.surfaceDark : Colors.white;
    final card   = isDark ? AppColors.cardDark    : AppColors.bgLight;
    final border = isDark ? AppColors.borderDark  : AppColors.borderLight;
    final txt    = isDark ? AppColors.textDark    : AppColors.textLight;
    final sub    = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      decoration: BoxDecoration(
        color:        bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      // 85% de l'écran max
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [

          // ── Handle ────────────────────────────────────────
          Center(child: Container(
            width: 40, height: 4,
            margin: const EdgeInsets.only(top: 12, bottom: 4),
            decoration: BoxDecoration(
              color: border, borderRadius: BorderRadius.circular(2)),
          )),

          // ── Header ────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
            child: Row(children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.tune_rounded,
                    color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(l10n.filters,
                    style: TextStyle(
                        color: txt, fontSize: 17, fontWeight: FontWeight.bold)),
                if (_activeCount > 0)
                  Text('$_activeCount filtre(s) actif(s)',
                      style: const TextStyle(
                          color: AppColors.primary, fontSize: 11)),
              ]),
              const Spacer(),
              // Reset
              TextButton.icon(
                onPressed: _reset,
                icon: const Icon(Icons.refresh_rounded,
                    size: 15, color: AppColors.danger),
                label: Text(l10n.reset,
                    style: const TextStyle(
                        color: AppColors.danger, fontSize: 13)),
                style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4)),
              ),
            ]),
          ),

          const Divider(height: 1),

          // ── Contenu (scrollable) ──────────────────────────
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  // ── STATUT ─────────────────────────────────
                  _sectionTitle('Statut', Icons.circle_outlined, txt),
                  const SizedBox(height: 10),
                  _StatusSelector(
                    value:    _status,
                    isDark:   isDark,
                    l10n:     l10n,
                    onChange: (v) => setState(() => _status = v),
                  ),
                  const SizedBox(height: 20),

                  // ── CATÉGORIE ──────────────────────────────
                  _sectionTitle(l10n.categoryLabel,
                      Icons.category_outlined, txt),
                  const SizedBox(height: 10),
                  _ChipSelector<CategoryModel>(
                    items:       hp.categories,
                    selected:    _categoryId,
                    labelOf:     (c) => c.name,
                    idOf:        (c) => c.id,
                    isDark:      isDark,
                    onSelected:  (id) => setState(() =>
                        _categoryId = _categoryId == id ? null : id),
                  ),
                  const SizedBox(height: 20),

                  // ── VILLE ──────────────────────────────────
                  _sectionTitle(l10n.cityLabel,
                      Icons.location_city_outlined, txt),
                  const SizedBox(height: 10),
                  _ChipSelector<CityModel>(
                    items:       hp.cities.take(12).toList(),
                    selected:    _cityId,
                    labelOf:     (c) => c.name,
                    idOf:        (c) => c.id,
                    isDark:      isDark,
                    onSelected:  (id) => setState(() =>
                        _cityId = _cityId == id ? null : id),
                  ),
                  const SizedBox(height: 20),

                  // ── FOURCHETTE DE PRIX ─────────────────────
                  _sectionTitle(l10n.priceRange,
                      Icons.attach_money_rounded, txt),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _priceTag(_fmtPrice(_minPrice) + ' FCFA', sub),
                      _priceTag(_fmtPrice(_maxPrice) + ' FCFA', sub),
                    ],
                  ),
                  RangeSlider(
                    values:    RangeValues(
                        _minPrice.toDouble(), _maxPrice.toDouble()),
                    min:       0,
                    max:       _kMaxPrice.toDouble(),
                    divisions: 40,
                    activeColor:   AppColors.primary,
                    inactiveColor: AppColors.primary.withOpacity(0.15),
                    labels: RangeLabels(
                      _fmtPrice(_minPrice),
                      _fmtPrice(_maxPrice),
                    ),
                    onChanged: (r) => setState(() {
                      _minPrice = r.start.round();
                      _maxPrice = r.end.round();
                    }),
                  ),
                  const SizedBox(height: 12),

                  // ── NOMBRE DE CHAMBRES ─────────────────────
                  _sectionTitle(l10n.minRooms,
                      Icons.bed_outlined, txt),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_minRooms == 0 ? 'Toutes' : '$_minRooms+',
                          style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 13)),
                      Text('${_kMaxRooms} max',
                          style: TextStyle(color: sub, fontSize: 11)),
                    ],
                  ),
                  Slider(
                    value:        _minRooms.toDouble(),
                    min:          0,
                    max:          _kMaxRooms.toDouble(),
                    divisions:    _kMaxRooms,
                    activeColor:  AppColors.primary,
                    inactiveColor:AppColors.primary.withOpacity(0.15),
                    label: _minRooms == 0 ? 'Toutes' : '$_minRooms+',
                    onChanged: (v) => setState(() => _minRooms = v.round()),
                  ),
                  const SizedBox(height: 12),

                  // ── SURFACE MINIMALE ───────────────────────
                  _sectionTitle(l10n.minArea,
                      Icons.square_foot_outlined, txt),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_minArea == 0 ? 'Toutes' : '$_minArea m²+',
                          style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 13)),
                      Text('${_kMaxArea} m² max',
                          style: TextStyle(color: sub, fontSize: 11)),
                    ],
                  ),
                  Slider(
                    value:        _minArea.toDouble(),
                    min:          0,
                    max:          _kMaxArea.toDouble(),
                    divisions:    25,
                    activeColor:  AppColors.primary,
                    inactiveColor:AppColors.primary.withOpacity(0.15),
                    label: _minArea == 0 ? 'Toutes' : '$_minArea m²+',
                    onChanged: (v) => setState(() => _minArea = v.round()),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // ── Bouton Appliquer ──────────────────────────────
          Container(
            padding: EdgeInsets.fromLTRB(
                20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
            decoration: BoxDecoration(
              color:  bg,
              border: Border(top: BorderSide(color: border)),
              boxShadow: [
                BoxShadow(
                  color:     Colors.black.withOpacity(isDark ? 0.3 : 0.06),
                  blurRadius: 10, offset: const Offset(0, -3)),
              ],
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _apply,
                icon:  const Icon(Icons.check_rounded, size: 18),
                label: Text(
                  _activeCount > 0
                      ? '${l10n.apply} ($_activeCount)'
                      : l10n.apply,
                  style: const TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w600),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title, IconData icon, Color color) {
    return Row(children: [
      Icon(icon, size: 16, color: AppColors.primary),
      const SizedBox(width: 7),
      Text(title,
          style: TextStyle(
              color: color, fontSize: 13, fontWeight: FontWeight.w600)),
    ]);
  }

  Widget _priceTag(String label, Color color) => Text(label,
      style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500));
}

// ═════════════════════════════════════════════════════════════
// Sélecteur de statut (chips)
// ═════════════════════════════════════════════════════════════
class _StatusSelector extends StatelessWidget {
  final String? value;
  final bool    isDark;
  final AppL10n l10n;
  final void Function(String?) onChange;

  const _StatusSelector({
    required this.value,
    required this.isDark,
    required this.l10n,
    required this.onChange,
  });

  @override
  Widget build(BuildContext context) {
    final options = [
      (null,          'Tous',          AppColors.primary),
      ('disponible',  l10n.available,  AppColors.success),
      ('reserve',     l10n.reserved,   AppColors.warning),
      ('occupe',      l10n.occupied,   AppColors.danger),
    ];

    return Wrap(
      spacing: 8, runSpacing: 8,
      children: options.map((opt) {
        final (val, label, color) = opt;
        final sel = value == val;
        return GestureDetector(
          onTap: () => onChange(val),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color:  sel ? color.withOpacity(0.15) : (isDark ? AppColors.cardDark : AppColors.bgLight),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color: sel ? color : (isDark ? AppColors.borderDark : AppColors.borderLight),
                  width: sel ? 1.5 : 1),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              if (sel) ...[
                Icon(Icons.check_rounded, size: 13, color: color),
                const SizedBox(width: 4),
              ],
              Text(label,
                  style: TextStyle(
                      color: sel ? color : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                      fontSize: 12,
                      fontWeight: sel ? FontWeight.w600 : FontWeight.normal)),
            ]),
          ),
        );
      }).toList(),
    );
  }
}

// ═════════════════════════════════════════════════════════════
// Sélecteur générique chips (catégories, villes, types)
// ═════════════════════════════════════════════════════════════
class _ChipSelector<T> extends StatelessWidget {
  final List<T>         items;
  final int?            selected;
  final String Function(T)  labelOf;
  final int    Function(T)  idOf;
  final bool                isDark;
  final void Function(int)  onSelected;

  const _ChipSelector({
    required this.items,
    required this.selected,
    required this.labelOf,
    required this.idOf,
    required this.isDark,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return Text('Aucune option disponible',
          style: TextStyle(
              color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
              fontSize: 12));
    }
    return Wrap(
      spacing: 8, runSpacing: 8,
      children: items.map((item) {
        final id  = idOf(item);
        final sel = selected == id;
        return GestureDetector(
          onTap: () => onSelected(id),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color:  sel
                  ? AppColors.primary.withOpacity(0.12)
                  : (isDark ? AppColors.cardDark : AppColors.bgLight),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color: sel
                      ? AppColors.primary
                      : (isDark ? AppColors.borderDark : AppColors.borderLight),
                  width: sel ? 1.5 : 1),
            ),
            child: Text(
              labelOf(item),
              style: TextStyle(
                  color: sel
                      ? AppColors.primary
                      : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                  fontSize: 12,
                  fontWeight: sel ? FontWeight.w600 : FontWeight.normal),
            ),
          ),
        );
      }).toList(),
    );
  }
}