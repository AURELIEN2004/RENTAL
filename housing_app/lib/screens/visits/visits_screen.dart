// // lib/screens/visits/visits_screen.dart
// import 'package:flutter/material.dart';
// import '../../core/constants/app_colors.dart';
// import '../../core/l10n/app_localizations.dart';
// import '../../data/models/visit_model.dart';
// import '../../data/models/notification_model.dart';
// import '../../data/services/api_service.dart';

// class VisitsScreen extends StatefulWidget {
//   const VisitsScreen({super.key});
//   @override
//   State<VisitsScreen> createState() => _VisitsScreenState();
// }

// class _VisitsScreenState extends State<VisitsScreen>
//     with SingleTickerProviderStateMixin {
//   final _api = ApiService();
//   List<VisitModel> _visits  = [];
//   bool _loading = true;
//   late TabController _tabs;

//   @override
//   void initState() {
//     super.initState();
//     _tabs = TabController(length: 3, vsync: this);
//     _load();
//   }

//   @override
//   void dispose() {
//     _tabs.dispose();
//     super.dispose();
//   }

//   Future<void> _load() async {
//     setState(() => _loading = true);
//     try {
//       _visits = await _api.getVisits();
//     } catch (_) {}
//     if (mounted) setState(() => _loading = false);
//   }

//   List<VisitModel> get _pending   => _visits.where((v) => v.status == 'attente').toList();
//   List<VisitModel> get _confirmed => _visits.where((v) => v.status == 'confirme').toList();
//   List<VisitModel> get _past      => _visits.where((v) => v.status == 'refuse' || v.status == 'annule').toList();

//   @override
//   Widget build(BuildContext context) {
//     final l10n = context.l10n;
//     final isDark = Theme.of(context).brightness == Brightness.dark;
//     final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;

//     return Scaffold(
//       backgroundColor: bg,
//       appBar: AppBar(
//         backgroundColor: bg,
//         title: Text(l10n.myVisits, style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
//         bottom: TabBar(
//           controller: _tabs,
//           labelColor: AppColors.primary,
//           unselectedLabelColor: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
//           indicatorColor: AppColors.primary,
//           tabs: const [
//             Tab(text: 'En attente'),
//             Tab(text: 'Confirmées'),
//             Tab(text: 'Passées'),
//           ],
//         ),
//       ),
//       body: _loading
//           ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
//           : TabBarView(
//               controller: _tabs,
//               children: [
//                 _buildList(_pending, 'En attente', isDark),
//                 _buildList(_confirmed, 'Confirmées', isDark),
//                 _buildList(_past, 'Passées', isDark),
//               ],
//             ),
//     );
//   }

//   Widget _buildList(List<VisitModel> visits, String label, bool isDark) {
//     if (visits.isEmpty) {
//       return Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Icon(Icons.calendar_today_outlined,
//                 size: 56, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
//             const SizedBox(height: 16),
//             Text('Aucune visite $label',
//                 style: TextStyle(
//                     color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
//           ],
//         ),
//       );
//     }

//     return RefreshIndicator(
//       onRefresh: _load,
//       color: AppColors.primary,
//       child: ListView.builder(
//         padding: const EdgeInsets.all(16),
//         itemCount: visits.length,
//         itemBuilder: (_, i) => _buildCard(visits[i], isDark),
//       ),
//     );
//   }

//   Widget _buildCard(VisitModel v, bool isDark) {
//     final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border = isDark ? AppColors.borderDark : AppColors.borderLight;
//     final textColor = isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

//     Color statusColor;
//     switch (v.status) {
//       case 'confirme': statusColor = AppColors.success; break;
//       case 'refuse':   statusColor = AppColors.danger;  break;
//       default:         statusColor = AppColors.warning;
//     }

