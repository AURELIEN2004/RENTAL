// ============================================================
// lib/widgets/common/map_search_button.dart
// ============================================================
// Bouton réutilisable "Voir sur la carte" à placer dans :
//   • home_screen.dart    (sous la barre de recherche)
//   • search_screen.dart  (dans la top bar)
//
// Usage :
//   MapSearchButton()                // version compacte
//   MapSearchButton(expanded: true)  // version pleine largeur
// ============================================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/providers/theme_provider.dart';
import '../../screens/search/search_map_screen.dart';

class MapSearchButton extends StatelessWidget {
  /// Si true → bouton pleine largeur avec texte
  /// Si false → bouton icône compact
  final bool expanded;

  const MapSearchButton({super.key, this.expanded = false});

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final l10n   = context.l10n;

    if (expanded) {
      return _ExpandedButton(isDark: isDark, l10n: l10n);
    }
    return _CompactButton(isDark: isDark, l10n: l10n);
  }
}

// ── Version pleine largeur ────────────────────────────────────
class _ExpandedButton extends StatelessWidget {
  final bool    isDark;
  final AppL10n l10n;
  const _ExpandedButton({required this.isDark, required this.l10n});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _navigate(context),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1A4B8C), Color(0xFF10B981)],
            begin: Alignment.centerLeft,
            end:   Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color:     AppColors.primary.withOpacity(0.3),
              blurRadius: 16,
              offset:    const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.map_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Text(
              l10n.mapView,
              style: const TextStyle(
                color:      Colors.white,
                fontSize:   15,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color:        Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text('NEW',
                  style: TextStyle(
                      color:      Colors.white,
                      fontSize:   9,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5)),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Version compacte (icône) ──────────────────────────────────
class _CompactButton extends StatelessWidget {
  final bool    isDark;
  final AppL10n l10n;
  const _CompactButton({required this.isDark, required this.l10n});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: l10n.mapView,
      child: GestureDetector(
        onTap: () => _navigate(context),
        child: Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color:        isDark ? AppColors.surfaceDark : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark ? AppColors.borderDark : AppColors.borderLight,
            ),
            boxShadow: [
              BoxShadow(
                color:     Colors.black.withOpacity(isDark ? 0.3 : 0.08),
                blurRadius: 8,
                offset:    const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(
            Icons.map_rounded,
            color: AppColors.primary,
            size:  20,
          ),
        ),
      ),
    );
  }
}

void _navigate(BuildContext context) {
  Navigator.push(
    context,
    PageRouteBuilder(
      pageBuilder: (_, animation, __) => const SearchMapScreen(),
      transitionsBuilder: (_, animation, __, child) {
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve:  Curves.easeOut,
          ),
          child: child,
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    ),
  );
}


// ============================================================
// INTÉGRATION dans home_screen.dart
// ============================================================
// Dans _buildSearchBar() ou juste après _buildCategories(),
// ajoutez le bouton carte :
//
//   // Dans la Row du search bar, après le bouton filtre :
//   const SizedBox(width: 8),
//   const MapSearchButton(),  // ← bouton icône compact
//
// OU en version pleine largeur entre les catégories et la liste :
//
//   SliverToBoxAdapter(child: _buildCategories(isDark, l10n)),
//   const SliverToBoxAdapter(child: MapSearchButton(expanded: true)), // ← AJOUTER
//   SliverToBoxAdapter(child: _buildRecommended(isDark, l10n)),
//
// ============================================================


// ============================================================
// INTÉGRATION dans search_screen.dart
// ============================================================
// Dans _buildTopBar(), dans la Row principale, ajouter
// AVANT le bouton de recherche :
//
//   const MapSearchButton(),
//   const SizedBox(width: 8),
//
// Ou dans _buildSubBar() à droite du sélecteur de tri :
//
//   const SizedBox(width: 8),
//   const MapSearchButton(),
//
// ============================================================