// // ============================================
// // lib/screens/housing/add_housing_screen.dart
// // ============================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/housing_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';

class AddHousingScreen extends StatefulWidget {
  final HousingModel? housing; // null = création, non-null = édition
  const AddHousingScreen({super.key, this.housing});
  @override
  State<AddHousingScreen> createState() => _AddHousingScreenState();
}

class _AddHousingScreenState extends State<AddHousingScreen> {
  final _api  = ApiService();
  int   _step = 0;
  bool  _saving = false;

  // Step 1 — Informations générales
  final _titleCtrl   = TextEditingController();
  final _addressCtrl = TextEditingController();
  int?  _categoryId;
  String? _categoryName;
  int?  _typeId;
  String? _typeName;

  // Step 2 — Détails logement
  final _priceCtrl  = TextEditingController();
  final _areaCtrl   = TextEditingController();
  int   _rooms      = 1;
  int   _bathrooms  = 1;
  bool  _furnished  = false;

  // Step 3 — Localisation
  int?   _regionId;
  String? _regionName;
  int?   _cityId;
  String? _cityName;
  int?   _districtId;
  String? _districtName;
  final  _descCtrl  = TextEditingController();
  final  _featCtrl  = TextEditingController();

  // Step 4 — Photos
  final List<File> _photos = [];

  // Step 5 — Aperçu

