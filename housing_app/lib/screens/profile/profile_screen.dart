
// // lib/screens/profile/profile_screen.dart
// // ✅ Un seul ProfileScreen pour TOUS les rôles
// // ✅ isStaff → onglets : Tableau de bord | Utilisateurs | Logements | Paramètres
// // ✅ isProprietaire → Tableau de bord | Mes annonces | Réservations | Paramètres
// // ✅ isLocataire → Tableau de bord | Mes favoris | Mes visites | Paramètres
// // ✅ Badge rôle corrigé : Admin (rouge) | Propriétaire (vert) | Locataire (bleu)
// // ✅ Supprime AdminDashboardScreen séparé

// import 'package:flutter/material.dart';
// import 'package:provider/provider.dart';
// import 'package:cached_network_image/cached_network_image.dart';
// import '../../widgets/app_bar_widget.dart';
// import '../../core/constants/app_colors.dart';
// import '../../core/l10n/app_localizations.dart';
// import '../../data/models/housing_model.dart';
// import '../../data/models/user_model.dart';
// import '../../data/models/visit_model.dart';
// import '../../data/providers/auth_provider.dart';
// import '../../data/providers/theme_provider.dart';
// import '../../data/services/api_service.dart';
// import '../housing/add_housing_screen.dart';
// import '../housing/housing_detail_screen.dart';
// import '../support/support_screen.dart';
// import '../preferences/preferences_screen.dart';
// import 'edit_profile_screen.dart';

// class ProfileScreen extends StatefulWidget {
//   const ProfileScreen({super.key});
//   @override
//   State<ProfileScreen> createState() => _ProfileScreenState();
// }

// class _ProfileScreenState extends State<ProfileScreen>
//     with TickerProviderStateMixin {
//   late TabController _tabs;
//   final _api = ApiService();

//   // Données locataire/proprio
//   List<HousingModel> _favorites    = [];
//   List<VisitModel>   _visits       = [];
//   List<HousingModel> _myHousings   = [];
//   List<VisitModel>   _reservations = [];
//   // Données admin
//   Map<String, dynamic> _adminStats    = {};
//   List<UserModel>      _allAdminUsers = []; // ✅ liste complète (jamais filtrée)
//   List<HousingModel>   _adminHousings = [];

//   bool _loadingFav = false, _loadingVis = false;
//   bool _loadingHousing = false, _loadingRes = false;
//   bool _loadingAdminStats = false, _loadingAdminUsers = false;
//   bool _loadingAdminHousings = false;

//   String _visitFilter   = 'all';
//   String _housingFilter = 'all';
//   String _resFilter     = 'all';
//   String _adminUserRole = 'all';

//   @override
//   void initState() {
//     super.initState();
//     _initTabs();
//     WidgetsBinding.instance.addPostFrameCallback((_) => _loadAll());
//   }

//   void _initTabs() {
//     final user = context.read<AuthProvider>().user;
//     _tabs = TabController(length: 4, vsync: this);
//   }

//   @override
//   void dispose() { _tabs.dispose(); super.dispose(); }

//   bool get _isAdmin => context.read<AuthProvider>().user?.isStaff == true;
//   bool get _isOwner => context.read<AuthProvider>().user?.isProprietaire == true;

//   Future<void> _loadAll() async {
//     if (_isAdmin) {
//       await Future.wait([_loadAdminStats(), _loadAdminUsers(), _loadAdminHousings()]);
//     } else {
//       await Future.wait([
//         _loadFavorites(), _loadVisits(),
//         if (_isOwner) ...[_loadMyHousings(), _loadReservations()],
//       ]);
//     }
//   }

//   Future<void> _loadFavorites() async {
//     setState(() => _loadingFav = true);
//     try { _favorites = await _api.getFavorites(); } catch (_) {}
//     if (mounted) setState(() => _loadingFav = false);
//   }
//   Future<void> _loadVisits() async {
//     setState(() => _loadingVis = true);
//     try { _visits = await _api.getVisits(); } catch (_) {}
//     if (mounted) setState(() => _loadingVis = false);
//   }
//   Future<void> _loadMyHousings() async {
//     setState(() => _loadingHousing = true);
//     try { _myHousings = await _api.getMyHousings(); } catch (_) {}
//     if (mounted) setState(() => _loadingHousing = false);
//   }
//   Future<void> _loadReservations() async {
//     setState(() => _loadingRes = true);
//     try { _reservations = await _api.getVisits(); } catch (_) {}
//     if (mounted) setState(() => _loadingRes = false);
//   }
//   Future<void> _loadAdminStats() async {
//     setState(() => _loadingAdminStats = true);
//     try { _adminStats = await _api.getAdminStats(); } catch (_) {}
//     if (mounted) setState(() => _loadingAdminStats = false);
//   }
//   Future<void> _loadAdminUsers() async {
//     setState(() => _loadingAdminUsers = true);
//     // ✅ Charge TOUT sans filtre côté API — le getter filtre en mémoire
//     try { _allAdminUsers = await _api.getAdminUsers(); } catch (_) {}
//     if (mounted) setState(() => _loadingAdminUsers = false);
//   }

//   // ✅ Getter filtre client-side — instantané, pas de réseau
//   List<UserModel> get _filteredAdminUsers {
//     switch (_adminUserRole) {
//       case 'proprietaire':
//         return _allAdminUsers.where((u) => u.isProprietaire).toList();
//       case 'locataire':
//         return _allAdminUsers.where((u) => u.isLocataire).toList();
//       default:
//         return _allAdminUsers;
//     }
//   }
//   Future<void> _loadAdminHousings() async {
//     setState(() => _loadingAdminHousings = true);
//     try { _adminHousings = await _api.getAdminHousings(); } catch (_) {}
//     if (mounted) setState(() => _loadingAdminHousings = false);
//   }

//   List<VisitModel>   get _filtVisits   => _visitFilter   == 'all' ? _visits    : _visits.where((v) => v.status == _visitFilter).toList();
//   List<HousingModel> get _filtHousings => _housingFilter == 'all' ? _myHousings : _myHousings.where((h) => h.status == _housingFilter).toList();
//   List<VisitModel>   get _filtRes      => _resFilter     == 'all' ? _reservations : _reservations.where((v) => v.status == _resFilter).toList();

//   @override
//   Widget build(BuildContext context) {
//     final isDark    = context.watch<ThemeProvider>().isDarkMode;
//     final auth      = context.watch<AuthProvider>();
//     final user      = auth.user;
//     final theme     = context.watch<ThemeProvider>();
//     final l10n      = context.l10n;
//     final bg        = isDark ? AppColors.bgDark : AppColors.bgLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
//     final isAdmin   = user?.isStaff == true;
//     final isOwner   = user?.isProprietaire == true;

//     // ✅ Couleur de l'indicateur selon le rôle
//     final tabColor = isAdmin ? AppColors.danger : AppColors.primary;

//     // Labels onglets
//     final tab2 = isAdmin ? 'Utilisateurs' : (isOwner ? l10n.myListings : l10n.myFavorites);
//     final tab3 = isAdmin ? 'Logements'    : (isOwner ? 'Réservations'  : l10n.myVisits);

//     return Scaffold(
//       backgroundColor: bg,
//       appBar: const RentalAppBar(showBack: false),
//       body: NestedScrollView(
//         headerSliverBuilder: (_, __) => [
//           SliverToBoxAdapter(
//             child: _buildHeader(user, isDark, textColor, subColor, l10n, auth, theme, isAdmin, isOwner, tabColor)),
//           SliverPersistentHeader(
//             pinned: true,
//             delegate: _TabDelegate(
//               TabBar(
//                 controller: _tabs,
//                 isScrollable: true,
//                 labelColor: tabColor,
//                 unselectedLabelColor: subColor,
//                 indicatorColor: tabColor,
//                 indicatorSize: TabBarIndicatorSize.label,
//                 dividerColor: Colors.transparent,
//                 tabs: [
//                   const Tab(text: 'Tableau de bord'),
//                   Tab(text: tab2),
//                   Tab(text: tab3),
//                   const Tab(text: 'Paramètres'),
//                 ],
//               ),
//               isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
//             ),
//           ),
//         ],
//         body: TabBarView(
//           controller: _tabs,
//           children: isAdmin
//               ? [
//                   _buildAdminDashTab(isDark, textColor, subColor, l10n, auth, theme),
//                   _buildAdminUsersTab(isDark, textColor, subColor),
//                   _buildAdminHousingsTab(isDark, textColor, subColor),
//                   _buildSettingsTab(isDark, textColor, subColor, l10n, theme, auth),
//                 ]
//               : isOwner
//                   ? [
//                       _buildDashTab(user, isDark, textColor, subColor, l10n, true, theme, auth),
//                       _buildMyHousingsTab(isDark, l10n),
//                       _buildReservationsTab(isDark, l10n),
//                       _buildSettingsTab(isDark, textColor, subColor, l10n, theme, auth),
//                     ]
//                   : [
//                       _buildDashTab(user, isDark, textColor, subColor, l10n, false, theme, auth),
//                       _buildFavoritesTab(isDark),
//                       _buildVisitsTab(isDark, l10n),
//                       _buildSettingsTab(isDark, textColor, subColor, l10n, theme, auth),
//                     ],
//         ),
//       ),
//     );
//   }

//   // ── Header commun à tous ─────────────────────────────────
//   Widget _buildHeader(user, bool isDark, Color textColor, Color subColor,
//       AppL10n l10n, AuthProvider auth, ThemeProvider theme,
//       bool isAdmin, bool isOwner, Color badgeColor) {
//     final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

//     // ✅ Badge rôle
//     String badgeLabel;
//     if (isAdmin)       badgeLabel = 'Administrateur';
//     else if (isOwner)  badgeLabel = l10n.owner;
//     else               badgeLabel = l10n.tenant;

//     return Container(
//       color: bg,
//       padding: EdgeInsets.only(
//           top: MediaQuery.of(context).padding.top + 8,
//           left: 20, right: 20, bottom: 16),
//       child: Column(children: [
//         Row(children: [
//           GestureDetector(
//             onTap: () => Navigator.push(context,
//                 MaterialPageRoute(builder: (_) => const EditProfileScreen()))
//                 .then((_) => setState(() {})),
//             child: Stack(children: [
//               CircleAvatar(
//                 radius: 38,
//                 backgroundColor: badgeColor.withOpacity(0.15),
//                 backgroundImage: user?.photo != null ? NetworkImage(user!.photo!) : null,
//                 child: user?.photo == null
//                     ? Text(user?.initials ?? 'U',
//                         style: TextStyle(fontSize: 26,
//                             fontWeight: FontWeight.bold, color: badgeColor))
//                     : null,
//               ),
//               Positioned(bottom: 0, right: 0,
//                 child: Container(width: 22, height: 22,
//                   decoration: BoxDecoration(color: badgeColor,
//                       shape: BoxShape.circle,
//                       border: Border.all(color: bg, width: 2)),
//                   child: const Icon(Icons.edit_rounded,
//                       color: Colors.white, size: 11))),
//             ]),
//           ),
//           const SizedBox(width: 16),
//           Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//             Text(
//               user?.fullName?.trim().isNotEmpty == true
//                   ? user!.fullName
//                   : (user?.username ?? 'Utilisateur'),
//               style: TextStyle(color: textColor, fontSize: 17, fontWeight: FontWeight.bold)),
//             const SizedBox(height: 2),
//             Text('@${user?.username ?? ''}',
//                 style: TextStyle(color: subColor, fontSize: 12)),
//             const SizedBox(height: 6),
//             Row(children: [
//               // ✅ Badge coloré selon le rôle
//               Container(
//                 padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
//                 decoration: BoxDecoration(
//                   color: badgeColor.withOpacity(0.15),
//                   borderRadius: BorderRadius.circular(20),
//                   border: Border.all(color: badgeColor.withOpacity(0.4)),
//                 ),
//                 child: Text(badgeLabel,
//                     style: TextStyle(color: badgeColor, fontSize: 11,
//                         fontWeight: FontWeight.w600)),
//               ),
//               const SizedBox(width: 6),
//               const Icon(Icons.verified_rounded, color: AppColors.success, size: 15),
//             ]),
//           ])),
//         ]),
//         const SizedBox(height: 14),
//         // 4 raccourcis rapides
//         Row(children: [
//           _quickBtn(Icons.edit_outlined, l10n.editProfile, isDark,
//               onTap: () => Navigator.push(context,
//                   MaterialPageRoute(builder: (_) => const EditProfileScreen()))
//                   .then((_) => setState(() {}))),
//           const SizedBox(width: 8),
//           _quickBtn(isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
//               l10n.darkMode, isDark, active: isDark,
//               onTap: () => theme.toggleTheme()),
//           const SizedBox(width: 8),
//           _quickBtn(Icons.language_rounded, theme.language.toUpperCase(), isDark,
//               onTap: () => theme.setLanguage(theme.language == 'fr' ? 'en' : 'fr')),
//           const SizedBox(width: 8),
//           _quickBtn(Icons.headset_mic_outlined, 'Support', isDark,
//               onTap: () => Navigator.push(context,
//                   MaterialPageRoute(builder: (_) => const SupportScreen()))),
//         ]),
//       ]),
//     );
//   }

