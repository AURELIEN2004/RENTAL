// lib/widgets/app_bar_widget.dart
// RentalAppBar dans un fichier séparé → plus d'import circulaire
// Usage : import '../../widgets/app_bar_widget.dart';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../data/providers/auth_provider.dart';
import '../data/providers/theme_provider.dart';

class RentalAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showBack;
  final List<Widget>? extraActions;
  final bool showNotif;
  final List<Widget>? actions; // 👈 AJOUT

  const RentalAppBar({
    super.key,
    this.title,
    this.showBack = true,
    this.extraActions,
    this.showNotif = true,
    this.actions, // 👈 AJOUT
  });

  @override
  Widget build(BuildContext context) {
    final isDark    = context.watch<ThemeProvider>().isDarkMode;
    final theme     = context.watch<ThemeProvider>();
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final bg        = isDark ? AppColors.bgDark   : AppColors.bgLight;

    return AppBar(
      backgroundColor: bg,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: showBack
          ? IconButton(
              icon: Icon(Icons.arrow_back_ios_rounded, color: textColor, size: 18),
              onPressed: () => Navigator.maybePop(context),
            )
          : null,
      automaticallyImplyLeading: false,
      title: title != null
          ? Text(title!,
              style: TextStyle(
                  color: textColor, fontWeight: FontWeight.bold, fontSize: 17))
          : _buildLogo(textColor),
      centerTitle: title != null,
      actions: [
      ...?actions,       // ✅ FIX
      ...?extraActions,

        // Toggle langue FR ↔ EN
        GestureDetector(
          onTap: () => theme.setLanguage(theme.language == 'fr' ? 'en' : 'fr'),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              border: Border.all(color: textColor.withOpacity(0.25)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.language_rounded, size: 13, color: textColor.withOpacity(0.8)),
                const SizedBox(width: 3),
                Text(
                  theme.language.toUpperCase(),
                  style: TextStyle(
                      color: textColor, fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),

        // Toggle dark / light mode
        IconButton(
          icon: Icon(
            isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
            color: textColor, size: 20,
          ),
          onPressed: () => theme.toggleTheme(),
          padding: const EdgeInsets.symmetric(horizontal: 4),
        ),

        // Notifications
        if (showNotif) _NotifButton(textColor: textColor),

        // Avatar utilisateur
        _AvatarButton(),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildLogo(Color textColor) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.home_work_rounded, color: AppColors.primary, size: 22),
        const SizedBox(width: 6),
        RichText(
          text: TextSpan(children: [
            TextSpan(
              text: 'Rent',
              style: TextStyle(
                  color: textColor, fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const TextSpan(
              text: 'AL',
              style: TextStyle(
                  color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ]),
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

// ── Bouton notifications ─────────────────────────────────────
class _NotifButton extends StatelessWidget {
  final Color textColor;
  const _NotifButton({required this.textColor});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      icon: Stack(
        clipBehavior: Clip.none,
        children: [
          Icon(Icons.notifications_outlined, color: textColor, size: 22),
          Positioned(
            top: -2, right: -2,
            child: Container(
              width: 8, height: 8,
              decoration: const BoxDecoration(
                  color: AppColors.danger, shape: BoxShape.circle),
            ),
          ),
        ],
      ),
      onPressed: () => Navigator.pushNamed(context, '/notifications'),
    );
  }
}

// ── Avatar utilisateur ───────────────────────────────────────
class _AvatarButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    return GestureDetector(
      onTap: () {
        if (user?.isStaff == true) {
          Navigator.pushNamed(context, '/admin');
        }
        // Sinon on reste sur l'onglet profil de la nav bar
      },
      child: CircleAvatar(
        radius: 16,
        backgroundColor: AppColors.primary,
        backgroundImage: user?.photo != null ? NetworkImage(user!.photo!) : null,
        child: user?.photo == null
            ? Text(
                user?.initials ?? 'U',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
              )
            : null,
      ),
    );
  }
}