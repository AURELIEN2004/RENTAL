// // // // // ============================================
// // // // // lib/screens/home/home_screen.dart
// // // // // ============================================

// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import 'package:cached_network_image/cached_network_image.dart';
// import '../../core/constants/app_colors.dart';
// import '../../core/l10n/app_localizations.dart';
// import '../../data/models/housing_model.dart';
// import '../../data/providers/auth_provider.dart';
// import '../../data/providers/housing_provider.dart';
// import '../../data/providers/theme_provider.dart';
// import '../../widgets/housing/housing_card.dart';
// import '../notifications/notifications_screen.dart';
// import '../housing/housing_detail_screen.dart';

// class HomeScreen extends StatefulWidget {
//   const HomeScreen({super.key});
//   @override
//   State<HomeScreen> createState() => _HomeScreenState();
// }

// class _HomeScreenState extends State<HomeScreen> {
//   int _catIndex = 0;
//   final _scroll = ScrollController();

//   @override
//   void initState() {
//     super.initState();
//     WidgetsBinding.instance.addPostFrameCallback((_) => _load());
//   }

//   @override
//   void dispose() {
//     _scroll.dispose();
//     super.dispose();
//   }

//   Future<void> _load() async {
//     final hp   = context.read<HousingProvider>();
//     final user = context.read<AuthProvider>().user;
//     await Future.wait([
//       hp.fetchHousings(),
//       hp.fetchCategories(),
//       if (user != null) hp.fetchRecommended(),
//     ]);
//   }

//   @override
//   Widget build(BuildContext context) {
//     final l10n  = context.l10n;
//     final isDark = context.watch<ThemeProvider>().isDarkMode;
//     final bg    = isDark ? AppColors.bgDark : AppColors.bgLight;

//     return Scaffold(
//       backgroundColor: bg,
//       body: RefreshIndicator(
//         onRefresh: _load,
//         color: AppColors.primary,
//         child: CustomScrollView(
//           controller: _scroll,
//           physics: const AlwaysScrollableScrollPhysics(),
//           slivers: [
//             SliverToBoxAdapter(child: _buildHeader(l10n, isDark)),
//             // SliverToBoxAdapter(child: _buildSearchBar(l10n, isDark)),
//             SliverToBoxAdapter(child: _buildCategories(isDark)),
//             // Section algo génétique
//             SliverToBoxAdapter(child: _buildRecommended(isDark, l10n)),
//             // Logements récents
//             SliverToBoxAdapter(
//                 child: _buildSectionHeader(l10n.recentListings, l10n.seeAll, isDark)),
//             _buildList(isDark),
//             const SliverToBoxAdapter(child: SizedBox(height: 100)),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildHeader(AppL10n l10n, bool isDark) {
//     final user      = context.watch<AuthProvider>().user;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

