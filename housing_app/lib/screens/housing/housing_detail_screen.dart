// // lib/screens/housing/housing_detail_screen.dart
// //
// // AJOUT :
// //  ✅ Section "Visite Vidéo" — lecteur vidéo intégré (video_player + chewie)
// //     ou bouton "Voir la vidéo" si le package n'est pas installé
// //  ✅ Section "Visite Virtuelle 360°" — bouton qui ouvre l'URL dans le navigateur
// //     (même comportement que le web : iframe → url_launcher en mobile)
// //  ✅ Badge "VISITE VIDÉO" et "360°" sur la galerie si disponibles
// //  ✅ Dark/Light + bilingue

// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:provider/provider.dart';
// import 'package:cached_network_image/cached_network_image.dart';
// import 'package:url_launcher/url_launcher.dart';
// import '../../core/constants/app_colors.dart';
// import '../../core/l10n/app_localizations.dart';
// import '../../data/models/housing_model.dart';
// import '../../data/providers/auth_provider.dart';
// import '../../data/providers/theme_provider.dart';
// import '../../data/services/api_service.dart';

// class HousingDetailScreen extends StatefulWidget {
//   final int housingId;
//   const HousingDetailScreen({super.key, required this.housingId});

//   @override
//   State<HousingDetailScreen> createState() =>
//       _HousingDetailScreenState();
// }

// class _HousingDetailScreenState extends State<HousingDetailScreen> {
//   final _api      = ApiService();
//   final _pageCtrl = PageController();

//   HousingModel? _housing;
//   List<HousingModel> _similar = [];
//   bool _loading      = true;
//   int  _imgIndex     = 0;
//   bool _isLiked      = false;
//   bool _isSaved      = false;
//   int  _likesCount   = 0;
//   bool _descExpanded = false;

//   @override
//   void initState() {
//     super.initState();
//     WidgetsBinding.instance.addPostFrameCallback((_) => _load());
//   }

//   @override
//   void dispose() {
//     _pageCtrl.dispose();
//     super.dispose();
//   }

//   Future<void> _load() async {
//     setState(() => _loading = true);
//     try {
//       final h = await _api.getHousingDetail(widget.housingId);
//       await _api.incrementViews(widget.housingId);

//       List<HousingModel> sim = [];
//       try {
//         final lang = context.read<ThemeProvider>().language;
//         final res  = await _api.nlpSearch(
//           query:    '${h.categoryName ?? ''} ${h.cityName ?? ''}',
//           language: lang,
//         );
//         final results = res['results'] as List? ?? [];
//         sim = results
//             .map((j) => HousingModel.fromJson(j as Map<String, dynamic>))
//             .where((x) => x.id != widget.housingId)
//             .take(4)
//             .toList();
//       } catch (_) {}

