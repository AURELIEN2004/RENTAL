// // // lib/screens/support/support_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/message_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';
import '../../widgets/app_bar_widget.dart';
import '../messaging/chat_screen.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});
  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  // ── Coordonnées admin RentAL ──────────────────────────────
  static const String _whatsApp = '+237659887452';
  static const String _phone    = '+237659887452';
  static const String _email    = 'feudjioaurelien24@gmail.com';

  final _api = ApiService();
  bool _startingChat = false;

  // ── Démarrer le chat avec le support admin ────────────────
  // Stratégie :
  // 1. Chercher une conversation existante avec un admin (is_staff)
  // 2. Si trouvé → ouvrir directement
  // 3. Si non → essayer startConversation (endpoint backend)
  // 4. Si ça échoue → fallback WhatsApp avec message d'info
  Future<void> _startLiveChat() async {
    final user = context.read<AuthProvider>().user;
    if (user == null) {
      Navigator.pushNamed(context, '/login');
      return;
    }
    setState(() => _startingChat = true);

    try {
      // Étape 1 : chercher une conversation support existante
      final convs = await _api.getConversations();
      ConversationModel? supportConv;

      // Chercher une conversation sans logement (conversation de support)
      // ou avec un participant admin
      for (final c in convs) {
        if (c.housingId == null || c.housingTitle == null) {
          supportConv = c;
          break;
        }
      }

      if (supportConv != null) {
        // Conversation existante trouvée → ouvrir directement
        if (mounted) {
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => ChatScreen(
              conversationId: supportConv!.id,
              otherUserId: 0,
              otherUserName: 'Support RentAL',
              housingTitle: 'Assistance & Support',
            ),
          ));
        }
      } else {
        // Étape 2 : Créer une nouvelle conversation de support
        // On envoie un message à l'admin via l'endpoint conversations/start/
        // avec un housing_id fictif ou on utilise un endpoint dédié
        try {
          final conv = await _api.startSupportConversation();
          if (mounted) {
            Navigator.push(context, MaterialPageRoute(
              builder: (_) => ChatScreen(
                conversationId: conv.id,
                otherUserId: 0,
                otherUserName: 'Support RentAL',
                housingTitle: 'Assistance & Support',
              ),
            ));
          }
        } catch (_) {
          // Étape 3 : Fallback WhatsApp
          if (mounted) {
            _showFallbackDialog();
          }
        }
      }
    } catch (e) {
      if (mounted) _showFallbackDialog();
    } finally {
      if (mounted) setState(() => _startingChat = false);
    }
  }

  void _showFallbackDialog() {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: isDark ? AppColors.cardDark : AppColors.surfaceLight,
        title: const Text('Chat en direct'),
        content: const Text(
          'Le chat intégré est temporairement indisponible.\n\n'
          'Contactez-nous directement via WhatsApp pour une réponse immédiate.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              _launchWhatsApp();
            },
            icon: const Icon(Icons.chat_rounded, size: 16),
            label: const Text('WhatsApp'),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF25D366)),
          ),
        ],
      ),
    );
  }

  Future<void> _launchWhatsApp() => _launch(
    'https://wa.me/$_whatsApp?text=${Uri.encodeComponent('Bonjour, j\'ai besoin d\'aide avec l\'application RentAL.')}',
  );

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark    = context.watch<ThemeProvider>().isDarkMode;
    final bg        = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: const RentalAppBar(title: 'Assistance & Support'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // ── Bannière ──────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(children: [
              const Icon(Icons.headset_mic_rounded, color: Colors.white, size: 40),
              const SizedBox(height: 10),
              const Text('Nous sommes là pour vous aider',
                  style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center),
              const SizedBox(height: 4),
              Text('Disponible 7j/7 de 8h à 22h',
                  style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12),
                  textAlign: TextAlign.center),
            ]),
          ),
          const SizedBox(height: 24),

          Text('Contactez-nous', style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 14),

          // ── Chat en direct ────────────────────────────────
          _card(
            isDark: isDark,
            icon: Icons.chat_bubble_rounded,
            iconColor: AppColors.secondary,
            title: 'Chat en direct',
            subtitle: 'Réponse instantanée — messagerie intégrée',
            badge: 'Disponible 24/7',
            badgeColor: AppColors.secondary,
            loading: _startingChat,
            onTap: _startingChat ? null : _startLiveChat,
          ),
          const SizedBox(height: 10),

          // ── WhatsApp ──────────────────────────────────────
          _card(
            isDark: isDark,
            icon: Icons.chat_rounded,
            iconColor: const Color(0xFF25D366),
            title: 'WhatsApp',
            subtitle: 'Réponse rapide',
            badge: 'Recommandé',
            badgeColor: AppColors.success,
            onTap: _launchWhatsApp,
          ),
          const SizedBox(height: 10),

          // ── Appel ─────────────────────────────────────────
          _card(
            isDark: isDark,
            icon: Icons.phone_rounded,
            iconColor: AppColors.primary,
            title: 'Appel',
            subtitle: _phone,
            onTap: () => _launch('tel:$_phone'),
          ),
          const SizedBox(height: 10),

          // ── Email ─────────────────────────────────────────
          _card(
            isDark: isDark,
            icon: Icons.email_rounded,
            iconColor: AppColors.info,
            title: 'Email',
            subtitle: _email,
            onTap: () => _launch('mailto:$_email?subject=${Uri.encodeComponent('Support RentAL')}'),
          ),
          const SizedBox(height: 28),

          // ── FAQ ───────────────────────────────────────────
          Text('Questions fréquentes',
              style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 14),
          ..._buildFaq(isDark),
          const SizedBox(height: 20),
        ]),
      ),
    );
  }

  Widget _card({
    required bool isDark, required IconData icon, required Color iconColor,
    required String title, required String subtitle, String? badge,
    Color? badgeColor, VoidCallback? onTap, bool loading = false,
  }) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedOpacity(
        opacity: onTap == null && !loading ? 0.6 : 1.0,
        duration: const Duration(milliseconds: 200),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(14),
              border: Border.all(color: border)),
          child: Row(children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(color: iconColor.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
              child: loading
                  ? Padding(padding: const EdgeInsets.all(12),
                      child: CircularProgressIndicator(strokeWidth: 2, color: iconColor))
                  : Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text(title, style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 14)),
                if (badge != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                        color: (badgeColor ?? AppColors.primary).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20)),
                    child: Text(badge, style: TextStyle(
                        color: badgeColor ?? AppColors.primary, fontSize: 10, fontWeight: FontWeight.w600)),
                  ),
                ],
              ]),
              const SizedBox(height: 2),
              Text(subtitle, style: TextStyle(color: subColor, fontSize: 12)),
            ])),
            Icon(Icons.arrow_forward_ios_rounded, color: subColor, size: 14),
          ]),
        ),
      ),
    );
  }

  List<Widget> _buildFaq(bool isDark) {
    final items = [
      ('Comment planifier une visite ?',
          'Ouvrez la fiche d\'un logement, appuyez sur "Planifier une visite", choisissez la date et l\'heure.'),
      ('Comment contacter un propriétaire ?',
          'Depuis la fiche logement, utilisez le bouton WhatsApp ou la messagerie intégrée.'),
      ('Puis-je annuler une visite ?',
          'Oui, depuis Profil → Mes visites, appuyez sur la visite puis "Annuler".'),
      ('Comment modifier mon profil ?',
          'Allez dans Profil → Modifier le profil pour changer vos informations et votre photo.'),
      ('Comment changer de langue ?',
          'Appuyez sur le bouton FR/EN dans la barre de navigation en haut.'),
      ('Mode sombre ne s\'active pas ?',
          'Appuyez sur l\'icône soleil/lune dans la barre de navigation en haut.'),
    ];

    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return items.map((item) => Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: ExpansionTile(
        title: Text(item.$1, style: TextStyle(color: textColor, fontWeight: FontWeight.w500, fontSize: 13)),
        iconColor: AppColors.primary,
        collapsedIconColor: subColor,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            child: Text(item.$2, style: TextStyle(color: subColor, fontSize: 12, height: 1.6)),
          ),
        ],
      ),
    )).toList();
  }
}