//     return SafeArea(
//       bottom: false,
//       child: Padding(
//         padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
//         child: Row(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Expanded(
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(l10n.discover,
//                       style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 26)),
//                   const SizedBox(height: 4),
//                   Text(l10n.tagline, style: TextStyle(color: subColor, fontSize: 13)),
//                 ],
//               ),
//             ),
//             Row(
//               children: [
//               //   // Notif
//               //   GestureDetector(
//               //     onTap: () => Navigator.push(context,
//               //         MaterialPageRoute(builder: (_) => const NotificationsScreen())),
//               //     child: Container(
//               //       width: 44, height: 44,
//               //       decoration: BoxDecoration(
//               //         color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
//               //         borderRadius: BorderRadius.circular(12),
//               //         border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
//               //       ),
//               //       child: Stack(
//               //         alignment: Alignment.center,
//               //         children: [
//               //           Icon(Icons.notifications_outlined, size: 22, color: textColor),
//               //           Positioned(top: 8, right: 8,
//               //               child: Container(width: 8, height: 8,
//               //                   decoration: const BoxDecoration(color: AppColors.danger, shape: BoxShape.circle))),
//               //         ],
//               //       ),
//               //     ),
//               //   ),
//               //   const SizedBox(width: 10),
//               //   // Avatar
//               //   GestureDetector(
//               //     onTap: () => Navigator.pushNamed(context, '/profile'),
//               //     child: CircleAvatar(
//               //       radius: 22, backgroundColor: AppColors.primary,
//               //       backgroundImage: user?.photo != null ? NetworkImage(user!.photo!) : null,
//               //       child: user?.photo == null
//               //           ? Text(user?.initials ?? 'U',
//               //               style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16))
//               //           : null,
//               //     ),
//               //   ),
//               ],
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildSearchBar(AppL10n l10n, bool isDark) {
//     final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
//     final border  = isDark ? AppColors.borderDark  : AppColors.borderLight;
//     final hint    = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;

//     return Padding(
//       padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
//       child: Row(
//         children: [
//           Expanded(
//             child: GestureDetector(
//               onTap: () => Navigator.pushNamed(context, '/search'),
//               child: Container(
//                 height: 50,
//                 padding: const EdgeInsets.symmetric(horizontal: 16),
//                 decoration: BoxDecoration(
//                   color: surface, borderRadius: BorderRadius.circular(14),
//                   border: Border.all(color: border),
//                 ),
//                 child: Row(
//                   children: [
//                     Icon(Icons.search, size: 20, color: hint),
//                     const SizedBox(width: 10),
//                     Text(l10n.searchHint, style: TextStyle(color: hint, fontSize: 14)),
//                   ],
//                 ),
//               ),
//             ),
//           ),
//           const SizedBox(width: 10),
//           GestureDetector(
//             onTap: () => Navigator.pushNamed(context, '/search'),
//             child: Container(
//               width: 50, height: 50,
//               decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(14)),
//               child: const Icon(Icons.tune, color: Colors.white, size: 22),
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildCategories(bool isDark) {
//     return Consumer<HousingProvider>(
//       builder: (context, hp, _) {
//         final chips = <Map<String, dynamic>>[
//           {'id': null, 'name': 'Tous', 'icon': Icons.home_outlined},
//           ...hp.categories.take(5).map((c) => {'id': c.id, 'name': c.name, 'icon': Icons.apartment_outlined}),
//         ];
//         return SizedBox(
//           height: 48,
//           child: ListView.builder(
//             scrollDirection: Axis.horizontal,
//             padding: const EdgeInsets.symmetric(horizontal: 16),
//             itemCount: chips.length,
//             itemBuilder: (_, i) {
//               final chip = chips[i];
//               final sel  = _catIndex == i;
//               final color = sel ? Colors.white : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight);
//               return GestureDetector(
//                 onTap: () {
//                   setState(() => _catIndex = i);
//                   context.read<HousingProvider>().setFilters(categoryId: chip['id'] as int?);
//                 },
//                 child: AnimatedContainer(
//                   duration: const Duration(milliseconds: 180),
//                   margin: const EdgeInsets.only(right: 10),
//                   padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
//                   decoration: BoxDecoration(
//                     color: sel ? AppColors.primary : (isDark ? AppColors.surfaceDark : AppColors.surfaceLight),
//                     borderRadius: BorderRadius.circular(24),
//                     border: Border.all(color: sel ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight)),
//                   ),
//                   child: Row(
//                     mainAxisSize: MainAxisSize.min,
//                     children: [
//                       Icon(chip['icon'] as IconData, size: 15, color: color),
//                       const SizedBox(width: 6),
//                       Text(chip['name'] as String,
//                           style: TextStyle(color: color, fontSize: 13,
//                               fontWeight: sel ? FontWeight.w600 : FontWeight.normal)),
//                     ],
//                   ),
//                 ),
//               );
//             },
//           ),
//         );
//       },
//     );
//   }

//   // ── Section algo génétique ────────────────────────────────
//   Widget _buildRecommended(bool isDark, AppL10n l10n) {
//     return Consumer2<AuthProvider, HousingProvider>(
//       builder: (context, auth, hp, _) {
//         if (auth.user == null) return const SizedBox.shrink();
//         if (hp.recommended.isEmpty) {
//           // Afficher une invitation à remplir les préférences
//           return Padding(
//             padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
//             child: GestureDetector(
//               onTap: () => Navigator.pushNamed(context, '/preferences'),
//               child: Container(
//                 padding: const EdgeInsets.all(16),
//                 decoration: BoxDecoration(
//                   gradient: LinearGradient(
//                     colors: [AppColors.secondary.withOpacity(0.15), AppColors.primary.withOpacity(0.1)],
//                     begin: Alignment.topLeft, end: Alignment.bottomRight,
//                   ),
//                   borderRadius: BorderRadius.circular(16),
//                   border: Border.all(color: AppColors.secondary.withOpacity(0.3)),
//                 ),
//                 child: Row(
//                   children: [
//                     const Icon(Icons.auto_awesome_rounded, color: AppColors.secondary, size: 28),
//                     const SizedBox(width: 12),
//                     Expanded(
//                       child: Column(
//                         crossAxisAlignment: CrossAxisAlignment.start,
//                         children: [
//                           Text('Activez les suggestions intelligentes',
//                               style: TextStyle(
//                                   color: isDark ? AppColors.textDark : AppColors.textLight,
//                                   fontWeight: FontWeight.bold, fontSize: 14)),
//                           const SizedBox(height: 4),
//                           const Text('Configurez vos préférences pour recevoir des recommandations personnalisées',
//                               style: TextStyle(color: AppColors.secondary, fontSize: 12)),
//                         ],
//                       ),
//                     ),
//                     const Icon(Icons.chevron_right_rounded, color: AppColors.secondary),
//                   ],
//                 ),
//               ),
//             ),
//           );
//         }

//         return Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Padding(
//               padding: const EdgeInsets.fromLTRB(20, 20, 16, 12),
//               child: Row(
//                 children: [
//                   const Icon(Icons.auto_awesome_rounded, color: AppColors.secondary, size: 18),
//                   const SizedBox(width: 8),
//                   Text('Pour vous',
//                       style: TextStyle(
//                           color: isDark ? AppColors.textDark : AppColors.textLight,
//                           fontSize: 17, fontWeight: FontWeight.bold)),
//                   const SizedBox(width: 6),
//                   Container(
//                     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
//                     decoration: BoxDecoration(
//                       color: AppColors.secondary.withOpacity(0.12),
//                       borderRadius: BorderRadius.circular(20),
//                     ),
//                     child: const Text('IA',
//                         style: TextStyle(color: AppColors.secondary, fontSize: 10, fontWeight: FontWeight.bold)),
//                   ),
//                 ],
//               ),
//             ),
//             SizedBox(
//               height: 230,
//               child: ListView.builder(
//                 scrollDirection: Axis.horizontal,
//                 padding: const EdgeInsets.symmetric(horizontal: 16),
//                 itemCount: hp.recommended.length.clamp(0, 6),
//                 itemBuilder: (_, i) => Padding(
//                   padding: const EdgeInsets.only(right: 12),
//                   child: _RecommendedCard(housing: hp.recommended[i], isDark: isDark),
//                 ),
//               ),
//             ),
//           ],
//         );
//       },
//     );
//   }

//   Widget _buildSectionHeader(String title, String action, bool isDark) {
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     return Padding(
//       padding: const EdgeInsets.fromLTRB(20, 20, 16, 12),
//       child: Row(
//         mainAxisAlignment: MainAxisAlignment.spaceBetween,
//         children: [
//           Text(title,
//               style: TextStyle(color: textColor, fontSize: 17, fontWeight: FontWeight.bold)),
//           TextButton(
//             onPressed: () => Navigator.pushNamed(context, '/search'),
//             style: TextButton.styleFrom(
//                 foregroundColor: AppColors.primary, padding: EdgeInsets.zero,
//                 minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
//             child: Text(action, style: const TextStyle(fontSize: 13, color: AppColors.primary)),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildList(bool isDark) {
//     return Consumer<HousingProvider>(
//       builder: (context, hp, _) {
//         if (hp.isLoading) {
//           return const SliverToBoxAdapter(
//             child: Padding(padding: EdgeInsets.all(64),
//                 child: Center(child: CircularProgressIndicator(color: AppColors.primary))));
//         }
//         if (hp.error != null) {
//           return SliverToBoxAdapter(
//             child: Padding(
//               padding: const EdgeInsets.all(32),
//               child: Column(
//                 children: [
//                   const Icon(Icons.wifi_off_rounded, size: 52, color: Colors.grey),
//                   const SizedBox(height: 12),
//                   const Text('Erreur de chargement'),
//                   const SizedBox(height: 12),
//                   ElevatedButton(onPressed: _load, child: const Text('Réessayer')),
//                 ],
//               ),
//             ),
//           );
//         }
//         if (hp.housings.isEmpty) {
//           return const SliverToBoxAdapter(
//             child: Padding(padding: EdgeInsets.all(48),
//                 child: Center(child: Text('Aucun logement trouvé'))));
//         }
//         return SliverPadding(
//           padding: const EdgeInsets.symmetric(horizontal: 16),
//           sliver: SliverList(
//             delegate: SliverChildBuilderDelegate(
//               (ctx, i) {
//                 if (i == hp.housings.length) {
//                   return Padding(
//                     padding: const EdgeInsets.symmetric(vertical: 12),
//                     child: Center(
//                       child: TextButton.icon(
//                         onPressed: hp.isLoadingMore ? null : hp.loadMore,
//                         icon: hp.isLoadingMore
//                             ? const SizedBox(width: 14, height: 14,
//                                 child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
//                             : const Icon(Icons.add_circle_outline, color: AppColors.primary, size: 18),
//                         label: Text(hp.isLoadingMore ? 'Chargement…' : 'Charger plus',
//                             style: const TextStyle(color: AppColors.primary, fontSize: 13)),
//                       ),
//                     ),
//                   );
//                 }
//                 return Padding(
//                   padding: const EdgeInsets.only(bottom: 16),
//                   child: HousingCard(housing: hp.housings[i]),
//                 );
//               },
//               childCount: hp.housings.length + 1,
//             ),
//           ),
//         );
//       },
//     );
//   }
// }

// // ── Mini card recommandation ─────────────────────────────────
// class _RecommendedCard extends StatelessWidget {
//   final HousingModel housing;
//   final bool isDark;
//   const _RecommendedCard({required this.housing, required this.isDark});

//   @override
//   Widget build(BuildContext context) {
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

//     return GestureDetector(
//       onTap: () => Navigator.push(context,
//           MaterialPageRoute(builder: (_) => HousingDetailScreen(housingId: housing.id))),
//       child: Container(
//         width: 180,
//         decoration: BoxDecoration(
//           color: isDark ? AppColors.cardDark : AppColors.cardLight,
//           borderRadius: BorderRadius.circular(16),
//           border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
//         ),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             Expanded(
//               child: ClipRRect(
//                 borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
//                 child: housing.mainImage != null
//                     ? CachedNetworkImage(imageUrl: housing.mainImage!,
//                         fit: BoxFit.cover, width: double.infinity)
//                     : Container(color: AppColors.surfaceDark,
//                         child: const Icon(Icons.home, color: AppColors.textMutedDark)),
//               ),
//             ),
//             Padding(
//               padding: const EdgeInsets.all(10),
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(housing.displayName,
//                       style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 12),
//                       maxLines: 1, overflow: TextOverflow.ellipsis),
//                   const SizedBox(height: 3),
//                   Text('${_fmt(housing.price)} FCFA/mois',
//                       style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold)),
//                   const SizedBox(height: 3),
//                   Row(
//                     children: [
//                       Icon(Icons.location_on, size: 10, color: subColor),
//                       const SizedBox(width: 2),
//                       Expanded(child: Text(housing.locationStr,
//                           style: TextStyle(color: subColor, fontSize: 10),
//                           maxLines: 1, overflow: TextOverflow.ellipsis)),
//                     ],
//                   ),
//                 ],
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   String _fmt(int p) {
//     final s = p.toString();
//     final buf = StringBuffer();
//     for (var i = 0; i < s.length; i++) {
//       if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
//       buf.write(s[i]);
//     }
//     return buf.toString();
//   }
// }



// lib/screens/home/home_screen.dart
//
// ✅ FIX LANGUE TEMPS RÉEL (v3 — méthode addListener) :
//    La méthode didChangeDependencies() ne fonctionne PAS fiablement
//    pour les ChangeNotifier. On utilise addListener() directement sur
//    ThemeProvider dans initState() → removeListener() dans dispose().
//
// ✅ FIX clés L10n manquantes :
//    • l10n.forYou    → "Pour vous" / "For you"
//    • l10n.all       → "Tous" / "All"
//    • l10n.perMonth  → "/mois" / "/month" dans _RecommendedCard
//
// ✅ FIX hardcodés FR :
//    • 'Erreur de chargement' → l10n.error
//    • 'Réessayer' → l10n.retry
//    • 'Aucun logement trouvé' → l10n.noHousing
//    • 'Chargement…' / 'Charger plus' → l10n.loading / l10n.loadMore

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/housing_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../widgets/housing/housing_card.dart';
import '../notifications/notifications_screen.dart';
import '../housing/housing_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int   _catIndex = 0;
  final _scroll   = ScrollController();

  // ✅ Référence directe au ThemeProvider pour addListener/removeListener
  late ThemeProvider _themeProvider;
  String _currentLanguage = '';

  @override
  void initState() {
    super.initState();
    // Attendre que le contexte soit prêt avant d'accéder aux providers
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _themeProvider = context.read<ThemeProvider>();
      _currentLanguage = _themeProvider.language;
      // ✅ Écouter DIRECTEMENT les changements du ThemeProvider
      _themeProvider.addListener(_onLanguageChange);
      _load();
    });
  }

  // ✅ Callback déclenché à chaque notifyListeners() du ThemeProvider
  void _onLanguageChange() {
    final newLang = _themeProvider.language;
    if (newLang != _currentLanguage && mounted) {
      setState(() => _currentLanguage = newLang);
      // Recharger les données depuis Django avec le nouveau header X-Language
      _load();
    }
  }

  @override
  void dispose() {
    // ✅ Désinscription propre pour éviter les memory leaks
    _themeProvider.removeListener(_onLanguageChange);
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    final hp   = context.read<HousingProvider>();
    final user = context.read<AuthProvider>().user;
    await Future.wait([
      hp.fetchHousings(),
      hp.fetchCategories(),
      if (user != null) hp.fetchRecommended(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final l10n   = context.l10n;
    // ✅ context.watch crée la dépendance → rebuild quand isDarkMode change
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Scaffold(
      backgroundColor: bg,
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.primary,
        child: CustomScrollView(
          controller: _scroll,
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(child: _buildHeader(l10n, isDark)),
            // SliverToBoxAdapter(child: _buildSearchBar(l10n, isDark)),
            SliverToBoxAdapter(child: _buildCategories(isDark, l10n)),
            SliverToBoxAdapter(child: _buildRecommended(isDark, l10n)),
            SliverToBoxAdapter(
                child: _buildSectionHeader(
                    l10n.recentListings, l10n.seeAll, isDark)),
            _buildList(isDark, l10n),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  Widget _buildHeader(AppL10n l10n, bool isDark) {
    final user      = context.watch<AuthProvider>().user;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
        child: Row(children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ✅ Traduit
                Text(l10n.discover,
                    style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 26)),
                const SizedBox(height: 4),
                // ✅ Traduit
                Text(l10n.tagline,
                    style: TextStyle(color: subColor, fontSize: 13)),
              ],
            ),
          ),
          // Row(children: [
          //   GestureDetector(
          //     onTap: () => Navigator.push(
          //         context,
          //         MaterialPageRoute(
          //             builder: (_) => const NotificationsScreen())),
          //     child: Container(
          //       width: 44, height: 44,
          //       decoration: BoxDecoration(
          //         color: isDark
          //             ? AppColors.surfaceDark
          //             : AppColors.surfaceLight,
          //         borderRadius: BorderRadius.circular(12),
          //         border: Border.all(
          //             color: isDark
          //                 ? AppColors.borderDark
          //                 : AppColors.borderLight),
          //       ),
          //       child: Stack(alignment: Alignment.center, children: [
          //         Icon(Icons.notifications_outlined,
          //             size: 22, color: textColor),
          //         Positioned(
          //           top: 8, right: 8,
          //           child: Container(
          //             width: 8, height: 8,
          //             decoration: const BoxDecoration(
          //                 color: AppColors.danger,
          //                 shape: BoxShape.circle),
          //           ),
          //         ),
          //       ]),
          //     ),
          //   ),
          //   const SizedBox(width: 10),
          //   CircleAvatar(
          //     radius: 22,
          //     backgroundColor: AppColors.primary,
          //     backgroundImage: user?.photo != null
          //         ? NetworkImage(user!.photo!)
          //         : null,
          //     child: user?.photo == null
          //         ? Text(user?.initials ?? 'U',
          //             style: const TextStyle(
          //                 color: Colors.white,
          //                 fontWeight: FontWeight.bold,
          //                 fontSize: 16))
          //         : null,
          //   ),
          // ]),
        ]),
      ),
    );
  }

  // ── SearchBar ───────────────────────────────────────────────────────────────
  Widget _buildSearchBar(AppL10n l10n, bool isDark) {
    final surface = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border  = isDark ? AppColors.borderDark  : AppColors.borderLight;
    final hint    = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(children: [
        Expanded(
          child: GestureDetector(
            onTap: () => Navigator.pushNamed(context, '/search'),
            child: Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                  color: surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: border)),
              child: Row(children: [
                Icon(Icons.search, size: 20, color: hint),
                const SizedBox(width: 10),
                // ✅ Traduit
                Text(l10n.searchHint,
                    style: TextStyle(color: hint, fontSize: 14)),
              ]),
            ),
          ),
        ),
        const SizedBox(width: 10),
        GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/search'),
          child: Container(
            width: 50, height: 50,
            decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(14)),
            child: const Icon(Icons.tune, color: Colors.white, size: 22),
          ),
        ),
      ]),
    );
  }

  // ── Catégories chips ────────────────────────────────────────────────────────
  Widget _buildCategories(bool isDark, AppL10n l10n) {
    return Consumer<HousingProvider>(
      builder: (context, hp, _) {
        final chips = <Map<String, dynamic>>[
          // ✅ "Tous" traduit via l10n.all
          {'id': null, 'name': l10n.all, 'icon': Icons.home_outlined},
          ...hp.categories.take(5).map((c) => {
            'id': c.id,
            'name': c.name, // vient du backend → déjà traduit par X-Language
            'icon': Icons.apartment_outlined,
          }),
        ];
        return SizedBox(
          height: 48,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: chips.length,
            itemBuilder: (_, i) {
              final chip = chips[i];
              final sel  = _catIndex == i;
              final col  = sel
                  ? Colors.white
                  : (isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight);
              return GestureDetector(
                onTap: () {
                  setState(() => _catIndex = i);
                  context
                      .read<HousingProvider>()
                      .setFilters(categoryId: chip['id'] as int?);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  margin: const EdgeInsets.only(right: 10),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: sel
                        ? AppColors.primary
                        : (isDark
                            ? AppColors.surfaceDark
                            : AppColors.surfaceLight),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                        color: sel
                            ? AppColors.primary
                            : (isDark
                                ? AppColors.borderDark
                                : AppColors.borderLight)),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(chip['icon'] as IconData, size: 15, color: col),
                    const SizedBox(width: 6),
                    Text(chip['name'] as String,
                        style: TextStyle(
                            color: col,
                            fontSize: 13,
                            fontWeight: sel
                                ? FontWeight.w600
                                : FontWeight.normal)),
                  ]),
                ),
              );
            },
          ),
        );
      },
    );
  }

  // ── Section "Pour vous / For you" ───────────────────────────────────────────
  Widget _buildRecommended(bool isDark, AppL10n l10n) {
    return Consumer2<AuthProvider, HousingProvider>(
      builder: (context, auth, hp, _) {
        if (auth.user == null) return const SizedBox.shrink();

        if (hp.recommended.isEmpty) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: GestureDetector(
              onTap: () => Navigator.pushNamed(context, '/preferences'),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.secondary.withOpacity(0.15),
                      AppColors.primary.withOpacity(0.1),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: AppColors.secondary.withOpacity(0.3)),
                ),
                child: Row(children: [
                  const Icon(Icons.auto_awesome_rounded,
                      color: AppColors.secondary, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ✅ Traduit
                        Text(l10n.activateSuggestions,
                            style: TextStyle(
                                color: isDark
                                    ? AppColors.textDark
                                    : AppColors.textLight,
                                fontWeight: FontWeight.bold,
                                fontSize: 14)),
                        const SizedBox(height: 4),
                        // ✅ Traduit
                        Text(l10n.configurePref,
                            style: const TextStyle(
                                color: AppColors.secondary, fontSize: 12)),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right_rounded,
                      color: AppColors.secondary),
                ]),
              ),
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 16, 12),
              child: Row(children: [
                const Icon(Icons.auto_awesome_rounded,
                    color: AppColors.secondary, size: 18),
                const SizedBox(width: 8),
                // ✅ "Pour vous" / "For you" traduit
                Text(l10n.forYou,
                    style: TextStyle(
                        color: isDark
                            ? AppColors.textDark
                            : AppColors.textLight,
                        fontSize: 17,
                        fontWeight: FontWeight.bold)),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                      color: AppColors.secondary.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20)),
                  child: const Text('IA',
                      style: TextStyle(
                          color: AppColors.secondary,
                          fontSize: 10,
                          fontWeight: FontWeight.bold)),
                ),
              ]),
            ),
            SizedBox(
              height: 230,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: hp.recommended.length.clamp(0, 6),
                itemBuilder: (_, i) => Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: _RecommendedCard(
                      housing: hp.recommended[i],
                      isDark: isDark,
                      l10n: l10n),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  // ── Section header ──────────────────────────────────────────────────────────
  Widget _buildSectionHeader(String title, String action, bool isDark) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 16, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title,
              style: TextStyle(
                  color: textColor,
                  fontSize: 17,
                  fontWeight: FontWeight.bold)),
          TextButton(
            onPressed: () => Navigator.pushNamed(context, '/search'),
            style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap),
            child: Text(action,
                style: const TextStyle(
                    fontSize: 13, color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  // ── Liste logements ─────────────────────────────────────────────────────────
  Widget _buildList(bool isDark, AppL10n l10n) {
    return Consumer<HousingProvider>(
      builder: (context, hp, _) {
        if (hp.isLoading) {
          return const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(64),
              child: Center(
                  child: CircularProgressIndicator(
                      color: AppColors.primary)),
            ),
          );
        }
        if (hp.error != null) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(children: [
                const Icon(Icons.wifi_off_rounded,
                    size: 52, color: Colors.grey),
                const SizedBox(height: 12),
                // ✅ Traduit
                Text(l10n.error,
                    style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 12),
                ElevatedButton(
                    onPressed: _load,
                    // ✅ Traduit
                    child: Text(l10n.retry)),
              ]),
            ),
          );
        }
        if (hp.housings.isEmpty) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(48),
              child: Center(
                // ✅ Traduit
                child: Text(l10n.noHousing,
                    style: const TextStyle(color: Colors.grey)),
              ),
            ),
          );
        }
        return SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (ctx, i) {
                if (i == hp.housings.length) {
                  return Padding(
                    padding:
                        const EdgeInsets.symmetric(vertical: 12),
                    child: Center(
                      child: TextButton.icon(
                        onPressed:
                            hp.isLoadingMore ? null : hp.loadMore,
                        icon: hp.isLoadingMore
                            ? const SizedBox(
                                width: 14, height: 14,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.primary))
                            : const Icon(Icons.add_circle_outline,
                                color: AppColors.primary, size: 18),
                        label: Text(
                          // ✅ Traduit
                          hp.isLoadingMore
                              ? l10n.loading
                              : l10n.loadMore,
                          style: const TextStyle(
                              color: AppColors.primary, fontSize: 13),
                        ),
                      ),
                    ),
                  );
                }
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: HousingCard(housing: hp.housings[i]),
                );
              },
              childCount: hp.housings.length + 1,
            ),
          ),
        );
      },
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Carte recommandée (section "Pour vous")
// ══════════════════════════════════════════════════════════════════════════════
class _RecommendedCard extends StatelessWidget {
  final HousingModel housing;
  final bool isDark;
  final AppL10n l10n;
  const _RecommendedCard(
      {required this.housing, required this.isDark, required this.l10n});

  @override
  Widget build(BuildContext context) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    return GestureDetector(
      onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) =>
                  HousingDetailScreen(housingId: housing.id))),
      child: Container(
        width: 180,
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color: isDark
                  ? AppColors.borderDark
                  : AppColors.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(16)),
                child: housing.mainImage != null
                    ? CachedNetworkImage(
                        imageUrl: housing.mainImage!,
                        fit: BoxFit.cover,
                        width: double.infinity)
                    : Container(
                        color: AppColors.surfaceDark,
                        child: const Icon(Icons.home,
                            color: AppColors.textMutedDark)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(housing.displayName,
                      style: TextStyle(
                          color: textColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 3),
                  // ✅ perMonth traduit
                  Text('${_fmt(housing.price)} FCFA${l10n.perMonth}',
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 3),
                  Row(children: [
                    Icon(Icons.location_on, size: 10, color: subColor),
                    const SizedBox(width: 2),
                    Expanded(
                      child: Text(housing.locationStr,
                          style:
                              TextStyle(color: subColor, fontSize: 10),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ),
                  ]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _fmt(int p) {
    if (p >= 1000000) {
      return '${(p / 1000000).toStringAsFixed(1)}M';
    }
    final s = p.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }
}