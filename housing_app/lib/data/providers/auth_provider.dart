// // // ============================================
// // // lib/data/providers/auth_provider.dart
// // // ============================================

import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthProvider with ChangeNotifier {
  final _api     = ApiService();
  final _storage = StorageService();

  UserModel? _user;
  bool       _isLoading = false;
  String?    _error;

  UserModel? get user          => _user;
  bool       get isLoading     => _isLoading;
  String?    get error         => _error;
  bool       get isAuthenticated => _user != null;

  /// Vérifier si un token existe au démarrage
  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await _storage.getAccessToken();
      if (token != null) {
        _user = await _api.getProfile();

        // Mettre à jour le cache local
        await _storage.saveUser(jsonEncode(_user!.toJson()));
      }
    } catch (e) {
      // Token expiré ou invalide → essayer depuis le cache
      final cached = _storage.getUser();
      if (cached != null) {
        try {
          _user = UserModel.fromJson(jsonDecode(cached));
        } catch (_) {
          _user = null;
        }
      }
      await _storage.clearTokens();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.login(username, password);

      // Sauvegarder les tokens
      final tokens = data['tokens'] ?? data;
      await _storage.saveAccessToken(tokens['access'] as String);
      await _storage.saveRefreshToken(tokens['refresh'] as String);

      // Charger le profil
      final userData = data['user'];
      if (userData != null) {
        _user = UserModel.fromJson(userData as Map<String, dynamic>);
      } else {
        _user = await _api.getProfile();
      }

      await _storage.saveUser(jsonEncode(_user!.toJson()));
      return true;
    } catch (e) {
      _error = _parseError(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register({
    required String username,
    required String email,
    required String phone,
    required String password,
    required bool isProprietaire,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _api.register({
        'username':       username,
        'email':          email,
        'phone':          phone,
        'password':       password,
        'is_proprietaire': isProprietaire,
        'is_locataire':   !isProprietaire,
      });

      final tokens = data['tokens'] ?? data;
      await _storage.saveAccessToken(tokens['access'] as String);
      await _storage.saveRefreshToken(tokens['refresh'] as String);

      final userData = data['user'];
      if (userData != null) {
        _user = UserModel.fromJson(userData as Map<String, dynamic>);
      } else {
        _user = await _api.getProfile();
      }

      await _storage.saveUser(jsonEncode(_user!.toJson()));
      return true;
    } catch (e) {
      _error = _parseError(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _storage.clearAll();
    _user = null;
    _error = null;
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    try {
      _user = await _api.updateProfile(data);
      await _storage.saveUser(jsonEncode(_user!.toJson()));
      notifyListeners();
      return true;
    } catch (e) {
      _error = _parseError(e);
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  String _parseError(dynamic e) {
    final msg = e.toString();
    if (msg.contains('401') || msg.contains('credentials')) {
      return 'Identifiants incorrects';
    }
    if (msg.contains('400')) {
      return 'Données invalides';
    }
    if (msg.contains('network') || msg.contains('connection')) {
      return 'Erreur de connexion réseau';
    }
    return 'Une erreur est survenue';
  }
}