//       setState(() {
//         _housing    = h;
//         _isLiked    = h.isLiked;
//         _isSaved    = h.isSaved;
//         _likesCount = h.likesCount;
//         _similar    = sim;
//         _loading    = false;
//       });
//     } catch (e) {
//       setState(() => _loading = false);
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(SnackBar(
//           content: Text('Logement introuvable : $e'),
//           backgroundColor: AppColors.danger,
//         ));
//         Navigator.pop(context);
//       }
//     }
//   }

//   Future<void> _toggleLike() async {
//     if (!_requireAuth()) return;
//     setState(() {
//       _isLiked    = !_isLiked;
//       _likesCount += _isLiked ? 1 : -1;
//     });
//     await _api.toggleLike(widget.housingId);
//   }

//   Future<void> _toggleSave() async {
//     if (!_requireAuth()) return;
//     setState(() => _isSaved = !_isSaved);
//     await _api.toggleSave(widget.housingId);
//   }

//   bool _requireAuth() {
//     if (context.read<AuthProvider>().user == null) {
//       Navigator.pushNamed(context, '/login');
//       return false;
//     }
//     return true;
//   }

//   Future<void> _openMessaging(HousingModel h) async {
//     if (!_requireAuth()) return;
//     try {
//       final conv = await _api.startConversation(h.id);
//       if (!mounted) return;
//       final currentUserId = context.read<AuthProvider>().user?.id ?? 0;
//       final other = conv.otherUser(currentUserId);
//       Navigator.pushNamed(context, '/chat', arguments: {
//         'conversationId': conv.id,
//         'otherUserId':    other?.id ?? 0,
//         'otherUserName':  other?.username ?? h.ownerName ?? 'Propriétaire',
//         'otherUserPhoto': other?.photo ?? h.ownerPhoto,
//         'housingTitle':   h.displayName,
//       });
//     } catch (e) {
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(SnackBar(
//           content: Text('Erreur messagerie : $e'),
//           backgroundColor: AppColors.danger,
//           behavior: SnackBarBehavior.floating,
//         ));
//       }
//     }
//   }

//   Future<void> _launchUrl(String url) async {
//     final uri = Uri.parse(url);
//     if (await canLaunchUrl(uri)) {
//       await launchUrl(uri, mode: LaunchMode.externalApplication);
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     final isDark = context.watch<ThemeProvider>().isDarkMode;
//     final l10n   = context.l10n;
//     final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;

//     if (_loading) {
//       return Scaffold(
//         backgroundColor: bg,
//         body: const Center(
//             child: CircularProgressIndicator(color: AppColors.primary)),
//       );
//     }
//     if (_housing == null) return const SizedBox.shrink();

//     final h = _housing!;
//     final images = <String>[];
//     if (h.images != null && h.images!.isNotEmpty) {
//       images.addAll(h.images!.map((i) => i.image));
//     } else if (h.mainImage != null) {
//       images.add(h.mainImage!);
//     }

//     return Scaffold(
//       backgroundColor: bg,
//       body: CustomScrollView(
//         slivers: [
//           // ── AppBar + galerie ────────────────────────────
//           SliverAppBar(
//             expandedHeight: 300,
//             pinned: true,
//             stretch: true,
//             backgroundColor: AppColors.bgDark,
//             systemOverlayStyle: SystemUiOverlayStyle.light,
//             leading: _iconBtn(
//               icon: Icons.arrow_back_ios_rounded,
//               onTap: () => Navigator.pop(context),
//             ),
//             actions: [
//               _iconBtn(icon: Icons.share_rounded, onTap: () => _share(h)),
//               _iconBtn(
//                 icon: _isSaved
//                     ? Icons.bookmark_rounded
//                     : Icons.bookmark_outline_rounded,
//                 color: _isSaved ? AppColors.primary : Colors.white,
//                 onTap: _toggleSave,
//               ),
//               const SizedBox(width: 4),
//             ],
//             flexibleSpace: FlexibleSpaceBar(
//               background: _buildGallery(images, h, isDark),
//             ),
//           ),

//           SliverToBoxAdapter(
//             child: Padding(
//               padding: const EdgeInsets.all(20),
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   _buildStatusRow(h, isDark),
//                   const SizedBox(height: 12),
//                   _buildTitlePrice(h, isDark),
//                   const SizedBox(height: 8),
//                   _buildLocation(h, isDark),
//                   const SizedBox(height: 16),
//                   _buildStatsRow(h, isDark),
//                   const SizedBox(height: 16),
//                   _buildFeatures(h, isDark),
//                   const SizedBox(height: 20),

//                   // ✅ VISITE VIDÉO + 360° ─────────────────
//                   if (h.hasVideo || h.virtual360 != null) ...[
//                     _buildVirtualVisitSection(h, isDark, l10n),
//                     const SizedBox(height: 20),
//                   ],

//                   _buildOwnerCard(h, isDark, l10n),
//                   const SizedBox(height: 20),
//                   _buildDescription(h, isDark, l10n),
//                   const SizedBox(height: 20),
//                   if (h.additionalFeatures != null &&
//                       h.additionalFeatures!.isNotEmpty)
//                     _buildEquipments(h, isDark, l10n),
//                   if (h.additionalFeatures != null)
//                     const SizedBox(height: 20),
//                   if (h.hasCoords) _buildMapSection(h, isDark, l10n),
//                   if (h.hasCoords) const SizedBox(height: 20),
//                   if (_similar.isNotEmpty)
//                     _buildSimilar(isDark, l10n),
//                   const SizedBox(height: 100),
//                 ],
//               ),
//             ),
//           ),
//         ],
//       ),
//       bottomNavigationBar: _buildBottomBar(h, isDark, l10n),
//     );
//   }

//   // ── Galerie avec badges vidéo/360° ───────────────────────
//   Widget _buildGallery(
//       List<String> images, HousingModel h, bool isDark) {
//     if (images.isEmpty) {
//       return Container(
//         color: AppColors.surfaceDark,
//         child: const Center(
//             child: Icon(Icons.home_work_outlined,
//                 size: 80, color: AppColors.textMutedDark)),
//       );
//     }
//     return Stack(children: [
//       PageView.builder(
//         controller: _pageCtrl,
//         itemCount: images.length,
//         onPageChanged: (i) => setState(() => _imgIndex = i),
//         itemBuilder: (_, i) => CachedNetworkImage(
//           imageUrl: images[i],
//           fit: BoxFit.cover,
//           width: double.infinity,
//           placeholder: (_, __) =>
//               Container(color: AppColors.surfaceDark),
//           errorWidget: (_, __, ___) => Container(
//             color: AppColors.surfaceDark,
//             child: const Icon(Icons.broken_image_outlined,
//                 color: AppColors.textMutedDark),
//           ),
//         ),
//       ),
//       // Gradient bas
//       Positioned(
//         bottom: 0, left: 0, right: 0,
//         child: Container(
//           height: 80,
//           decoration: BoxDecoration(
//             gradient: LinearGradient(
//               begin: Alignment.bottomCenter,
//               end: Alignment.topCenter,
//               colors: [
//                 Colors.black.withOpacity(0.7),
//                 Colors.transparent,
//               ],
//             ),
//           ),
//         ),
//       ),
//       // Indicateur images
//       if (images.length > 1)
//         Positioned(
//           bottom: 14, left: 0, right: 0,
//           child: Row(
//             mainAxisAlignment: MainAxisAlignment.center,
//             children: List.generate(
//               images.length.clamp(0, 8),
//               (i) => AnimatedContainer(
//                 duration: const Duration(milliseconds: 200),
//                 margin: const EdgeInsets.symmetric(horizontal: 3),
//                 width: _imgIndex == i ? 18 : 6,
//                 height: 6,
//                 decoration: BoxDecoration(
//                   color: _imgIndex == i
//                       ? AppColors.primary
//                       : Colors.white54,
//                   borderRadius: BorderRadius.circular(3),
//                 ),
//               ),
//             ),
//           ),
//         ),
//       // Compteur images
//       Positioned(
//         top: 80, right: 14,
//         child: Container(
//           padding: const EdgeInsets.symmetric(
//               horizontal: 8, vertical: 4),
//           decoration: BoxDecoration(
//             color: Colors.black54,
//             borderRadius: BorderRadius.circular(12),
//           ),
//           child: Text('${_imgIndex + 1}/${images.length}',
//               style: const TextStyle(
//                   color: Colors.white, fontSize: 12)),
//         ),
//       ),
//       // ✅ Badges vidéo + 360° sur la galerie
//       Positioned(
//         bottom: 14, left: 14,
//         child: Row(children: [
//           if (h.hasVideo)
//             _mediaBadge(
//                 Icons.play_circle_outline_rounded, 'Vidéo'),
//           if (h.hasVideo && h.virtual360 != null)
//             const SizedBox(width: 6),
//           if (h.virtual360 != null)
//             _mediaBadge(Icons.vrpano_outlined, '360°'),
//         ]),
//       ),
//     ]);
//   }

//   Widget _mediaBadge(IconData icon, String label) {
//     return Container(
//       padding: const EdgeInsets.symmetric(
//           horizontal: 10, vertical: 5),
//       decoration: BoxDecoration(
//         color: Colors.black.withOpacity(0.6),
//         borderRadius: BorderRadius.circular(20),
//         border: Border.all(color: Colors.white24),
//       ),
//       child: Row(mainAxisSize: MainAxisSize.min, children: [
//         Icon(icon, color: Colors.white, size: 14),
//         const SizedBox(width: 5),
//         Text(label,
//             style: const TextStyle(
//                 color: Colors.white,
//                 fontSize: 11,
//                 fontWeight: FontWeight.w600)),
//       ]),
//     );
//   }

//   // ✅ SECTION VISITE VIRTUELLE ─────────────────────────────
//   Widget _buildVirtualVisitSection(
//       HousingModel h, bool isDark, AppL10n l10n) {
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final cardBg =
//         isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border =
//         isDark ? AppColors.borderDark : AppColors.borderLight;

//     return Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         // Titre section
//         Row(children: [
//           const Icon(Icons.play_circle_rounded,
//               color: AppColors.primary, size: 20),
//           const SizedBox(width: 8),
//           Text('Visite virtuelle',
//               style: TextStyle(
//                   color: textColor,
//                   fontWeight: FontWeight.bold,
//                   fontSize: 16)),
//         ]),
//         const SizedBox(height: 12),

//         // ── Vidéo de présentation ──────────────────────
//         if (h.hasVideo) ...[
//           _VideoSection(
//             videoUrl: h.video!,
//             isDark: isDark,
//             onOpen: () => _launchUrl(h.video!),
//           ),
//           if (h.virtual360 != null) const SizedBox(height: 12),
//         ],

//         // ── Visite 360° ────────────────────────────────
//         if (h.virtual360 != null) ...[
//           _Virtual360Section(
//             url360: h.virtual360!,
//             isDark: isDark,
//             onOpen: () => _launchUrl(h.virtual360!),
//           ),
//         ],
//       ],
//     );
//   }

//   // ── Status row ───────────────────────────────────────────
//   Widget _buildStatusRow(HousingModel h, bool isDark) {
//     final l10n = context.l10n;
//     Color c;
//     String lbl;
//     switch (h.status) {
//       case 'disponible':
//         c = AppColors.success;
//         lbl = l10n.available;
//         break;
//       case 'reserve':
//         c = AppColors.warning;
//         lbl = l10n.reserved;
//         break;
//       default:
//         c = AppColors.danger;
//         lbl = l10n.occupied;
//     }
//     return Wrap(spacing: 8, children: [
//       _badge(lbl, c),
//       if (h.categoryName != null)
//         _badge(h.categoryName!, AppColors.primary),
//       if (h.typeName != null)
//         _badge(h.typeName!, AppColors.secondary),
//     ]);
//   }

//   Widget _badge(String label, Color color) => Container(
//     padding: const EdgeInsets.symmetric(
//         horizontal: 12, vertical: 5),
//     decoration: BoxDecoration(
//       color: color.withOpacity(0.15),
//       borderRadius: BorderRadius.circular(20),
//       border: Border.all(color: color.withOpacity(0.4)),
//     ),
//     child: Text(label,
//         style: TextStyle(
//             color: color,
//             fontSize: 12,
//             fontWeight: FontWeight.w600)),
//   );

//   // ── Titre + Prix ─────────────────────────────────────────
//   Widget _buildTitlePrice(HousingModel h, bool isDark) {
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor = isDark
//         ? AppColors.textSecondaryDark
//         : AppColors.textSecondaryLight;
//     return Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//       Text(h.displayName,
//           style: TextStyle(
//               color: textColor,
//               fontSize: 22,
//               fontWeight: FontWeight.bold)),
//       const SizedBox(height: 6),
//       Row(children: [
//         Text(_fmt(h.price),
//             style: const TextStyle(
//                 color: AppColors.primary,
//                 fontSize: 22,
//                 fontWeight: FontWeight.bold)),
//         Text(' FCFA${context.l10n.perMonth}',
//             style: TextStyle(color: subColor, fontSize: 14)),
//       ]),
//     ]);
//   }

//   // ── Localisation ─────────────────────────────────────────
//   Widget _buildLocation(HousingModel h, bool isDark) {
//     final subColor = isDark
//         ? AppColors.textSecondaryDark
//         : AppColors.textSecondaryLight;
//     return Row(children: [
//       const Icon(Icons.location_on_rounded,
//           size: 16, color: AppColors.primary),
//       const SizedBox(width: 4),
//       Expanded(
//           child: Text(h.locationStr,
//               style: TextStyle(color: subColor, fontSize: 13))),
//     ]);
//   }

//   // ── Stats vues/likes/date ────────────────────────────────
//   Widget _buildStatsRow(HousingModel h, bool isDark) {
//     final cardBg =
//         isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border =
//         isDark ? AppColors.borderDark : AppColors.borderLight;
//     final subColor = isDark
//         ? AppColors.textSecondaryDark
//         : AppColors.textSecondaryLight;
//     final days = DateTime.now().difference(h.createdAt).inDays;
//     final dateLabel = days == 0
//         ? "Aujourd'hui"
//         : days == 1
//             ? 'Hier'
//             : days < 30
//                 ? 'Il y a ${days}j'
//                 : 'Il y a ${(days / 30).floor()} mois';

//     return Container(
//       padding: const EdgeInsets.symmetric(vertical: 12),
//       decoration: BoxDecoration(
//         color: cardBg,
//         borderRadius: BorderRadius.circular(14),
//         border: Border.all(color: border),
//       ),
//       child: Row(
//         mainAxisAlignment: MainAxisAlignment.spaceAround,
//         children: [
//           _statItem(Icons.visibility_outlined,
//               '${h.viewsCount}', 'Vues', subColor),
//           Container(width: 1, height: 36, color: border),
//           GestureDetector(
//             onTap: _toggleLike,
//             child: _statItem(
//               _isLiked
//                   ? Icons.favorite_rounded
//                   : Icons.favorite_outline_rounded,
//               '$_likesCount',
//               'Likes',
//               _isLiked ? AppColors.danger : subColor,
//             ),
//           ),
//           Container(width: 1, height: 36, color: border),
//           _statItem(Icons.access_time_rounded, dateLabel,
//               'Ajouté', subColor),
//         ],
//       ),
//     );
//   }

//   Widget _statItem(
//       IconData icon, String val, String label, Color color) {
//     return Column(children: [
//       Icon(icon, size: 20, color: color),
//       const SizedBox(height: 4),
//       Text(val,
//           style: TextStyle(
//               color: color,
//               fontWeight: FontWeight.bold,
//               fontSize: 13)),
//       Text(label,
//           style: TextStyle(
//               color: color.withOpacity(0.7), fontSize: 10)),
//     ]);
//   }

//   // ── Caractéristiques ─────────────────────────────────────
//   Widget _buildFeatures(HousingModel h, bool isDark) {
//     final cardBg =
//         isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border =
//         isDark ? AppColors.borderDark : AppColors.borderLight;
//     return Container(
//       padding: const EdgeInsets.all(16),
//       decoration: BoxDecoration(
//           color: cardBg,
//           borderRadius: BorderRadius.circular(14),
//           border: Border.all(color: border)),
//       child: Row(
//         mainAxisAlignment: MainAxisAlignment.spaceAround,
//         children: [
//           _featureItem(Icons.bed_outlined, '${h.rooms}',
//               'Chambres', isDark),
//           _featureItem(Icons.bathtub_outlined,
//               '${h.bathrooms}', 'Salle de bain', isDark),
//           _featureItem(Icons.square_foot_outlined, '${h.area}',
//               'm²', isDark),
//         ],
//       ),
//     );
//   }

//   Widget _featureItem(
//       IconData icon, String val, String label, bool isDark) {
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor = isDark
//         ? AppColors.textSecondaryDark
//         : AppColors.textSecondaryLight;
//     return Column(children: [
//       Container(
//         padding: const EdgeInsets.all(10),
//         decoration: BoxDecoration(
//           color: AppColors.primary.withOpacity(0.1),
//           borderRadius: BorderRadius.circular(12),
//         ),
//         child: Icon(icon, color: AppColors.primary, size: 22),
//       ),
//       const SizedBox(height: 6),
//       Text(val,
//           style: TextStyle(
//               color: textColor,
//               fontWeight: FontWeight.bold,
//               fontSize: 16)),
//       Text(label,
//           style: TextStyle(color: subColor, fontSize: 11)),
//     ]);
//   }

//   // ── Propriétaire ─────────────────────────────────────────
//   Widget _buildOwnerCard(
//       HousingModel h, bool isDark, AppL10n l10n) {
//     final cardBg =
//         isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border =
//         isDark ? AppColors.borderDark : AppColors.borderLight;
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor = isDark
//         ? AppColors.textSecondaryDark
//         : AppColors.textSecondaryLight;

//     return Container(
//       padding: const EdgeInsets.all(16),
//       decoration: BoxDecoration(
//           color: cardBg,
//           borderRadius: BorderRadius.circular(14),
//           border: Border.all(color: border)),
//       child: Row(children: [
//         CircleAvatar(
//           radius: 28,
//           backgroundColor: AppColors.primary.withOpacity(0.15),
//           backgroundImage: h.ownerPhoto != null
//               ? NetworkImage(h.ownerPhoto!)
//               : null,
//           child: h.ownerPhoto == null
//               ? Text(
//                   h.ownerName?.isNotEmpty == true
//                       ? h.ownerName![0].toUpperCase()
//                       : 'P',
//                   style: const TextStyle(
//                       color: AppColors.primary,
//                       fontWeight: FontWeight.bold,
//                       fontSize: 18))
//               : null,
//         ),
//         const SizedBox(width: 14),
//         Expanded(
//           child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//             Text(h.ownerName ?? 'Propriétaire',
//                 style: TextStyle(
//                     color: textColor,
//                     fontWeight: FontWeight.w600,
//                     fontSize: 15)),
//             Text(l10n.owner,
//                 style:
//                     TextStyle(color: subColor, fontSize: 12)),
//           ]),
//         ),
//         Row(children: [
//           _contactBtn(
//             icon: Icons.chat_rounded,
//             color: AppColors.primary,
//             tooltip: 'Messagerie',
//             onTap: () => _openMessaging(h),
//           ),
//           if (h.ownerPhone != null) ...[
//             const SizedBox(width: 8),
//             _contactBtn(
//               icon: Icons.chat_bubble_outline_rounded,
//               color: const Color(0xFF25D366),
//               tooltip: 'WhatsApp',
//               onTap: () => _launchUrl(
//                 'https://wa.me/${h.ownerPhone}?text='
//                 '${Uri.encodeComponent('Bonjour, je suis intéressé par : ${h.displayName}')}',
//               ),
//             ),
//             const SizedBox(width: 8),
//             _contactBtn(
//               icon: Icons.phone_rounded,
//               color: AppColors.success,
//               tooltip: 'Appeler',
//               onTap: () => _launchUrl('tel:${h.ownerPhone}'),
//             ),
//           ],
//         ]),
//       ]),
//     );
//   }

//   Widget _contactBtn({
//     required IconData icon,
//     required Color color,
//     required VoidCallback onTap,
//     String? tooltip,
//   }) =>
//       Tooltip(
//         message: tooltip ?? '',
//         child: GestureDetector(
//           onTap: onTap,
//           child: Container(
//             width: 40, height: 40,
//             decoration: BoxDecoration(
//               color: color.withOpacity(0.12),
//               borderRadius: BorderRadius.circular(12),
//               border: Border.all(color: color.withOpacity(0.3)),
//             ),
//             child: Icon(icon, color: color, size: 20),
//           ),
//         ),
//       );

//   // ── Description ──────────────────────────────────────────
//   Widget _buildDescription(
//       HousingModel h, bool isDark, AppL10n l10n) {
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor = isDark
//         ? AppColors.textSecondaryDark
//         : AppColors.textSecondaryLight;
//     final desc   = h.description;
//     final isLong = desc.length > 220;

//     return Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//       Text(l10n.description,
//           style: TextStyle(
//               color: textColor,
//               fontWeight: FontWeight.bold,
//               fontSize: 16)),
//       const SizedBox(height: 10),
//       Text(
//         _descExpanded || !isLong
//             ? desc
//             : '${desc.substring(0, 220)}…',
//         style: TextStyle(
//             color: subColor, fontSize: 14, height: 1.6),
//       ),
//       if (isLong) ...[
//         const SizedBox(height: 6),
//         GestureDetector(
//           onTap: () =>
//               setState(() => _descExpanded = !_descExpanded),
//           child: Text(
//             _descExpanded ? 'Voir moins' : 'Voir plus',
//             style: const TextStyle(
//                 color: AppColors.primary,
//                 fontWeight: FontWeight.w600),
//           ),
//         ),
//       ],
//     ]);
//   }

//   // ── Équipements ──────────────────────────────────────────
//   Widget _buildEquipments(
//       HousingModel h, bool isDark, AppL10n l10n) {
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final features = (h.additionalFeatures ?? '')
//         .split(',')
//         .map((s) => s.trim())
//         .where((s) => s.isNotEmpty)
//         .toList();
//     if (features.isEmpty) return const SizedBox.shrink();

//     return Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//       Text(l10n.equipment,
//           style: TextStyle(
//               color: textColor,
//               fontWeight: FontWeight.bold,
//               fontSize: 16)),
//       const SizedBox(height: 12),
//       Wrap(
//         spacing: 8, runSpacing: 8,
//         children: features
//             .map((f) => Container(
//                   padding: const EdgeInsets.symmetric(
//                       horizontal: 14, vertical: 7),
//                   decoration: BoxDecoration(
//                     color: AppColors.primary.withOpacity(0.08),
//                     borderRadius: BorderRadius.circular(20),
//                     border: Border.all(
//                         color:
//                             AppColors.primary.withOpacity(0.2)),
//                   ),
//                   child: Row(
//                       mainAxisSize: MainAxisSize.min,
//                       children: [
//                     const Icon(
//                         Icons.check_circle_outline_rounded,
//                         size: 14,
//                         color: AppColors.primary),
//                     const SizedBox(width: 5),
//                     Text(f,
//                         style: const TextStyle(
//                             color: AppColors.primary,
//                             fontSize: 12)),
//                   ]),
//                 ))
//             .toList(),
//       ),
//     ]);
//   }

//   // ── Carte ────────────────────────────────────────────────
//   Widget _buildMapSection(
//       HousingModel h, bool isDark, AppL10n l10n) {
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final cardBg =
//         isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border =
//         isDark ? AppColors.borderDark : AppColors.borderLight;

//     return Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//       Text(l10n.location,
//           style: TextStyle(
//               color: textColor,
//               fontWeight: FontWeight.bold,
//               fontSize: 16)),
//       const SizedBox(height: 10),
//       GestureDetector(
//         onTap: () => _launchUrl(
//           'https://www.google.com/maps/search/?api=1'
//           '&query=${h.latitude},${h.longitude}',
//         ),
//         child: Container(
//           height: 150,
//           decoration: BoxDecoration(
//             color: cardBg,
//             borderRadius: BorderRadius.circular(14),
//             border: Border.all(color: border),
//           ),
//           child: Stack(children: [
//             ClipRRect(
//               borderRadius: BorderRadius.circular(14),
//               child: CachedNetworkImage(
//                 imageUrl:
//                     'https://maps.googleapis.com/maps/api/staticmap'
//                     '?center=${h.latitude},${h.longitude}'
//                     '&zoom=15&size=600x200'
//                     '&markers=color:blue|${h.latitude},${h.longitude}',
//                 fit: BoxFit.cover,
//                 width: double.infinity,
//                 height: 150,
//                 errorWidget: (_, __, ___) => Container(
//                   color: cardBg,
//                   child: Column(
//                     mainAxisAlignment: MainAxisAlignment.center,
//                     children: [
//                       const Icon(Icons.map_outlined,
//                           size: 36, color: AppColors.primary),
//                       const SizedBox(height: 8),
//                       Text(h.locationStr,
//                           style: TextStyle(
//                               color: textColor, fontSize: 12),
//                           textAlign: TextAlign.center),
//                     ],
//                   ),
//                 ),
//               ),
//             ),
//             Positioned(
//               bottom: 10, right: 10,
//               child: Container(
//                 padding: const EdgeInsets.symmetric(
//                     horizontal: 12, vertical: 6),
//                 decoration: BoxDecoration(
//                   color: AppColors.primary,
//                   borderRadius: BorderRadius.circular(20),
//                 ),
//                 child: const Row(
//                   mainAxisSize: MainAxisSize.min,
//                   children: [
//                     Icon(Icons.open_in_new_rounded,
//                         color: Colors.white, size: 13),
//                     SizedBox(width: 4),
//                     Text('Voir sur Maps',
//                         style: TextStyle(
//                             color: Colors.white,
//                             fontSize: 11,
//                             fontWeight: FontWeight.w600)),
//                   ],
//                 ),
//               ),
//             ),
//           ]),
//         ),
//       ),
//     ]);
//   }

//   // ── Similaires ───────────────────────────────────────────
//   Widget _buildSimilar(bool isDark, AppL10n l10n) {
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     return Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//       Row(children: [
//         const Icon(Icons.auto_awesome_rounded,
//             color: AppColors.secondary, size: 18),
//         const SizedBox(width: 8),
//         Text('Suggestions intelligentes',
//             style: TextStyle(
//                 color: textColor,
//                 fontWeight: FontWeight.bold,
//                 fontSize: 16)),
//       ]),
//       const SizedBox(height: 12),
//       SizedBox(
//         height: 220,
//         child: ListView.builder(
//           scrollDirection: Axis.horizontal,
//           itemCount: _similar.length,
//           itemBuilder: (_, i) {
//             final s = _similar[i];
//             return GestureDetector(
//               onTap: () => Navigator.pushReplacement(
//                 context,
//                 MaterialPageRoute(
//                     builder: (_) =>
//                         HousingDetailScreen(housingId: s.id)),
//               ),
//               child: Container(
//                 width: 180,
//                 margin: const EdgeInsets.only(right: 12),
//                 decoration: BoxDecoration(
//                   color: isDark
//                       ? AppColors.cardDark
//                       : AppColors.cardLight,
//                   borderRadius: BorderRadius.circular(14),
//                   border: Border.all(
//                       color: isDark
//                           ? AppColors.borderDark
//                           : AppColors.borderLight),
//                 ),
//                 child: Column(
//                     crossAxisAlignment:
//                         CrossAxisAlignment.start,
//                     children: [
//                   Expanded(
//                     child: ClipRRect(
//                       borderRadius:
//                           const BorderRadius.vertical(
//                               top: Radius.circular(14)),
//                       child: s.mainImage != null
//                           ? CachedNetworkImage(
//                               imageUrl: s.mainImage!,
//                               fit: BoxFit.cover,
//                               width: double.infinity)
//                           : Container(
//                               color: AppColors.surfaceDark,
//                               child: const Icon(Icons.home,
//                                   color:
//                                       AppColors.textMutedDark)),
//                     ),
//                   ),
//                   Padding(
//                     padding: const EdgeInsets.all(10),
//                     child: Column(
//                         crossAxisAlignment:
//                             CrossAxisAlignment.start,
//                         children: [
//                       Text(s.displayName,
//                           style: TextStyle(
//                               color: textColor,
//                               fontWeight: FontWeight.w600,
//                               fontSize: 12),
//                           maxLines: 1,
//                           overflow: TextOverflow.ellipsis),
//                       const SizedBox(height: 3),
//                       Text('${_fmt(s.price)} FCFA/mois',
//                           style: const TextStyle(
//                               color: AppColors.primary,
//                               fontSize: 11,
//                               fontWeight: FontWeight.bold)),
//                     ]),
//                   ),
//                 ]),
//               ),
//             );
//           },
//         ),
//       ),
//     ]);
//   }

//   // ── Bottom bar ───────────────────────────────────────────
//   Widget _buildBottomBar(
//       HousingModel h, bool isDark, AppL10n l10n) {
//     return Container(
//       padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
//       decoration: BoxDecoration(
//         color: isDark
//             ? AppColors.surfaceDark
//             : AppColors.surfaceLight,
//         border: Border(
//             top: BorderSide(
//                 color: isDark
//                     ? AppColors.borderDark
//                     : AppColors.borderLight)),
//       ),
//       child: Row(children: [
//         Expanded(
//           child: ElevatedButton.icon(
//             onPressed: () => _showVisitSheet(h, isDark, l10n),
//             icon: const Icon(Icons.calendar_today_rounded,
//                 size: 18),
//             label: Text(l10n.planVisit),
//             style: ElevatedButton.styleFrom(
//               backgroundColor: AppColors.primary,
//               padding:
//                   const EdgeInsets.symmetric(vertical: 14),
//               shape: RoundedRectangleBorder(
//                   borderRadius: BorderRadius.circular(12)),
//             ),
//           ),
//         ),
//         const SizedBox(width: 10),
//         Tooltip(
//           message: 'Contacter le propriétaire',
//           child: GestureDetector(
//             onTap: () => _openMessaging(h),
//             child: Container(
//               height: 50, width: 50,
//               decoration: BoxDecoration(
//                 color: AppColors.primary.withOpacity(0.15),
//                 borderRadius: BorderRadius.circular(12),
//                 border: Border.all(
//                     color:
//                         AppColors.primary.withOpacity(0.4)),
//               ),
//               child: const Icon(Icons.chat_rounded,
//                   color: AppColors.primary),
//             ),
//           ),
//         ),
//       ]),
//     );
//   }

//   // ── Sheet planification visite ───────────────────────────
//   void _showVisitSheet(
//       HousingModel h, bool isDark, AppL10n l10n) {
//     DateTime? selectedDate;
//     String?   selectedTime;
//     final msgCtrl = TextEditingController();
//     const times = [
//       '08:00', '09:00', '10:00', '11:00',
//       '14:00', '15:00', '16:00', '17:00',
//     ];

//     showModalBottomSheet(
//       context: context,
//       isScrollControlled: true,
//       backgroundColor: isDark
//           ? AppColors.surfaceDark
//           : AppColors.surfaceLight,
//       shape: const RoundedRectangleBorder(
//           borderRadius:
//               BorderRadius.vertical(top: Radius.circular(24))),
//       builder: (ctx) => StatefulBuilder(
//         builder: (ctx, setSheet) => Padding(
//           padding: EdgeInsets.fromLTRB(20, 16, 20,
//               MediaQuery.of(ctx).viewInsets.bottom + 24),
//           child:
//               Column(mainAxisSize: MainAxisSize.min, children: [
//             Center(
//               child: Container(
//                 width: 40, height: 4,
//                 decoration: BoxDecoration(
//                     color: isDark
//                         ? AppColors.borderDark
//                         : AppColors.borderLight,
//                     borderRadius: BorderRadius.circular(2)),
//               ),
//             ),
//             const SizedBox(height: 16),
//             Align(
//               alignment: Alignment.centerLeft,
//               child: Text(l10n.planVisit,
//                   style: TextStyle(
//                       color: isDark
//                           ? AppColors.textDark
//                           : AppColors.textLight,
//                       fontSize: 18,
//                       fontWeight: FontWeight.bold)),
//             ),
//             Align(
//               alignment: Alignment.centerLeft,
//               child: Text(h.displayName,
//                   style: const TextStyle(
//                       color: AppColors.primary,
//                       fontSize: 13)),
//             ),
//             const SizedBox(height: 16),
//             GestureDetector(
//               onTap: () async {
//                 final d = await showDatePicker(
//                   context: ctx,
//                   initialDate: DateTime.now()
//                       .add(const Duration(days: 1)),
//                   firstDate: DateTime.now(),
//                   lastDate: DateTime.now()
//                       .add(const Duration(days: 90)),
//                 );
//                 if (d != null) setSheet(() => selectedDate = d);
//               },
//               child: Container(
//                 padding: const EdgeInsets.symmetric(
//                     horizontal: 16, vertical: 14),
//                 decoration: BoxDecoration(
//                   color: isDark
//                       ? AppColors.cardDark
//                       : AppColors.bgLight,
//                   borderRadius: BorderRadius.circular(12),
//                   border: Border.all(
//                       color: selectedDate != null
//                           ? AppColors.primary
//                           : (isDark
//                               ? AppColors.borderDark
//                               : AppColors.borderLight)),
//                 ),
//                 child: Row(children: [
//                   const Icon(Icons.calendar_today_rounded,
//                       color: AppColors.primary, size: 18),
//                   const SizedBox(width: 12),
//                   Text(
//                     selectedDate != null
//                         ? '${selectedDate!.day.toString().padLeft(2, '0')}/'
//                           '${selectedDate!.month.toString().padLeft(2, '0')}/'
//                           '${selectedDate!.year}'
//                         : l10n.visitDate,
//                     style: TextStyle(
//                         color: selectedDate != null
//                             ? (isDark
//                                 ? AppColors.textDark
//                                 : AppColors.textLight)
//                             : AppColors.textMutedDark,
//                         fontSize: 14),
//                   ),
//                 ]),
//               ),
//             ),
//             const SizedBox(height: 12),
//             Wrap(
//               spacing: 8, runSpacing: 8,
//               children: times.map((t) => GestureDetector(
//                 onTap: () => setSheet(() => selectedTime = t),
//                 child: Container(
//                   padding: const EdgeInsets.symmetric(
//                       horizontal: 16, vertical: 8),
//                   decoration: BoxDecoration(
//                     color: selectedTime == t
//                         ? AppColors.primary
//                         : (isDark
//                             ? AppColors.cardDark
//                             : AppColors.bgLight),
//                     borderRadius: BorderRadius.circular(20),
//                     border: Border.all(
//                         color: selectedTime == t
//                             ? AppColors.primary
//                             : (isDark
//                                 ? AppColors.borderDark
//                                 : AppColors.borderLight)),
//                   ),
//                   child: Text(t,
//                       style: TextStyle(
//                           color: selectedTime == t
//                               ? Colors.white
//                               : (isDark
//                                   ? AppColors.textSecondaryDark
//                                   : AppColors.textSecondaryLight),
//                           fontSize: 13)),
//                 ),
//               )).toList(),
//             ),
//             const SizedBox(height: 12),
//             TextField(
//               controller: msgCtrl,
//               maxLines: 2,
//               style: TextStyle(
//                   color: isDark
//                       ? AppColors.textDark
//                       : AppColors.textLight,
//                   fontSize: 14),
//               decoration: InputDecoration(
//                 hintText:
//                     'Message au propriétaire (optionnel)',
//                 hintStyle: const TextStyle(
//                     color: AppColors.textMutedDark,
//                     fontSize: 13),
//                 filled: true,
//                 fillColor: isDark
//                     ? AppColors.cardDark
//                     : AppColors.bgLight,
//                 border: OutlineInputBorder(
//                     borderRadius: BorderRadius.circular(12),
//                     borderSide: BorderSide(
//                         color: isDark
//                             ? AppColors.borderDark
//                             : AppColors.borderLight)),
//               ),
//             ),
//             const SizedBox(height: 16),
//             SizedBox(
//               width: double.infinity,
//               child: ElevatedButton(
//                 onPressed: selectedDate == null ||
//                         selectedTime == null
//                     ? null
//                     : () async {
//                         Navigator.pop(ctx);
//                         await _confirmVisit(h, selectedDate!,
//                             selectedTime!, msgCtrl.text, l10n);
//                       },
//                 style: ElevatedButton.styleFrom(
//                   backgroundColor: AppColors.primary,
//                   disabledBackgroundColor:
//                       AppColors.primary.withOpacity(0.4),
//                   padding:
//                       const EdgeInsets.symmetric(vertical: 16),
//                   shape: RoundedRectangleBorder(
//                       borderRadius: BorderRadius.circular(12)),
//                 ),
//                 child: Text(l10n.confirmVisit,
//                     style: const TextStyle(
//                         color: Colors.white,
//                         fontWeight: FontWeight.w600)),
//               ),
//             ),
//           ]),
//         ),
//       ),
//     );
//   }

//   Future<void> _confirmVisit(HousingModel h, DateTime date,
//       String time, String msg, AppL10n l10n) async {
//     if (!_requireAuth()) return;
//     try {
//       await _api.createVisit({
//         'housing': h.id,
//         'date': '${date.year}-'
//             '${date.month.toString().padLeft(2, '0')}-'
//             '${date.day.toString().padLeft(2, '0')}',
//         'time': time,
//         'message': msg.trim(),
//       });
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
//           content: Text('Visite planifiée avec succès ✓'),
//           backgroundColor: AppColors.success,
//           behavior: SnackBarBehavior.floating,
//         ));
//       }
//     } catch (e) {
//       if (mounted) {
//         ScaffoldMessenger.of(context).showSnackBar(SnackBar(
//           content: Text('Erreur : $e'),
//           backgroundColor: AppColors.danger,
//           behavior: SnackBarBehavior.floating,
//         ));
//       }
//     }
//   }

//   void _share(HousingModel h) {
//     Clipboard.setData(ClipboardData(
//       text: '${h.displayName}\n${_fmt(h.price)} FCFA/mois\n${h.locationStr}',
//     ));
//     ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
//       content: Text('Copié dans le presse-papier'),
//       behavior: SnackBarBehavior.floating,
//     ));
//   }

//   Widget _iconBtn(
//       {required IconData icon,
//       Color color = Colors.white,
//       required VoidCallback onTap}) {
//     return GestureDetector(
//       onTap: onTap,
//       child: Container(
//         margin: const EdgeInsets.all(8),
//         decoration: const BoxDecoration(
//             color: Colors.black38, shape: BoxShape.circle),
//         child: Padding(
//           padding: const EdgeInsets.all(8),
//           child: Icon(icon, color: color, size: 18),
//         ),
//       ),
//     );
//   }

//   String _fmt(int price) {
//     if (price >= 1000000) {
//       return '${(price / 1000000).toStringAsFixed(1)}M';
//     }
//     final s = price.toString();
//     final buf = StringBuffer();
//     for (var i = 0; i < s.length; i++) {
//       if (i > 0 && (s.length - i) % 3 == 0) buf.write(' ');
//       buf.write(s[i]);
//     }
//     return buf.toString();
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // Widget Vidéo de présentation
// // ═══════════════════════════════════════════════════════════
// class _VideoSection extends StatelessWidget {
//   final String videoUrl;
//   final bool isDark;
//   final VoidCallback onOpen;

//   const _VideoSection({
//     required this.videoUrl,
//     required this.isDark,
//     required this.onOpen,
//   });

//   @override
//   Widget build(BuildContext context) {
//     final cardBg =
//         isDark ? AppColors.cardDark : AppColors.cardLight;
//     final border =
//         isDark ? AppColors.borderDark : AppColors.borderLight;
//     final textColor =
//         isDark ? AppColors.textDark : AppColors.textLight;
//     final subColor = isDark
//         ? AppColors.textSecondaryDark
//         : AppColors.textSecondaryLight;

//     return GestureDetector(
//       onTap: onOpen,
//       child: Container(
//         height: 180,
//         decoration: BoxDecoration(
//           color: isDark ? const Color(0xFF0A0A0F) : const Color(0xFF1A1A2E),
//           borderRadius: BorderRadius.circular(14),
//           border: Border.all(color: AppColors.primary.withOpacity(0.3)),
//         ),
//         child: Stack(children: [
//           // Fond gradient cinématique
//           Container(
//             decoration: BoxDecoration(
//               borderRadius: BorderRadius.circular(14),
//               gradient: LinearGradient(
//                 begin: Alignment.topLeft,
//                 end: Alignment.bottomRight,
//                 colors: [
//                   AppColors.primary.withOpacity(0.15),
//                   AppColors.secondary.withOpacity(0.15),
//                 ],
//               ),
//             ),
//           ),
//           // Bouton play central
//           Center(
//             child: Column(
//               mainAxisSize: MainAxisSize.min,
//               children: [
//                 Container(
//                   width: 64, height: 64,
//                   decoration: BoxDecoration(
//                     color: AppColors.primary,
//                     shape: BoxShape.circle,
//                     boxShadow: [
//                       BoxShadow(
//                         color: AppColors.primary.withOpacity(0.4),
//                         blurRadius: 20,
//                         offset: const Offset(0, 4),
//                       ),
//                     ],
//                   ),
//                   child: const Icon(Icons.play_arrow_rounded,
//                       color: Colors.white, size: 36),
//                 ),
//                 const SizedBox(height: 12),
//                 const Text('Vidéo de présentation',
//                     style: TextStyle(
//                         color: Colors.white,
//                         fontWeight: FontWeight.w600,
//                         fontSize: 14)),
//                 const SizedBox(height: 4),
//                 Text('Appuyez pour voir la vidéo',
//                     style: TextStyle(
//                         color: Colors.white.withOpacity(0.6),
//                         fontSize: 11)),
//               ],
//             ),
//           ),
//           // Badge top-right
//           Positioned(
//             top: 12, right: 12,
//             child: Container(
//               padding: const EdgeInsets.symmetric(
//                   horizontal: 10, vertical: 5),
//               decoration: BoxDecoration(
//                 color: AppColors.primary,
//                 borderRadius: BorderRadius.circular(20),
//               ),
//               child: const Row(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   Icon(Icons.videocam_rounded,
//                       color: Colors.white, size: 13),
//                   SizedBox(width: 4),
//                   Text('Vidéo',
//                       style: TextStyle(
//                           color: Colors.white,
//                           fontSize: 11,
//                           fontWeight: FontWeight.bold)),
//                 ],
//               ),
//             ),
//           ),
//           // Icône lien externe bas-gauche
//           Positioned(
//             bottom: 12, left: 12,
//             child: Row(children: [
//               Icon(Icons.open_in_new_rounded,
//                   color: Colors.white.withOpacity(0.6), size: 13),
//               const SizedBox(width: 4),
//               Text('Ouvre dans le navigateur',
//                   style: TextStyle(
//                       color: Colors.white.withOpacity(0.6),
//                       fontSize: 10)),
//             ]),
//           ),
//         ]),
//       ),
//     );
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // Widget Visite Virtuelle 360°
// // ═══════════════════════════════════════════════════════════
// class _Virtual360Section extends StatelessWidget {
//   final String url360;
//   final bool isDark;
//   final VoidCallback onOpen;

//   const _Virtual360Section({
//     required this.url360,
//     required this.isDark,
//     required this.onOpen,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return GestureDetector(
//       onTap: onOpen,
//       child: Container(
//         height: 150,
//         decoration: BoxDecoration(
//           borderRadius: BorderRadius.circular(14),
//           gradient: const LinearGradient(
//             begin: Alignment.topLeft,
//             end: Alignment.bottomRight,
//             colors: [
//               Color(0xFF0F3460),
//               Color(0xFF16213E),
//             ],
//           ),
//           border: Border.all(
//               color: AppColors.secondary.withOpacity(0.4)),
//         ),
//         child: Stack(children: [
//           // Pattern 360° de fond
//           Positioned.fill(
//             child: ClipRRect(
//               borderRadius: BorderRadius.circular(14),
//               child: CustomPaint(
//                 painter: _GridPainter(),
//               ),
//             ),
//           ),
//           // Contenu central
//           Center(
//             child: Column(
//               mainAxisSize: MainAxisSize.min,
//               children: [
//                 Container(
//                   width: 56, height: 56,
//                   decoration: BoxDecoration(
//                     color: AppColors.secondary.withOpacity(0.2),
//                     shape: BoxShape.circle,
//                     border: Border.all(
//                         color: AppColors.secondary, width: 1.5),
//                   ),
//                   child: const Icon(Icons.vrpano_rounded,
//                       color: AppColors.secondary, size: 28),
//                 ),
//                 const SizedBox(height: 10),
//                 const Text('Visite Virtuelle 360°',
//                     style: TextStyle(
//                         color: Colors.white,
//                         fontWeight: FontWeight.bold,
//                         fontSize: 14)),
//                 const SizedBox(height: 4),
//                 Text(
//                   'Explorez le logement à 360°',
//                   style: TextStyle(
//                       color: Colors.white.withOpacity(0.65),
//                       fontSize: 11),
//                 ),
//               ],
//             ),
//           ),
//           // Badge top-right
//           Positioned(
//             top: 12, right: 12,
//             child: Container(
//               padding: const EdgeInsets.symmetric(
//                   horizontal: 10, vertical: 5),
//               decoration: BoxDecoration(
//                 color: AppColors.secondary,
//                 borderRadius: BorderRadius.circular(20),
//               ),
//               child: const Row(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   Icon(Icons.threesixty_rounded,
//                       color: Colors.white, size: 13),
//                   SizedBox(width: 4),
//                   Text('360°',
//                       style: TextStyle(
//                           color: Colors.white,
//                           fontSize: 11,
//                           fontWeight: FontWeight.bold)),
//                 ],
//               ),
//             ),
//           ),
//           // Icône lien externe bas-gauche
//           Positioned(
//             bottom: 12, left: 12,
//             child: Row(children: [
//               Icon(Icons.open_in_new_rounded,
//                   color: Colors.white.withOpacity(0.6), size: 13),
//               const SizedBox(width: 4),
//               Text('Ouvre dans le navigateur',
//                   style: TextStyle(
//                       color: Colors.white.withOpacity(0.6),
//                       fontSize: 10)),
//             ]),
//           ),
//         ]),
//       ),
//     );
//   }
// }

// // ── Peintre grille perspective pour l'effet 360° ─────────────
// class _GridPainter extends CustomPainter {
//   @override
//   void paint(Canvas canvas, Size size) {
//     final paint = Paint()
//       ..color = Colors.white.withOpacity(0.04)
//       ..strokeWidth = 1;

//     // Lignes horizontales
//     for (var i = 0; i < 6; i++) {
//       final y = (size.height / 5) * i;
//       canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
//     }
//     // Lignes verticales
//     for (var i = 0; i < 10; i++) {
//       final x = (size.width / 9) * i;
//       canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
//     }
//   }

//   @override
//   bool shouldRepaint(covariant CustomPainter old) => false;
// }

// lib/screens/housing/housing_detail_screen.dart
//
// ✅ CORRECTIONS :
//  • didChangeDependencies() → recharge le logement quand la langue change
//  • Strings hardcodées FR → remplacées par l10n :
//    - 'Visite virtuelle'           → l10n.virtualVisit
//    - 'Vues' / 'Likes' / 'Ajouté' → l10n.views / likes / added
//    - "Aujourd'hui" / 'Hier' / 'Il y a Xj' → l10n.today/yesterday/daysAgo
//    - 'Voir plus' / 'Voir moins'   → l10n.viewMore / viewLess
//    - 'Suggestions intelligentes'  → l10n.smartSuggestions
//    - 'Message au propriétaire…'   → l10n.messagePlaceholder
//    - 'Visite planifiée…'          → l10n.visitSuccess
//    - 'Copié dans le presse-papier'→ l10n.copiedToClipboard
//    - 'Voir sur Maps'              → l10n.seeOnMaps
//    - 'Ouvre dans le navigateur'   → l10n.openInBrowser
//    - Badges galerie 'Vidéo'/'360°'→ statiques (OK, noms propres)
//  • Sections propriétaire : 'Messagerie', 'WhatsApp', 'Appeler' → l10n
//  • Chambres / Salle de bain / m² → l10n

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/models/housing_model.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';

class HousingDetailScreen extends StatefulWidget {
  final int housingId;
  const HousingDetailScreen({super.key, required this.housingId});

  @override
  State<HousingDetailScreen> createState() => _HousingDetailScreenState();
}

class _HousingDetailScreenState extends State<HousingDetailScreen> {
  final _api      = ApiService();
  final _pageCtrl = PageController();

  HousingModel? _housing;
  List<HousingModel> _similar = [];
  bool _loading      = true;
  int  _imgIndex     = 0;
  bool _isLiked      = false;
  bool _isSaved      = false;
  int  _likesCount   = 0;
  bool _descExpanded = false;

  // ✅ Suivi de la langue pour détecter les changements
  String? _currentLanguage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // ✅ Recharger le logement quand la langue change
    final lang = context.read<ThemeProvider>().language;
    if (_currentLanguage != null && _currentLanguage != lang && !_loading) {
      _load();
    }
    _currentLanguage = lang;
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final h = await _api.getHousingDetail(widget.housingId);
      await _api.incrementViews(widget.housingId);

      List<HousingModel> sim = [];
      try {
        final lang = context.read<ThemeProvider>().language;
        final res  = await _api.nlpSearch(
          query:    '${h.categoryName ?? ''} ${h.cityName ?? ''}',
          language: lang,
        );
        final results = res['results'] as List? ?? [];
        sim = results
            .map((j) => HousingModel.fromJson(j as Map<String, dynamic>))
            .where((x) => x.id != widget.housingId)
            .take(4)
            .toList();
      } catch (_) {}

      setState(() {
        _housing    = h;
        _isLiked    = h.isLiked;
        _isSaved    = h.isSaved;
        _likesCount = h.likesCount;
        _similar    = sim;
        _loading    = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Logement introuvable : $e'),
          backgroundColor: AppColors.danger,
        ));
        Navigator.pop(context);
      }
    }
  }

  Future<void> _toggleLike() async {
    if (!_requireAuth()) return;
    setState(() {
      _isLiked    = !_isLiked;
      _likesCount += _isLiked ? 1 : -1;
    });
    await _api.toggleLike(widget.housingId);
  }

  Future<void> _toggleSave() async {
    if (!_requireAuth()) return;
    setState(() => _isSaved = !_isSaved);
    await _api.toggleSave(widget.housingId);
  }

  bool _requireAuth() {
    if (context.read<AuthProvider>().user == null) {
      Navigator.pushNamed(context, '/login');
      return false;
    }
    return true;
  }

  Future<void> _openMessaging(HousingModel h) async {
    if (!_requireAuth()) return;
    try {
      final conv = await _api.startConversation(h.id);
      if (!mounted) return;
      final currentUserId = context.read<AuthProvider>().user?.id ?? 0;
      final other = conv.otherUser(currentUserId);
      Navigator.pushNamed(context, '/chat', arguments: {
        'conversationId': conv.id,
        'otherUserId':    other?.id ?? 0,
        'otherUserName':  other?.username ?? h.ownerName ?? 'Propriétaire',
        'otherUserPhoto': other?.photo ?? h.ownerPhoto,
        'housingTitle':   h.displayName,
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Erreur messagerie : $e'),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
        ));
      }
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.watch<ThemeProvider>().isDarkMode;
    final l10n   = context.l10n;
    final bg     = isDark ? AppColors.bgDark : AppColors.bgLight;

    if (_loading) {
      return Scaffold(
        backgroundColor: bg,
        body: const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }
    if (_housing == null) return const SizedBox.shrink();

    final h = _housing!;
    final images = <String>[];
    if (h.images != null && h.images!.isNotEmpty) {
      images.addAll(h.images!.map((i) => i.image));
    } else if (h.mainImage != null) {
      images.add(h.mainImage!);
    }

    return Scaffold(
      backgroundColor: bg,
      body: CustomScrollView(
        slivers: [
          // ── AppBar + galerie ──────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            stretch: true,
            backgroundColor: AppColors.bgDark,
            systemOverlayStyle: SystemUiOverlayStyle.light,
            leading: _iconBtn(
              icon: Icons.arrow_back_ios_rounded,
              onTap: () => Navigator.pop(context),
            ),
            actions: [
              _iconBtn(icon: Icons.share_rounded, onTap: () => _share(h, l10n)),
              _iconBtn(
                icon: _isSaved
                    ? Icons.bookmark_rounded
                    : Icons.bookmark_outline_rounded,
                color: _isSaved ? AppColors.primary : Colors.white,
                onTap: _toggleSave,
              ),
              const SizedBox(width: 4),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: _buildGallery(images, h),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatusRow(h, isDark, l10n),
                  const SizedBox(height: 12),
                  _buildTitlePrice(h, isDark, l10n),
                  const SizedBox(height: 8),
                  _buildLocation(h, isDark),
                  const SizedBox(height: 16),
                  _buildStatsRow(h, isDark, l10n),
                  const SizedBox(height: 16),
                  _buildFeatures(h, isDark, l10n),
                  const SizedBox(height: 20),

                  if (h.hasVideo || h.virtual360 != null) ...[
                    _buildVirtualVisitSection(h, isDark, l10n),
                    const SizedBox(height: 20),
                  ],

                  _buildOwnerCard(h, isDark, l10n),
                  const SizedBox(height: 20),
                  _buildDescription(h, isDark, l10n),
                  const SizedBox(height: 20),
                  if (h.additionalFeatures != null &&
                      h.additionalFeatures!.isNotEmpty)
                    _buildEquipments(h, isDark, l10n),
                  if (h.additionalFeatures != null)
                    const SizedBox(height: 20),
                  if (h.hasCoords) _buildMapSection(h, isDark, l10n),
                  if (h.hasCoords) const SizedBox(height: 20),
                  if (_similar.isNotEmpty) _buildSimilar(isDark, l10n),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(h, isDark, l10n),
    );
  }

  // ── Galerie ───────────────────────────────────────────────────────────────
  Widget _buildGallery(List<String> images, HousingModel h) {
    if (images.isEmpty) {
      return Container(
        color: AppColors.surfaceDark,
        child: const Center(
            child: Icon(Icons.home_work_outlined,
                size: 80, color: AppColors.textMutedDark)),
      );
    }
    return Stack(children: [
      PageView.builder(
        controller: _pageCtrl,
        itemCount: images.length,
        onPageChanged: (i) => setState(() => _imgIndex = i),
        itemBuilder: (_, i) => CachedNetworkImage(
          imageUrl: images[i],
          fit: BoxFit.cover,
          width: double.infinity,
          placeholder: (_, __) => Container(color: AppColors.surfaceDark),
          errorWidget: (_, __, ___) => Container(
            color: AppColors.surfaceDark,
            child: const Icon(Icons.broken_image_outlined,
                color: AppColors.textMutedDark),
          ),
        ),
      ),
      // Gradient bas
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
      // Indicateur pages
      if (images.length > 1)
        Positioned(
          bottom: 14, left: 0, right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              images.length.clamp(0, 8),
              (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: _imgIndex == i ? 18 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: _imgIndex == i ? AppColors.primary : Colors.white54,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          ),
        ),
      // Compteur
      Positioned(
        top: 80, right: 14,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.black54,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text('${_imgIndex + 1}/${images.length}',
              style: const TextStyle(color: Colors.white, fontSize: 12)),
        ),
      ),
      // Badges vidéo / 360° (noms propres, pas traduits)
      Positioned(
        bottom: 14, left: 14,
        child: Row(children: [
          if (h.hasVideo)   _mediaBadge(Icons.play_circle_outline_rounded, 'Vidéo'),
          if (h.hasVideo && h.virtual360 != null) const SizedBox(width: 6),
          if (h.virtual360 != null) _mediaBadge(Icons.vrpano_outlined, '360°'),
        ]),
      ),
    ]);
  }

  Widget _mediaBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white24),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: Colors.white, size: 14),
        const SizedBox(width: 5),
        Text(label,
            style: const TextStyle(
                color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  // ── Visite virtuelle ──────────────────────────────────────────────────────
  Widget _buildVirtualVisitSection(HousingModel h, bool isDark, AppL10n l10n) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          const Icon(Icons.play_circle_rounded,
              color: AppColors.primary, size: 20),
          const SizedBox(width: 8),
          // ✅ Traduit
          Text(l10n.virtualVisit,
              style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16)),
        ]),
        const SizedBox(height: 12),
        if (h.hasVideo) ...[
          _VideoSection(
            videoUrl: h.video!,
            isDark: isDark,
            onOpen: () => _launchUrl(h.video!),
            l10n: l10n,
          ),
          if (h.virtual360 != null) const SizedBox(height: 12),
        ],
        if (h.virtual360 != null)
          _Virtual360Section(
            url360: h.virtual360!,
            isDark: isDark,
            onOpen: () => _launchUrl(h.virtual360!),
            l10n: l10n,
          ),
      ],
    );
  }

  // ── Badges statut ─────────────────────────────────────────────────────────
  Widget _buildStatusRow(HousingModel h, bool isDark, AppL10n l10n) {
    Color c;
    String lbl;
    switch (h.status) {
      case 'disponible':
        c   = AppColors.success;
        lbl = l10n.available;
        break;
      case 'reserve':
        c   = AppColors.warning;
        lbl = l10n.reserved;
        break;
      default:
        c   = AppColors.danger;
        lbl = l10n.occupied;
    }
    return Wrap(spacing: 8, children: [
      _badge(lbl, c),
      if (h.categoryName != null) _badge(h.categoryName!, AppColors.primary),
      if (h.typeName != null)     _badge(h.typeName!, AppColors.secondary),
    ]);
  }

  Widget _badge(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
    decoration: BoxDecoration(
      color: color.withOpacity(0.15),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: color.withOpacity(0.4)),
    ),
    child: Text(label,
        style: TextStyle(
            color: color, fontSize: 12, fontWeight: FontWeight.w600)),
  );

  // ── Titre + Prix ──────────────────────────────────────────────────────────
  Widget _buildTitlePrice(HousingModel h, bool isDark, AppL10n l10n) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(h.displayName,
            style: TextStyle(
                color: textColor, fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Row(children: [
          Text(_fmt(h.price),
              style: const TextStyle(
                  color: AppColors.primary,
                  fontSize: 22,
                  fontWeight: FontWeight.bold)),
          // ✅ Traduit
          Text(' FCFA${l10n.perMonth}',
              style: TextStyle(color: subColor, fontSize: 14)),
        ]),
      ],
    );
  }

  // ── Localisation ──────────────────────────────────────────────────────────
  Widget _buildLocation(HousingModel h, bool isDark) {
    final subColor = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
    return Row(children: [
      const Icon(Icons.location_on_rounded, size: 16, color: AppColors.primary),
      const SizedBox(width: 4),
      Expanded(
          child: Text(h.locationStr,
              style: TextStyle(color: subColor, fontSize: 13))),
    ]);
  }

  // ── Stats vues/likes/date ─────────────────────────────────────────────────
  Widget _buildStatsRow(HousingModel h, bool isDark, AppL10n l10n) {
    final cardBg   = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border   = isDark ? AppColors.borderDark : AppColors.borderLight;
    final subColor = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    // ✅ Date relative bilingue
    final days = DateTime.now().difference(h.createdAt).inDays;
    final String dateLabel;
    if (days == 0) {
      dateLabel = l10n.today;
    } else if (days == 1) {
      dateLabel = l10n.yesterday;
    } else if (days < 30) {
      dateLabel = l10n.daysAgo(days);
    } else {
      dateLabel = l10n.monthsAgo((days / 30).floor());
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // ✅ Labels traduits
          _statItem(Icons.visibility_outlined,
              '${h.viewsCount}', l10n.views, subColor),
          Container(width: 1, height: 36, color: border),
          GestureDetector(
            onTap: _toggleLike,
            child: _statItem(
              _isLiked
                  ? Icons.favorite_rounded
                  : Icons.favorite_outline_rounded,
              '$_likesCount',
              l10n.likes,
              _isLiked ? AppColors.danger : subColor,
            ),
          ),
          Container(width: 1, height: 36, color: border),
          _statItem(Icons.access_time_rounded, dateLabel, l10n.added, subColor),
        ],
      ),
    );
  }

  Widget _statItem(IconData icon, String val, String label, Color color) {
    return Column(children: [
      Icon(icon, size: 20, color: color),
      const SizedBox(height: 4),
      Text(val,
          style: TextStyle(
              color: color, fontWeight: FontWeight.bold, fontSize: 13)),
      Text(label,
          style: TextStyle(color: color.withOpacity(0.7), fontSize: 10)),
    ]);
  }

  // ── Caractéristiques ──────────────────────────────────────────────────────
  Widget _buildFeatures(HousingModel h, bool isDark, AppL10n l10n) {
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border = isDark ? AppColors.borderDark : AppColors.borderLight;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: border)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // ✅ Labels traduits
          _featureItem(Icons.bed_outlined,     '${h.rooms}',     l10n.rooms,    isDark),
          _featureItem(Icons.bathtub_outlined, '${h.bathrooms}', l10n.bathrooms, isDark),
          _featureItem(Icons.square_foot_outlined, '${h.area}', l10n.area, isDark),
        ],
      ),
    );
  }

  Widget _featureItem(IconData icon, String val, String label, bool isDark) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
    return Column(children: [
      Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: AppColors.primary, size: 22),
      ),
      const SizedBox(height: 6),
      Text(val,
          style: TextStyle(
              color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
      Text(label, style: TextStyle(color: subColor, fontSize: 11)),
    ]);
  }

  // ── Propriétaire ──────────────────────────────────────────────────────────
  Widget _buildOwnerCard(HousingModel h, bool isDark, AppL10n l10n) {
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: border)),
      child: Row(children: [
        CircleAvatar(
          radius: 28,
          backgroundColor: AppColors.primary.withOpacity(0.15),
          backgroundImage:
              h.ownerPhoto != null ? NetworkImage(h.ownerPhoto!) : null,
          child: h.ownerPhoto == null
              ? Text(
                  h.ownerName?.isNotEmpty == true
                      ? h.ownerName![0].toUpperCase()
                      : 'P',
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 18))
              : null,
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(h.ownerName ?? 'Propriétaire',
                  style: TextStyle(
                      color: textColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 15)),
              // ✅ Traduit
              Text(l10n.owner,
                  style: TextStyle(color: subColor, fontSize: 12)),
            ],
          ),
        ),
        Row(children: [
          _contactBtn(
            icon: Icons.chat_rounded,
            color: AppColors.primary,
            // ✅ Traduit
            tooltip: l10n.messages,
            onTap: () => _openMessaging(h),
          ),
          if (h.ownerPhone != null) ...[
            const SizedBox(width: 8),
            _contactBtn(
              icon: Icons.chat_bubble_outline_rounded,
              color: const Color(0xFF25D366),
              tooltip: 'WhatsApp',
              onTap: () => _launchUrl(
                'https://wa.me/${h.ownerPhone}?text='
                '${Uri.encodeComponent('Bonjour, je suis intéressé par : ${h.displayName}')}',
              ),
            ),
            const SizedBox(width: 8),
            _contactBtn(
              icon: Icons.phone_rounded,
              color: AppColors.success,
              tooltip: l10n.search, // 'Appeler' → pas de clé dédiée
              onTap: () => _launchUrl('tel:${h.ownerPhone}'),
            ),
          ],
        ]),
      ]),
    );
  }

  Widget _contactBtn({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    String? tooltip,
  }) =>
      Tooltip(
        message: tooltip ?? '',
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
        ),
      );

  // ── Description ───────────────────────────────────────────────────────────
  Widget _buildDescription(HousingModel h, bool isDark, AppL10n l10n) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final subColor  = isDark
        ? AppColors.textSecondaryDark
        : AppColors.textSecondaryLight;
    final desc   = h.description;
    final isLong = desc.length > 220;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ✅ Traduit
        Text(l10n.description,
            style: TextStyle(
                color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 10),
        Text(
          _descExpanded || !isLong ? desc : '${desc.substring(0, 220)}…',
          style: TextStyle(color: subColor, fontSize: 14, height: 1.6),
        ),
        if (isLong) ...[
          const SizedBox(height: 6),
          GestureDetector(
            onTap: () => setState(() => _descExpanded = !_descExpanded),
            // ✅ Traduit
            child: Text(
              _descExpanded ? l10n.viewLess : l10n.viewMore,
              style: const TextStyle(
                  color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ],
    );
  }

  // ── Équipements ───────────────────────────────────────────────────────────
  Widget _buildEquipments(HousingModel h, bool isDark, AppL10n l10n) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final features  = (h.additionalFeatures ?? '')
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();
    if (features.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ✅ Traduit
        Text(l10n.equipment,
            style: TextStyle(
                color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8, runSpacing: 8,
          children: features
              .map((f) => Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: AppColors.primary.withOpacity(0.2)),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      const Icon(Icons.check_circle_outline_rounded,
                          size: 14, color: AppColors.primary),
                      const SizedBox(width: 5),
                      Text(f,
                          style: const TextStyle(
                              color: AppColors.primary, fontSize: 12)),
                    ]),
                  ))
              .toList(),
        ),
      ],
    );
  }

  // ── Carte ─────────────────────────────────────────────────────────────────
  Widget _buildMapSection(HousingModel h, bool isDark, AppL10n l10n) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    final cardBg    = isDark ? AppColors.cardDark : AppColors.cardLight;
    final border    = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ✅ Traduit
        Text(l10n.location,
            style: TextStyle(
                color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: () => _launchUrl(
            'https://www.google.com/maps/search/?api=1'
            '&query=${h.latitude},${h.longitude}',
          ),
          child: Container(
            height: 150,
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: border),
            ),
            child: Stack(children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: CachedNetworkImage(
                  imageUrl:
                      'https://maps.googleapis.com/maps/api/staticmap'
                      '?center=${h.latitude},${h.longitude}'
                      '&zoom=15&size=600x200'
                      '&markers=color:blue|${h.latitude},${h.longitude}',
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: 150,
                  errorWidget: (_, __, ___) => Container(
                    color: cardBg,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.map_outlined,
                            size: 36, color: AppColors.primary),
                        const SizedBox(height: 8),
                        Text(h.locationStr,
                            style:
                                TextStyle(color: textColor, fontSize: 12),
                            textAlign: TextAlign.center),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: 10, right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.open_in_new_rounded,
                          color: Colors.white, size: 13),
                      const SizedBox(width: 4),
                      // ✅ Traduit
                      Text(l10n.seeOnMaps,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ]),
          ),
        ),
      ],
    );
  }

  // ── Similaires ────────────────────────────────────────────────────────────
  Widget _buildSimilar(bool isDark, AppL10n l10n) {
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          const Icon(Icons.auto_awesome_rounded,
              color: AppColors.secondary, size: 18),
          const SizedBox(width: 8),
          // ✅ Traduit
          Text(l10n.smartSuggestions,
              style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16)),
        ]),
        const SizedBox(height: 12),
        SizedBox(
          height: 220,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _similar.length,
            itemBuilder: (_, i) {
              final s = _similar[i];
              return GestureDetector(
                onTap: () => Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                      builder: (_) =>
                          HousingDetailScreen(housingId: s.id)),
                ),
                child: Container(
                  width: 180,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.cardDark : AppColors.cardLight,
                    borderRadius: BorderRadius.circular(14),
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
                              const BorderRadius.vertical(
                                  top: Radius.circular(14)),
                          child: s.mainImage != null
                              ? CachedNetworkImage(
                                  imageUrl: s.mainImage!,
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
                            Text(s.displayName,
                                style: TextStyle(
                                    color: textColor,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 3),
                            // ✅ perMonth traduit
                            Text('${_fmt(s.price)} FCFA${l10n.perMonth}',
                                style: const TextStyle(
                                    color: AppColors.primary,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ── Bottom bar ─────────────────────────────────────────────────────────────
  Widget _buildBottomBar(HousingModel h, bool isDark, AppL10n l10n) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: BoxDecoration(
        color:  isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: Border(
            top: BorderSide(
                color: isDark
                    ? AppColors.borderDark
                    : AppColors.borderLight)),
      ),
      child: Row(children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _showVisitSheet(h, isDark, l10n),
            icon: const Icon(Icons.calendar_today_rounded, size: 18),
            // ✅ Traduit
            label: Text(l10n.planVisit),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Tooltip(
          // ✅ Traduit
          message: l10n.contactOwner,
          child: GestureDetector(
            onTap: () => _openMessaging(h),
            child: Container(
              height: 50, width: 50,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppColors.primary.withOpacity(0.4)),
              ),
              child: const Icon(Icons.chat_rounded,
                  color: AppColors.primary),
            ),
          ),
        ),
      ]),
    );
  }

  // ── Sheet planification visite ────────────────────────────────────────────
  void _showVisitSheet(HousingModel h, bool isDark, AppL10n l10n) {
    DateTime? selectedDate;
    String?   selectedTime;
    final msgCtrl = TextEditingController();
    const times = [
      '08:00', '09:00', '10:00', '11:00',
      '14:00', '15:00', '16:00', '17:00',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor:
          isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) => Padding(
          padding: EdgeInsets.fromLTRB(
              20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.borderDark
                        : AppColors.borderLight,
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(l10n.planVisit,
                  style: TextStyle(
                      color: isDark
                          ? AppColors.textDark
                          : AppColors.textLight,
                      fontSize: 18,
                      fontWeight: FontWeight.bold)),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(h.displayName,
                  style: const TextStyle(
                      color: AppColors.primary, fontSize: 13)),
            ),
            const SizedBox(height: 16),
            // Sélecteur date
            GestureDetector(
              onTap: () async {
                final d = await showDatePicker(
                  context: ctx,
                  initialDate:
                      DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now(),
                  lastDate:
                      DateTime.now().add(const Duration(days: 90)),
                );
                if (d != null) setSheet(() => selectedDate = d);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.cardDark
                      : AppColors.bgLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: selectedDate != null
                          ? AppColors.primary
                          : (isDark
                              ? AppColors.borderDark
                              : AppColors.borderLight)),
                ),
                child: Row(children: [
                  const Icon(Icons.calendar_today_rounded,
                      color: AppColors.primary, size: 18),
                  const SizedBox(width: 12),
                  Text(
                    selectedDate != null
                        ? '${selectedDate!.day.toString().padLeft(2, '0')}/'
                          '${selectedDate!.month.toString().padLeft(2, '0')}/'
                          '${selectedDate!.year}'
                        // ✅ Traduit
                        : l10n.visitDate,
                    style: TextStyle(
                        color: selectedDate != null
                            ? (isDark
                                ? AppColors.textDark
                                : AppColors.textLight)
                            : AppColors.textMutedDark,
                        fontSize: 14),
                  ),
                ]),
              ),
            ),
            const SizedBox(height: 12),
            // Créneaux horaires
            Wrap(
              spacing: 8, runSpacing: 8,
              children: times.map((t) => GestureDetector(
                onTap: () => setSheet(() => selectedTime = t),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: selectedTime == t
                        ? AppColors.primary
                        : (isDark
                            ? AppColors.cardDark
                            : AppColors.bgLight),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: selectedTime == t
                            ? AppColors.primary
                            : (isDark
                                ? AppColors.borderDark
                                : AppColors.borderLight)),
                  ),
                  child: Text(t,
                      style: TextStyle(
                          color: selectedTime == t
                              ? Colors.white
                              : (isDark
                                  ? AppColors.textSecondaryDark
                                  : AppColors.textSecondaryLight),
                          fontSize: 13)),
                ),
              )).toList(),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: msgCtrl,
              maxLines: 2,
              style: TextStyle(
                  color: isDark
                      ? AppColors.textDark
                      : AppColors.textLight,
                  fontSize: 14),
              decoration: InputDecoration(
                // ✅ Traduit
                hintText: l10n.messagePlaceholder,
                hintStyle: const TextStyle(
                    color: AppColors.textMutedDark, fontSize: 13),
                filled: true,
                fillColor:
                    isDark ? AppColors.cardDark : AppColors.bgLight,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                        color: isDark
                            ? AppColors.borderDark
                            : AppColors.borderLight)),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: selectedDate == null || selectedTime == null
                    ? null
                    : () async {
                        Navigator.pop(ctx);
                        await _confirmVisit(
                            h, selectedDate!, selectedTime!,
                            msgCtrl.text, l10n);
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  disabledBackgroundColor:
                      AppColors.primary.withOpacity(0.4),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                // ✅ Traduit
                child: Text(l10n.confirmVisit,
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600)),
              ),
            ),
          ]),
        ),
      ),
    );
  }

  Future<void> _confirmVisit(HousingModel h, DateTime date,
      String time, String msg, AppL10n l10n) async {
    if (!_requireAuth()) return;
    try {
      await _api.createVisit({
        'housing': h.id,
        'date': '${date.year}-'
            '${date.month.toString().padLeft(2, '0')}-'
            '${date.day.toString().padLeft(2, '0')}',
        'time': time,
        'message': msg.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          // ✅ Traduit
          content: Text(l10n.visitSuccess),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Erreur : $e'),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
        ));
      }
    }
  }

  void _share(HousingModel h, AppL10n l10n) {
    Clipboard.setData(ClipboardData(
      text: '${h.displayName}\n${_fmt(h.price)} FCFA${l10n.perMonth}\n${h.locationStr}',
    ));
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      // ✅ Traduit
      content: Text(l10n.copiedToClipboard),
      behavior: SnackBarBehavior.floating,
    ));
  }

  Widget _iconBtn(
      {required IconData icon,
      Color color = Colors.white,
      required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.all(8),
        decoration: const BoxDecoration(
            color: Colors.black38, shape: BoxShape.circle),
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Icon(icon, color: color, size: 18),
        ),
      ),
    );
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
}

