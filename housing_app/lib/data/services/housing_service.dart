// ============================================
// lib/data/services/housing_service.dart
// ============================================

import '../models/housing_model.dart';
import '../models/visit_model.dart';
import 'api_service.dart';
import '../../core/constants/api_constants.dart';

class HousingService {
  final _api = ApiService();

  // Liste des logements
  Future<List<HousingModel>> getHousings({Map<String, dynamic>? filters}) async {
    try {
      final response = await _api.get(
        ApiConstants.housings,
        queryParams: filters,
      );

      final List housingsJson = response.data['results'] ?? response.data;
      return housingsJson.map((json) => HousingModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Erreur de chargement des logements');
    }
  }

  // Logements recommandés (algorithme génétique)
  Future<List<HousingModel>> getRecommendedHousings() async {
    try {
      final response = await _api.get(ApiConstants.recommendedHousings);
      final List housingsJson = response.data;
      return housingsJson.map((json) => HousingModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Erreur de chargement des recommandations');
    }
  }

  // Détail d'un logement
  Future<HousingModel> getHousing(int id) async {
    try {
      final response = await _api.get('${ApiConstants.housings}$id/');
      return HousingModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Erreur de chargement du logement');
    }
  }

  // Créer un logement
  Future<HousingModel> createHousing(
    Map<String, dynamic> data,
    List<String> imagePaths,
  ) async {
    try {
      final response = await _api.uploadMultipart(
        ApiConstants.housings,
        data,
        imagePaths,
      );
      return HousingModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Erreur de création du logement');
    }
  }

  // Incrémenter les vues
  Future<void> incrementViews(int id) async {
    try {
      await _api.post('${ApiConstants.housings}$id/increment_views/');
    } catch (e) {
      // Silent fail
    }
  }

  // Toggle like
  Future<Map<String, dynamic>> toggleLike(int id) async {
    try {
      final response = await _api.post('${ApiConstants.housings}$id/toggle_like/');
      return response.data;
    } catch (e) {
      throw Exception('Erreur lors du like');
    }
  }

  // Mes logements (propriétaire)
  Future<List<HousingModel>> getMyHousings() async {
    try {
      final response = await _api.get(ApiConstants.myHousings);
      final List housingsJson = response.data;
      return housingsJson.map((json) => HousingModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Erreur de chargement de vos logements');
    }
  }

  // Visites
  Future<List<VisitModel>> getVisits() async {
    try {
      final response = await _api.get(ApiConstants.visits);
      final List visitsJson = response.data;
      return visitsJson.map((json) => VisitModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Erreur de chargement des visites');
    }
  }

  Future<VisitModel> createVisit(Map<String, dynamic> data) async {
    try {
      final response = await _api.post(ApiConstants.visits, data: data);
      return VisitModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Erreur de planification de la visite');
    }
  }

  Future<void> confirmVisit(int id) async {
    try {
      await _api.post('${ApiConstants.visits}$id/confirm/');
    } catch (e) {
      throw Exception('Erreur de confirmation');
    }
  }

  Future<void> refuseVisit(int id, {String? message}) async {
    try {
      await _api.post(
        '${ApiConstants.visits}$id/refuse/',
        data: {'message': message ?? ''},
      );
    } catch (e) {
      throw Exception('Erreur de refus');
    }
  }
}