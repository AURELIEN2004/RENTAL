// // lib/screens/notifications/notifications_screen.dart
// import 'package:flutter/material.dart';
// import '../../core/constants/app_colors.dart';
// import '../../core/l10n/app_localizations.dart';
// import '../../data/models/notification_model.dart';
// import '../../data/services/api_service.dart';

// class NotificationsScreen extends StatefulWidget {
//   const NotificationsScreen({super.key});
//   @override
//   State<NotificationsScreen> createState() => _NotificationsScreenState();
// }

// class _NotificationsScreenState extends State<NotificationsScreen> {
//   final _api = ApiService();
//   List<NotificationModel> _notifications = [];
//   bool _loading = true;

//   @override
//   void initState() {
//     super.initState();
//     _load();
//   }

//   Future<void> _load() async {
//     setState(() => _loading = true);
//     try {
//       _notifications = await _api.getNotifications();
//     } catch (_) {}
//     if (mounted) setState(() => _loading = false);
//   }

//   Future<void> _markAllRead() async {
//     try {
//       await _api.markAllNotificationsRead();
//       setState(() {
//         _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
//       });
//     } catch (_) {}
//   }

//   @override
//   Widget build(BuildContext context) {
//     final l10n = context.l10n;
//     final isDark = Theme.of(context).brightness == Brightness.dark;
//     final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

//     // Grouper par période
//     final today = <NotificationModel>[];
//     final thisWeek = <NotificationModel>[];

//     final now = DateTime.now();
//     for (final n in _notifications) {
//       final diff = now.difference(n.createdAt);
//       if (diff.inDays == 0) {
//         today.add(n);
//       } else {
//         thisWeek.add(n);
//       }
//     }

//     return Scaffold(
//       backgroundColor: bg,
//       appBar: AppBar(
//         backgroundColor: bg,
//         title: Text(l10n.notifications),
//         actions: [
//           TextButton(
//             onPressed: _markAllRead,
//             child: Text(
//               l10n.markAllRead,
//               style: const TextStyle(color: AppColors.primary, fontSize: 13),
//             ),
//           ),
//         ],
//       ),
//       body: _loading
//           ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
//           : RefreshIndicator(
//               onRefresh: _load,
//               color: AppColors.primary,
//               child: _notifications.isEmpty
//                   ? _buildEmpty(l10n, isDark)
//                   : ListView(
//                       children: [
//                         if (today.isNotEmpty) ...[
//                           _buildGroupHeader(l10n.today, isDark),
//                           ...today.map((n) => _buildItem(n, isDark)),
//                         ],
//                         if (thisWeek.isNotEmpty) ...[
//                           _buildGroupHeader(l10n.thisWeek, isDark),
//                           ...thisWeek.map((n) => _buildItem(n, isDark)),
//                         ],
//                         const SizedBox(height: 32),
//                       ],
//                     ),
//             ),
//     );
//   }

//   Widget _buildGroupHeader(String title, bool isDark) {
//     return Padding(
//       padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
//       child: Text(
//         title,
//         style: TextStyle(
//           color: isDark ? AppColors.textDark : AppColors.textLight,
//           fontWeight: FontWeight.bold,
//           fontSize: 15,
//         ),
//       ),
//     );
//   }

//   Widget _buildItem(NotificationModel n, bool isDark) {
//     final bg = n.isRead
//         ? Colors.transparent
//         : (isDark
//             ? AppColors.primary.withOpacity(0.07)
//             : AppColors.primaryLight.withOpacity(0.4));

