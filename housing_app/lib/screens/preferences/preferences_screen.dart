// lib/screens/preferences/preferences_screen.dart
// Quiz de préférences — alimente l'algorithme génétique backend
// Miroir du PreferenceQuiz.jsx du web

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/housing_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';

class PreferencesScreen extends StatefulWidget {
  const PreferencesScreen({super.key});
  @override
  State<PreferencesScreen> createState() => _PreferencesScreenState();
}

class _PreferencesScreenState extends State<PreferencesScreen> {
  final _api = ApiService();
  int _step = 0;
  bool _saving = false;

  // Réponses du quiz
  String  _priority    = 'price';          // price | location | size | comfort
  String  _cityPref    = '';
  int     _maxPrice    = 150000;
  int     _minRooms    = 1;
  bool?   _furnished;
  final List<String> _features = [];
  String  _category   = '';

  final _cities = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Maroua', 'Bamenda'];
  final _categories = ['Studio', 'Appartement', 'Maison', 'Villa', 'Chambre'];
  final _featureOptions = ['WiFi', 'Parking', 'Piscine', 'Sécurité 24h', 'Groupe électrogène', 'Climatisation', 'Cuisine équipée'];

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final l10n   = context.l10n;
    final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        title: Text('Mes Préférences', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        iconTheme: IconThemeData(color: textColor),
      ),
      body: Column(
        children: [
          // Barre de progression
          LinearProgressIndicator(
            value: (_step + 1) / 5,
            backgroundColor: isDark ? AppColors.borderDark : AppColors.borderLight,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            minHeight: 3,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Étape ${_step + 1}/5',
                    style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 13)),
                Text('${((_step + 1) / 5 * 100).round()}%',
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _buildStep(isDark, textColor, l10n),
              ),
            ),
          ),

          // Navigation bas
          _buildNav(isDark, l10n),
        ],
      ),
    );
  }

  Widget _buildStep(bool isDark, Color textColor, AppL10n l10n) {
    switch (_step) {
      case 0: return _stepPriority(isDark, textColor);
      case 1: return _stepCity(isDark, textColor);
      case 2: return _stepBudget(isDark, textColor);
      case 3: return _stepFurnished(isDark, textColor);
      case 4: return _stepFeatures(isDark, textColor);
      default: return const SizedBox.shrink();
    }
  }

  // Étape 1 : Priorité
  Widget _stepPriority(bool isDark, Color textColor) {
    final options = [
      ('price', Icons.attach_money_rounded, 'Budget', 'Je privilégie le prix'),
      ('location', Icons.location_on_rounded, 'Localisation', 'La zone est essentielle'),
      ('size', Icons.square_foot_rounded, 'Surface', 'J\'ai besoin d\'espace'),
      ('comfort', Icons.star_rounded, 'Confort', 'Les équipements comptent'),
    ];
    return _stepWrapper(
      isDark, textColor,
      title: 'Quelle est votre priorité ?',
      subtitle: 'Cela nous aide à personnaliser vos résultats',
      child: Column(
        children: options.map((o) {
          final (val, icon, label, sub) = o;
          return _selectTile(
            isDark: isDark,
            textColor: textColor,
            selected: _priority == val,
            icon: icon,
            title: label,
            subtitle: sub,
            onTap: () => setState(() => _priority = val),
          );
        }).toList(),
      ),
    );
  }

  // Étape 2 : Ville préférée
  Widget _stepCity(bool isDark, Color textColor) {
    return _stepWrapper(
      isDark, textColor,
      title: 'Quelle ville vous intéresse ?',
      subtitle: 'Sélectionnez votre ville préférée',
      child: Wrap(
        spacing: 10, runSpacing: 10,
        children: _cities.map((c) => GestureDetector(
          onTap: () => setState(() => _cityPref = _cityPref == c ? '' : c),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            decoration: BoxDecoration(
              color: _cityPref == c ? AppColors.primary : (isDark ? AppColors.cardDark : AppColors.cardLight),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: _cityPref == c ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight)),
            ),
            child: Text(c,
                style: TextStyle(
                    color: _cityPref == c ? Colors.white : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                    fontWeight: _cityPref == c ? FontWeight.w600 : FontWeight.normal)),
          ),
        )).toList(),
      ),
    );
  }

  // Étape 3 : Budget max
  Widget _stepBudget(bool isDark, Color textColor) {
    final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    return _stepWrapper(
      isDark, textColor,
      title: 'Votre budget maximum ?',
      subtitle: 'Loyer mensuel en FCFA',
      child: Column(
        children: [
          Text(
            '${_fmtPrice(_maxPrice)} FCFA / mois',
            style: const TextStyle(color: AppColors.primary, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.primary,
              thumbColor: AppColors.primary,
              overlayColor: AppColors.primary.withOpacity(0.12),
              inactiveTrackColor: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
            child: Slider(
              value: _maxPrice.toDouble(),
              min: 20000, max: 500000, divisions: 96,
              onChanged: (v) => setState(() => _maxPrice = v.round()),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('20 000', style: TextStyle(color: subColor, fontSize: 12)),
              Text('500 000', style: TextStyle(color: subColor, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 16),
          // Nbr chambres min
          Row(
            children: [
              Text('Chambres minimum :', style: TextStyle(color: textColor, fontWeight: FontWeight.w500)),
              const Spacer(),
              Row(
                children: [
                  _counterBtn(Icons.remove, () { if (_minRooms > 1) setState(() => _minRooms--); }),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text('$_minRooms', style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                  _counterBtn(Icons.add, () { if (_minRooms < 10) setState(() => _minRooms++); }),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _counterBtn(IconData icon, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 32, height: 32,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.primary),
      ),
      child: Icon(icon, color: AppColors.primary, size: 16),
    ),
  );

  // Étape 4 : Meublé ?
  Widget _stepFurnished(bool isDark, Color textColor) {
    return _stepWrapper(
      isDark, textColor,
      title: 'Meublé ou non meublé ?',
      subtitle: 'Votre préférence pour le type de logement',
      child: Column(
        children: [
          _selectTile(
            isDark: isDark, textColor: textColor,
            selected: _furnished == true,
            icon: Icons.weekend_rounded,
            title: 'Meublé',
            subtitle: 'Logement entièrement équipé',
            onTap: () => setState(() => _furnished = true),
          ),
          _selectTile(
            isDark: isDark, textColor: textColor,
            selected: _furnished == false,
            icon: Icons.home_outlined,
            title: 'Non meublé',
            subtitle: 'Logement vide à décorer',
            onTap: () => setState(() => _furnished = false),
          ),
          _selectTile(
            isDark: isDark, textColor: textColor,
            selected: _furnished == null,
            icon: Icons.all_inclusive_rounded,
            title: 'Peu importe',
            subtitle: 'Les deux m\'intéressent',
            onTap: () => setState(() => _furnished = null),
          ),
        ],
      ),
    );
  }

  // Étape 5 : Équipements souhaités
  Widget _stepFeatures(bool isDark, Color textColor) {
    return _stepWrapper(
      isDark, textColor,
      title: 'Équipements souhaités ?',
      subtitle: 'Sélectionnez tout ce qui vous importe',
      child: Wrap(
        spacing: 10, runSpacing: 10,
        children: _featureOptions.map((f) {
          final selected = _features.contains(f);
          return GestureDetector(
            onTap: () => setState(() => selected ? _features.remove(f) : _features.add(f)),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: selected ? AppColors.primary : (isDark ? AppColors.cardDark : AppColors.cardLight),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: selected ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (selected) const Icon(Icons.check_rounded, color: Colors.white, size: 14),
                  if (selected) const SizedBox(width: 4),
                  Text(f, style: TextStyle(
                    color: selected ? Colors.white : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                    fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                    fontSize: 13,
                  )),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _stepWrapper(bool isDark, Color textColor, {
    required String title, required String subtitle, required Widget child}) {
    final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: TextStyle(color: textColor, fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Text(subtitle, style: TextStyle(color: subColor, fontSize: 13)),
        const SizedBox(height: 24),
        child,
      ],
    );
  }

  Widget _selectTile({
    required bool isDark, required Color textColor, required bool selected,
    required IconData icon, required String title, required String subtitle,
    required VoidCallback onTap,
  }) {
    final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.1) : (isDark ? AppColors.cardDark : AppColors.cardLight),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight),
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: selected ? AppColors.primary.withOpacity(0.15) : (isDark ? AppColors.bgDark : AppColors.bgLight),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: selected ? AppColors.primary : subColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 14)),
                  Text(subtitle, style: TextStyle(color: subColor, fontSize: 12)),
                ],
              ),
            ),
            if (selected)
              const Icon(Icons.check_circle_rounded, color: AppColors.primary),
          ],
        ),
      ),
    );
  }

  Widget _buildNav(bool isDark, AppL10n l10n) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: Border(top: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
      ),
      child: Row(
        children: [
          if (_step > 0)
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
          if (_step > 0) const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _saving ? null : () {
                if (_step < 4) {
                  setState(() => _step++);
                } else {
                  _save();
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _saving
                  ? const SizedBox(width: 20, height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(_step < 4 ? l10n.next : 'Enregistrer',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final user = context.read<AuthProvider>().user;
      if (user == null) return;

      await _api.post('/housings/preferences/', data: {
        'priority':   _priority,
        'city':       _cityPref,
        'max_price':  _maxPrice,
        'min_rooms':  _minRooms,
        'furnished':  _furnished,
        'features':   _features,
        'category':   _category,
      });

      // Recharger les recommandations
      await context.read<HousingProvider>().fetchRecommended();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Préférences enregistrées ✓ Vos recommandations sont mises à jour'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: AppColors.danger, behavior: SnackBarBehavior.floating),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  String _fmtPrice(int p) {
    final s = p.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }
}