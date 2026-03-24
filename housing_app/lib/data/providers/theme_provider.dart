// // ============================================
// // lib/data/providers/theme_provider.dart
// // ============================================


import 'package:flutter/material.dart';
import '../services/storage_service.dart';

class ThemeProvider with ChangeNotifier {
  final _storage = StorageService();

  bool   _isDarkMode = true;  // dark par défaut (fidèle aux maquettes)
  String _language   = 'fr';

  bool   get isDarkMode => _isDarkMode;
  String get language   => _language;

  /// Appelé dans main() avant runApp — charge depuis le stockage
  Future<void> load() async {
    _isDarkMode = _storage.getTheme();
    _language   = _storage.getLanguage();
    // Pas besoin de notifyListeners ici (pas encore dans l'arbre widget)
  }

  Future<void> toggleTheme() async {
    _isDarkMode = !_isDarkMode;
    await _storage.saveTheme(_isDarkMode);
    notifyListeners();
  }

  Future<void> setLanguage(String lang) async {
    if (lang == _language) return;
    _language = lang;
    await _storage.saveLanguage(lang);
    notifyListeners();
  }
}