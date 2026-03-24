
// lib/screens/favorites/favorites_screen.dart
// ✅ Corrigé : Django renvoie [{housing: {...}}] → on extrait housing
// ✅ Affiche image, prix, titre, localisation, stats vues/likes/date
// ✅ Bouton "Remove" rouge comme sur le web

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';
import '../housing/housing_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});
  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  final _api = ApiService();
  List<HousingModel> _favorites = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try { _favorites = await _api.getFavorites(); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _remove(HousingModel h) async {
    await _api.toggleLike(h.id);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final l10n   = context.l10n;
    final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;

    return Scaffold(
      backgroundColor: bg,
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _favorites.isEmpty
              ? _buildEmpty(isDark, l10n)
              : RefreshIndicator(
                  onRefresh: _load,
                  color: AppColors.primary,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _favorites.length,
                    itemBuilder: (_, i) => _buildCard(_favorites[i], isDark),
                  ),
                ),
    );
  }

  Widget _buildCard(HousingModel h, bool isDark) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    Color statusColor;
    String statusLabel;
    switch (h.status) {
      case 'disponible':
        statusColor = AppColors.success;
        statusLabel = 'DISPONIBLE';
        break;
      case 'reserve':
        statusColor = AppColors.warning;
        statusLabel = 'RÉSERVÉ';
        break;
      default:
        statusColor = AppColors.danger;
        statusLabel = 'OCCUPÉ';
    }

    return GestureDetector(
      onTap: () => Navigator.push(context,
          MaterialPageRoute(builder: (_) => HousingDetailScreen(housingId: h.id))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16),
            border: Border.all(color: border),
            boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)]),
        child: Column(children: [
          // Image avec badge statut
          Stack(children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: h.mainImage != null
                  ? CachedNetworkImage(imageUrl: h.mainImage!, height: 180, width: double.infinity, fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => _placeholder(isDark))
                  : _placeholder(isDark),
            ),
            // Badge statut (DISPONIBLE en vert comme sur le web)
            Positioned(top: 12, left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: statusColor, borderRadius: BorderRadius.circular(20)),
                child: Text(statusLabel,
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              )),
            // Bouton favori
            Positioned(top: 8, right: 8,
              child: Container(width: 36, height: 36,
                decoration: BoxDecoration(color: Colors.black38, shape: BoxShape.circle),
                child: const Icon(Icons.favorite_rounded, color: AppColors.danger, size: 18))),
          ]),

          // Infos
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Prix
              // Text('${_fmt(h.price)} FCFA / mois',
              //     style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 15)),
              // const SizedBox(height: 4),
              // Prix
Text('${_fmt(h.price)} FCFA / mois',
    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 15)),

const SizedBox(height: 6),

// 🔥 TITRE DU LOGEMENT
Text(
  h.displayName.isNotEmpty ? h.displayName : h.title,
  style: TextStyle(
    color: textColor,
    fontSize: 16,
    fontWeight: FontWeight.bold,
  ),
  maxLines: 2,
  overflow: TextOverflow.ellipsis,
),

const SizedBox(height: 4),


              // Type
              if (h.typeName != null || h.categoryName != null)
                Text(h.typeName ?? h.categoryName ?? '',
                    style: TextStyle(color: subColor, fontSize: 12)),
              const SizedBox(height: 4),
              // Localisation
              Row(children: [
                const Icon(Icons.location_on, size: 13, color: AppColors.primary),
                const SizedBox(width: 4),
                Expanded(child: Text(h.locationStr,
                    style: TextStyle(color: subColor, fontSize: 12),
                    maxLines: 1, overflow: TextOverflow.ellipsis)),
              ]),
              const SizedBox(height: 8),
              // Caractéristiques
              Row(children: [
                _feat(Icons.bed_outlined, '${h.rooms} ch.', subColor),
                const SizedBox(width: 12),
                _feat(Icons.bathtub_outlined, '${h.bathrooms} db.', subColor),
                const SizedBox(width: 12),
                _feat(Icons.square_foot_outlined, '${h.area} m²', subColor),
              ]),
              const SizedBox(height: 8),
              // Stats vues / likes / date
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Row(children: [
                  Icon(Icons.visibility_outlined, size: 13, color: subColor),
                  Text(' ${h.viewsCount}', style: TextStyle(color: subColor, fontSize: 11)),
                  const SizedBox(width: 10),
                  Icon(Icons.favorite_outline_rounded, size: 13, color: subColor),
                  Text(' ${h.likesCount}', style: TextStyle(color: subColor, fontSize: 11)),
                ]),
                Text(_relDate(h.createdAt), style: TextStyle(color: subColor, fontSize: 11)),
              ]),
              const SizedBox(height: 12),
              // Bouton Remove (comme sur le web)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _remove(h),
                  icon: const Icon(Icons.delete_outline_rounded, size: 16, color: Colors.white),
                  label: const Text('Remove', style: TextStyle(color: Colors.white, fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.danger,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                ),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _placeholder(bool isDark) => Container(
    height: 180,
    color: isDark ? AppColors.surfaceDark : AppColors.bgLight,
    child: Center(child: Icon(Icons.home_work_outlined, size: 56,
        color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight)),
  );

  Widget _feat(IconData icon, String text, Color color) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 13, color: color),
      const SizedBox(width: 3),
      Text(text, style: TextStyle(color: color, fontSize: 11)),
    ],
  );

  Widget _buildEmpty(bool isDark, AppL10n l10n) {
    return Center(child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.favorite_border_rounded, size: 72,
            color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
        const SizedBox(height: 16),
        Text(l10n.noFavorites, style: TextStyle(
            color: isDark ? AppColors.textDark : AppColors.textLight,
            fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        Text('Likez des logements pour les retrouver ici', style: TextStyle(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            fontSize: 13), textAlign: TextAlign.center),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () => Navigator.pushNamed(context, '/search'),
          child: const Text('Explorer les logements'),
        ),
      ]),
    ));
  }

  String _fmt(int p) {
    final s = p.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  String _relDate(DateTime dt) {
    final d = DateTime.now().difference(dt).inDays;
    if (d == 0) return "Aujourd'hui";
    if (d < 30) return 'Il y a $d j';
    return 'Il y a ${(d/30).floor()} mois';
  }
}