//   Widget _quickBtn(IconData icon, String label, bool isDark,
//       {required VoidCallback onTap, bool active = false}) {
//     return Expanded(child: GestureDetector(
//       onTap: onTap,
//       child: AnimatedContainer(
//         duration: const Duration(milliseconds: 180),
//         padding: const EdgeInsets.symmetric(vertical: 9),
//         decoration: BoxDecoration(
//           color: active ? AppColors.primary.withOpacity(0.15)
//               : (isDark ? AppColors.cardDark : AppColors.cardLight),
//           borderRadius: BorderRadius.circular(12),
//           border: Border.all(color: active ? AppColors.primary.withOpacity(0.4)
//               : (isDark ? AppColors.borderDark : AppColors.borderLight)),
//         ),
//         child: Column(children: [
//           Icon(icon, size: 18,
//               color: active ? AppColors.primary
//                   : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
//           const SizedBox(height: 3),
//           Text(label, style: TextStyle(fontSize: 9,
//               color: active ? AppColors.primary
//                   : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
//               textAlign: TextAlign.center, maxLines: 1,
//               overflow: TextOverflow.ellipsis),
//         ]),
//       ),
//     ));
//   }

//   // ── ADMIN : Tab 1 Tableau de bord ───────────────────────
//   Widget _buildAdminDashTab(bool isDark, Color textColor, Color subColor,
//       AppL10n l10n, AuthProvider auth, ThemeProvider theme) {
//     final u    = _adminStats['users']    as Map? ?? {};
//     final h    = _adminStats['housings'] as Map? ?? {};
//     final act  = _adminStats['activity'] as Map? ?? {};

//     return SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
//       if (_loadingAdminStats)
//         const Center(child: CircularProgressIndicator(color: AppColors.danger))
//       else ...[
//         _sectionTitle('👥 Utilisateurs', isDark),
//         const SizedBox(height: 10),
//         Row(children: [
//           _adminStat(Icons.people_rounded, const Color(0xFF2563EB),
//               u['total']?.toString() ?? '0', 'Total', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.home_rounded, AppColors.success,
//               u['proprietaires']?.toString() ?? '0', 'Propriétaires', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.search_rounded, const Color(0xFF7C3AED),
//               u['locataires']?.toString() ?? '0', 'Locataires', isDark),
//         ]),
//         const SizedBox(height: 8),
//         Row(children: [
//           _adminStat(Icons.block_rounded, AppColors.warning,
//               u['blocked']?.toString() ?? '0', 'Bloqués', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.person_add_rounded, const Color(0xFF06B6D4),
//               u['new_30d']?.toString() ?? '0', 'Nouveaux 30j', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.trending_up_rounded, AppColors.danger,
//               u['new_7d']?.toString() ?? '0', '7 derniers j', isDark),
//         ]),
//         const SizedBox(height: 18),
//         _sectionTitle('🏠 Logements', isDark),
//         const SizedBox(height: 10),
//         Row(children: [
//           _adminStat(Icons.home_work_rounded, const Color(0xFF2563EB),
//               h['total']?.toString() ?? '0', 'Total', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.check_circle_outline_rounded, AppColors.success,
//               h['available']?.toString() ?? '0', 'Disponible', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.event_rounded, AppColors.warning,
//               h['reserved']?.toString() ?? '0', 'Réservé', isDark),
//         ]),
//         const SizedBox(height: 18),
//         _sectionTitle('📊 Activité', isDark),
//         const SizedBox(height: 10),
//         Row(children: [
//           _adminStat(Icons.chat_rounded, const Color(0xFF2563EB),
//               act['total_messages']?.toString() ?? '0', 'Messages', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.calendar_today_rounded, AppColors.success,
//               act['total_visits']?.toString() ?? '0', 'Visites', isDark),
//           const SizedBox(width: 8),
//           _adminStat(Icons.schedule_rounded, AppColors.warning,
//               act['pending_visits']?.toString() ?? '0', 'En attente', isDark),
//         ]),
//         const SizedBox(height: 20),
//       ],
//       _actionCard(isDark, Icons.tune_rounded, AppColors.secondary,
//           'Préférences', 'Personnalisez vos recommandations',
//           () => Navigator.push(context,
//               MaterialPageRoute(builder: (_) => const PreferencesScreen()))),
//       const SizedBox(height: 10),
//       _logoutBtn(isDark, l10n, auth),
//     ]));
//   }

//   Widget _sectionTitle(String t, bool isDark) => Align(
//     alignment: Alignment.centerLeft,
//     child: Text(t, style: TextStyle(
//         color: isDark ? AppColors.textDark : AppColors.textLight,
//         fontSize: 14, fontWeight: FontWeight.bold)));

//   Widget _adminStat(IconData icon, Color color, String val,
//       String label, bool isDark) {
//     final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     return Expanded(child: Container(
//       padding: const EdgeInsets.all(12),
//       decoration: BoxDecoration(color: cardBg,
//           borderRadius: BorderRadius.circular(12),
//           border: Border.all(color: color.withOpacity(0.35), width: 1.5)),
//       child: Column(children: [
//         Icon(icon, color: color, size: 20),
//         const SizedBox(height: 4),
//         Text(val, style: TextStyle(color: textColor, fontSize: 18,
//             fontWeight: FontWeight.bold)),
//         Text(label, style: TextStyle(color: color.withOpacity(0.8),
//             fontSize: 8, fontWeight: FontWeight.bold),
//             textAlign: TextAlign.center),
//       ]),
//     ));
//   }

//   // ── ADMIN : Tab 2 Utilisateurs ───────────────────────────
//   Widget _buildAdminUsersTab(bool isDark, Color textColor, Color subColor) {
//     return Column(children: [
//       _filterRow([
//         ('all', 'Tous'), ('proprietaire', 'Propriétaires'), ('locataire', 'Locataires'),
//       ], _adminUserRole, (v) {
//         // ✅ Filtre instantané en mémoire — pas d'appel réseau
//         setState(() => _adminUserRole = v);
//       },
//           isDark, activeColor: AppColors.danger),
//       Expanded(
//         child: _loadingAdminUsers
//             ? const Center(child: CircularProgressIndicator(color: AppColors.danger))
//             : _filteredAdminUsers.isEmpty
//                 ? Center(child: Column(
//                     mainAxisAlignment: MainAxisAlignment.center,
//                     children: [
//                       Icon(Icons.people_outline_rounded, size: 52,
//                           color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
//                       const SizedBox(height: 12),
//                       Text(
//                         _adminUserRole == 'all'        ? 'Aucun utilisateur'   :
//                         _adminUserRole == 'proprietaire'? 'Aucun propriétaire' :
//                                                           'Aucun locataire',
//                         style: TextStyle(color: isDark
//                             ? AppColors.textSecondaryDark
//                             : AppColors.textSecondaryLight, fontSize: 14)),
//                     ]))
//                 : RefreshIndicator(
//                     onRefresh: _loadAdminUsers,
//                     color: AppColors.danger,
//                     child: ListView.builder(
//                       padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
//                       // ✅ _filteredAdminUsers au lieu de _adminUsers
//                       itemCount: _filteredAdminUsers.length,
//                       itemBuilder: (_, i) =>
//                           _adminUserRow(_filteredAdminUsers[i], isDark, textColor, subColor),
//                     ),
//                   ),
//       ),
//     ]);
//   }

//   Widget _adminUserRow(UserModel u, bool isDark, Color textColor, Color subColor) {
//     final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border = isDark ? AppColors.borderDark : AppColors.borderLight;
//     return Container(
//       margin: const EdgeInsets.only(bottom: 8),
//       padding: const EdgeInsets.all(12),
//       decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12),
//           border: Border.all(color: border)),
//       child: Row(children: [
//         CircleAvatar(radius: 20, backgroundColor: AppColors.primary.withOpacity(0.15),
//           backgroundImage: u.photo != null ? NetworkImage(u.photo!) : null,
//           child: u.photo == null ? Text(u.initials,
//               style: const TextStyle(color: AppColors.primary,
//                   fontWeight: FontWeight.bold, fontSize: 13)) : null),
//         const SizedBox(width: 10),
//         Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//           Text(u.fullName.isNotEmpty ? u.fullName : u.username,
//               style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 13),
//               maxLines: 1, overflow: TextOverflow.ellipsis),
//           Text(u.email, style: TextStyle(color: subColor, fontSize: 11),
//               maxLines: 1, overflow: TextOverflow.ellipsis),
//           Row(children: [
//             if (u.isProprietaire) _pill('Propriétaire', AppColors.success),
//             if (u.isLocataire)    _pill('Locataire', AppColors.primary),
//             if (!u.isProprietaire && !u.isLocataire)
//               _pill('Aucun rôle', AppColors.textMutedDark),
//           ]),
//         ])),
//         PopupMenuButton<String>(
//           icon: Icon(Icons.more_vert, color: subColor, size: 18),
//           color: isDark ? AppColors.cardDark : AppColors.surfaceLight,
//           onSelected: (action) async {
//             if (action == 'block') { await _api.blockUser(u.id); _loadAdminUsers(); }
//             else if (action == 'unblock') { await _api.unblockUser(u.id); _loadAdminUsers(); }
//             else if (action == 'delete') {
//               final ok = await _confirm('Supprimer', 'Supprimer ${u.username} ?', isDark);
//               if (ok) { await _api.deleteAdminUser(u.id); _loadAdminUsers(); }
//             }
//           },
//           itemBuilder: (_) => [
//             const PopupMenuItem(value: 'block',   child: Text('Bloquer')),
//             const PopupMenuItem(value: 'unblock', child: Text('Débloquer')),
//             PopupMenuItem(value: 'delete',
//                 child: const Text('Supprimer', style: TextStyle(color: AppColors.danger))),
//           ],
//         ),
//       ]),
//     );
//   }

//   // ── ADMIN : Tab 3 Logements ──────────────────────────────
//   Widget _buildAdminHousingsTab(bool isDark, Color textColor, Color subColor) {
//     return RefreshIndicator(
//       onRefresh: _loadAdminHousings, color: AppColors.danger,
//       child: _loadingAdminHousings
//           ? const Center(child: CircularProgressIndicator(color: AppColors.danger))
//           : ListView.builder(
//               padding: const EdgeInsets.all(16),
//               itemCount: _adminHousings.length,
//               itemBuilder: (_, i) =>
//                   _adminHousingRow(_adminHousings[i], isDark, textColor, subColor),
//             ),
//     );
//   }

//   Widget _adminHousingRow(HousingModel h, bool isDark, Color textColor, Color subColor) {
//     final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border = isDark ? AppColors.borderDark : AppColors.borderLight;
//     return Container(
//       margin: const EdgeInsets.only(bottom: 10),
//       padding: const EdgeInsets.all(12),
//       decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12),
//           border: Border.all(color: border)),
//       child: Row(children: [
//         ClipRRect(borderRadius: BorderRadius.circular(8),
//           child: h.mainImage != null
//               ? CachedNetworkImage(imageUrl: h.mainImage!, width: 55, height: 55, fit: BoxFit.cover)
//               : Container(width: 55, height: 55, color: AppColors.surfaceDark,
//                   child: const Icon(Icons.home, color: AppColors.textMutedDark))),
//         const SizedBox(width: 10),
//         Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//           Text(h.displayName, style: TextStyle(color: textColor,
//               fontWeight: FontWeight.w600, fontSize: 12),
//               maxLines: 1, overflow: TextOverflow.ellipsis),
//           Text('${_fmt(h.price)} FCFA',
//               style: const TextStyle(color: AppColors.primary, fontSize: 11)),
//           Text(h.locationStr, style: TextStyle(color: subColor, fontSize: 10)),
//           Row(children: [
//             Icon(Icons.visibility_outlined, size: 10, color: subColor),
//             Text(' ${h.viewsCount}', style: TextStyle(color: subColor, fontSize: 9)),
//           ]),
//         ])),
//         IconButton(
//           icon: Icon(h.isVisible ? Icons.visibility_rounded : Icons.visibility_off_rounded,
//               color: h.isVisible ? AppColors.success : AppColors.textMutedDark, size: 20),
//           onPressed: () async {
//             await _api.toggleHousingVisibility(h.id);
//             _loadAdminHousings();
//           },
//         ),
//         IconButton(
//           icon: const Icon(Icons.delete_outline_rounded, color: AppColors.danger, size: 20),
//           onPressed: () async {
//             final ok = await _confirm('Supprimer', 'Supprimer "${h.displayName}" ?', isDark);
//             if (ok) { await _api.deleteAdminHousing(h.id); _loadAdminHousings(); }
//           },
//         ),
//       ]),
//     );
//   }

//   // ── LOCATAIRE/PROPRIO : Tab 1 Tableau de bord ───────────
//   Widget _buildDashTab(user, bool isDark, Color textColor, Color subColor,
//       AppL10n l10n, bool isOwner, ThemeProvider theme, AuthProvider auth) {
//     return SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
//       Row(children: [
//         _statCard(Icons.favorite_rounded, AppColors.danger,
//             _favorites.length.toString(), l10n.myFavorites, isDark),
//         const SizedBox(width: 12),
//         _statCard(Icons.calendar_today_rounded, AppColors.primary,
//             _visits.length.toString(), l10n.myVisits, isDark),
//         if (isOwner) ...[
//           const SizedBox(width: 12),
//           _statCard(Icons.home_work_rounded, AppColors.secondary,
//               _myHousings.length.toString(), l10n.myListings, isDark),
//         ],
//       ]),
//       const SizedBox(height: 20),
//       if (isOwner) ...[
//         _actionCard(isDark, Icons.add_home_rounded, AppColors.success,
//             'Ajouter un logement', 'Publiez une nouvelle annonce',
//             () => Navigator.push(context,
//                 MaterialPageRoute(builder: (_) => const AddHousingScreen()))
//                 .then((_) => _loadMyHousings())),
//         const SizedBox(height: 10),
//       ],
//       _actionCard(isDark, Icons.tune_rounded, AppColors.secondary,
//           'Préférences', 'Personnalisez vos recommandations IA',
//           () => Navigator.push(context,
//               MaterialPageRoute(builder: (_) => const PreferencesScreen()))),
//       const SizedBox(height: 10),
//       _actionCard(isDark, Icons.headset_mic_rounded, AppColors.info,
//           'Assistance & Support', 'Chat, WhatsApp, Email, Appel',
//           () => Navigator.push(context,
//               MaterialPageRoute(builder: (_) => const SupportScreen()))),
//       const SizedBox(height: 10),
//       if (user != null && !user.isStaff)
//         _actionCard(isDark, Icons.swap_horiz_rounded, AppColors.warning,
//             user.isProprietaire ? l10n.switchToTenant : l10n.switchToOwner,
//             user.isProprietaire ? 'Passer en mode locataire' : 'Commencer à louer votre bien',
//             () => _switchRole(user, l10n)),
//       const SizedBox(height: 10),
//       _logoutBtn(isDark, l10n, auth),
//     ]));
//   }

