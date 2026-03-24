// // // ============================================
// // // lib/data/services/storage_service.dart
// // // ============================================


import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ── Tokens JWT ────────────────────────────────────────────
  // Utilise SharedPreferences sur toutes les plateformes
  // (évite le bug flutter_secure_storage sur Chrome/Web)
  Future<void> saveAccessToken(String token) async {
    await _prefs?.setString('access_token', token);
  }

  Future<String?> getAccessToken() async {
    return _prefs?.getString('access_token');
  }

  Future<void> saveRefreshToken(String token) async {
    await _prefs?.setString('refresh_token', token);
  }

  Future<String?> getRefreshToken() async {
    return _prefs?.getString('refresh_token');
  }

  Future<void> clearTokens() async {
    await _prefs?.remove('access_token');
    await _prefs?.remove('refresh_token');
  }

  // ── User JSON ────────────────────────────────────────────
  Future<void> saveUser(String json) async {
    await _prefs?.setString('user', json);
  }

  String? getUser() => _prefs?.getString('user');

  Future<void> clearUser() async => _prefs?.remove('user');

  // ── Thème ─────────────────────────────────────────────────
  Future<void> saveTheme(bool isDark) async {
    await _prefs?.setBool('is_dark', isDark);
  }

  bool getTheme() => _prefs?.getBool('is_dark') ?? true; // dark par défaut

  // ── Langue ────────────────────────────────────────────────
  Future<void> saveLanguage(String lang) async {
    await _prefs?.setString('language', lang);
  }

  String getLanguage() => _prefs?.getString('language') ?? 'fr';

  // ── Clear all ─────────────────────────────────────────────
  Future<void> clearAll() async {
    await clearTokens();
    await clearUser();
  }
}