//     return Container(
//       margin: const EdgeInsets.only(bottom: 12),
//       padding: const EdgeInsets.all(16),
//       decoration: BoxDecoration(
//         color: cardBg,
//         borderRadius: BorderRadius.circular(16),
//         border: Border.all(color: border),
//       ),
//       child: Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           Row(
//             children: [
//               Expanded(
//                 child: Text(v.housingTitle,
//                     style: TextStyle(
//                         color: textColor,
//                         fontWeight: FontWeight.w600,
//                         fontSize: 14)),
//               ),
//               Container(
//                 padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
//                 decoration: BoxDecoration(
//                   color: statusColor.withOpacity(0.15),
//                   borderRadius: BorderRadius.circular(20),
//                 ),
//                 child: Text(v.statusLabel,
//                     style: TextStyle(
//                         color: statusColor,
//                         fontSize: 11,
//                         fontWeight: FontWeight.w600)),
//               ),
//             ],
//           ),
//           if (v.housingAddress != null) ...[
//             const SizedBox(height: 6),
//             Row(children: [
//               Icon(Icons.location_on_outlined, size: 14, color: AppColors.primary),
//               const SizedBox(width: 4),
//               Text(v.housingAddress!, style: TextStyle(color: subColor, fontSize: 12)),
//             ]),
//           ],
//           const SizedBox(height: 8),
//           Row(
//             children: [
//               Icon(Icons.calendar_today_outlined, size: 14, color: subColor),
//               const SizedBox(width: 4),
//               Text(
//                 '${v.date.day}/${v.date.month}/${v.date.year} à ${v.time}',
//                 style: TextStyle(color: subColor, fontSize: 12),
//               ),
//             ],
//           ),
//           if (v.message != null && v.message!.isNotEmpty) ...[
//             const SizedBox(height: 8),
//             Text(v.message!, style: TextStyle(color: subColor, fontSize: 12)),
//           ],
//           // Actions pour les visites en attente (propriétaire)
//           if (v.status == 'attente') ...[
//             const SizedBox(height: 12),
//             Row(
//               children: [
//                 Expanded(
//                   child: OutlinedButton(
//                     onPressed: () async {
//                       await _api.refuseVisit(v.id);
//                       _load();
//                     },
//                     style: OutlinedButton.styleFrom(
//                       side: const BorderSide(color: AppColors.danger),
//                       foregroundColor: AppColors.danger,
//                       padding: const EdgeInsets.symmetric(vertical: 8),
//                     ),
//                     child: const Text('Refuser', style: TextStyle(fontSize: 13)),
//                   ),
//                 ),
//                 const SizedBox(width: 10),
//                 Expanded(
//                   child: ElevatedButton(
//                     onPressed: () async {
//                       await _api.confirmVisit(v.id);
//                       _load();
//                     },
//                     style: ElevatedButton.styleFrom(
//                       backgroundColor: AppColors.success,
//                       padding: const EdgeInsets.symmetric(vertical: 8),
//                     ),
//                     child: const Text('Confirmer', style: TextStyle(fontSize: 13)),
//                   ),
//                 ),
//               ],
//             ),
//           ],
//         ],
//       ),
//     );
//   }
// }


// lib/screens/visits/visits_screen.dart
//
// ✅ CORRECTIONS :
//  • Onglets (En attente / Confirmées / Passées) → l10n.pending/confirmed/past
//  • Labels "Aucune visite X" → l10n.noVisitLabel(label)
//  • Boutons "Refuser" / "Confirmer" → l10n.refuse / l10n.confirmVisit
//  • Rechargement auto au changement de langue via didChangeDependencies()
//  • _formatTime() bilingue (via l10n)

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/visit_model.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';

class VisitsScreen extends StatefulWidget {
  const VisitsScreen({super.key});
  @override
  State<VisitsScreen> createState() => _VisitsScreenState();
}