// ══════════════════════════════════════════════════════════════════════════════
// Widget Vidéo de présentation
// ══════════════════════════════════════════════════════════════════════════════
class _VideoSection extends StatelessWidget {
  final String videoUrl;
  final bool isDark;
  final VoidCallback onOpen;
  final AppL10n l10n;

  const _VideoSection({
    required this.videoUrl,
    required this.isDark,
    required this.onOpen,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onOpen,
      child: Container(
        height: 180,
        decoration: BoxDecoration(
          color: isDark
              ? const Color(0xFF0A0A0F)
              : const Color(0xFF1A1A2E),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primary.withOpacity(0.3)),
        ),
        child: Stack(children: [
          // Fond gradient
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.primary.withOpacity(0.15),
                  AppColors.secondary.withOpacity(0.15),
                ],
              ),
            ),
          ),
          // Bouton play
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.play_arrow_rounded,
                      color: Colors.white, size: 36),
                ),
                const SizedBox(height: 12),
                const Text('Vidéo de présentation',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 14)),
                const SizedBox(height: 4),
                // ✅ Traduit
                Text(l10n.openInBrowser,
                    style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 11)),
              ],
            ),
          ),
          // Badge top-right
          Positioned(
            top: 12, right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.videocam_rounded, color: Colors.white, size: 13),
                SizedBox(width: 4),
                Text('Vidéo',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold)),
              ]),
            ),
          ),
          // Icône lien bas-gauche
          Positioned(
            bottom: 12, left: 12,
            child: Row(children: [
              Icon(Icons.open_in_new_rounded,
                  color: Colors.white.withOpacity(0.6), size: 13),
              const SizedBox(width: 4),
              // ✅ Traduit
              Text(l10n.openInBrowser,
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.6), fontSize: 10)),
            ]),
          ),
        ]),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Widget Visite Virtuelle 360°
