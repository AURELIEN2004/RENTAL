// // // ============================================
// // // lib/core/theme/app_theme.dart
// // // ============================================


import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';

class AppTheme {
  // ── Dark Theme ───────────────────────────────────────────
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.bgDark,

      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surfaceDark,
        error: AppColors.danger,
      ),

      // TextTheme sans Google Fonts — évite l'erreur "Failed to parse font"
      textTheme: const TextTheme(
        displayLarge:   TextStyle(color: AppColors.textDark, fontWeight: FontWeight.bold),
        headlineLarge:  TextStyle(color: AppColors.textDark, fontWeight: FontWeight.bold, fontSize: 28),
        headlineMedium: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.bold, fontSize: 22),
        headlineSmall:  TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600, fontSize: 18),
        titleLarge:     TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600, fontSize: 16),
        titleMedium:    TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w500, fontSize: 14),
        bodyLarge:      TextStyle(color: AppColors.textDark, fontSize: 15),
        bodyMedium:     TextStyle(color: AppColors.textSecondaryDark, fontSize: 13),
        bodySmall:      TextStyle(color: AppColors.textMutedDark, fontSize: 12),
        labelLarge:     TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600, fontSize: 14),
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bgDark,
        foregroundColor: AppColors.textDark,
        elevation: 0,
        scrolledUnderElevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: AppColors.textDark,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),

      cardTheme: CardThemeData(
        color: AppColors.cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderDark),
        ),
        margin: EdgeInsets.zero,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        hintStyle: const TextStyle(color: AppColors.textMutedDark, fontSize: 14),
        labelStyle: const TextStyle(color: AppColors.textSecondaryDark),
        prefixIconColor: AppColors.textMutedDark,
        suffixIconColor: AppColors.textMutedDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surfaceDark,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMutedDark,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 11),
      ),

      dividerTheme: const DividerThemeData(
        color: AppColors.borderDark,
        thickness: 1,
        space: 0,
      ),

      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.cardDark,
        contentTextStyle: const TextStyle(color: AppColors.textDark),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  // ── Light Theme ──────────────────────────────────────────
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.bgLight,

      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surfaceLight,
        error: AppColors.danger,
      ),

      textTheme: const TextTheme(
        headlineLarge:  TextStyle(color: AppColors.textLight, fontWeight: FontWeight.bold, fontSize: 28),
        headlineMedium: TextStyle(color: AppColors.textLight, fontWeight: FontWeight.bold, fontSize: 22),
        headlineSmall:  TextStyle(color: AppColors.textLight, fontWeight: FontWeight.w600, fontSize: 18),
        titleLarge:     TextStyle(color: AppColors.textLight, fontWeight: FontWeight.w600, fontSize: 16),
        titleMedium:    TextStyle(color: AppColors.textLight, fontWeight: FontWeight.w500, fontSize: 14),
        bodyLarge:      TextStyle(color: AppColors.textLight, fontSize: 15),
        bodyMedium:     TextStyle(color: AppColors.textSecondaryLight, fontSize: 13),
        bodySmall:      TextStyle(color: AppColors.textMutedLight, fontSize: 12),
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfaceLight,
        foregroundColor: AppColors.textLight,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: AppColors.textLight,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),

      cardTheme: CardThemeData(
        color: AppColors.cardLight,
        elevation: 2,
        shadowColor: Colors.black12,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderLight),
        ),
        margin: EdgeInsets.zero,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        hintStyle: const TextStyle(color: AppColors.textMutedLight, fontSize: 14),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surfaceLight,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMutedLight,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 11),
      ),

      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1,
        space: 0,
      ),
    );
  }
}