  @override
  void initState() {
    super.initState();
    if (widget.housing != null) {
      final h = widget.housing!;
      _titleCtrl.text  = h.title;
      _priceCtrl.text  = h.price.toString();
      _areaCtrl.text   = h.area.toString();
      _rooms           = h.rooms;
      _bathrooms       = h.bathrooms;
      _descCtrl.text   = h.description;
      _categoryId      = h.categoryId;
      _categoryName    = h.categoryName;
      _cityId          = h.cityId;
      _cityName        = h.cityName;
    }
    // Charger les listes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final hp = context.read<HousingProvider>();
      if (hp.categories.isEmpty) hp.fetchCategories();
      if (hp.regions.isEmpty)    hp.fetchRegions();
    });
  }

  @override
  void dispose() {
    _titleCtrl.dispose(); _addressCtrl.dispose();
    _priceCtrl.dispose(); _areaCtrl.dispose();
    _descCtrl.dispose();  _featCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark    = context.watch<ThemeProvider>().isDarkMode;
    final l10n      = context.l10n;
    final bg        = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final isEdit    = widget.housing != null;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        title: Text(isEdit ? 'Modifier le logement' : l10n.addHousing,
            style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        iconTheme: IconThemeData(color: textColor),
      ),
      body: Column(
        children: [
          // Barre de progression
          LinearProgressIndicator(
            value: (_step + 1) / 5,
            backgroundColor: isDark ? AppColors.borderDark : AppColors.borderLight,
            valueColor: const AlwaysStoppedAnimation(AppColors.primary),
            minHeight: 3,
          ),
          // Étape label
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(_stepLabel(_step, l10n),
                    style: TextStyle(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        fontSize: 12)),
                Text('${_step + 1}/5',
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 12)),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: _buildStep(isDark, textColor, l10n),
            ),
          ),
          _buildNav(isDark, l10n),
        ],
      ),
    );
  }

  String _stepLabel(int s, AppL10n l10n) {
    switch (s) {
      case 0: return l10n.general;
      case 1: return l10n.details;
      case 2: return 'Localisation & Description';
      case 3: return l10n.photos;
      default: return l10n.preview;
    }
  }

  Widget _buildStep(bool isDark, Color textColor, AppL10n l10n) {
    switch (_step) {
      case 0: return _step1(isDark, textColor, l10n);
      case 1: return _step2(isDark, textColor, l10n);
      case 2: return _step3(isDark, textColor, l10n);
      case 3: return _step4Photos(isDark, textColor, l10n);
      case 4: return _step5Preview(isDark, textColor, l10n);
      default: return const SizedBox.shrink();
    }
  }

  // ── Step 1 : Infos générales ──────────────────────────────
  Widget _step1(bool isDark, Color textColor, AppL10n l10n) {
    final hp = context.watch<HousingProvider>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(l10n.general, textColor),
        const SizedBox(height: 16),
        _field(_titleCtrl, l10n.titleLabel, Icons.title_rounded, isDark,
            hint: 'Ex: Appartement T2 lumineux', required: true),
        const SizedBox(height: 14),
        _field(_addressCtrl, 'Adresse complète', Icons.location_on_outlined, isDark,
            hint: 'Ex: Rue des Palmiers, Bastos'),
        const SizedBox(height: 20),
        _sectionTitle('Type de logement', textColor),
        const SizedBox(height: 10),
        if (hp.categories.isNotEmpty) ...[
          _label('Catégorie', isDark),
          Wrap(spacing: 8, runSpacing: 8,
            children: hp.categories.map((c) => _Chip(
              label: c.name,
              selected: _categoryId == c.id,
              isDark: isDark,
              onTap: () => setState(() { _categoryId = c.id; _categoryName = c.name; }),
            )).toList(),
          ),
          const SizedBox(height: 14),
        ],
        if (hp.housingTypes.isNotEmpty) ...[
          _label('Type', isDark),
          Wrap(spacing: 8, runSpacing: 8,
            children: hp.housingTypes.map((t) => _Chip(
              label: t.name,
              selected: _typeId == t.id,
              isDark: isDark,
              onTap: () => setState(() { _typeId = t.id; _typeName = t.name; }),
            )).toList(),
          ),
        ],
      ],
    );
  }

  // ── Step 2 : Détails ──────────────────────────────────────
  Widget _step2(bool isDark, Color textColor, AppL10n l10n) {
    final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(l10n.details, textColor),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: _field(_priceCtrl, l10n.priceLabel, Icons.attach_money_rounded, isDark,
              hint: '1200', keyboardType: TextInputType.number, required: true)),
          const SizedBox(width: 12),
          Expanded(child: _field(_areaCtrl, l10n.areaLabel, Icons.square_foot_rounded, isDark,
              hint: '50', keyboardType: TextInputType.number, required: true)),
        ]),
        const SizedBox(height: 16),
        // Chambres
        _counterRow('Chambres', _rooms,
            () { if (_rooms > 1) setState(() => _rooms--); },
            () { if (_rooms < 20) setState(() => _rooms++); },
            textColor, isDark),
        const SizedBox(height: 10),
        _counterRow('Salles de bain', _bathrooms,
            () { if (_bathrooms > 1) setState(() => _bathrooms--); },
            () { if (_bathrooms < 10) setState(() => _bathrooms++); },
            textColor, isDark),
        const SizedBox(height: 16),
        // Meublé
        GestureDetector(
          onTap: () => setState(() => _furnished = !_furnished),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _furnished ? AppColors.primary.withOpacity(0.1) : (isDark ? AppColors.cardDark : AppColors.cardLight),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _furnished ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight)),
            ),
            child: Row(
              children: [
                Icon(Icons.weekend_rounded,
                    color: _furnished ? AppColors.primary : subColor),
                const SizedBox(width: 12),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l10n.furnished, style: TextStyle(color: textColor, fontWeight: FontWeight.w500)),
                    Text('Logement avec mobilier inclus', style: TextStyle(color: subColor, fontSize: 12)),
                  ],
                )),
                Switch(
                  value: _furnished,
                  activeColor: AppColors.primary,
                  onChanged: (v) => setState(() => _furnished = v),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _counterRow(String label, int value, VoidCallback dec, VoidCallback inc, Color textColor, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Row(
        children: [
          Text(label, style: TextStyle(color: textColor, fontWeight: FontWeight.w500)),
          const Spacer(),
          _counterBtn(Icons.remove_rounded, dec, isDark),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text('$value', style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          _counterBtn(Icons.add_rounded, inc, isDark),
        ],
      ),
    );
  }

  Widget _counterBtn(IconData icon, VoidCallback onTap, bool isDark) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 32, height: 32,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle,
        border: Border.all(color: AppColors.primary.withOpacity(0.4)),
      ),
      child: Icon(icon, color: AppColors.primary, size: 16),
    ),
  );

  // ── Step 3 : Localisation + Description ──────────────────
  Widget _step3(bool isDark, Color textColor, AppL10n l10n) {
    final hp = context.watch<HousingProvider>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Localisation', textColor),
        const SizedBox(height: 14),
        if (hp.regions.isNotEmpty) ...[
          _label(l10n.regionLabel, isDark),
          Wrap(spacing: 8, runSpacing: 8,
            children: hp.regions.map((r) => _Chip(
              label: r.name, selected: _regionId == r.id, isDark: isDark,
              onTap: () {
                setState(() { _regionId = r.id; _regionName = r.name; _cityId = null; });
                context.read<HousingProvider>().fetchCities(regionId: r.id);
              },
            )).toList(),
          ),
          const SizedBox(height: 12),
        ],
        if (hp.cities.isNotEmpty) ...[
          _label(l10n.cityLabel, isDark),
          Wrap(spacing: 8, runSpacing: 8,
            children: hp.cities.map((c) => _Chip(
              label: c.name, selected: _cityId == c.id, isDark: isDark,
              onTap: () {
                setState(() { _cityId = c.id; _cityName = c.name; _districtId = null; });
                context.read<HousingProvider>().fetchDistricts(cityId: c.id);
              },
            )).toList(),
          ),
          const SizedBox(height: 12),
        ],
        if (hp.districts.isNotEmpty) ...[
          _label(l10n.districtLabel, isDark),
          Wrap(spacing: 8, runSpacing: 8,
            children: hp.districts.map((d) => _Chip(
              label: d.name, selected: _districtId == d.id, isDark: isDark,
              onTap: () => setState(() { _districtId = d.id; _districtName = d.name; }),
            )).toList(),
          ),
          const SizedBox(height: 16),
        ],
        _sectionTitle(l10n.description, textColor),
        const SizedBox(height: 10),
        TextFormField(
          controller: _descCtrl,
          minLines: 4, maxLines: 8,
          style: TextStyle(color: isDark ? AppColors.textDark : AppColors.textLight, fontSize: 14),
          decoration: _inputDecoration('Décrivez votre logement en détail…', isDark),
        ),
        const SizedBox(height: 14),
        _field(_featCtrl, 'Équipements (séparés par virgule)', Icons.check_circle_outline_rounded, isDark,
            hint: 'WiFi, Parking, Piscine, Climatisation'),
      ],
    );
  }

  // ── Step 4 : Photos ───────────────────────────────────────
  Widget _step4Photos(bool isDark, Color textColor, AppL10n l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(l10n.photos, textColor),
        const SizedBox(height: 8),
        Text('Ajoutez jusqu\'à 10 photos (première = couverture)',
            style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 13)),
        const SizedBox(height: 16),
        Wrap(
          spacing: 10, runSpacing: 10,
          children: [
            ..._photos.asMap().entries.map((e) => Stack(
              clipBehavior: Clip.none,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.file(e.value, width: 100, height: 100, fit: BoxFit.cover),
                ),
                if (e.key == 0)
                  Positioned(top: 4, left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                        child: const Text('Cover', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                      )),
                Positioned(top: -6, right: -6,
                    child: GestureDetector(
                      onTap: () => setState(() => _photos.removeAt(e.key)),
                      child: Container(
                        width: 20, height: 20,
                        decoration: const BoxDecoration(color: AppColors.danger, shape: BoxShape.circle),
                        child: const Icon(Icons.close, color: Colors.white, size: 12),
                      ),
                    )),
              ],
            )),
            if (_photos.length < 10)
              GestureDetector(
                onTap: _pickPhoto,
                child: Container(
                  width: 100, height: 100,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.cardDark : AppColors.bgLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight, style: BorderStyle.solid),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.add_photo_alternate_outlined, color: AppColors.primary, size: 28),
                      const SizedBox(height: 4),
                      Text('Ajouter', style: const TextStyle(color: AppColors.primary, fontSize: 11)),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }

  Future<void> _pickPhoto() async {
    final picked = await ImagePicker().pickMultiImage(imageQuality: 80);
    if (picked.isNotEmpty) {
      setState(() => _photos.addAll(picked.take(10 - _photos.length).map((x) => File(x.path))));
    }
  }

  // ── Step 5 : Aperçu ───────────────────────────────────────
  Widget _step5Preview(bool isDark, Color textColor, AppL10n l10n) {
    final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(l10n.preview, textColor),
        const SizedBox(height: 16),
        if (_photos.isNotEmpty)
          ClipRRect(borderRadius: BorderRadius.circular(16),
              child: Image.file(_photos.first, height: 200, width: double.infinity, fit: BoxFit.cover)),
        const SizedBox(height: 16),
        _previewRow('Titre',       _titleCtrl.text,                textColor, subColor),
        _previewRow('Catégorie',   _categoryName ?? '—',            textColor, subColor),
        _previewRow('Prix',        '${_priceCtrl.text} FCFA/mois', textColor, subColor),
        _previewRow('Surface',     '${_areaCtrl.text} m²',         textColor, subColor),
        _previewRow('Chambres',    '$_rooms',                       textColor, subColor),
        _previewRow('Salle de bain','$_bathrooms',                  textColor, subColor),
        _previewRow('Ville',       _cityName     ?? '—',            textColor, subColor),
        _previewRow('Quartier',    _districtName ?? '—',            textColor, subColor),
        _previewRow('Meublé',      _furnished ? 'Oui' : 'Non',      textColor, subColor),
        if (_descCtrl.text.isNotEmpty) _previewRow('Description', _descCtrl.text, textColor, subColor),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.success.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.success.withOpacity(0.3)),
          ),
          child: const Row(
            children: [
              Icon(Icons.check_circle_outline_rounded, color: AppColors.success),
              SizedBox(width: 10),
              Expanded(child: Text('Tout est bon ! Appuyez sur "Publier" pour soumettre votre annonce.',
                  style: TextStyle(color: AppColors.success, fontSize: 13))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _previewRow(String label, String value, Color textColor, Color subColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text(label, style: TextStyle(color: subColor, fontSize: 13))),
          Expanded(child: Text(value, style: TextStyle(color: textColor, fontSize: 13, fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  // ── Navigation ────────────────────────────────────────────
  Widget _buildNav(bool isDark, AppL10n l10n) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: Border(top: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
      ),
      child: Row(
        children: [
          if (_step > 0) ...[
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _step--),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primary),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(l10n.back, style: const TextStyle(color: AppColors.primary)),
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _saving ? null : (_step < 4 ? _nextStep : _submit),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _saving
                  ? const SizedBox(width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(_step < 4 ? l10n.next : l10n.publish,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }

  void _nextStep() {
    if (_step == 0 && _titleCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Le titre est requis')));
      return;
    }
    if (_step == 1 && (_priceCtrl.text.isEmpty || _areaCtrl.text.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Prix et surface requis')));
      return;
    }
    setState(() => _step++);
  }

  Future<void> _submit() async {
    final user = context.read<AuthProvider>().user;
    if (user == null) return;

    setState(() => _saving = true);
    try {
      final fields = <String, dynamic>{
        'title':       _titleCtrl.text.trim(),
        'price':       _priceCtrl.text,
        'area':        _areaCtrl.text,
        'rooms':       _rooms.toString(),
        'bathrooms':   _bathrooms.toString(),
        'description': _descCtrl.text.trim(),
        if (_categoryId != null) 'category':     _categoryId.toString(),
        if (_typeId     != null) 'housing_type':  _typeId.toString(),
        if (_cityId     != null) 'city':          _cityId.toString(),
        if (_districtId != null) 'district':      _districtId.toString(),
        if (_featCtrl.text.isNotEmpty) 'additional_features': _featCtrl.text,
      };

      if (widget.housing != null) {
        await _api.updateHousing(widget.housing!.id, fields);
      } else {
        await _api.createHousing(fields, _photos);
      }

      await context.read<HousingProvider>().fetchMyHousings();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(widget.housing != null ? 'Logement modifié ✓' : 'Annonce publiée ✓'),
          backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating,
        ));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Erreur: $e'), backgroundColor: AppColors.danger, behavior: SnackBarBehavior.floating));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  Widget _sectionTitle(String t, Color c) => Text(t,
      style: TextStyle(color: c, fontSize: 18, fontWeight: FontWeight.bold));

  Widget _label(String t, bool isDark) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(t, style: TextStyle(
        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
        fontWeight: FontWeight.w500, fontSize: 13)),
  );

  Widget _field(TextEditingController ctrl, String label, IconData icon, bool isDark, {
    String? hint, TextInputType keyboardType = TextInputType.text, bool required = false,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 2),
    child: TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      style: TextStyle(color: isDark ? AppColors.textDark : AppColors.textLight, fontSize: 14),
      decoration: _inputDecoration(hint ?? label, isDark).copyWith(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.textMutedDark, size: 18),
      ),
    ),
  );

  InputDecoration _inputDecoration(String hint, bool isDark) => InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: AppColors.textMutedDark, fontSize: 13),
    filled: true,
    fillColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
  );
}

class _Chip extends StatelessWidget {
  final String label;
  final bool selected, isDark;
  final VoidCallback onTap;
  const _Chip({required this.label, required this.selected, required this.isDark, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? AppColors.primary : (isDark ? AppColors.cardDark : AppColors.cardLight),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: selected ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight)),
      ),
      child: Text(label, style: TextStyle(
          color: selected ? Colors.white : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
          fontSize: 13, fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
    ),
  );
}
