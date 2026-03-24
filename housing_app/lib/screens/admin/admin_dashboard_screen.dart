// // lib/screens/admin/admin_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/models/user_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';
import '../../widgets/app_bar_widget.dart';
// Pages normales accessibles à l'admin
import '../home/home_screen.dart';
import '../search/search_screen.dart';
import '../messaging/conversations_screen.dart';
import '../profile/profile_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});
  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  // ── Bottom nav index ──────────────────────────────────────
  // 0=Admin | 1=Home | 2=Search | 3=Messages | 4=Profil
  int _navIndex = 0;

  // ── Admin tabs ────────────────────────────────────────────
  late TabController _adminTabs;
  final _api = ApiService();

  Map<String, dynamic> _stats = {};
  List<UserModel>    _users    = [];
  List<HousingModel> _housings = [];
  List<dynamic>      _supportConvs = [];

  bool _loadingStats    = true;
  bool _loadingUsers    = false;
  bool _loadingHousings = false;
  bool _loadingSupport  = false;

  String _userSearch = '';
  String _userRole   = 'all';

  @override
  void initState() {
    super.initState();
    _adminTabs = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadAll());
  }

  @override
  void dispose() {
    _adminTabs.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    await Future.wait([_loadStats(), _loadUsers(), _loadHousings(), _loadSupport()]);
  }

  Future<void> _loadStats() async {
    setState(() => _loadingStats = true);
    try { _stats = await _api.getAdminStats(); } catch (_) {}
    if (mounted) setState(() => _loadingStats = false);
  }

  Future<void> _loadUsers() async {
    setState(() => _loadingUsers = true);
    try { _users = await _api.getAdminUsers(search: _userSearch, role: _userRole); } catch (_) {}
    if (mounted) setState(() => _loadingUsers = false);
  }

  Future<void> _loadHousings() async {
    setState(() => _loadingHousings = true);
    try { _housings = await _api.getAdminHousings(); } catch (_) {}
    if (mounted) setState(() => _loadingHousings = false);
  }

  Future<void> _loadSupport() async {
    setState(() => _loadingSupport = true);
    try {
      _supportConvs = await _api.getConversations();
    } catch (_) {}
    if (mounted) setState(() => _loadingSupport = false);
  }

  @override
  Widget build(BuildContext context) {
    final isDark    = context.watch<ThemeProvider>().isDarkMode;
    final l10n      = context.l10n;
    final bg        = isDark ? AppColors.bgDark : AppColors.bgLight;
    final navBg     = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    // Pages selon l'index de la bottom nav
    final pages = <Widget>[
      _buildAdminPanel(isDark, l10n, subColor),
      _WithAppBar(child: const HomeScreen()),
      _WithAppBar(title: l10n.search, child: const SearchScreen()),
      _WithAppBar(title: l10n.messages, child: const ConversationsScreen()),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: bg,
      body: IndexedStack(index: _navIndex, children: pages),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: navBg,
          border: Border(top: BorderSide(color: border)),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // Admin (onglet spécial en rouge)
                _NavItem(
                  icon: Icons.admin_panel_settings_outlined,
                  activeIcon: Icons.admin_panel_settings_rounded,
                  label: 'Admin',
                  active: _navIndex == 0,
                  activeColor: AppColors.danger,
                  onTap: () => setState(() => _navIndex = 0),
                ),
                _NavItem(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: l10n.home,
                  active: _navIndex == 1,
                  onTap: () => setState(() => _navIndex = 1),
                ),
                _NavItem(
                  icon: Icons.search_outlined,
                  activeIcon: Icons.search_rounded,
                  label: l10n.search,
                  active: _navIndex == 2,
                  onTap: () => setState(() => _navIndex = 2),
                ),
                _NavItem(
                  icon: Icons.chat_bubble_outline_rounded,
                  activeIcon: Icons.chat_bubble_rounded,
                  label: l10n.messages,
                  active: _navIndex == 3,
                  onTap: () => setState(() => _navIndex = 3),
                ),
                _NavItem(
                  icon: Icons.person_outline_rounded,
                  activeIcon: Icons.person_rounded,
                  label: l10n.profile,
                  active: _navIndex == 4,
                  onTap: () => setState(() => _navIndex = 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Panel Admin ───────────────────────────────────────────
  Widget _buildAdminPanel(bool isDark, AppL10n l10n, Color subColor) {
    final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: RentalAppBar(
        showBack: false,
        extraActions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.danger.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.danger.withOpacity(0.4)),
            ),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.admin_panel_settings_rounded, color: AppColors.danger, size: 14),
              SizedBox(width: 4),
              Text('Admin', style: TextStyle(color: AppColors.danger, fontSize: 11, fontWeight: FontWeight.bold)),
            ]),
          ),
        ],
      ),
      body: Column(children: [
        // Titre Overview
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
          child: Row(children: [
            const Icon(Icons.bar_chart_rounded, color: AppColors.primary, size: 22),
            const SizedBox(width: 8),
            Text('Overview', style: TextStyle(color: textColor, fontSize: 22, fontWeight: FontWeight.bold)),
          ]),
        ),
        // Tab bar admin
        TabBar(
          controller: _adminTabs,
          labelColor: AppColors.primary,
          unselectedLabelColor: subColor,
          indicatorColor: AppColors.primary,
          indicatorSize: TabBarIndicatorSize.label,
          dividerColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          tabs: const [
            Tab(text: 'Vue d\'ensemble'),
            Tab(text: 'Utilisateurs'),
            Tab(text: 'Logements'),
            Tab(text: 'Support'),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _adminTabs,
            children: [
              _buildOverview(isDark),
              _buildUsers(isDark),
              _buildHousings(isDark),
              _buildSupport(isDark),
            ],
          ),
        ),
      ]),
    );
  }

  // ── Tab Overview ─────────────────────────────────────────
  Widget _buildOverview(bool isDark) {
    if (_loadingStats) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    final users    = _stats['users']    as Map? ?? {};
    final housings = _stats['housings'] as Map? ?? {};
    final activity = _stats['activity'] as Map? ?? {};

    return RefreshIndicator(
      onRefresh: _loadStats,
      color: AppColors.primary,
      child: ListView(padding: const EdgeInsets.all(20), children: [
        _sectionTitle('👥 Utilisateurs', isDark),
        const SizedBox(height: 12),
        Row(children: [
          _statCard(users['total']?.toString() ?? '0', 'TOTAL',
              Icons.people_rounded, const Color(0xFF2563EB), isDark),
          const SizedBox(width: 10),
          _statCard(users['proprietaires']?.toString() ?? '0', 'OWNERS',
              Icons.home_rounded, const Color(0xFF10B981), isDark),
          const SizedBox(width: 10),
          _statCard(users['locataires']?.toString() ?? '0', 'TENANTS',
              Icons.search_rounded, const Color(0xFF7C3AED), isDark),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          _statCard(users['blocked']?.toString() ?? '0', 'BLOCKED',
              Icons.block_rounded, const Color(0xFFF59E0B), isDark),
          const SizedBox(width: 10),
          _statCard(users['new_30d']?.toString() ?? '0', 'NOUVEAUX 30J',
              Icons.person_add_rounded, const Color(0xFF06B6D4), isDark),
          const SizedBox(width: 10),
          _statCard(users['new_7d']?.toString() ?? '0', 'CETTE SEMAINE',
              Icons.trending_up_rounded, const Color(0xFFEF4444), isDark),
        ]),
        const SizedBox(height: 24),
        _sectionTitle('🏠 Logements', isDark),
        const SizedBox(height: 12),
        Row(children: [
          _statCard(housings['total']?.toString() ?? '0', 'TOTAL',
              Icons.home_work_rounded, const Color(0xFF2563EB), isDark),
          const SizedBox(width: 10),
          _statCard(housings['available']?.toString() ?? '0', 'DISPONIBLE',
              Icons.check_circle_outline_rounded, const Color(0xFF10B981), isDark),
          const SizedBox(width: 10),
          _statCard(housings['reserved']?.toString() ?? '0', 'RÉSERVÉ',
              Icons.event_rounded, const Color(0xFFF59E0B), isDark),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          _statCard(housings['occupied']?.toString() ?? '0', 'OCCUPÉ',
              Icons.lock_rounded, const Color(0xFFEF4444), isDark),
          const SizedBox(width: 10),
          _statCard(housings['new_30d']?.toString() ?? '0', 'NOUVEAUX 30J',
              Icons.add_home_rounded, const Color(0xFF7C3AED), isDark),
          const SizedBox(width: 10),
          _statCard(activity['total_visits']?.toString() ?? '0', 'VISITES',
              Icons.calendar_today_rounded, const Color(0xFF06B6D4), isDark),
        ]),
        const SizedBox(height: 24),
        _sectionTitle('📊 Activité', isDark),
        const SizedBox(height: 12),
        Row(children: [
          _statCard(activity['total_messages']?.toString() ?? '0', 'MESSAGES',
              Icons.chat_rounded, const Color(0xFF2563EB), isDark),
          const SizedBox(width: 10),
          _statCard(activity['pending_visits']?.toString() ?? '0', 'EN ATTENTE',
              Icons.schedule_rounded, const Color(0xFFF59E0B), isDark),
          const SizedBox(width: 10),
          const Expanded(child: SizedBox()),
        ]),
      ]),
    );
  }

  // ── Tab Utilisateurs ─────────────────────────────────────
  Widget _buildUsers(bool isDark) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: Column(children: [
          _searchField('Rechercher un utilisateur…', isDark, (v) { _userSearch = v; _loadUsers(); }),
          const SizedBox(height: 8),
          Row(children: [
            for (final (val, lbl) in [('all','Tous'),('proprietaire','Propriétaires'),('locataire','Locataires')])
              Expanded(child: GestureDetector(
                onTap: () { setState(() => _userRole = val); _loadUsers(); },
                child: Container(
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.symmetric(vertical: 7),
                  decoration: BoxDecoration(
                    color: _userRole == val ? AppColors.primary : (isDark ? AppColors.cardDark : AppColors.cardLight),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _userRole == val ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight)),
                  ),
                  child: Text(lbl, textAlign: TextAlign.center,
                      style: TextStyle(
                          color: _userRole == val ? Colors.white : subColor,
                          fontSize: 11, fontWeight: _userRole == val ? FontWeight.w600 : FontWeight.normal)),
                ),
              )),
          ]),
        ]),
      ),
      Expanded(
        child: _loadingUsers
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : RefreshIndicator(
                onRefresh: _loadUsers,
                color: AppColors.primary,
                child: ListView.builder(
                  itemCount: _users.length,
                  itemBuilder: (_, i) => _userRow(_users[i], isDark),
                ),
              ),
      ),
    ]);
  }

  Widget _userRow(UserModel u, bool isDark) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12),
          border: Border.all(color: border)),
      child: Row(children: [
        CircleAvatar(
          radius: 22,
          backgroundColor: AppColors.primary.withOpacity(0.15),
          backgroundImage: u.photo != null ? NetworkImage(u.photo!) : null,
          child: u.photo == null ? Text(u.initials,
              style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)) : null,
        ),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(u.fullName, style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 13)),
          Text(u.email, style: TextStyle(color: subColor, fontSize: 11)),
          Row(children: [
            if (u.isStaff)   _pill('Admin', AppColors.danger),
            if (u.isProprietaire) _pill('Propriétaire', AppColors.success),
            if (u.isLocataire)    _pill('Locataire', AppColors.primary),
          ]),
        ])),
        PopupMenuButton<String>(
          icon: Icon(Icons.more_vert, color: subColor, size: 18),
          color: isDark ? AppColors.cardDark : AppColors.surfaceLight,
          onSelected: (action) async {
            if (action == 'block')   { await _api.blockUser(u.id);       _loadUsers(); }
            if (action == 'unblock') { await _api.unblockUser(u.id);     _loadUsers(); }
            if (action == 'delete') {
              final ok = await _confirm('Supprimer', '${u.username} ?', isDark);
              if (ok) { await _api.deleteAdminUser(u.id); _loadUsers(); }
            }
          },
          itemBuilder: (_) => [
            const PopupMenuItem(value: 'block',   child: Text('Bloquer')),
            const PopupMenuItem(value: 'unblock', child: Text('Débloquer')),
            const PopupMenuItem(value: 'delete',
                child: Text('Supprimer', style: TextStyle(color: AppColors.danger))),
          ],
        ),
      ]),
    );
  }

  Widget _pill(String l, Color c) => Container(
    margin: const EdgeInsets.only(right: 4, top: 2),
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(color: c.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
    child: Text(l, style: TextStyle(color: c, fontSize: 9, fontWeight: FontWeight.w600)),
  );

  // ── Tab Logements ─────────────────────────────────────────
  Widget _buildHousings(bool isDark) {
    return _loadingHousings
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : RefreshIndicator(
            onRefresh: _loadHousings,
            color: AppColors.primary,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _housings.length,
              itemBuilder: (_, i) => _housingRow(_housings[i], isDark),
            ),
          );
  }

  Widget _housingRow(HousingModel h, bool isDark) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12),
          border: Border.all(color: border)),
      child: Row(children: [
        ClipRRect(borderRadius: BorderRadius.circular(8),
          child: h.mainImage != null
              ? CachedNetworkImage(imageUrl: h.mainImage!, width: 55, height: 55, fit: BoxFit.cover)
              : Container(width: 55, height: 55, color: AppColors.surfaceDark,
                  child: const Icon(Icons.home, color: AppColors.textMutedDark))),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(h.displayName, style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 12),
              maxLines: 1, overflow: TextOverflow.ellipsis),
          Text('${_fmt(h.price)} FCFA', style: const TextStyle(color: AppColors.primary, fontSize: 11)),
          Text(h.locationStr, style: TextStyle(color: subColor, fontSize: 10)),
          Row(children: [
            Icon(Icons.visibility_outlined, size: 10, color: subColor),
            Text(' ${h.viewsCount}', style: TextStyle(color: subColor, fontSize: 9)),
          ]),
        ])),
        IconButton(
          icon: Icon(h.isVisible ? Icons.visibility_rounded : Icons.visibility_off_rounded,
              color: h.isVisible ? AppColors.success : AppColors.textMutedDark, size: 20),
          onPressed: () async { await _api.toggleHousingVisibility(h.id); _loadHousings(); },
        ),
        IconButton(
          icon: const Icon(Icons.delete_outline_rounded, color: AppColors.danger, size: 20),
          onPressed: () async {
            final ok = await _confirm('Supprimer', '"${h.displayName}" ?', isDark);
            if (ok) { await _api.deleteAdminHousing(h.id); _loadHousings(); }
          },
        ),
      ]),
    );
  }

  // ── Tab Support ───────────────────────────────────────────
  // L'admin peut voir toutes les conversations et répondre
  Widget _buildSupport(bool isDark) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        child: _searchField('Rechercher une conversation…', isDark, (_) {}),
      ),
      Expanded(
        child: _loadingSupport
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : _supportConvs.isEmpty
                ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Icon(Icons.chat_bubble_outline_rounded, size: 64, color: AppColors.textMutedDark),
                    const SizedBox(height: 16),
                    Text('Aucune conversation', style: TextStyle(color: subColor, fontSize: 16)),
                  ]))
                : RefreshIndicator(
                    onRefresh: _loadSupport,
                    color: AppColors.primary,
                    child: ListView.builder(
                      itemCount: _supportConvs.length,
                      itemBuilder: (_, i) {
                        final conv = _supportConvs[i];
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: border)),
                          child: Row(children: [
                            CircleAvatar(
                              radius: 22, backgroundColor: AppColors.primary.withOpacity(0.15),
                              child: const Icon(Icons.person_rounded, color: AppColors.primary, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(conv is Map ? (conv['participants']?.toString() ?? 'Utilisateur') : 'Utilisateur',
                                  style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 13)),
                              Text('Voir la conversation', style: TextStyle(color: subColor, fontSize: 11)),
                            ])),
                            const Icon(Icons.chevron_right_rounded, color: AppColors.primary),
                          ]),
                        );
                      },
                    ),
                  ),
      ),
    ]);
  }

  // ── Helpers ───────────────────────────────────────────────
  Widget _statCard(String value, String label, IconData icon, Color color, bool isDark) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    return Expanded(child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardBg, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.3), width: 1.5),
      ),
      child: Column(children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(color: textColor, fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label,
            style: TextStyle(color: color.withOpacity(0.8), fontSize: 8, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center),
      ]),
    ));
  }

  Widget _sectionTitle(String t, bool isDark) => Padding(
    padding: const EdgeInsets.only(bottom: 4),
    child: Text(t, style: TextStyle(
        color: isDark ? AppColors.textDark : AppColors.textLight,
        fontSize: 16, fontWeight: FontWeight.bold)),
  );

  Widget _searchField(String hint, bool isDark, ValueChanged<String> onChange) => TextField(
    style: TextStyle(color: isDark ? AppColors.textDark : AppColors.textLight, fontSize: 13),
    onChanged: onChange,
    decoration: InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: AppColors.textMutedDark, fontSize: 13),
      prefixIcon: const Icon(Icons.search, color: AppColors.textMutedDark, size: 18),
      filled: true,
      fillColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
    ),
  );

  Future<bool> _confirm(String title, String msg, bool isDark) async {
    return await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: isDark ? AppColors.cardDark : AppColors.surfaceLight,
        title: Text(title),
        content: Text(msg),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          TextButton(onPressed: () => Navigator.pop(context, true),
              child: Text(title, style: const TextStyle(color: AppColors.danger))),
        ],
      ),
    ) ?? false;
  }

  String _fmt(int price) {
    final s = price.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }
}

// ── Wrapper avec AppBar ──────────────────────────────────────
class _WithAppBar extends StatelessWidget {
  final String? title;
  final Widget child;
  const _WithAppBar({this.title, required this.child});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: RentalAppBar(title: title, showBack: false),
    body: child,
  );
}

// ── Item bottom nav ──────────────────────────────────────────
class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool active;
  final Color? activeColor;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon, required this.activeIcon,
    required this.label, required this.active,
    required this.onTap, this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final ac = activeColor ?? AppColors.primary;
    final ic = isDark ? AppColors.textMutedDark : AppColors.textMutedLight;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(width: 60, child: Column(mainAxisSize: MainAxisSize.min, children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: active ? ac.withOpacity(0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Icon(active ? activeIcon : icon, size: 24, color: active ? ac : ic),
        ),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(fontSize: 10, color: active ? ac : ic,
            fontWeight: active ? FontWeight.w600 : FontWeight.normal)),
      ])),
    );
  }
}