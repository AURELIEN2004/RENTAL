// // // ============================================
// // // lib/screens/messaging/chat_screen.dart
// // // ============================================


import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/message_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';

class ChatScreen extends StatefulWidget {
  final int     conversationId;
  final int     otherUserId;
  final String  otherUserName;
  final String? otherUserPhoto;
  final String? housingTitle;

  const ChatScreen({
    super.key,
    required this.conversationId,
    required this.otherUserId,
    required this.otherUserName,
    this.otherUserPhoto,
    this.housingTitle,
  });

  /// Factory depuis les arguments de route nommée
  static ChatScreen fromArgs(Map<String, dynamic> args) {
    return ChatScreen(
      conversationId: args['conversationId'] as int,
      otherUserId:    args['otherUserId']    as int? ?? 0,
      otherUserName:  args['otherUserName']  as String? ?? 'Utilisateur',
      otherUserPhoto: args['otherUserPhoto'] as String?,
      housingTitle:   args['housingTitle']   as String?,
    );
  }

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _api     = ApiService();
  final _ctrl    = TextEditingController();
  final _scroll  = ScrollController();

  List<MessageModel> _messages = [];
  bool _loading  = true;
  bool _sending  = false;
  File? _image;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _messages = await _api.getMessages(widget.conversationId);
      await _api.markAsRead(widget.conversationId);
    } catch (_) {}
    if (mounted) {
      setState(() => _loading = false);
      _scrollBottom();
    }
  }

  void _scrollBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty && _image == null) return;

    setState(() => _sending = true);
    try {
      final msg = await _api.sendMessage(
        conversationId: widget.conversationId,
        content: text.isNotEmpty ? text : null,
        image:   _image,
      );
      setState(() {
        _messages.add(msg);
        _ctrl.clear();
        _image  = null;
        _sending = false;
      });
      _scrollBottom();
    } catch (e) {
      setState(() => _sending = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Erreur : $e'),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
        ));
      }
    }
  }

  Future<void> _pickImage() async {
    final picked = await ImagePicker()
        .pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (picked != null) setState(() => _image = File(picked.path));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final currentUserId =
        context.read<AuthProvider>().user?.id ?? 0;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        elevation: 0,
        titleSpacing: 0,
        title: Row(children: [
          // Avatar
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary.withOpacity(0.2),
            backgroundImage: widget.otherUserPhoto != null
                ? NetworkImage(widget.otherUserPhoto!)
                : null,
            child: widget.otherUserPhoto == null
                ? Text(
                    widget.otherUserName.isNotEmpty
                        ? widget.otherUserName[0].toUpperCase()
                        : 'U',
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
              Text(widget.otherUserName,
                  style: TextStyle(
                      color: isDark
                          ? AppColors.textDark
                          : AppColors.textLight,
                      fontSize: 15,
                      fontWeight: FontWeight.w600)),
              if (widget.housingTitle != null)
                Text(widget.housingTitle!,
                    style: const TextStyle(
                        color: AppColors.primary, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
            ]),
          ),
        ]),
        iconTheme: IconThemeData(
            color: isDark ? AppColors.textDark : AppColors.textLight),
      ),
      body: Column(children: [
        // ── Messages ─────────────────────────────────────
        Expanded(
          child: _loading
              ? const Center(
                  child: CircularProgressIndicator(
                      color: AppColors.primary))
              : _messages.isEmpty
                  ? _buildEmpty(isDark)
                  : ListView.builder(
                      controller: _scroll,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      itemCount: _messages.length,
                      itemBuilder: (_, i) {
                        final m   = _messages[i];
                        final mine = m.senderId == currentUserId;
                        final showDate = i == 0 ||
                            _messages[i].createdAt.day !=
                                _messages[i - 1].createdAt.day;
                        return Column(children: [
                          if (showDate)
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 12),
                              child: Text(
                                _fmtDate(m.createdAt),
                                style: TextStyle(
                                    fontSize: 11,
                                    color: isDark
                                        ? AppColors.textMutedDark
                                        : AppColors.textMutedLight),
                              ),
                            ),
                          _buildBubble(m, mine, isDark),
                        ]);
                      },
                    ),
        ),

        // ── Preview image sélectionnée ────────────────────
        if (_image != null)
          Container(
            padding: const EdgeInsets.all(8),
            color: isDark
                ? AppColors.surfaceDark
                : AppColors.bgLight,
            child: Stack(children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child:
                    Image.file(_image!, height: 80, fit: BoxFit.cover),
              ),
              Positioned(
                top: 0, right: 0,
                child: GestureDetector(
                  onTap: () => setState(() => _image = null),
                  child: const CircleAvatar(
                    radius: 10,
                    backgroundColor: AppColors.danger,
                    child: Icon(Icons.close,
                        color: Colors.white, size: 12),
                  ),
                ),
              ),
            ]),
          ),

        // ── Input ─────────────────────────────────────────
        Container(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 16),
          decoration: BoxDecoration(
            color: isDark
                ? AppColors.surfaceDark
                : AppColors.surfaceLight,
            border: Border(
                top: BorderSide(
                    color: isDark
                        ? AppColors.borderDark
                        : AppColors.borderLight)),
          ),
          child: Row(children: [
            // Bouton image
            IconButton(
              icon: const Icon(Icons.photo_outlined,
                  color: AppColors.primary),
              onPressed: _pickImage,
            ),
            // Champ texte
            Expanded(
              child: TextField(
                controller: _ctrl,
                maxLines: null,
                style: TextStyle(
                    color: isDark
                        ? AppColors.textDark
                        : AppColors.textLight,
                    fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Message…',
                  hintStyle: const TextStyle(
                      color: AppColors.textMutedDark),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 8),
                ),
                onSubmitted: (_) => _send(),
              ),
            ),
            // Bouton envoyer
            GestureDetector(
              onTap: _sending ? null : _send,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 42, height: 42,
                decoration: BoxDecoration(
                  color: _sending
                      ? AppColors.primary.withOpacity(0.5)
                      : AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: _sending
                    ? const Padding(
                        padding: EdgeInsets.all(11),
                        child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white))
                    : const Icon(Icons.send_rounded,
                        color: Colors.white, size: 18),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _buildBubble(
      MessageModel m, bool mine, bool isDark) {
    final bubbleBg = mine
        ? AppColors.primary
        : (isDark ? AppColors.cardDark : AppColors.bgLight);
    final textColor =
        mine ? Colors.white : (isDark ? AppColors.textDark : AppColors.textLight);
    final timeColor =
        mine ? Colors.white70 : AppColors.textMutedDark;

    return Align(
      alignment:
          mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        constraints: BoxConstraints(
            maxWidth:
                MediaQuery.of(context).size.width * 0.72),
        padding: const EdgeInsets.symmetric(
            horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: bubbleBg,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(mine ? 16 : 4),
            bottomRight: Radius.circular(mine ? 4 : 16),
          ),
          border: mine
              ? null
              : Border.all(
                  color: isDark
                      ? AppColors.borderDark
                      : AppColors.borderLight),
        ),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          // Nom expéditeur (pour les messages reçus)
          if (!mine && m.senderName != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(m.senderName!,
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 11,
                      fontWeight: FontWeight.w600)),
            ),
          // Image
          if (m.isImageMsg)
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                  imageUrl: m.image!,
                  width: 200,
                  fit: BoxFit.cover),
            ),
          // Texte
          if (m.content != null && m.content!.isNotEmpty)
            Text(m.content!,
                style:
                    TextStyle(color: textColor, fontSize: 14)),
          const SizedBox(height: 4),
          // Heure + statut lu
          Row(mainAxisSize: MainAxisSize.min, children: [
            Text(
              '${m.createdAt.hour.toString().padLeft(2, '0')}'
              ':${m.createdAt.minute.toString().padLeft(2, '0')}',
              style:
                  TextStyle(fontSize: 10, color: timeColor),
            ),
            if (mine) ...[
              const SizedBox(width: 4),
              Icon(
                m.isRead
                    ? Icons.done_all_rounded
                    : Icons.done_rounded,
                size: 13,
                color: m.isRead
                    ? Colors.lightBlueAccent
                    : Colors.white70,
              ),
            ],
          ]),
        ]),
      ),
    );
  }

  Widget _buildEmpty(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline_rounded,
              size: 56,
              color: isDark
                  ? AppColors.textMutedDark
                  : AppColors.textMutedLight),
          const SizedBox(height: 12),
          Text(
            'Envoyez le premier message\npour démarrer la conversation',
            style: TextStyle(
                color: isDark
                    ? AppColors.textSecondaryDark
                    : AppColors.textSecondaryLight,
                fontSize: 13),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  String _fmtDate(DateTime dt) {
    final now  = DateTime.now();
    final diff = now.difference(dt).inDays;
    if (diff == 0) return "Aujourd'hui";
    if (diff == 1) return 'Hier';
    return '${dt.day.toString().padLeft(2, '0')}/'
        '${dt.month.toString().padLeft(2, '0')}/'
        '${dt.year}';
  }
}