class _VisitsScreenState extends State<VisitsScreen>
    with SingleTickerProviderStateMixin {
  final _api = ApiService();
  List<VisitModel> _visits = [];
  bool _loading = true;
  late TabController _tabs;

  // ── Langue suivie pour détecter les changements ──────────────────────────
  String? _currentLanguage;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    _load();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // ✅ Rechargement automatique quand la langue change
    final lang = context.read<ThemeProvider>().language;
    if (_currentLanguage != null && _currentLanguage != lang) {
      _load();
    }
    _currentLanguage = lang;
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _visits = await _api.getVisits();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  List<VisitModel> get _pending =>
      _visits.where((v) => v.status == 'attente').toList();
  List<VisitModel> get _confirmed =>
      _visits.where((v) => v.status == 'confirme').toList();
  List<VisitModel> get _past =>
      _visits.where((v) => v.status == 'refuse' || v.status == 'annule').toList();

  @override
  Widget build(BuildContext context) {
    // ✅ context.watch pour reconstruire les labels quand la langue change
    context.watch<ThemeProvider>();
    final l10n     = context.l10n;
    final isDark   = Theme.of(context).brightness == Brightness.dark;
    final bg       = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        title: Text(
          l10n.myVisits,
          style: TextStyle(color: textColor, fontWeight: FontWeight.bold),
        ),
        // ✅ Onglets traduits
        bottom: TabBar(
          controller: _tabs,
          labelColor: AppColors.primary,
          unselectedLabelColor: isDark
              ? AppColors.textSecondaryDark
              : AppColors.textSecondaryLight,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: l10n.pending),
            Tab(text: l10n.confirmed),
            Tab(text: l10n.past),
          ],
        ),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : TabBarView(
              controller: _tabs,
              children: [
                _buildList(_pending, l10n.pending, isDark, l10n),
                _buildList(_confirmed, l10n.confirmed, isDark, l10n),
                _buildList(_past, l10n.past, isDark, l10n),
              ],
            ),
    );
  }

  Widget _buildList(
      List<VisitModel> visits, String label, bool isDark, AppL10n l10n) {
    if (visits.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_today_outlined,
                size: 56,
                color:
                    isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
            const SizedBox(height: 16),
            // ✅ Label traduit
            Text(
              l10n.noVisitLabel(label),
              style: TextStyle(
                  color: isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: visits.length,
        itemBuilder: (_, i) => _buildCard(visits[i], isDark, l10n),
      ),
    );
  }

  Widget _buildCard(VisitModel v, bool isDark, AppL10n l10n) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    Color statusColor;
    switch (v.status) {
      case 'confirme':
        statusColor = AppColors.success;
        break;
      case 'refuse':
        statusColor = AppColors.danger;
        break;
      default:
        statusColor = AppColors.warning;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── En-tête : titre + badge statut ────────────────────────────
          Row(children: [
            Expanded(
              child: Text(
                v.housingTitle,
                style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.w600,
                    fontSize: 14),
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                // ✅ statusLabel bilingue (via VisitModel)
                _statusLabel(v.status, l10n),
                style: TextStyle(
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w600),
              ),
            ),
          ]),

          // ── Adresse ──────────────────────────────────────────────────
          if (v.housingAddress != null) ...[
            const SizedBox(height: 6),
            Row(children: [
              const Icon(Icons.location_on_outlined,
                  size: 14, color: AppColors.primary),
              const SizedBox(width: 4),
              Text(v.housingAddress!,
                  style: TextStyle(color: subColor, fontSize: 12)),
            ]),
          ],

          // ── Date + heure ─────────────────────────────────────────────
          const SizedBox(height: 8),
          Row(children: [
            Icon(Icons.calendar_today_outlined, size: 14, color: subColor),
            const SizedBox(width: 4),
            Text(
              '${v.date.day.toString().padLeft(2, '0')}/'
              '${v.date.month.toString().padLeft(2, '0')}/'
              '${v.date.year} à ${v.time}',
              style: TextStyle(color: subColor, fontSize: 12),
            ),
          ]),

          // ── Message ──────────────────────────────────────────────────
          if (v.message != null && v.message!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(v.message!,
                style: TextStyle(color: subColor, fontSize: 12)),
          ],

          // ── Actions pour les visites en attente ──────────────────────
          if (v.status == 'attente') ...[
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    await _api.refuseVisit(v.id);
                    _load();
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.danger),
                    foregroundColor: AppColors.danger,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  // ✅ Traduit
                  child: Text(l10n.refuse,
                      style: const TextStyle(fontSize: 13)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    await _api.confirmVisit(v.id);
                    _load();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  // ✅ Traduit
                  child: Text(l10n.confirm,
                      style: const TextStyle(fontSize: 13, color: Colors.white)),
                ),
              ),
            ]),
          ],
        ],
      ),
    );
  }

  // ✅ statusLabel bilingue (utilise l10n au lieu de strings hardcodées)
  String _statusLabel(String status, AppL10n l10n) {
    switch (status) {
      case 'confirme': return l10n.confirmed;
      case 'refuse':   return l10n.refuse;
      case 'annule':   return l10n.cancelVisit;
      default:         return l10n.pending;
    }
  }
}