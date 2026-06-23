// lib/widgets/housing/housing_map_marker.dart
// ============================================================
// Marker carte personnalisé avec badge prix animé.
// Utilisé dans SearchMapScreen → MarkerLayer de flutter_map.
// ============================================================

import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../data/models/housing_model.dart';

class HousingMapMarker extends StatelessWidget {
  final HousingModel housing;
  final bool         isSelected;

  const HousingMapMarker({
    super.key,
    required this.housing,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = _statusColor();

    return AnimatedScale(
      scale:    isSelected ? 1.25 : 1.0,
      duration: const Duration(milliseconds: 200),
      curve:    Curves.elasticOut,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Badge prix ────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.warning : color,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white,
                width: isSelected ? 2.5 : 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: (isSelected ? AppColors.warning : color)
                      .withOpacity(isSelected ? 0.6 : 0.35),
                  blurRadius: isSelected ? 12 : 6,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isSelected) ...[
                  const Icon(
                    Icons.location_on_rounded,
                    color: Colors.white,
                    size: 11,
                  ),
                  const SizedBox(width: 3),
                ],
                Text(
                  _formatPrice(housing.price),
                  style: TextStyle(
                    color:      Colors.white,
                    fontSize:   isSelected ? 12 : 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.2,
                  ),
                ),
              ],
            ),
          ),

          // ── Pointe du marker ──────────────────────────────
          CustomPaint(
            size: const Size(10, 5),
            painter: _MarkerTipPainter(
              color: isSelected ? AppColors.warning : color,
            ),
          ),
        ],
      ),
    );
  }

  Color _statusColor() {
    switch (housing.status) {
      case 'disponible': return AppColors.success;
      case 'reserve':    return AppColors.warning;
      default:           return AppColors.danger;
    }
  }

  String _formatPrice(int price) {
    if (price >= 1_000_000) {
      return '${(price / 1_000_000).toStringAsFixed(1)}M';
    }
    if (price >= 1_000) {
      return '${(price / 1_000).round()}k';
    }
    return '$price';
  }
}

// ── Peintre pointe du marker ─────────────────────────────────
class _MarkerTipPainter extends CustomPainter {
  final Color color;
  const _MarkerTipPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width / 2, size.height)
      ..close();

    canvas.drawPath(path, paint);

    // Bordure blanche
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawPath(path, borderPaint);
  }

  @override
  bool shouldRepaint(covariant _MarkerTipPainter old) => old.color != color;
}


// ── Cluster marker (pour les groupes) ───────────────────────
class HousingClusterMarker extends StatelessWidget {
  final int count;
  const HousingClusterMarker({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    return Container(
      width:  42,
      height: 42,
      decoration: BoxDecoration(
        color:  AppColors.primary,
        shape:  BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.45),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Center(
        child: Text(
          count > 99 ? '99+' : '$count',
          style: const TextStyle(
            color:      Colors.white,
            fontSize:   13,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}