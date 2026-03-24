

// ============================================
// lib/main.dart
// ============================================

// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'data/services/api_service.dart';
import 'data/services/storage_service.dart';
import 'data/providers/auth_provider.dart';
import 'data/providers/housing_provider.dart';
import 'data/providers/theme_provider.dart';
import 'app.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── Initialiser les services ────────────────────────────
  await StorageService().init();

  final themeProvider = ThemeProvider();
  await themeProvider.load();

  ApiService().init(language: themeProvider.language);

  // ── Lancer l'app ────────────────────────────────────────
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: themeProvider),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => HousingProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

