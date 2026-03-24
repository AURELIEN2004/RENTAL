// // ============================================
// // lib/screens/messaging/conversations_screen.dart
// // ============================================


import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/message_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';
import 'chat_screen.dart';

class ConversationsScreen extends StatefulWidget {
  const ConversationsScreen({super.key});
  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  final _api = ApiService();
  List<ConversationModel> _conversations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _conversations = await _api.getConversations();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        automaticallyImplyLeading: false,
        title: Text(
          l10n.messages,
          style: TextStyle(
            color: isDark ? AppColors.textDark : AppColors.textLight,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.refresh_rounded,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
            onPressed: _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _conversations.isEmpty
              ? _buildEmpty(l10n, isDark)
              : RefreshIndicator(
                  onRefresh: _load,
                  color: AppColors.primary,
                  child: ListView.builder(
                    itemCount: _conversations.length,
                    itemBuilder: (context, i) =>
                        _buildItem(_conversations[i], isDark),
                  ),
                ),
    );
  }

  Widget _buildItem(ConversationModel conv, bool isDark) {
    final currentUserId =
        context.read<AuthProvider>().user?.id ?? 0;
    final other = conv.otherUser(currentUserId);
    final hasUnread = conv.unreadCount > 0;
    final cardBg = hasUnread
        ? (isDark
            ? AppColors.primary.withOpacity(0.07)
            : AppColors.primaryLight.withOpacity(0.3))
        : Colors.transparent;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return InkWell(
      onTap: () {
        if (other == null) return;
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ChatScreen(
              conversationId: conv.id,
              otherUserId: other.id,
              otherUserName: other.username,
              otherUserPhoto: other.photo,
              housingTitle: conv.housingTitle,
            ),
          ),
        ).then((_) => _load());
      },
      child: Container(
        color: cardBg,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 26,
              backgroundColor: AppColors.primary.withOpacity(0.2),
              backgroundImage: other?.photo != null
                  ? NetworkImage(other!.photo!)
                  : null,
              child: other?.photo == null
                  ? Text(
                      other?.initials ?? '?',
                      style: const TextStyle(
                          color: AppColors.primary, fontWeight: FontWeight.bold),
                    )
                  : null,
            ),
            const SizedBox(width: 14),
            // Infos
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        other?.username ?? 'Inconnu',
                        style: TextStyle(
                          color: textColor,
                          fontWeight:
                              hasUnread ? FontWeight.bold : FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                      if (conv.updatedAt != null)
                        Text(
                          _fmtTime(conv.updatedAt!),
                          style: TextStyle(
                            color: subColor,
                            fontSize: 11,
                          ),
                        ),
                    ],
                  ),
                  if (conv.housingTitle != null) ...[
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.home_outlined,
                            size: 11, color: AppColors.primary),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            conv.housingTitle!,
                            style: const TextStyle(
                                color: AppColors.primary, fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 3),
                  Text(
                    conv.lastMessage?.content ??
                        (conv.lastMessage?.isImageMessage == true
                            ? '📷 Photo'
                            : 'Nouveau message'),
                    style: TextStyle(
                      color: subColor,
                      fontSize: 12,
                      fontWeight:
                          hasUnread ? FontWeight.w500 : FontWeight.normal,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (hasUnread)
              Container(
                margin: const EdgeInsets.only(left: 8),
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  conv.unreadCount.toString(),
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(AppL10n l10n, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.chat_bubble_outline_rounded,
                size: 72,
                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
            const SizedBox(height: 16),
            Text(l10n.noMessages,
                style: TextStyle(
                    fontSize: 16,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
          ],
        ),
      ),
    );
  }

  String _fmtTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'À l\'instant';
    if (diff.inMinutes < 60) return '${diff.inMinutes}min';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}j';
    return '${dt.day}/${dt.month}';
  }
}