//   // ── LOCATAIRE : Tab 2 Favoris ────────────────────────────
//   Widget _buildFavoritesTab(bool isDark) {
//     if (_loadingFav) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
//     if (_favorites.isEmpty) return _empty(Icons.favorite_outline_rounded, 'Aucun favori',
//         'Likez des logements pour les retrouver ici', isDark,
//         action: ElevatedButton(
//             onPressed: () => Navigator.pushNamed(context, '/search'),
//             child: const Text('Explorer les logements')));
//     return RefreshIndicator(
//       onRefresh: _loadFavorites, color: AppColors.primary,
//       child: ListView.builder(
//         padding: const EdgeInsets.all(16),
//         itemCount: _favorites.length,
//         itemBuilder: (_, i) => _housingItem(_favorites[i], isDark,
//             onRemove: () async {
//               await _api.toggleLike(_favorites[i].id);
//               _loadFavorites();
//             }),
//       ),
//     );
//   }

//   // ── LOCATAIRE : Tab 3 Visites ────────────────────────────
//   Widget _buildVisitsTab(bool isDark, AppL10n l10n) {
//     return Column(children: [
//       _filterRow([
//         ('all', 'Toutes'), ('attente', 'En attente'),
//         ('confirme', 'Confirmées'), ('refuse', 'Refusées'),
//       ], _visitFilter, (v) => setState(() => _visitFilter = v), isDark),
//       Expanded(child: _loadingVis
//           ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
//           : _filtVisits.isEmpty
//               ? _empty(Icons.calendar_today_outlined, 'Aucune visite', '', isDark)
//               : RefreshIndicator(onRefresh: _loadVisits, color: AppColors.primary,
//                   child: ListView.builder(
//                     padding: const EdgeInsets.all(16),
//                     itemCount: _filtVisits.length,
//                     itemBuilder: (_, i) => _visitCard(_filtVisits[i], isDark, isOwner: false),
//                   ))),
//     ]);
//   }

//   // ── PROPRIO : Tab 2 Mes annonces ─────────────────────────
//   Widget _buildMyHousingsTab(bool isDark, AppL10n l10n) {
//     return Column(children: [
//       _filterRow([
//         ('all', 'Toutes'), ('disponible', l10n.available),
//         ('reserve', l10n.reserved), ('occupe', l10n.occupied),
//       ], _housingFilter, (v) => setState(() => _housingFilter = v), isDark),
//       Expanded(child: _loadingHousing
//           ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
//           : _filtHousings.isEmpty
//               ? _empty(Icons.home_work_outlined, 'Aucune annonce', '', isDark,
//                   action: ElevatedButton.icon(
//                     onPressed: () => Navigator.push(context,
//                         MaterialPageRoute(builder: (_) => const AddHousingScreen()))
//                         .then((_) => _loadMyHousings()),
//                     icon: const Icon(Icons.add, size: 18),
//                     label: Text(l10n.addHousing)))
//               : RefreshIndicator(onRefresh: _loadMyHousings, color: AppColors.primary,
//                   child: ListView.builder(
//                     padding: const EdgeInsets.all(16),
//                     itemCount: _filtHousings.length,
//                     itemBuilder: (_, i) => _myHousingCard(_filtHousings[i], isDark, l10n),
//                   ))),
//     ]);
//   }

//   // ── PROPRIO : Tab 3 Réservations ─────────────────────────
//   Widget _buildReservationsTab(bool isDark, AppL10n l10n) {
//     return Column(children: [
//       _filterRow([
//         ('all', 'Toutes'), ('attente', 'En attente'),
//         ('confirme', 'Confirmées'), ('refuse', 'Refusées'),
//       ], _resFilter, (v) => setState(() => _resFilter = v), isDark),
//       Expanded(child: _loadingRes
//           ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
//           : _filtRes.isEmpty
//               ? _empty(Icons.calendar_month_outlined, 'Aucune réservation', '', isDark)
//               : RefreshIndicator(onRefresh: _loadReservations, color: AppColors.primary,
//                   child: ListView.builder(
//                     padding: const EdgeInsets.all(16),
//                     itemCount: _filtRes.length,
//                     itemBuilder: (_, i) => _visitCard(_filtRes[i], isDark, isOwner: true),
//                   ))),
//     ]);
//   }

//   // ── TOUS : Tab 4 Paramètres ──────────────────────────────
//   Widget _buildSettingsTab(bool isDark, Color textColor, Color subColor,
//       AppL10n l10n, ThemeProvider theme, AuthProvider auth) {
//     return SingleChildScrollView(padding: const EdgeInsets.all(20), child: Column(children: [
//       _settingTile(isDark, Icons.language_rounded, l10n.languageLabel, subColor,
//           trailing: Text(theme.language == 'fr' ? 'Français' : 'English',
//               style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
//           onTap: () => theme.setLanguage(theme.language == 'fr' ? 'en' : 'fr')),
//       _settingTile(isDark, Icons.dark_mode_rounded, l10n.darkMode, subColor,
//           trailing: Switch(value: isDark, activeColor: AppColors.primary,
//               onChanged: (_) => theme.toggleTheme()),
//           onTap: () => theme.toggleTheme()),
//       _settingTile(isDark, Icons.notifications_outlined, l10n.notifications, subColor,
//           onTap: () => Navigator.pushNamed(context, '/notifications')),
//       _settingTile(isDark, Icons.security_outlined, 'Sécurité & Mot de passe', subColor,
//           onTap: () => Navigator.push(context,
//               MaterialPageRoute(builder: (_) => const EditProfileScreen()))),
//       const SizedBox(height: 20),
//       _logoutBtn(isDark, l10n, auth),
//     ]));
//   }

//   // ── Widgets partagés ─────────────────────────────────────
//   Widget _housingItem(HousingModel h, bool isDark, {VoidCallback? onRemove}) {
//     final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
//     return GestureDetector(
//       onTap: () => Navigator.push(context,
//           MaterialPageRoute(builder: (_) => HousingDetailScreen(housingId: h.id))),
//       child: Container(
//         margin: const EdgeInsets.only(bottom: 12),
//         padding: const EdgeInsets.all(12),
//         decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14),
//             border: Border.all(color: border)),
//         child: Row(children: [
//           ClipRRect(borderRadius: BorderRadius.circular(10),
//             child: h.mainImage != null
//                 ? CachedNetworkImage(imageUrl: h.mainImage!, width: 75, height: 75, fit: BoxFit.cover)
//                 : Container(width: 75, height: 75, color: AppColors.surfaceDark,
//                     child: const Icon(Icons.home, color: AppColors.textMutedDark))),
//           const SizedBox(width: 12),
//           Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//             Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
//               decoration: BoxDecoration(color: AppColors.success,
//                   borderRadius: BorderRadius.circular(20)),
//               child: Text('DISPONIBLE',
//                   style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold))),
//             const SizedBox(height: 3),
//             Text(h.displayName, style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 13),
//                 maxLines: 1, overflow: TextOverflow.ellipsis),
//             Text('${_fmt(h.price)} FCFA/mois',
//                 style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold)),
//             Row(children: [
//               Icon(Icons.visibility_outlined, size: 11, color: subColor),
//               Text(' ${h.viewsCount}', style: TextStyle(color: subColor, fontSize: 10)),
//               const SizedBox(width: 8),
//               Icon(Icons.favorite_outline_rounded, size: 11, color: subColor),
//               Text(' ${h.likesCount}', style: TextStyle(color: subColor, fontSize: 10)),
//               const SizedBox(width: 8),
//               Text(_relDate(h.createdAt), style: TextStyle(color: subColor, fontSize: 10)),
//             ]),
//           ])),
//           if (onRemove != null)
//             IconButton(icon: const Icon(Icons.favorite_rounded, color: AppColors.danger, size: 22),
//                 onPressed: onRemove),
//         ]),
//       ),
//     );
//   }

//   Widget _visitCard(VisitModel v, bool isDark, {required bool isOwner}) {
//     final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

//     Color statusColor;
//     switch (v.status) {
//       case 'confirme': statusColor = AppColors.success; break;
//       case 'refuse':   statusColor = AppColors.danger;  break;
//       case 'annule':   statusColor = Colors.grey;       break;
//       default:         statusColor = AppColors.warning;
//     }

//     return Container(
//       margin: const EdgeInsets.only(bottom: 12),
//       decoration: BoxDecoration(
//           color: cardBg,
//           borderRadius: BorderRadius.circular(14),
//           border: Border.all(color: border)),
//       child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

//         // ── Image + infos ───────────────────────────────────
//         Padding(
//           padding: const EdgeInsets.all(12),
//           child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [

//             // ✅ Image du logement
//             ClipRRect(
//               borderRadius: BorderRadius.circular(10),
//               child: v.housingImage != null && v.housingImage!.isNotEmpty
//                   ? CachedNetworkImage(
//                       imageUrl: v.housingImage!,
//                       width: 72, height: 72, fit: BoxFit.cover,
//                       placeholder: (_, __) => Container(
//                         width: 72, height: 72,
//                         color: isDark ? AppColors.surfaceDark : AppColors.bgLight,
//                         child: const Icon(Icons.home_outlined,
//                             color: AppColors.textMutedDark, size: 28)),
//                       errorWidget: (_, __, ___) => Container(
//                         width: 72, height: 72,
//                         color: isDark ? AppColors.surfaceDark : AppColors.bgLight,
//                         child: const Icon(Icons.broken_image_outlined,
//                             color: AppColors.textMutedDark, size: 28)),
//                     )
//                   : Container(
//                       width: 72, height: 72,
//                       decoration: BoxDecoration(
//                         color: isDark ? AppColors.surfaceDark : AppColors.bgLight,
//                         borderRadius: BorderRadius.circular(10)),
//                       child: const Icon(Icons.home_work_outlined,
//                           color: AppColors.textMutedDark, size: 28)),
//             ),
//             const SizedBox(width: 12),

//             // ── Infos ──────────────────────────────────────
//             Expanded(child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
//                   Expanded(child: Text(v.housingTitle,
//                       style: TextStyle(color: textColor,
//                           fontWeight: FontWeight.w600, fontSize: 13),
//                       maxLines: 2, overflow: TextOverflow.ellipsis)),
//                   const SizedBox(width: 6),
//                   Container(
//                     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
//                     decoration: BoxDecoration(
//                         color: statusColor.withOpacity(0.15),
//                         borderRadius: BorderRadius.circular(20)),
//                     child: Text(v.statusLabel,
//                         style: TextStyle(color: statusColor,
//                             fontSize: 10, fontWeight: FontWeight.w600))),
//                 ]),
//                 const SizedBox(height: 5),
//                 Row(children: [
//                   Icon(Icons.calendar_today_outlined, size: 12, color: subColor),
//                   const SizedBox(width: 4),
//                   Text(
//                     '${v.date.day.toString().padLeft(2, '0')}/'
//                     '${v.date.month.toString().padLeft(2, '0')}/'
//                     '${v.date.year}',
//                     style: TextStyle(color: subColor, fontSize: 11)),
//                   const SizedBox(width: 8),
//                   Icon(Icons.access_time_rounded, size: 12, color: subColor),
//                   const SizedBox(width: 4),
//                   Text(v.time, style: TextStyle(color: subColor, fontSize: 11)),
//                 ]),
//                 const SizedBox(height: 3),
//                 if (isOwner && v.locataireName != null)
//                   Text('Locataire : ${v.locataireName}',
//                       style: TextStyle(color: subColor, fontSize: 11)),
//                 if (!isOwner && v.ownerName != null)
//                   Text('Propriétaire : ${v.ownerName}',
//                       style: TextStyle(color: subColor, fontSize: 11)),
//                 if (v.housingAddress != null && v.housingAddress!.isNotEmpty) ...[
//                   const SizedBox(height: 3),
//                   Row(children: [
//                     const Icon(Icons.location_on_outlined,
//                         size: 11, color: AppColors.primary),
//                     const SizedBox(width: 3),
//                     Expanded(child: Text(v.housingAddress!,
//                         style: const TextStyle(
//                             color: AppColors.primary, fontSize: 11),
//                         maxLines: 1, overflow: TextOverflow.ellipsis)),
//                   ]),
//                 ],
//               ],
//             )),
//           ]),
//         ),

//         // ── Séparateur ──────────────────────────────────────
//         Divider(height: 1, color: border),