//     return InkWell(
//       onTap: () async {
//         if (!n.isRead) {
//           await _api.markNotificationRead(n.id);
//           setState(() {
//             final idx = _notifications.indexWhere((x) => x.id == n.id);
//             if (idx != -1) {
//               _notifications[idx] = n.copyWith(isRead: true);
//             }
//           });
//         }
//       },
//       child: Container(
//         color: bg,
//         padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
//         child: Row(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             _buildIcon(n, isDark),
//             const SizedBox(width: 14),
//             Expanded(
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(
//                     n.title,
//                     style: TextStyle(
//                       color: isDark ? AppColors.textDark : AppColors.textLight,
//                       fontWeight: n.isRead ? FontWeight.normal : FontWeight.w600,
//                       fontSize: 14,
//                     ),
//                     maxLines: 2,
//                     overflow: TextOverflow.ellipsis,
//                   ),
//                   const SizedBox(height: 3),
//                   Text(
//                     n.message,
//                     style: TextStyle(
//                       color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
//                       fontSize: 12,
//                     ),
//                     maxLines: 2,
//                     overflow: TextOverflow.ellipsis,
//                   ),
//                   const SizedBox(height: 4),
//                   Text(
//                     _formatTime(n.createdAt),
//                     style: TextStyle(
//                       color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
//                       fontSize: 11,
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//             if (!n.isRead)
//               Container(
//                 width: 8,
//                 height: 8,
//                 margin: const EdgeInsets.only(top: 4),
//                 decoration: const BoxDecoration(
//                   color: AppColors.primary,
//                   shape: BoxShape.circle,
//                 ),
//               ),
//           ],
//         ),
//       ),
//     );
//   }

//   Widget _buildIcon(NotificationModel n, bool isDark) {
//     IconData icon;
//     Color color;
//     switch (n.type) {
//       case 'message':
//         icon = Icons.chat_bubble_rounded;
//         color = AppColors.primary;
//         break;
//       case 'visit':
//       case 'visit_confirmed':
//         icon = Icons.event_available_rounded;
//         color = AppColors.success;
//         break;
//       case 'visit_refused':
//         icon = Icons.event_busy_rounded;
//         color = AppColors.danger;
//         break;
//       case 'new_housing':
//         icon = Icons.home_rounded;
//         color = AppColors.secondary;
//         break;
//       default:
//         icon = Icons.notifications_rounded;
//         color = AppColors.warning;
//     }

//     return Container(
//       width: 44,
//       height: 44,
//       decoration: BoxDecoration(
//         color: color.withOpacity(0.15),
//         borderRadius: BorderRadius.circular(12),
//       ),
//       child: Icon(icon, color: color, size: 22),
//     );
//   }

//   Widget _buildEmpty(AppL10n l10n, bool isDark) {
//     return Center(
//       child: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         children: [
//           Icon(Icons.notifications_none_rounded,
//               size: 72,
//               color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
//           const SizedBox(height: 16),
//           Text(
//             l10n.noNotifications,
//             style: TextStyle(
//               color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
//               fontSize: 16,
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   String _formatTime(DateTime dt) {
//     final now = DateTime.now();
//     final diff = now.difference(dt);
//     if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
//     if (diff.inHours < 24) return 'Il y a ${diff.inHours}h';
//     return '${dt.day}/${dt.month}/${dt.year}';
//   }
// }

// lib/screens/notifications/notifications_screen.dart
//
// ✅ CORRECTIONS :
//  • _formatTime() bilingue : utilise l10n.minutesAgo / hoursAgo
//  • Rechargement auto au changement de langue via didChangeDependencies()
//  • context.watch<ThemeProvider>() pour reconstruire les labels

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/notification_model.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _api = ApiService();
  List<NotificationModel> _notifications = [];
  bool _loading = true;

  String? _currentLanguage;

  @override
  void initState() {
    super.initState();
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

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _notifications = await _api.getNotifications();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _markAllRead() async {
    try {
      await _api.markAllNotificationsRead();
      setState(() {
        _notifications =
            _notifications.map((n) => n.copyWith(isRead: true)).toList();
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Reconstruire quand la langue change
    context.watch<ThemeProvider>();
    final l10n   = context.l10n;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;

    // Grouper par période
    final today    = <NotificationModel>[];
    final thisWeek = <NotificationModel>[];
    final now      = DateTime.now();

    for (final n in _notifications) {
      if (now.difference(n.createdAt).inDays == 0) {
        today.add(n);
      } else {
        thisWeek.add(n);
      }
    }

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        title: Text(l10n.notifications),
        actions: [
          TextButton(
            onPressed: _markAllRead,
            child: Text(
              l10n.markAllRead,
              style: const TextStyle(color: AppColors.primary, fontSize: 13),
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _load,
              color: AppColors.primary,
              child: _notifications.isEmpty
                  ? _buildEmpty(l10n, isDark)
                  : ListView(
                      children: [
                        if (today.isNotEmpty) ...[
                          _buildGroupHeader(l10n.today, isDark),
                          ...today.map((n) => _buildItem(n, isDark, l10n)),
                        ],
                        if (thisWeek.isNotEmpty) ...[
                          _buildGroupHeader(l10n.thisWeek, isDark),
                          ...thisWeek.map((n) => _buildItem(n, isDark, l10n)),
                        ],
                        const SizedBox(height: 32),
                      ],
                    ),
            ),
    );
  }

  Widget _buildGroupHeader(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Text(
        title,
        style: TextStyle(
          color: isDark ? AppColors.textDark : AppColors.textLight,
          fontWeight: FontWeight.bold,
          fontSize: 15,
        ),
      ),
    );
  }

  Widget _buildItem(NotificationModel n, bool isDark, AppL10n l10n) {
    final bgColor = n.isRead
        ? Colors.transparent
        : (isDark
            ? AppColors.primary.withOpacity(0.07)
            : AppColors.primaryLight.withOpacity(0.4));

    return InkWell(
      onTap: () async {
        if (!n.isRead) {
          await _api.markNotificationRead(n.id);
          setState(() {
            final idx = _notifications.indexWhere((x) => x.id == n.id);
            if (idx != -1) {
              _notifications[idx] = n.copyWith(isRead: true);
            }
          });
        }
      },
      child: Container(
        color: bgColor,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildIcon(n, isDark),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    n.title,
                    style: TextStyle(
                      color: isDark ? AppColors.textDark : AppColors.textLight,
                      fontWeight:
                          n.isRead ? FontWeight.normal : FontWeight.w600,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    n.message,
                    style: TextStyle(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                      fontSize: 12,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  // ✅ _formatTime bilingue via l10n
                  Text(
                    _formatTime(n.createdAt, l10n),
                    style: TextStyle(
                      color: isDark
                          ? AppColors.textMutedDark
                          : AppColors.textMutedLight,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            if (!n.isRead)
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 4),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildIcon(NotificationModel n, bool isDark) {
    IconData icon;
    Color color;
    switch (n.type) {
      case 'message':
        icon  = Icons.chat_bubble_rounded;
        color = AppColors.primary;
        break;
      case 'visit':
      case 'visit_confirmed':
        icon  = Icons.event_available_rounded;
        color = AppColors.success;
        break;
      case 'visit_refused':
        icon  = Icons.event_busy_rounded;
        color = AppColors.danger;
        break;
      case 'new_housing':
        icon  = Icons.home_rounded;
        color = AppColors.secondary;
        break;
      default:
        icon  = Icons.notifications_rounded;
        color = AppColors.warning;
    }

    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: color, size: 22),
    );
  }

  Widget _buildEmpty(AppL10n l10n, bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_none_rounded,
              size: 72,
              color: isDark
                  ? AppColors.textMutedDark
                  : AppColors.textMutedLight),
          const SizedBox(height: 16),
          Text(
            l10n.noNotifications,
            style: TextStyle(
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  // ✅ formatTime bilingue — utilise l10n.minutesAgo / hoursAgo
  String _formatTime(DateTime dt, AppL10n l10n) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return l10n.minutesAgo(diff.inMinutes);
    if (diff.inHours < 24)   return l10n.hoursAgo(diff.inHours);
    return '${dt.day.toString().padLeft(2, '0')}/'
        '${dt.month.toString().padLeft(2, '0')}/'
        '${dt.year}';
  }
}