// ============================================
// lib/data/services/auth_service.dart
// ============================================

import 'dart:convert';
import '../models/user_model.dart';
import 'api_service.dart';
import 'storage_service.dart';
import '../../core/constants/api_constants.dart';

class AuthService {
  final _api = ApiService();
  final _storage = StorageService();

  Future<UserModel> login(String username, String password) async {
    try {
      final response = await _api.post(
        ApiConstants.login,
        data: {
          'username': username,
          'password': password,
        },
      );

      final tokens = response.data['tokens'];
      final userData = response.data['user'];

      // Sauvegarder les tokens
      await _storage.saveAccessToken(tokens['access']);
      await _storage.saveRefreshToken(tokens['refresh']);

      // Sauvegarder l'utilisateur
      final user = UserModel.fromJson(userData);
      await _storage.saveUser(jsonEncode(user.toJson()));

      return user;
    } catch (e) {
      throw Exception('Erreur de connexion: ${e.toString()}');
    }
  }

  Future<UserModel> register(Map<String, dynamic> userData) async {
    try {
      final response = await _api.post(
        ApiConstants.register,
        data: userData,
      );

      final tokens = response.data['tokens'];
      final userJson = response.data['user'];

      // Sauvegarder les tokens
      await _storage.saveAccessToken(tokens['access']);
      await _storage.saveRefreshToken(tokens['refresh']);

      // Sauvegarder l'utilisateur
      final user = UserModel.fromJson(userJson);
      await _storage.saveUser(jsonEncode(user.toJson()));

      return user;
    } catch (e) {
      throw Exception('Erreur d\'inscription: ${e.toString()}');
    }
  }

  Future<void> logout() async {
    await _storage.clearAll();
  }

  Future<UserModel?> getCurrentUser() async {
    final userJson = _storage.getUser();
    if (userJson == null) return null;

    try {
      return UserModel.fromJson(jsonDecode(userJson));
    } catch (e) {
      return null;
    }
  }

  Future<bool> isAuthenticated() async {
    final token = await _storage.getAccessToken();
    return token != null;
  }

  Future<UserModel> getProfile() async {
    try {
      final response = await _api.get(ApiConstants.profile);
      final user = UserModel.fromJson(response.data);
      await _storage.saveUser(jsonEncode(user.toJson()));
      return user;
    } catch (e) {
      throw Exception('Erreur de récupération du profil');
    }
  }

  Future<UserModel> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await _api.patch(ApiConstants.profile, data: data);
      final user = UserModel.fromJson(response.data);
      await _storage.saveUser(jsonEncode(user.toJson()));
      return user;
    } catch (e) {
      throw Exception('Erreur de mise à jour du profil');
    }
  }
}