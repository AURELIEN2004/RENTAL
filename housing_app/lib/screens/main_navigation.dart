
// lib/screens/main_navigation.dart
// ✅ Placé dans lib/screens/ comme dans le projet existant
// ✅ Imports corrects avec chemins relatifs depuis lib/screens/
// ✅ RentalAppBar importée depuis widgets/common/rental_app_bar.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/l10n/app_localizations.dart';
import '../data/providers/theme_provider.dart';
import '../widgets/app_bar_widget.dart';

// Screens — chemins depuis lib/screens/
import 'home/home_screen.dart';
import 'search/search_screen.dart';
import 'favorites/favorites_screen.dart';
import 'messaging/conversations_screen.dart';
import 'profile/profile_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});
  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final l10n   = context.l10n;
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final navBg  = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border = isDark ? AppColors.borderDark  : AppColors.borderLight;

    // Chaque onglet est wrapped avec la RentalAppBar sauf Profile (qui la gère elle-même)
    final screens = <Widget>[
      _WithAppBar(child: const HomeScreen()),
      _WithAppBar(title: l10n.search, child: const SearchScreen()),
      _WithAppBar(title: l10n.myFavorites, child: const FavoritesScreen()),
      _WithAppBar(title: l10n.messages, child: const ConversationsScreen()),
      const ProfileScreen(), // ProfileScreen a sa propre RentalAppBar
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: navBg,
          border: Border(top: BorderSide(color: border, width: 1)),
          boxShadow: isDark
              ? []
              : [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12)],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: Icons.home_outlined, activeIcon: Icons.home_rounded,
                  label: l10n.home, active: _index == 0,
                  onTap: () => setState(() => _index = 0),
                ),
                _NavItem(
                  icon: Icons.search_outlined, activeIcon: Icons.search_rounded,
                  label: l10n.search, active: _index == 1,
                  onTap: () => setState(() => _index = 1),
                ),
                _NavItem(
                  icon: Icons.favorite_outline_rounded, activeIcon: Icons.favorite_rounded,
                  label: l10n.favorites, active: _index == 2,
                  onTap: () => setState(() => _index = 2),
                ),
                _NavItem(
                  icon: Icons.chat_bubble_outline_rounded, activeIcon: Icons.chat_bubble_rounded,
                  label: l10n.messages, active: _index == 3,
                  onTap: () => setState(() => _index = 3),
                ),
                _NavItem(
                  icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded,
                  label: l10n.profile, active: _index == 4,
                  onTap: () => setState(() => _index = 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Wrapper : ajoute RentalAppBar à un écran qui n'en a pas
class _WithAppBar extends StatelessWidget {
  final String? title;
  final Widget child;
  const _WithAppBar({this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: RentalAppBar(title: title, showBack: false),
      body: child,
    );
  }
}

/// Item de la barre de navigation
class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark      = context.watch<ThemeProvider>().isDarkMode;
    final activeColor   = AppColors.primary;
    final inactiveColor = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 60,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: active
                    ? AppColors.primary.withOpacity(0.15)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                active ? activeIcon : icon,
                size: 24,
                color: active ? activeColor : inactiveColor,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: active ? activeColor : inactiveColor,
                fontWeight: active ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}