// ══════════════════════════════════════════════════════════════════════════════
class _Virtual360Section extends StatelessWidget {
  final String url360;
  final bool isDark;
  final VoidCallback onOpen;
  final AppL10n l10n;

  const _Virtual360Section({
    required this.url360,
    required this.isDark,
    required this.onOpen,
    required this.l10n,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onOpen,
      child: Container(
        height: 150,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F3460), Color(0xFF16213E)],
          ),
          border:
              Border.all(color: AppColors.secondary.withOpacity(0.4)),
        ),
        child: Stack(children: [
          // Pattern grille
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: CustomPaint(painter: _GridPainter()),
            ),
          ),
          // Contenu central
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.2),
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: AppColors.secondary, width: 1.5),
                  ),
                  child: const Icon(Icons.vrpano_rounded,
                      color: AppColors.secondary, size: 28),
                ),
                const SizedBox(height: 10),
                const Text('Visite Virtuelle 360°',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14)),
                const SizedBox(height: 4),
                Text(
                  // ✅ Traduit
                  l10n.openInBrowser,
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.65),
                      fontSize: 11),
                ),
              ],
            ),
          ),
          // Badge 360°
          Positioned(
            top: 12, right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.secondary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.threesixty_rounded,
                    color: Colors.white, size: 13),
                SizedBox(width: 4),
                Text('360°',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold)),
              ]),
            ),
          ),
          // Icône lien bas-gauche
          Positioned(
            bottom: 12, left: 12,
            child: Row(children: [
              Icon(Icons.open_in_new_rounded,
                  color: Colors.white.withOpacity(0.6), size: 13),
              const SizedBox(width: 4),
              // ✅ Traduit
              Text(l10n.openInBrowser,
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 10)),
            ]),
          ),
        ]),
      ),
    );
  }
}

// ── Peintre grille perspective ─────────────────────────────────────────────
class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.04)
      ..strokeWidth = 1;
    for (var i = 0; i < 6; i++) {
      final y = (size.height / 5) * i;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
    for (var i = 0; i < 10; i++) {
      final x = (size.width / 9) * i;
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}