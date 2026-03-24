// // ============================================
// // lib/core/constants/app_colors.dart
// // ============================================

import 'package:flutter/material.dart';

class AppColors {
  // ── Brand ──────────────────────────────────────────────────
  static const Color primary      = Color(0xFF2563EB);
  static const Color primaryHover = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFFDDEAFE);
  static const Color secondary    = Color(0xFF7C3AED);
  static const Color accent       = Color(0xFF06B6D4);

  // ── Status ──────────────────────────────────────────────────
  static const Color success = Color(0xFF10B981);
  static const Color danger  = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info    = Color(0xFF3B82F6);

  // ── Dark mode (default — maquettes) ─────────────────────────
  static const Color bgDark       = Color(0xFF0F1117);
  static const Color surfaceDark  = Color(0xFF1A1E2E);
  static const Color cardDark     = Color(0xFF1E2235);
  static const Color borderDark   = Color(0xFF2D3148);

  static const Color textDark          = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textMutedDark     = Color(0xFF64748B);

  // ── Light mode ───────────────────────────────────────────────
  static const Color bgLight       = Color(0xFFF8FAFC);
  static const Color surfaceLight  = Color(0xFFFFFFFF);
  static const Color cardLight     = Color(0xFFFFFFFF);
  static const Color borderLight   = Color(0xFFE2E8F0);

  static const Color textLight          = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);
  static const Color textMutedLight     = Color(0xFF94A3B8);

  // ── Housing status ───────────────────────────────────────────
  static const Color disponibleBg   = Color(0xFF064E3B);
  static const Color disponibleText = Color(0xFF6EE7B7);
  static const Color reserveBg      = Color(0xFF78350F);
  static const Color reserveText    = Color(0xFFFCD34D);
  static const Color occupeBg       = Color(0xFF7F1D1D);
  static const Color occupeText     = Color(0xFFFCA5A5);

  // ── Chat ─────────────────────────────────────────────────────
  static const Color messageMeBg    = Color(0xFF2563EB);
  static const Color messageOtherBg = Color(0xFF1E2235);

  // ── Gradient ─────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF7C3AED)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Color(0xFF0F1117), Color(0xFF1A1E2E)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}