//         // ── Actions ─────────────────────────────────────────
//         Padding(
//           padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
//           child: Row(children: [
//             Expanded(child: OutlinedButton.icon(
//               onPressed: () => Navigator.push(context,
//                   MaterialPageRoute(builder: (_) =>
//                       HousingDetailScreen(housingId: v.housingId))),
//               icon: const Icon(Icons.visibility_outlined, size: 14),
//               label: const Text('Voir logement', style: TextStyle(fontSize: 12)),
//               style: OutlinedButton.styleFrom(
//                   foregroundColor: AppColors.primary,
//                   side: const BorderSide(color: AppColors.primary),
//                   padding: const EdgeInsets.symmetric(vertical: 8),
//                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
//             )),
//             if (isOwner && v.status == 'attente') ...[
//               const SizedBox(width: 8),
//               Expanded(child: ElevatedButton.icon(
//                 onPressed: () async { await _api.confirmVisit(v.id); _loadReservations(); },
//                 icon: const Icon(Icons.check_rounded, size: 14, color: Colors.white),
//                 label: const Text('Confirmer', style: TextStyle(fontSize: 12, color: Colors.white)),
//                 style: ElevatedButton.styleFrom(backgroundColor: AppColors.success,
//                     padding: const EdgeInsets.symmetric(vertical: 8),
//                     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
//               )),
//               const SizedBox(width: 8),
//               Expanded(child: OutlinedButton.icon(
//                 onPressed: () async {
//                   final ok = await _confirm('Refuser', 'Refuser cette visite ?', isDark);
//                   if (ok) { await _api.refuseVisit(v.id); _loadReservations(); }
//                 },
//                 icon: const Icon(Icons.close_rounded, size: 14),
//                 label: const Text('Refuser', style: TextStyle(fontSize: 12)),
//                 style: OutlinedButton.styleFrom(
//                     foregroundColor: AppColors.danger,
//                     side: const BorderSide(color: AppColors.danger),
//                     padding: const EdgeInsets.symmetric(vertical: 8),
//                     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
//               )),
//             ],
//             if (!isOwner && v.status == 'attente') ...[
//               const SizedBox(width: 8),
//               Expanded(child: OutlinedButton.icon(
//                 onPressed: () async {
//                   final ok = await _confirm('Annuler', 'Annuler cette visite ?', isDark);
//                   if (ok) { await _api.cancelVisit(v.id); _loadVisits(); }
//                 },
//                 icon: const Icon(Icons.cancel_outlined, size: 14),
//                 label: const Text('Annuler', style: TextStyle(fontSize: 12)),
//                 style: OutlinedButton.styleFrom(
//                     foregroundColor: AppColors.warning,
//                     side: const BorderSide(color: AppColors.warning),
//                     padding: const EdgeInsets.symmetric(vertical: 8),
//                     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
//               )),
//             ],
//           ]),
//         ),
//       ]),
//     );
//   }

//   Widget _myHousingCard(HousingModel h, bool isDark, AppL10n l10n) {
//     final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
//     return Container(
//       margin: const EdgeInsets.only(bottom: 12),
//       decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14),
//           border: Border.all(color: border)),
//       child: Column(children: [
//         ListTile(
//           contentPadding: const EdgeInsets.all(12),
//           leading: ClipRRect(borderRadius: BorderRadius.circular(8),
//             child: h.mainImage != null
//                 ? CachedNetworkImage(imageUrl: h.mainImage!, width: 60, height: 60, fit: BoxFit.cover)
//                 : Container(width: 60, height: 60, color: AppColors.surfaceDark,
//                     child: const Icon(Icons.home, color: AppColors.textMutedDark))),
//           title: Text(h.displayName, style: TextStyle(color: textColor,
//               fontWeight: FontWeight.w600, fontSize: 13),
//               maxLines: 1, overflow: TextOverflow.ellipsis),
//           subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//             Text('${_fmt(h.price)} FCFA/mois',
//                 style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
//             Row(children: [
//               Icon(Icons.visibility_outlined, size: 11, color: subColor),
//               Text(' ${h.viewsCount}', style: TextStyle(color: subColor, fontSize: 10)),
//               const SizedBox(width: 6),
//               Icon(Icons.favorite_outline_rounded, size: 11, color: subColor),
//               Text(' ${h.likesCount}', style: TextStyle(color: subColor, fontSize: 10)),
//             ]),
//           ]),
//           trailing: PopupMenuButton<String>(
//             icon: Icon(Icons.more_vert, color: subColor),
//             color: isDark ? AppColors.cardDark : AppColors.surfaceLight,
//             onSelected: (action) async {
//               if (action == 'edit') {
//                 Navigator.push(context, MaterialPageRoute(
//                     builder: (_) => AddHousingScreen(housing: h)))
//                     .then((_) => _loadMyHousings());
//               } else if (action == 'delete') {
//                 final ok = await _confirm('Supprimer', 'Supprimer "${h.displayName}" ?', isDark);
//                 if (ok) { await _api.deleteHousing(h.id); _loadMyHousings(); }
//               }
//             },
//             itemBuilder: (_) => [
//               const PopupMenuItem(value: 'edit', child: Text('Modifier')),
//               PopupMenuItem(value: 'delete',
//                   child: const Text('Supprimer', style: TextStyle(color: AppColors.danger))),
//             ],
//           ),
//         ),
//         Padding(
//           padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
//           child: Row(children: ['disponible','reserve','occupe'].map((s) {
//             final active = h.status == s;
//             Color c; switch (s) { case 'disponible': c = AppColors.success; break; case 'reserve': c = AppColors.warning; break; default: c = AppColors.danger; }
//             String lbl; switch (s) { case 'disponible': lbl = l10n.available; break; case 'reserve': lbl = l10n.reserved; break; default: lbl = l10n.occupied; }
//             return Expanded(child: GestureDetector(
//               onTap: () async { await _api.updateHousing(h.id, {'status': s}); _loadMyHousings(); },
//               child: Container(
//                 margin: const EdgeInsets.only(right: 4),
//                 padding: const EdgeInsets.symmetric(vertical: 5),
//                 decoration: BoxDecoration(
//                   color: active ? c.withOpacity(0.15) : Colors.transparent,
//                   borderRadius: BorderRadius.circular(8),
//                   border: Border.all(color: active ? c : border),
//                 ),
//                 child: Text(lbl, style: TextStyle(color: active ? c : subColor, fontSize: 10,
//                     fontWeight: active ? FontWeight.w600 : FontWeight.normal),
//                     textAlign: TextAlign.center),
//               ),
//             ));
//           }).toList()),
//         ),
//       ]),
//     );
//   }

//   Widget _filterRow(List<(String, String)> opts, String selected,
//       ValueChanged<String> onSelect, bool isDark,
//       {Color activeColor = AppColors.primary}) {
//     return SizedBox(height: 44, child: ListView.builder(
//       scrollDirection: Axis.horizontal,
//       padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
//       itemCount: opts.length,
//       itemBuilder: (_, i) {
//         final (val, lbl) = opts[i];
//         final sel = selected == val;
//         return GestureDetector(
//           onTap: () => onSelect(val),
//           child: Container(
//             margin: const EdgeInsets.only(right: 8),
//             padding: const EdgeInsets.symmetric(horizontal: 14),
//             decoration: BoxDecoration(
//               color: sel ? activeColor : (isDark ? AppColors.cardDark : AppColors.cardLight),
//               borderRadius: BorderRadius.circular(20),
//               border: Border.all(color: sel ? activeColor : (isDark ? AppColors.borderDark : AppColors.borderLight)),
//             ),
//             child: Center(child: Text(lbl, style: TextStyle(
//                 color: sel ? Colors.white : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
//                 fontSize: 12, fontWeight: sel ? FontWeight.w600 : FontWeight.normal))),
//           ),
//         );
//       },
//     ));
//   }

//   Widget _statCard(IconData icon, Color color, String count, String label, bool isDark) {
//     return Expanded(child: Container(
//       padding: const EdgeInsets.all(14),
//       decoration: BoxDecoration(
//         color: isDark ? AppColors.cardDark : AppColors.cardLight,
//         borderRadius: BorderRadius.circular(14),
//         border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
//       ),
//       child: Column(children: [
//         Container(width: 38, height: 38,
//             decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
//             child: Icon(icon, color: color, size: 18)),
//         const SizedBox(height: 8),
//         Text(count, style: TextStyle(color: isDark ? AppColors.textDark : AppColors.textLight,
//             fontSize: 20, fontWeight: FontWeight.bold)),
//         Text(label, style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
//             fontSize: 9), textAlign: TextAlign.center, maxLines: 2),
//       ]),
//     ));
//   }

//   Widget _actionCard(bool isDark, IconData icon, Color color, String title,
//       String sub, VoidCallback onTap) {
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
//     return GestureDetector(onTap: onTap, child: Container(
//       padding: const EdgeInsets.all(14),
//       decoration: BoxDecoration(
//         color: isDark ? AppColors.cardDark : AppColors.cardLight,
//         borderRadius: BorderRadius.circular(14),
//         border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
//       ),
//       child: Row(children: [
//         Container(width: 42, height: 42,
//             decoration: BoxDecoration(color: color.withOpacity(0.12),
//                 borderRadius: BorderRadius.circular(12)),
//             child: Icon(icon, color: color, size: 20)),
//         const SizedBox(width: 14),
//         Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
//           Text(title, style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 13)),
//           Text(sub,   style: TextStyle(color: subColor, fontSize: 11)),
//         ])),
//         Icon(Icons.chevron_right_rounded, color: subColor, size: 18),
//       ]),
//     ));
//   }

//   Widget _logoutBtn(bool isDark, AppL10n l10n, AuthProvider auth) {
//     return GestureDetector(
//       onTap: () async {
//         final ok = await _confirm(l10n.logout, 'Voulez-vous vraiment vous déconnecter ?', isDark);
//         if (ok && mounted) {
//           await auth.logout();
//           if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
//         }
//       },
//       child: Container(
//         padding: const EdgeInsets.all(16),
//         decoration: BoxDecoration(
//           color: AppColors.danger.withOpacity(0.08),
//           borderRadius: BorderRadius.circular(14),
//           border: Border.all(color: AppColors.danger.withOpacity(0.3)),
//         ),
//         child: Row(children: [
//           const Icon(Icons.logout_rounded, color: AppColors.danger, size: 22),
//           const SizedBox(width: 12),
//           Text(l10n.logout, style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600)),
//         ]),
//       ),
//     );
//   }

