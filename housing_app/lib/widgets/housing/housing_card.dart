// // /// ============================================
// // // lib/widgets/housing/housing_card.dart
// // // ============================================

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/housing_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../screens/housing/housing_detail_screen.dart';

class HousingCard extends StatefulWidget {
  final HousingModel housing;
  final VoidCallback? onTap;

  const HousingCard({super.key, required this.housing, this.onTap});

  @override
  State<HousingCard> createState() => _HousingCardState();
}

class _HousingCardState extends State<HousingCard>
    with SingleTickerProviderStateMixin {
  late bool _isLiked;
  late int  _likesCount;
  late AnimationController _likeAnim;
  late Animation<double>   _likeScale;

  @override
  void initState() {
    super.initState();
    _isLiked   = widget.housing.isLiked;
    _likesCount = widget.housing.likesCount;
    _likeAnim  = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 200));
    _likeScale = Tween<double>(begin: 1, end: 1.3).animate(
      CurvedAnimation(parent: _likeAnim, curve: Curves.elasticOut));
  }

  @override
  void didUpdateWidget(HousingCard old) {
    super.didUpdateWidget(old);
    _isLiked    = widget.housing.isLiked;
    _likesCount = widget.housing.likesCount;
  }

  @override
  void dispose() {
    _likeAnim.dispose();
    super.dispose();
  }

  Future<void> _handleLike() async {
    final user = context.read<AuthProvider>().user;
    if (user == null) { Navigator.pushNamed(context, '/login'); return; }
    _likeAnim.forward().then((_) => _likeAnim.reverse());
    setState(() {
      _isLiked    = !_isLiked;
      _likesCount += _isLiked ? 1 : -1;
    });
    await context.read<HousingProvider>().toggleLike(widget.housing.id);
  }

  @override
  Widget build(BuildContext context) {
    final isDark    = context.watch<ThemeProvider>().isDarkMode;
    final cardColor = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return GestureDetector(
      onTap: widget.onTap ?? () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => HousingDetailScreen(housingId: widget.housing.id)),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: border),
          boxShadow: isDark
              ? []
              : [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Image ────────────────────────────────────
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                  child: widget.housing.mainImage != null
                      ? CachedNetworkImage(
                          imageUrl: widget.housing.mainImage!,
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => _placeholder(isDark),
                          errorWidget:  (_, __, ___) => _placeholder(isDark),
                        )
                      : _placeholder(isDark),
                ),

                // Gradient overlay
                Positioned(
                  bottom: 0, left: 0, right: 0,
                  child: Container(
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [Colors.black.withOpacity(0.7), Colors.transparent],
                      ),
                    ),
                  ),
                ),

                // Prix
                Positioned(
                  bottom: 12, left: 12,
                  child: Text(
                    '${_fmt(widget.housing.price)} FCFA/mois',
                    style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold,
                      fontSize: 15, shadows: [Shadow(color: Colors.black45, blurRadius: 4)],
                    ),
                  ),
                ),

                // Badge NOUVEAU ou STATUT
                Positioned(
                  top: 12, left: 12,
                  child: _buildBadge(),
                ),

                // Bouton like animé
                Positioned(
                  top: 8, right: 8,
                  child: GestureDetector(
                    onTap: _handleLike,
                    child: ScaleTransition(
                      scale: _likeScale,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 36, height: 36,
                        decoration: BoxDecoration(
                          color: _isLiked
                              ? AppColors.danger.withOpacity(0.2)
                              : Colors.black.withOpacity(0.35),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: _isLiked ? AppColors.danger : Colors.white24,
                          ),
                        ),
                        child: Icon(
                          _isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          color: _isLiked ? AppColors.danger : Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // ── Contenu ──────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Titre
                  Text(
                    widget.housing.displayName,
                    style: TextStyle(
                      color: textColor, fontSize: 15,
                      fontWeight: FontWeight.w600, height: 1.3,
                    ),
                    maxLines: 1, overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),

                  // Localisation
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 13, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          widget.housing.locationStr,
                          style: TextStyle(color: subColor, fontSize: 12),
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Caractéristiques
                  Row(
                    children: [
                      _feat(Icons.bed_outlined, '${widget.housing.rooms} Ch.', subColor),
                      const SizedBox(width: 14),
                      _feat(Icons.bathtub_outlined, '${widget.housing.bathrooms} SdB', subColor),
                      const SizedBox(width: 14),
                      _feat(Icons.square_foot_outlined, '${widget.housing.area} m²', subColor),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // ── Stats : vues / likes / date ─────────
                  Divider(color: border, height: 1),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          _statChip(Icons.visibility_outlined, widget.housing.viewsCount, subColor),
                          const SizedBox(width: 12),
                          _statChip(
                            _isLiked ? Icons.favorite_rounded : Icons.favorite_outline_rounded,
                            _likesCount,
                            _isLiked ? AppColors.danger : subColor,
                          ),
                        ],
                      ),
                      Text(
                        _relativeDate(widget.housing.createdAt),
                        style: TextStyle(color: subColor, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge() {
    final l10n = context.l10n;
    if (widget.housing.isNew) {
      return _chip(l10n.newBadge, AppColors.primary);
    }
    switch (widget.housing.status) {
      case 'disponible': return _chip(l10n.available, AppColors.success);
      case 'reserve':    return _chip(l10n.reserved, AppColors.warning);
      case 'occupe':     return _chip(l10n.occupied, AppColors.danger);
      default:           return const SizedBox.shrink();
    }
  }

  Widget _chip(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(
      color: color.withOpacity(0.9), borderRadius: BorderRadius.circular(20)),
    child: Text(label,
        style: const TextStyle(
            color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
  );

  Widget _feat(IconData icon, String text, Color color) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 14, color: color),
      const SizedBox(width: 4),
      Text(text, style: TextStyle(color: color, fontSize: 12)),
    ],
  );

  Widget _statChip(IconData icon, int count, Color color) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 13, color: color),
      const SizedBox(width: 3),
      Text('$count', style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500)),
    ],
  );

  Widget _placeholder(bool isDark) => Container(
    height: 200,
    color: isDark ? AppColors.surfaceDark : AppColors.bgLight,
    child: Center(child: Icon(Icons.home_work_outlined,
        size: 56, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight)),
  );

  String _fmt(int price) {
    final s = price.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  String _relativeDate(DateTime dt) {
    final diff = DateTime.now().difference(dt).inDays;
    if (diff == 0) return "Aujourd'hui";
    if (diff == 1) return 'Hier';
    if (diff < 7)  return 'Il y a $diff j';
    if (diff < 30) return 'Il y a ${(diff / 7).floor()}sem';
    return 'Il y a ${(diff / 30).floor()}mois';
  }
}