//   Widget _settingTile(bool isDark, IconData icon, String label, Color subColor,
//       {Widget? trailing, required VoidCallback onTap}) {
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     return Container(
//       margin: const EdgeInsets.only(bottom: 8),
//       decoration: BoxDecoration(
//         color: isDark ? AppColors.cardDark : AppColors.cardLight,
//         borderRadius: BorderRadius.circular(12),
//         border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
//       ),
//       child: ListTile(
//         leading: Icon(icon, color: subColor, size: 20),
//         title: Text(label, style: TextStyle(color: textColor, fontSize: 14)),
//         trailing: trailing ?? Icon(Icons.chevron_right_rounded, color: subColor, size: 18),
//         onTap: onTap, dense: true,
//       ),
//     );
//   }

//   Widget _pill(String label, Color color) => Container(
//     margin: const EdgeInsets.only(right: 4, top: 2),
//     padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
//     decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
//     child: Text(label, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w600)));

//   Widget _empty(IconData icon, String title, String sub, bool isDark, {Widget? action}) {
//     return Center(child: Padding(padding: const EdgeInsets.all(32),
//       child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
//         Icon(icon, size: 60, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
//         const SizedBox(height: 16),
//         Text(title, style: TextStyle(color: isDark ? AppColors.textDark : AppColors.textLight,
//             fontSize: 15, fontWeight: FontWeight.w600)),
//         if (sub.isNotEmpty) ...[
//           const SizedBox(height: 8),
//           Text(sub, style: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
//               fontSize: 12), textAlign: TextAlign.center),
//         ],
//         if (action != null) ...[const SizedBox(height: 20), action],
//       ])));
//   }

//   Future<bool> _confirm(String title, String msg, bool isDark) async {
//     return await showDialog<bool>(context: context,
//       builder: (_) => AlertDialog(
//         backgroundColor: isDark ? AppColors.cardDark : AppColors.surfaceLight,
//         title: Text(title), content: Text(msg),
//         actions: [
//           TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
//           TextButton(onPressed: () => Navigator.pop(context, true),
//               child: Text(title, style: const TextStyle(color: AppColors.danger))),
//         ],
//       )) ?? false;
//   }

//   Future<void> _switchRole(user, AppL10n l10n) async {
//     final auth = context.read<AuthProvider>();
//     final newIsOwner = !user.isProprietaire;
//     await auth.updateProfile({'is_proprietaire': newIsOwner, 'is_locataire': !newIsOwner});
//     _tabs.dispose();
//     _initTabs();
//     setState(() {});
//   }

//   String _fmt(int price) {
//     if (price >= 1000000) return '${(price / 1000000).toStringAsFixed(1)}M';
//     final s = price.toString(); final buf = StringBuffer();
//     for (var i = 0; i < s.length; i++) {
//       if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
//       buf.write(s[i]);
//     }
//     return buf.toString();
//   }

//   String _relDate(DateTime dt) {
//     final d = DateTime.now().difference(dt).inDays;
//     if (d == 0) return "Aujourd'hui"; if (d < 30) return 'Il y a ${d}j';
//     return 'Il y a ${(d / 30).floor()}mois';
//   }
// }

// class _TabDelegate extends SliverPersistentHeaderDelegate {
//   final TabBar tabBar; final Color bg;
//   _TabDelegate(this.tabBar, this.bg);
//   @override Widget build(_, __, ___) => Container(color: bg, child: tabBar);
//   @override double get maxExtent => tabBar.preferredSize.height;
//   @override double get minExtent => tabBar.preferredSize.height;
//   @override bool shouldRebuild(_TabDelegate old) => tabBar != old.tabBar;
// }


// lib/screens/profile/profile_screen.dart
//
// ✅ CORRECTIONS i18n :
//  • Onglets → l10n.dashboard / users / housings / settings / reservations
//  • Labels tabs admin/proprio/locataire → l10n.*
//  • 'Tableau de bord', 'Utilisateurs', 'Logements', 'Paramètres' → l10n
//  • 'Administrateur' → l10n.administrator
//  • 'Propriétaire', 'Locataire' → l10n.owner / tenant
//  • Boutons filtres : 'Toutes', 'En attente'… → l10n.*
//  • Boutons actions : 'Modifier', 'Supprimer', 'Bloquer'… → l10n.*
//  • Paramètres : 'Langue', 'Mode sombre', 'Sécurité' → l10n.*
//  • Rechargement auto au changement de langue via didChangeDependencies()
//
// Filtres admin users : _allAdminUsers + _filteredAdminUsers getter (côté client)

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../widgets/app_bar_widget.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/models/user_model.dart';
import '../../data/models/visit_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/housing_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';
import '../housing/add_housing_screen.dart';
import '../housing/housing_detail_screen.dart';
import '../support/support_screen.dart';
import '../preferences/preferences_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with TickerProviderStateMixin {
  late TabController _tabs;
  final _api = ApiService();

  // ── Données communes ───────────────────────────────────────────────────────
  List<HousingModel> _favorites    = [];
  List<VisitModel>   _visits       = [];
  List<HousingModel> _myHousings   = [];
  List<VisitModel>   _reservations = [];

  // ── Données admin ──────────────────────────────────────────────────────────
  Map<String, dynamic> _adminStats    = {};
  List<UserModel>      _allAdminUsers = []; // liste complète (filtre côté client)
  List<HousingModel>   _adminHousings = [];

  // ── Loading ────────────────────────────────────────────────────────────────
  bool _loadingFav           = false;
  bool _loadingVis           = false;
  bool _loadingHousing       = false;
  bool _loadingRes           = false;
  bool _loadingAdminStats    = false;
  bool _loadingAdminUsers    = false;
  bool _loadingAdminHousings = false;

  // ── Filtres ────────────────────────────────────────────────────────────────
  String _visitFilter     = 'all';
  String _housingFilter   = 'all';
  String _resFilter       = 'all';
  String _adminUserRole   = 'all';
  String _adminUserSearch = '';

  // ── Suivi langue ───────────────────────────────────────────────────────────
  String? _currentLanguage;

  bool get _isAdmin => context.read<AuthProvider>().user?.isStaff == true;
  bool get _isOwner =>
      context.read<AuthProvider>().user?.isProprietaire == true;

  // ── Filtre admin users côté client ─────────────────────────────────────────
  List<UserModel> get _filteredAdminUsers {
    var list = _allAdminUsers;
    if (_adminUserRole != 'all') {
      list = list.where((u) {
        if (_adminUserRole == 'proprietaire') return u.isProprietaire;
        if (_adminUserRole == 'locataire')    return u.isLocataire;
        return true;
      }).toList();
    }
    if (_adminUserSearch.isNotEmpty) {
      final q = _adminUserSearch.toLowerCase();
      list = list.where((u) =>
        u.username.toLowerCase().contains(q) ||
        u.email.toLowerCase().contains(q) ||
        u.fullName.toLowerCase().contains(q),
      ).toList();
    }
    return list;
  }

  @override
  void initState() {
    super.initState();
    _initTabs();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadAll());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // ✅ Rechargement quand la langue change
    final lang = context.read<ThemeProvider>().language;
    if (_currentLanguage != null && _currentLanguage != lang) {
      _loadAll();
    }
    _currentLanguage = lang;
  }

  void _initTabs() {
    _tabs = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    final user = context.read<AuthProvider>().user;
    if (user?.isStaff == true) {
      await Future.wait([
        _loadAdminStats(),
        _loadAdminUsers(),
        _loadAdminHousings(),
      ]);
    } else {
      await Future.wait([
        _loadFavorites(),
        _loadVisits(),
        if (user?.isProprietaire == true) ...[
          _loadMyHousings(),
          _loadReservations(),
        ],
      ]);
    }
  }

  // ── Loaders ────────────────────────────────────────────────────────────────
  Future<void> _loadFavorites() async {
    setState(() => _loadingFav = true);
    try { _favorites = await _api.getFavorites(); } catch (_) {}
    if (mounted) setState(() => _loadingFav = false);
  }

  Future<void> _loadVisits() async {
    setState(() => _loadingVis = true);
    try { _visits = await _api.getVisits(); } catch (_) {}
    if (mounted) setState(() => _loadingVis = false);
  }

  Future<void> _loadMyHousings() async {
    setState(() => _loadingHousing = true);
    try { _myHousings = await _api.getMyHousings(); } catch (_) {}
    if (mounted) setState(() => _loadingHousing = false);
  }

  Future<void> _loadReservations() async {
    setState(() => _loadingRes = true);
    try { _reservations = await _api.getVisits(); } catch (_) {}
    if (mounted) setState(() => _loadingRes = false);
  }

  Future<void> _loadAdminStats() async {
    setState(() => _loadingAdminStats = true);
    try { _adminStats = await _api.getAdminStats(); } catch (_) {}
    if (mounted) setState(() => _loadingAdminStats = false);
  }

  Future<void> _loadAdminUsers() async {
    setState(() => _loadingAdminUsers = true);
    try { _allAdminUsers = await _api.getAdminUsers(); } catch (_) {}
    if (mounted) setState(() => _loadingAdminUsers = false);
  }

  Future<void> _loadAdminHousings() async {
    setState(() => _loadingAdminHousings = true);
    try { _adminHousings = await _api.getAdminHousings(); } catch (_) {}
    if (mounted) setState(() => _loadingAdminHousings = false);
  }

  // ── Getters filtrés ────────────────────────────────────────────────────────
  List<VisitModel> get _filtVisits =>
      _visitFilter == 'all' ? _visits
          : _visits.where((v) => v.status == _visitFilter).toList();
  List<HousingModel> get _filtHousings =>
      _housingFilter == 'all' ? _myHousings
          : _myHousings.where((h) => h.status == _housingFilter).toList();
  List<VisitModel> get _filtRes =>
      _resFilter == 'all' ? _reservations
          : _reservations.where((v) => v.status == _resFilter).toList();

  // ══════════════════════════════════════════════════════════════════════════
  // BUILD
  // ══════════════════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    // ✅ context.watch pour reconstruire les labels quand la langue change
    final isDark    = context.watch<ThemeProvider>().isDarkMode;
    final auth      = context.watch<AuthProvider>();
    final theme     = context.watch<ThemeProvider>();
    final l10n      = context.l10n;
    final user      = auth.user;
    final bg        = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
    final isAdmin = user?.isStaff == true;
    final isOwner = user?.isProprietaire == true;

    // ✅ Labels onglets traduits selon le rôle
    final List<Tab> tabs;
    if (isAdmin) {
      tabs = [
        Tab(text: l10n.dashboard),
        Tab(text: l10n.users),
        Tab(text: l10n.housings),
        Tab(text: l10n.settings),
      ];
    } else if (isOwner) {
      tabs = [
        Tab(text: l10n.dashboard),
        Tab(text: l10n.myListings),
        Tab(text: l10n.reservations),
        Tab(text: l10n.settings),
      ];
    } else {
      tabs = [
        Tab(text: l10n.dashboard),
        Tab(text: l10n.myFavorites),
        Tab(text: l10n.myVisits),
        Tab(text: l10n.settings),
      ];
    }

    return Scaffold(
      backgroundColor: bg,
      appBar: const RentalAppBar(showBack: false),
      body: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverToBoxAdapter(
            child: _buildHeader(user, isDark, textColor, subColor, l10n,
                auth, theme, isAdmin, isOwner),
          ),
          SliverPersistentHeader(
            pinned: true,
            delegate: _TabDelegate(
              TabBar(
                controller: _tabs,
                isScrollable: true,
                labelColor:
                    isAdmin ? AppColors.danger : AppColors.primary,
                unselectedLabelColor: subColor,
                indicatorColor:
                    isAdmin ? AppColors.danger : AppColors.primary,
                indicatorSize: TabBarIndicatorSize.label,
                dividerColor: Colors.transparent,
                tabs: tabs,
              ),
              isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabs,
          children: isAdmin
              ? [
                  _buildAdminDashTab(isDark, textColor, subColor, l10n, auth, theme),
                  _buildAdminUsersTab(isDark, textColor, subColor, l10n),
                  _buildAdminHousingsTab(isDark, textColor, subColor, l10n),
                  _buildSettingsTab(isDark, textColor, subColor, l10n, theme, auth),
                ]
              : isOwner
                  ? [
                      _buildDashTab(user, isDark, textColor, subColor, l10n,
                          true, theme, auth),
                      _buildMyHousingsTab(isDark, l10n),
                      _buildReservationsTab(isDark, l10n),
                      _buildSettingsTab(isDark, textColor, subColor, l10n, theme, auth),
                    ]
                  : [
                      _buildDashTab(user, isDark, textColor, subColor, l10n,
                          false, theme, auth),
                      _buildFavoritesTab(isDark, l10n),
                      _buildVisitsTab(isDark, l10n),
                      _buildSettingsTab(isDark, textColor, subColor, l10n, theme, auth),
                    ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER UNIFIÉ
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildHeader(user, bool isDark, Color textColor, Color subColor,
      AppL10n l10n, AuthProvider auth, ThemeProvider theme,
      bool isAdmin, bool isOwner) {
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

    // ✅ Badge couleur + libellé traduit
    Color badgeColor;
    String badgeLabel;
    if (isAdmin) {
      badgeColor = AppColors.danger;
      badgeLabel = l10n.administrator;
    } else if (isOwner) {
      badgeColor = AppColors.success;
      badgeLabel = l10n.owner;
    } else {
      badgeColor = AppColors.primary;
      badgeLabel = l10n.tenant;
    }

    return Container(
      color: bg,
      padding: EdgeInsets.only(
          top: MediaQuery.of(context).padding.top + 8,
          left: 20, right: 20, bottom: 16),
      child: Column(children: [
        Row(children: [
          GestureDetector(
            onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const EditProfileScreen()))
                .then((_) => setState(() {})),
            child: Stack(children: [
              CircleAvatar(
                radius: 38,
                backgroundColor: badgeColor.withOpacity(0.15),
                backgroundImage:
                    user?.photo != null ? NetworkImage(user!.photo!) : null,
                child: user?.photo == null
                    ? Text(user?.initials ?? 'U',
                        style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: badgeColor))
                    : null,
              ),
              Positioned(
                bottom: 0, right: 0,
                child: Container(
                  width: 22, height: 22,
                  decoration: BoxDecoration(
                      color: badgeColor,
                      shape: BoxShape.circle,
                      border: Border.all(color: bg, width: 2)),
                  child: const Icon(Icons.edit_rounded,
                      color: Colors.white, size: 11),
                ),
              ),
            ]),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.fullName?.isNotEmpty == true
                      ? user!.fullName
                      : user?.username ?? 'Utilisateur',
                  style: TextStyle(
                      color: textColor,
                      fontSize: 17,
                      fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text('@${user?.username ?? ''}',
                    style: TextStyle(color: subColor, fontSize: 12)),
                const SizedBox(height: 6),
                Row(children: [
                  // ✅ Badge rôle traduit
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: badgeColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: badgeColor.withOpacity(0.4)),
                    ),
                    child: Text(badgeLabel,
                        style: TextStyle(
                            color: badgeColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.verified_rounded,
                      color: AppColors.success, size: 15),
                ]),
              ],
            ),
          ),
        ]),
        const SizedBox(height: 14),
        // Raccourcis
        Row(children: [
          _quickBtn(Icons.edit_outlined, l10n.editProfile, isDark,
              onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const EditProfileScreen()))
                  .then((_) => setState(() {}))),
          const SizedBox(width: 8),
          _quickBtn(
            isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
            l10n.darkMode, isDark,
            active: isDark,
            onTap: () => theme.toggleTheme(),
          ),
          const SizedBox(width: 8),
          // ✅ Label langue traduit (FR/EN affiché selon langue courante)
          _quickBtn(Icons.language_rounded,
              theme.language == 'fr' ? 'EN' : 'FR', isDark,
              onTap: () =>
                  theme.setLanguage(theme.language == 'fr' ? 'en' : 'fr')),
          const SizedBox(width: 8),
          _quickBtn(Icons.headset_mic_outlined, 'Support', isDark,
              onTap: () => Navigator.push(context,
                  MaterialPageRoute(
                      builder: (_) => const SupportScreen()))),
        ]),
      ]),
    );
  }

  Widget _quickBtn(IconData icon, String label, bool isDark,
      {required VoidCallback onTap, bool active = false}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: active
                ? AppColors.primary.withOpacity(0.15)
                : (isDark ? AppColors.cardDark : AppColors.cardLight),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: active
                    ? AppColors.primary.withOpacity(0.4)
                    : (isDark
                        ? AppColors.borderDark
                        : AppColors.borderLight)),
          ),
          child: Column(children: [
            Icon(icon,
                size: 18,
                color: active
                    ? AppColors.primary
                    : (isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondaryLight)),
            const SizedBox(height: 3),
            Text(label,
                style: TextStyle(
                    fontSize: 9,
                    color: active
                        ? AppColors.primary
                        : (isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight)),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ]),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1 — TABLEAU DE BORD ADMIN
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildAdminDashTab(bool isDark, Color textColor, Color subColor,
      AppL10n l10n, AuthProvider auth, ThemeProvider theme) {
    final users    = _adminStats['users']    as Map? ?? {};
    final housings = _adminStats['housings'] as Map? ?? {};
    final activity = _adminStats['activity'] as Map? ?? {};

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(children: [
        if (_loadingAdminStats)
          const Center(
              child:
                  CircularProgressIndicator(color: AppColors.danger))
        else ...[
          // ── Stats utilisateurs ──────────────────────────────────────
          _adminSectionTitle('👥 ${l10n.users}', isDark),
          const SizedBox(height: 10),
          Row(children: [
            _adminStatCard(Icons.people_rounded, const Color(0xFF2563EB),
                users['total']?.toString() ?? '0', 'Total', isDark),
            const SizedBox(width: 10),
            _adminStatCard(Icons.home_rounded, AppColors.success,
                users['proprietaires']?.toString() ?? '0',
                l10n.owner, isDark),
            const SizedBox(width: 10),
            _adminStatCard(Icons.search_rounded, const Color(0xFF7C3AED),
                users['locataires']?.toString() ?? '0',
                l10n.tenant, isDark),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            _adminStatCard(Icons.block_rounded, AppColors.warning,
                users['blocked']?.toString() ?? '0',
                l10n.block, isDark),
            const SizedBox(width: 10),
            _adminStatCard(Icons.person_add_rounded,
                const Color(0xFF06B6D4),
                users['new_30d']?.toString() ?? '0', 'Nouveaux 30j',
                isDark),
            const SizedBox(width: 10),
            const Expanded(child: SizedBox()),
          ]),
          const SizedBox(height: 18),

          // ── Stats logements ─────────────────────────────────────────
          _adminSectionTitle('🏠 ${l10n.housings}', isDark),
          const SizedBox(height: 10),
          Row(children: [
            _adminStatCard(Icons.home_work_rounded,
                const Color(0xFF2563EB),
                housings['total']?.toString() ?? '0', 'Total', isDark),
            const SizedBox(width: 10),
            _adminStatCard(
                Icons.check_circle_outline_rounded, AppColors.success,
                housings['available']?.toString() ?? '0',
                l10n.available, isDark),
            const SizedBox(width: 10),
            _adminStatCard(Icons.event_rounded, AppColors.warning,
                housings['reserved']?.toString() ?? '0',
                l10n.reserved, isDark),
          ]),
          const SizedBox(height: 18),

          // ── Stats activité ──────────────────────────────────────────
          _adminSectionTitle('📊 Activité', isDark),
          const SizedBox(height: 10),
          Row(children: [
            _adminStatCard(Icons.chat_rounded, const Color(0xFF2563EB),
                activity['total_messages']?.toString() ?? '0',
                l10n.messages, isDark),
            const SizedBox(width: 10),
            _adminStatCard(Icons.calendar_today_rounded, AppColors.success,
                activity['total_visits']?.toString() ?? '0',
                l10n.myVisits, isDark),
            const SizedBox(width: 10),
            _adminStatCard(Icons.schedule_rounded, AppColors.warning,
                activity['pending_visits']?.toString() ?? '0',
                l10n.pending, isDark),
          ]),
          const SizedBox(height: 20),
        ],

        _actionCard(isDark, Icons.tune_rounded, AppColors.secondary,
            'Préférences', 'Personnalisez vos recommandations',
            () => Navigator.push(context,
                MaterialPageRoute(
                    builder: (_) => const PreferencesScreen()))),
        const SizedBox(height: 10),
        _logoutBtn(isDark, l10n, auth),
      ]),
    );
  }

  Widget _adminSectionTitle(String t, bool isDark) => Align(
    alignment: Alignment.centerLeft,
    child: Text(t,
        style: TextStyle(
            color: isDark ? AppColors.textDark : AppColors.textLight,
            fontSize: 14,
            fontWeight: FontWeight.bold)),
  );

  Widget _adminStatCard(IconData icon, Color color, String value,
      String label, bool isDark) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(12),
          border:
              Border.all(color: color.withOpacity(0.35), width: 1.5),
        ),
        child: Column(children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 5),
          Text(value,
              style: TextStyle(
                  color: textColor,
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
          Text(label,
              style: TextStyle(
                  color: color.withOpacity(0.8),
                  fontSize: 8,
                  fontWeight: FontWeight.bold),
              textAlign: TextAlign.center),
        ]),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2 — UTILISATEURS (admin)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildAdminUsersTab(bool isDark, Color textColor, Color subColor,
      AppL10n l10n) {
    return Column(children: [
      // ✅ Filtres traduits
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: TextField(
          style: TextStyle(color: textColor, fontSize: 13),
          decoration: _searchDeco('Rechercher…', isDark),
          onChanged: (v) => setState(() => _adminUserSearch = v),
        ),
      ),
      _filterRow([
        ('all', 'Tous'),
        ('proprietaire', l10n.owner),
        ('locataire', l10n.tenant),
      ], _adminUserRole, (v) {
        setState(() => _adminUserRole = v);
      }, isDark, activeColor: AppColors.danger),

      Expanded(
        child: _loadingAdminUsers
            ? const Center(
                child: CircularProgressIndicator(
                    color: AppColors.danger))
            : RefreshIndicator(
                onRefresh: _loadAdminUsers,
                color: AppColors.danger,
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 8),
                  itemCount: _filteredAdminUsers.length,
                  itemBuilder: (_, i) => _adminUserRow(
                      _filteredAdminUsers[i], isDark, textColor,
                      subColor, l10n),
                ),
              ),
      ),
    ]);
  }

  Widget _adminUserRow(UserModel u, bool isDark, Color textColor,
      Color subColor, AppL10n l10n) {
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: border)),
      child: Row(children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: AppColors.primary.withOpacity(0.15),
          backgroundImage:
              u.photo != null ? NetworkImage(u.photo!) : null,
          child: u.photo == null
              ? Text(u.initials,
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 13))
              : null,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                  u.fullName.isNotEmpty ? u.fullName : u.username,
                  style: TextStyle(
                      color: textColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
              Text(u.email,
                  style: TextStyle(color: subColor, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
              Row(children: [
                // ✅ Traduit
                if (u.isProprietaire)
                  _pill(l10n.owner, AppColors.success),
                if (u.isLocataire)
                  _pill(l10n.tenant, AppColors.primary),
              ]),
            ],
          ),
        ),
        PopupMenuButton<String>(
          icon: Icon(Icons.more_vert, color: subColor, size: 18),
          color: isDark ? AppColors.cardDark : AppColors.surfaceLight,
          onSelected: (action) async {
            if (action == 'block') {
              await _api.blockUser(u.id);
              _loadAdminUsers();
            } else if (action == 'unblock') {
              await _api.unblockUser(u.id);
              _loadAdminUsers();
            } else if (action == 'delete') {
              final ok = await _confirm(
                  l10n.delete, 'Supprimer ${u.username} ?', isDark);
              if (ok) {
                await _api.deleteAdminUser(u.id);
                _loadAdminUsers();
              }
            }
          },
          // ✅ Traduit
          itemBuilder: (_) => [
            PopupMenuItem(value: 'block',   child: Text(l10n.block)),
            PopupMenuItem(value: 'unblock', child: Text(l10n.unblock)),
            PopupMenuItem(
                value: 'delete',
                child: Text(l10n.delete,
                    style: const TextStyle(color: AppColors.danger))),
          ],
        ),
      ]),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3 — LOGEMENTS (admin)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildAdminHousingsTab(bool isDark, Color textColor,
      Color subColor, AppL10n l10n) {
    return RefreshIndicator(
      onRefresh: _loadAdminHousings,
      color: AppColors.danger,
      child: _loadingAdminHousings
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.danger))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _adminHousings.length,
              itemBuilder: (_, i) => _adminHousingRow(
                  _adminHousings[i], isDark, textColor, subColor, l10n),
            ),
    );
  }

  Widget _adminHousingRow(HousingModel h, bool isDark, Color textColor,
      Color subColor, AppL10n l10n) {
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: border)),
      child: Row(children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: h.mainImage != null
              ? CachedNetworkImage(
                  imageUrl: h.mainImage!,
                  width: 55, height: 55, fit: BoxFit.cover)
              : Container(
                  width: 55, height: 55,
                  color: AppColors.surfaceDark,
                  child: const Icon(Icons.home,
                      color: AppColors.textMutedDark)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(h.displayName,
                  style: TextStyle(
                      color: textColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
              Text('${_fmt(h.price)} FCFA',
                  style: const TextStyle(
                      color: AppColors.primary, fontSize: 11)),
              Text(h.locationStr,
                  style: TextStyle(color: subColor, fontSize: 10)),
            ],
          ),
        ),
        IconButton(
          icon: Icon(
            h.isVisible
                ? Icons.visibility_rounded
                : Icons.visibility_off_rounded,
            color: h.isVisible
                ? AppColors.success
                : AppColors.textMutedDark,
            size: 20,
          ),
          onPressed: () async {
            await _api.toggleHousingVisibility(h.id);
            _loadAdminHousings();
          },
        ),
        IconButton(
          icon: const Icon(Icons.delete_outline_rounded,
              color: AppColors.danger, size: 20),
          onPressed: () async {
            final ok = await _confirm(
                l10n.delete, 'Supprimer "${h.displayName}" ?', isDark);
            if (ok) {
              await _api.deleteAdminHousing(h.id);
              _loadAdminHousings();
            }
          },
        ),
      ]),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1 — TABLEAU DE BORD (proprio / locataire)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildDashTab(user, bool isDark, Color textColor, Color subColor,
      AppL10n l10n, bool isOwner, ThemeProvider theme,
      AuthProvider auth) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(children: [
        Row(children: [
          _statCard(Icons.favorite_rounded, AppColors.danger,
              _favorites.length.toString(), l10n.myFavorites, isDark),
          const SizedBox(width: 12),
          _statCard(Icons.calendar_today_rounded, AppColors.primary,
              _visits.length.toString(), l10n.myVisits, isDark),
          if (isOwner) ...[
            const SizedBox(width: 12),
            _statCard(Icons.home_work_rounded, AppColors.secondary,
                _myHousings.length.toString(), l10n.myListings, isDark),
          ],
        ]),
        const SizedBox(height: 20),
        if (isOwner) ...[
          _actionCard(isDark, Icons.add_home_rounded, AppColors.success,
              l10n.addHousing, 'Publiez une nouvelle annonce',
              () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const AddHousingScreen()))
                  .then((_) => _loadMyHousings())),
          const SizedBox(height: 10),
        ],
        _actionCard(isDark, Icons.tune_rounded, AppColors.secondary,
            'Préférences', 'Personnalisez vos recommandations IA',
            () => Navigator.push(context,
                MaterialPageRoute(
                    builder: (_) => const PreferencesScreen()))),
        const SizedBox(height: 10),
        _actionCard(isDark, Icons.headset_mic_rounded, AppColors.info,
            'Assistance & Support', 'Chat, WhatsApp, Email, Appel',
            () => Navigator.push(context,
                MaterialPageRoute(
                    builder: (_) => const SupportScreen()))),
        const SizedBox(height: 10),
        if (user != null)
          _actionCard(
              isDark,
              Icons.swap_horiz_rounded,
              AppColors.warning,
              // ✅ Traduit
              user.isProprietaire
                  ? l10n.switchToTenant
                  : l10n.switchToOwner,
              user.isProprietaire
                  ? 'Passer en mode locataire'
                  : 'Commencer à louer votre bien',
              () => _switchRole(user, l10n)),
        const SizedBox(height: 10),
        _logoutBtn(isDark, l10n, auth),
      ]),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2 — MES FAVORIS (locataire)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildFavoritesTab(bool isDark, AppL10n l10n) {
    if (_loadingFav) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.primary));
    }
    if (_favorites.isEmpty) {
      return _empty(Icons.favorite_outline_rounded, l10n.noFavorites,
          '', isDark,
          action: ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/search'),
              child: Text('Explorer les logements')));
    }
    return RefreshIndicator(
      onRefresh: _loadFavorites,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _favorites.length,
        itemBuilder: (_, i) => _housingListItem(_favorites[i], isDark,
            onRemove: () async {
              await _api.toggleLike(_favorites[i].id);
              _loadFavorites();
            }),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3 — MES VISITES (locataire)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildVisitsTab(bool isDark, AppL10n l10n) {
    return Column(children: [
      // ✅ Labels traduits
      _filterRow([
        ('all', 'Toutes'),
        ('attente', l10n.pending),
        ('confirme', l10n.confirmed),
        ('refuse', l10n.refuse),
      ], _visitFilter,
          (v) => setState(() => _visitFilter = v), isDark),
      Expanded(
        child: _loadingVis
            ? const Center(
                child: CircularProgressIndicator(
                    color: AppColors.primary))
            : _filtVisits.isEmpty
                ? _empty(Icons.calendar_today_outlined,
                    l10n.myVisits, '', isDark)
                : RefreshIndicator(
                    onRefresh: _loadVisits,
                    color: AppColors.primary,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filtVisits.length,
                      itemBuilder: (_, i) => _visitCard(
                          _filtVisits[i], isDark,
                          isOwner: false, l10n: l10n),
                    ),
                  ),
      ),
    ]);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2 — MES ANNONCES (propriétaire)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildMyHousingsTab(bool isDark, AppL10n l10n) {
    return Column(children: [
      // ✅ Labels traduits
      _filterRow([
        ('all', 'Toutes'),
        ('disponible', l10n.available),
        ('reserve',    l10n.reserved),
        ('occupe',     l10n.occupied),
      ], _housingFilter,
          (v) => setState(() => _housingFilter = v), isDark),
      Expanded(
        child: _loadingHousing
            ? const Center(
                child: CircularProgressIndicator(
                    color: AppColors.primary))
            : _filtHousings.isEmpty
                ? _empty(Icons.home_work_outlined,
                    l10n.myListings, '', isDark,
                    action: ElevatedButton.icon(
                      onPressed: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const AddHousingScreen()))
                          .then((_) => _loadMyHousings()),
                      icon: const Icon(Icons.add, size: 18),
                      label: Text(l10n.addHousing),
                    ))
                : RefreshIndicator(
                    onRefresh: _loadMyHousings,
                    color: AppColors.primary,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filtHousings.length,
                      itemBuilder: (_, i) =>
                          _myHousingCard(_filtHousings[i], isDark, l10n),
                    ),
                  ),
      ),
    ]);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3 — RÉSERVATIONS (propriétaire)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildReservationsTab(bool isDark, AppL10n l10n) {
    return Column(children: [
      // ✅ Labels traduits
      _filterRow([
        ('all', 'Toutes'),
        ('attente', l10n.pending),
        ('confirme', l10n.confirmed),
        ('refuse', l10n.refuse),
      ], _resFilter,
          (v) => setState(() => _resFilter = v), isDark),
      Expanded(
        child: _loadingRes
            ? const Center(
                child: CircularProgressIndicator(
                    color: AppColors.primary))
            : _filtRes.isEmpty
                ? _empty(Icons.calendar_month_outlined,
                    l10n.reservations, '', isDark)
                : RefreshIndicator(
                    onRefresh: _loadReservations,
                    color: AppColors.primary,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _filtRes.length,
                      itemBuilder: (_, i) => _visitCard(
                          _filtRes[i], isDark,
                          isOwner: true, l10n: l10n),
                    ),
                  ),
      ),
    ]);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 4 — PARAMÈTRES (tous)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildSettingsTab(bool isDark, Color textColor, Color subColor,
      AppL10n l10n, ThemeProvider theme, AuthProvider auth) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(children: [
        // ✅ Labels traduits
        _settingTile(isDark, Icons.language_rounded, l10n.languageLabel,
            subColor,
            trailing: Text(
              theme.language == 'fr' ? 'Français' : 'English',
              style: const TextStyle(
                  color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
            onTap: () =>
                theme.setLanguage(theme.language == 'fr' ? 'en' : 'fr')),
        _settingTile(isDark, Icons.dark_mode_rounded, l10n.darkMode,
            subColor,
            trailing: Switch(
                value: isDark,
                activeColor: AppColors.primary,
                onChanged: (_) => theme.toggleTheme()),
            onTap: () => theme.toggleTheme()),
        _settingTile(isDark, Icons.notifications_outlined,
            l10n.notifications, subColor,
            onTap: () =>
                Navigator.pushNamed(context, '/notifications')),
        // ✅ Traduit
        _settingTile(isDark, Icons.security_outlined, l10n.security,
            subColor,
            onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => const EditProfileScreen()))),
        const SizedBox(height: 20),
        _logoutBtn(isDark, l10n, auth),
      ]),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // WIDGETS PARTAGÉS
  // ══════════════════════════════════════════════════════════════════════════
  Widget _housingListItem(HousingModel h, bool isDark,
      {VoidCallback? onRemove}) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
    final l10n = context.l10n;

    return GestureDetector(
      onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => HousingDetailScreen(housingId: h.id))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border)),
        child: Row(children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: h.mainImage != null
                ? CachedNetworkImage(
                    imageUrl: h.mainImage!,
                    width: 75, height: 75, fit: BoxFit.cover)
                : Container(
                    width: 75, height: 75,
                    color: AppColors.surfaceDark,
                    child: const Icon(Icons.home,
                        color: AppColors.textMutedDark)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _statusBadge(h.status, l10n),
                const SizedBox(height: 3),
                Text(h.displayName,
                    style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                // ✅ perMonth traduit
                Text('${_fmt(h.price)} FCFA${l10n.perMonth}',
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.bold)),
                Row(children: [
                  Icon(Icons.visibility_outlined,
                      size: 11, color: subColor),
                  Text(' ${h.viewsCount}',
                      style: TextStyle(color: subColor, fontSize: 10)),
                  const SizedBox(width: 8),
                  Icon(Icons.favorite_outline_rounded,
                      size: 11, color: subColor),
                  Text(' ${h.likesCount}',
                      style: TextStyle(color: subColor, fontSize: 10)),
                  const SizedBox(width: 8),
                  Text(_relDate(h.createdAt),
                      style:
                          TextStyle(color: subColor, fontSize: 10)),
                ]),
              ],
            ),
          ),
          if (onRemove != null)
            IconButton(
              icon: const Icon(Icons.favorite_rounded,
                  color: AppColors.danger, size: 22),
              onPressed: onRemove,
            ),
        ]),
      ),
    );
  }

  // Widget _visitCard(VisitModel v, bool isDark,
  //     {required bool isOwner, required AppL10n l10n}) {
  //   final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
  //   final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
  //   final textColor = isDark ? AppColors.textDark : AppColors.textLight;
  //   final subColor  = isDark
  //       ? AppColors.textSecondaryDark
  //       : AppColors.textSecondaryLight;

  //   Color statusColor;
  //   switch (v.status) {
  //     case 'confirme': statusColor = AppColors.success; break;
  //     case 'refuse':   statusColor = AppColors.danger;  break;
  //     default:         statusColor = AppColors.warning;
  //   }

  //   // ✅ statusLabel traduit
  //   String statusLabel;
  //   switch (v.status) {
  //     case 'confirme': statusLabel = l10n.confirmed; break;
  //     case 'refuse':   statusLabel = l10n.refuse; break;
  //     case 'annule':   statusLabel = l10n.cancelVisit; break;
  //     default:         statusLabel = l10n.pending;
  //   }

  //   return Container(
  //     margin: const EdgeInsets.only(bottom: 12),
  //     padding: const EdgeInsets.all(14),
  //     decoration: BoxDecoration(
  //         color: cardBg,
  //         borderRadius: BorderRadius.circular(14),
  //         border: Border.all(color: border)),
  //     child: Column(
  //       crossAxisAlignment: CrossAxisAlignment.start,
  //       children: [
  //         Row(children: [
  //           Expanded(
  //             child: Text(v.housingTitle,
  //                 style: TextStyle(
  //                     color: textColor,
  //                     fontWeight: FontWeight.w600,
  //                     fontSize: 13),
  //                 maxLines: 1,
  //                 overflow: TextOverflow.ellipsis),
  //           ),
  //           Container(
  //             padding: const EdgeInsets.symmetric(
  //                 horizontal: 10, vertical: 3),
  //             decoration: BoxDecoration(
  //                 color: statusColor.withOpacity(0.12),
  //                 borderRadius: BorderRadius.circular(20)),
  //             child: Text(statusLabel,
  //                 style: TextStyle(
  //                     color: statusColor,
  //                     fontSize: 10,
  //                     fontWeight: FontWeight.w600)),
  //           ),
  //         ]),
  //         const SizedBox(height: 6),
  //         Row(children: [
  //           Icon(Icons.calendar_today_outlined,
  //               size: 13, color: subColor),
  //           const SizedBox(width: 4),
  //           Text(
  //             '${v.date.day.toString().padLeft(2, '0')}/'
  //             '${v.date.month.toString().padLeft(2, '0')}/'
  //             '${v.date.year} à ${v.time}',
  //             style: TextStyle(color: subColor, fontSize: 12),
  //           ),
  //         ]),
  //         if (isOwner && v.locataireName != null) ...[
  //           const SizedBox(height: 4),
  //           Text('${l10n.tenant} : ${v.locataireName}',
  //               style: TextStyle(color: subColor, fontSize: 11)),
  //         ],
  //         if (!isOwner && v.ownerName != null) ...[
  //           const SizedBox(height: 4),
  //           Text('${l10n.owner} : ${v.ownerName}',
  //               style: TextStyle(color: subColor, fontSize: 11)),
  //         ],
  //         const SizedBox(height: 10),
  //         Row(children: [
  //           Expanded(
  //             child: OutlinedButton.icon(
  //               onPressed: () => Navigator.push(
  //                   context,
  //                   MaterialPageRoute(
  //                       builder: (_) =>
  //                           HousingDetailScreen(housingId: v.housingId))),
  //               icon: const Icon(Icons.visibility_outlined, size: 14),
  //               label: const Text('Voir', style: TextStyle(fontSize: 12)),
  //               style: OutlinedButton.styleFrom(
  //                   foregroundColor: AppColors.primary,
  //                   side: const BorderSide(color: AppColors.primary),
  //                   padding: const EdgeInsets.symmetric(vertical: 8),
  //                   shape: RoundedRectangleBorder(
  //                       borderRadius: BorderRadius.circular(8))),
  //             ),
  //           ),
  //           if (isOwner && v.status == 'attente') ...[
  //             const SizedBox(width: 8),
  //             Expanded(
  //               child: ElevatedButton.icon(
  //                 onPressed: () async {
  //                   await _api.confirmVisit(v.id);
  //                   _loadReservations();
  //                 },
  //                 icon: const Icon(Icons.check_rounded,
  //                     size: 14, color: Colors.white),
  //                 // ✅ Traduit
  //                 label: Text(l10n.confirm,
  //                     style: const TextStyle(
  //                         fontSize: 12, color: Colors.white)),
  //                 style: ElevatedButton.styleFrom(
  //                     backgroundColor: AppColors.success,
  //                     padding: const EdgeInsets.symmetric(vertical: 8),
  //                     shape: RoundedRectangleBorder(
  //                         borderRadius: BorderRadius.circular(8))),
  //               ),
  //             ),
  //             const SizedBox(width: 8),
  //             Expanded(
  //               child: OutlinedButton.icon(
  //                 onPressed: () async {
  //                   final ok = await _confirm(
  //                       l10n.refuse, 'Refuser cette visite ?', isDark);
  //                   if (ok) {
  //                     await _api.refuseVisit(v.id);
  //                     _loadReservations();
  //                   }
  //                 },
  //                 icon: const Icon(Icons.close_rounded, size: 14),
  //                 // ✅ Traduit
  //                 label: Text(l10n.refuse,
  //                     style: const TextStyle(fontSize: 12)),
  //                 style: OutlinedButton.styleFrom(
  //                     foregroundColor: AppColors.danger,
  //                     side: const BorderSide(color: AppColors.danger),
  //                     padding: const EdgeInsets.symmetric(vertical: 8),
  //                     shape: RoundedRectangleBorder(
  //                         borderRadius: BorderRadius.circular(8))),
  //               ),
  //             ),
  //           ],
  //           if (!isOwner && v.status == 'attente') ...[
  //             const SizedBox(width: 8),
  //             Expanded(
  //               child: OutlinedButton.icon(
  //                 onPressed: () async {
  //                   final ok = await _confirm(
  //                       l10n.cancelVisit, 'Annuler cette visite ?', isDark);
  //                   if (ok) {
  //                     await _api.cancelVisit(v.id);
  //                     _loadVisits();
  //                   }
  //                 },
  //                 icon: const Icon(Icons.cancel_outlined, size: 14),
  //                 // ✅ Traduit
  //                 label: Text(l10n.cancelVisit,
  //                     style: const TextStyle(fontSize: 12)),
  //                 style: OutlinedButton.styleFrom(
  //                     foregroundColor: AppColors.warning,
  //                     side: const BorderSide(color: AppColors.warning),
  //                     padding: const EdgeInsets.symmetric(vertical: 8),
  //                     shape: RoundedRectangleBorder(
  //                         borderRadius: BorderRadius.circular(8))),
  //               ),
  //             ),
  //           ],
  //         ]),
  //       ],
  //     ),
  //   );
  // }

 
  Widget _visitCard(VisitModel v, bool isDark,
      {required bool isOwner, required AppL10n l10n}) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
 
    Color statusColor;
    switch (v.status) {
      case 'confirme': statusColor = AppColors.success; break;
      case 'refuse':   statusColor = AppColors.danger;  break;
      default:         statusColor = AppColors.warning;
    }
 
    String statusLabel;
    switch (v.status) {
      case 'confirme': statusLabel = l10n.confirmed;   break;
      case 'refuse':   statusLabel = l10n.refuse;      break;
      case 'annule':   statusLabel = l10n.cancelVisit; break;
      default:         statusLabel = l10n.pending;
    }
 
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ✅ IMAGE DU LOGEMENT (manquante avant)
          if (v.housingImage != null)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(14)),
              child: CachedNetworkImage(
                imageUrl: v.housingImage!,
                height: 140,
                width: double.infinity,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(
                  height: 140,
                  color: AppColors.surfaceDark,
                  child: const Center(
                      child: CircularProgressIndicator(
                          color: AppColors.primary,
                          strokeWidth: 2)),
                ),
                errorWidget: (_, __, ___) => Container(
                  height: 140,
                  color: AppColors.surfaceDark,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.home_work_outlined,
                          size: 36, color: AppColors.textMutedDark),
                      const SizedBox(height: 6),
                      Text(v.housingTitle,
                          style: TextStyle(
                              color: subColor, fontSize: 12),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              ),
            ),
 
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // En-tête : titre + badge statut
                Row(children: [
                  Expanded(
                    child: Text(v.housingTitle,
                        style: TextStyle(
                            color: textColor,
                            fontWeight: FontWeight.w600,
                            fontSize: 13),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20)),
                    child: Text(statusLabel,
                        style: TextStyle(
                            color: statusColor,
                            fontSize: 10,
                            fontWeight: FontWeight.w600)),
                  ),
                ]),
 
                // ✅ Prix du logement
                if (v.housingPrice != null) ...[
                  const SizedBox(height: 3),
                  Text(
                    '${_fmt(v.housingPrice!)} FCFA${l10n.perMonth}',
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.bold),
                  ),
                ],
 
                const SizedBox(height: 6),
 
                // Date + heure
                Row(children: [
                  Icon(Icons.calendar_today_outlined,
                      size: 13, color: subColor),
                  const SizedBox(width: 4),
                  Text(
                    '${v.date.day.toString().padLeft(2, '0')}/'
                    '${v.date.month.toString().padLeft(2, '0')}/'
                    '${v.date.year} à ${v.time}',
                    style: TextStyle(color: subColor, fontSize: 12),
                  ),
                ]),
 
                // Adresse si disponible
                if (v.housingAddress != null) ...[
                  const SizedBox(height: 3),
                  Row(children: [
                    const Icon(Icons.location_on_outlined,
                        size: 13, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(v.housingAddress!,
                        style: TextStyle(color: subColor, fontSize: 11)),
                  ]),
                ],
 
                // Locataire / Propriétaire
                if (isOwner && v.locataireName != null) ...[
                  const SizedBox(height: 4),
                  Text('${l10n.tenant} : ${v.locataireName}',
                      style: TextStyle(color: subColor, fontSize: 11)),
                ],
                if (!isOwner && v.ownerName != null) ...[
                  const SizedBox(height: 4),
                  Text('${l10n.owner} : ${v.ownerName}',
                      style: TextStyle(color: subColor, fontSize: 11)),
                ],
 
                // Message du locataire
                if (v.message != null && v.message!.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isDark
                          ? AppColors.surfaceDark
                          : AppColors.bgLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(v.message!,
                        style:
                            TextStyle(color: subColor, fontSize: 11),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                  ),
                ],
 
                const SizedBox(height: 10),
 
                // Boutons d'action
                Row(children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) => HousingDetailScreen(
                                  housingId: v.housingId))),
                      icon: const Icon(Icons.visibility_outlined,
                          size: 14),
                      label: const Text('Voir',
                          style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(
                              color: AppColors.primary),
                          padding:
                              const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.circular(8))),
                    ),
                  ),
                  if (isOwner && v.status == 'attente') ...[
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          await _api.confirmVisit(v.id);
                          _loadReservations();
                        },
                        icon: const Icon(Icons.check_rounded,
                            size: 14, color: Colors.white),
                        label: Text(l10n.confirm,
                            style: const TextStyle(
                                fontSize: 12, color: Colors.white)),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.success,
                            padding:
                                const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(8))),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final ok = await _confirm(
                              l10n.refuse,
                              'Refuser cette visite ?', isDark);
                          if (ok) {
                            await _api.refuseVisit(v.id);
                            _loadReservations();
                          }
                        },
                        icon: const Icon(Icons.close_rounded,
                            size: 14),
                        label: Text(l10n.refuse,
                            style: const TextStyle(fontSize: 12)),
                        style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.danger,
                            side: const BorderSide(
                                color: AppColors.danger),
                            padding:
                                const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(8))),
                      ),
                    ),
                  ],
                  if (!isOwner && v.status == 'attente') ...[
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final ok = await _confirm(
                              l10n.cancelVisit,
                              'Annuler cette visite ?', isDark);
                          if (ok) {
                            await _api.cancelVisit(v.id);
                            _loadVisits();
                          }
                        },
                        icon: const Icon(Icons.cancel_outlined,
                            size: 14),
                        label: Text(l10n.cancelVisit,
                            style: const TextStyle(fontSize: 12)),
                        style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.warning,
                            side: const BorderSide(
                                color: AppColors.warning),
                            padding:
                                const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(8))),
                      ),
                    ),
                  ],
                ]),
              ],
            ),
          ),
        ],
      ),
    );
  }
 



  Widget _myHousingCard(HousingModel h, bool isDark, AppL10n l10n) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: border)),
      child: Column(children: [
        ListTile(
          contentPadding: const EdgeInsets.all(12),
          leading: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: h.mainImage != null
                ? CachedNetworkImage(
                    imageUrl: h.mainImage!,
                    width: 60, height: 60, fit: BoxFit.cover)
                : Container(
                    width: 60, height: 60,
                    color: AppColors.surfaceDark,
                    child: const Icon(Icons.home,
                        color: AppColors.textMutedDark)),
          ),
          title: Text(h.displayName,
              style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 13),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ✅ Traduit
              Text('${_fmt(h.price)} FCFA${l10n.perMonth}',
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12)),
            ],
          ),
          trailing: PopupMenuButton<String>(
            icon: Icon(Icons.more_vert, color: subColor),
            color:
                isDark ? AppColors.cardDark : AppColors.surfaceLight,
            onSelected: (action) async {
              if (action == 'edit') {
                Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) =>
                                AddHousingScreen(housing: h)))
                    .then((_) => _loadMyHousings());
              } else if (action == 'delete') {
                final ok = await _confirm(l10n.delete,
                    'Supprimer "${h.displayName}" ?', isDark);
                if (ok) {
                  await _api.deleteHousing(h.id);
                  _loadMyHousings();
                }
              }
            },
            // ✅ Traduit
            itemBuilder: (_) => [
              PopupMenuItem(value: 'edit', child: Text(l10n.edit)),
              PopupMenuItem(
                  value: 'delete',
                  child: Text(l10n.delete,
                      style: const TextStyle(
                          color: AppColors.danger))),
            ],
          ),
        ),
        // Sélecteur statut
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          child: Row(
            children: ['disponible', 'reserve', 'occupe'].map((s) {
              final active = h.status == s;
              Color c;
              switch (s) {
                case 'disponible': c = AppColors.success; break;
                case 'reserve':    c = AppColors.warning; break;
                default:           c = AppColors.danger;
              }
              // ✅ Traduit
              String lbl;
              switch (s) {
                case 'disponible': lbl = l10n.available; break;
                case 'reserve':    lbl = l10n.reserved;  break;
                default:           lbl = l10n.occupied;
              }
              return Expanded(
                child: GestureDetector(
                  onTap: () async {
                    await _api.updateHousing(h.id, {'status': s});
                    _loadMyHousings();
                  },
                  child: Container(
                    margin: const EdgeInsets.only(right: 4),
                    padding:
                        const EdgeInsets.symmetric(vertical: 5),
                    decoration: BoxDecoration(
                      color: active
                          ? c.withOpacity(0.15)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: active ? c : border),
                    ),
                    child: Text(lbl,
                        style: TextStyle(
                            color: active ? c : subColor,
                            fontSize: 10,
                            fontWeight: active
                                ? FontWeight.w600
                                : FontWeight.normal),
                        textAlign: TextAlign.center),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ]),
    );
  }

  // ── Helpers UI ─────────────────────────────────────────────────────────────
  Widget _filterRow(List<(String, String)> opts, String selected,
      ValueChanged<String> onSelect, bool isDark,
      {Color activeColor = AppColors.primary}) {
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        itemCount: opts.length,
        itemBuilder: (_, i) {
          final (val, lbl) = opts[i];
          final sel = selected == val;
          return GestureDetector(
            onTap: () => onSelect(val),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: sel
                    ? activeColor
                    : (isDark
                        ? AppColors.cardDark
                        : AppColors.cardLight),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: sel
                        ? activeColor
                        : (isDark
                            ? AppColors.borderDark
                            : AppColors.borderLight)),
              ),
              child: Center(
                child: Text(lbl,
                    style: TextStyle(
                        color: sel
                            ? Colors.white
                            : (isDark
                                ? AppColors.textSecondaryDark
                                : AppColors.textSecondaryLight),
                        fontSize: 12,
                        fontWeight: sel
                            ? FontWeight.w600
                            : FontWeight.normal)),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _statCard(IconData icon, Color color, String count,
      String label, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color:
              isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: isDark
                  ? AppColors.borderDark
                  : AppColors.borderLight),
        ),
        child: Column(children: [
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(height: 8),
          Text(count,
              style: TextStyle(
                  color:
                      isDark ? AppColors.textDark : AppColors.textLight,
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
          Text(label,
              style: TextStyle(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                  fontSize: 9),
              textAlign: TextAlign.center,
              maxLines: 2),
        ]),
      ),
    );
  }

  Widget _actionCard(bool isDark, IconData icon, Color color,
      String title, String sub, VoidCallback onTap) {
    final textColor =
        isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
              color: isDark
                  ? AppColors.borderDark
                  : AppColors.borderLight),
        ),
        child: Row(children: [
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 13)),
                Text(sub,
                    style:
                        TextStyle(color: subColor, fontSize: 11)),
              ],
            ),
          ),
          Icon(Icons.chevron_right_rounded, color: subColor, size: 18),
        ]),
      ),
    );
  }

  Widget _logoutBtn(bool isDark, AppL10n l10n, AuthProvider auth) {
    return GestureDetector(
      onTap: () async {
        final ok = await _confirm(l10n.logout,
            'Voulez-vous vraiment vous déconnecter ?', isDark);
        if (ok && mounted) {
          await auth.logout();
          if (mounted) {
            Navigator.pushNamedAndRemoveUntil(
                context, '/login', (_) => false);
          }
        }
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.danger.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border:
              Border.all(color: AppColors.danger.withOpacity(0.3)),
        ),
        child: Row(children: [
          const Icon(Icons.logout_rounded,
              color: AppColors.danger, size: 22),
          const SizedBox(width: 12),
          Text(l10n.logout,
              style: const TextStyle(
                  color: AppColors.danger,
                  fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }

  Widget _settingTile(bool isDark, IconData icon, String label,
      Color subColor,
      {Widget? trailing, required VoidCallback onTap}) {
    final textColor =
        isDark ? AppColors.textDark : AppColors.textLight;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: isDark
                ? AppColors.borderDark
                : AppColors.borderLight),
      ),
      child: ListTile(
        leading: Icon(icon, color: subColor, size: 20),
        title:
            Text(label, style: TextStyle(color: textColor, fontSize: 14)),
        trailing: trailing ??
            Icon(Icons.chevron_right_rounded, color: subColor, size: 18),
        onTap: onTap,
        dense: true,
      ),
    );
  }

  Widget _pill(String label, Color color) => Container(
    margin: const EdgeInsets.only(right: 4, top: 2),
    padding:
        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10)),
    child: Text(label,
        style: TextStyle(
            color: color, fontSize: 9, fontWeight: FontWeight.w600)),
  );

  Widget _statusBadge(String status, AppL10n l10n) {
    Color c;
    String lbl;
    switch (status) {
      case 'disponible':
        c = AppColors.success;
        lbl = l10n.available.toUpperCase();
        break;
      case 'reserve':
        c = AppColors.warning;
        lbl = l10n.reserved.toUpperCase();
        break;
      default:
        c = AppColors.danger;
        lbl = l10n.occupied.toUpperCase();
    }
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
          color: c, borderRadius: BorderRadius.circular(20)),
      child: Text(lbl,
          style: const TextStyle(
              color: Colors.white,
              fontSize: 9,
              fontWeight: FontWeight.bold)),
    );
  }

  Widget _empty(IconData icon, String title, String sub, bool isDark,
      {Widget? action}) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                size: 60,
                color: isDark
                    ? AppColors.textMutedDark
                    : AppColors.textMutedLight),
            const SizedBox(height: 16),
            Text(title,
                style: TextStyle(
                    color:
                        isDark ? AppColors.textDark : AppColors.textLight,
                    fontSize: 15,
                    fontWeight: FontWeight.w600)),
            if (sub.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(sub,
                  style: TextStyle(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                      fontSize: 12),
                  textAlign: TextAlign.center),
            ],
            if (action != null) ...[
              const SizedBox(height: 20),
              action,
            ],
          ],
        ),
      ),
    );
  }

  Future<bool> _confirm(
      String title, String msg, bool isDark) async {
    return await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            backgroundColor: isDark
                ? AppColors.cardDark
                : AppColors.surfaceLight,
            title: Text(title),
            content: Text(msg),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Annuler')),
              TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: Text(title,
                      style: const TextStyle(
                          color: AppColors.danger))),
            ],
          ),
        ) ??
        false;
  }

  Future<void> _switchRole(user, AppL10n l10n) async {
    final auth      = context.read<AuthProvider>();
    final newIsOwner = !user.isProprietaire;
    await auth.updateProfile({
      'is_proprietaire': newIsOwner,
      'is_locataire':    !newIsOwner,
    });
    _tabs.dispose();
    _initTabs();
    setState(() {});
  }

  String _fmt(int price) {
    if (price >= 1000000) {
      return '${(price / 1000000).toStringAsFixed(1)}M';
    }
    final s   = price.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  String _relDate(DateTime dt) {
    final l10n = context.l10n;
    final d    = DateTime.now().difference(dt).inDays;
    if (d == 0) return l10n.today;
    if (d < 30) return l10n.daysAgo(d);
    return l10n.monthsAgo((d / 30).floor());
  }

  InputDecoration _searchDeco(String hint, bool isDark) =>
      InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(
            color: AppColors.textMutedDark, fontSize: 13),
        prefixIcon: const Icon(Icons.search,
            color: AppColors.textMutedDark, size: 18),
        filled: true,
        fillColor:
            isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
                color: isDark
                    ? AppColors.borderDark
                    : AppColors.borderLight)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
                color: isDark
                    ? AppColors.borderDark
                    : AppColors.borderLight)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(
                color: AppColors.primary, width: 1.5)),
      );
}

// ── TabBar delegate ──────────────────────────────────────────────────────────
class _TabDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  final Color  bg;
  _TabDelegate(this.tabBar, this.bg);
  @override
  Widget build(_, __, ___) => Container(color: bg, child: tabBar);
  @override
  double get maxExtent => tabBar.preferredSize.height;
  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  bool shouldRebuild(_TabDelegate old) => tabBar != old.tabBar;
}