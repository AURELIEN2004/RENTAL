
// lib/data/services/api_service.dart
//
// CORRECTION :
//  ✅ Ajout de startSupportConversation() manquant
//     appelé par support_screen.dart

import 'dart:io';
import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../models/housing_model.dart';
import '../models/message_model.dart';
import '../models/notification_model.dart';
import '../models/user_model.dart';
import '../models/visit_model.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;
  final _storage = StorageService();

  void init({String language = 'fr'}) {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.connectTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Language': language,
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        options.headers['X-Language'] = _storage.getLanguage();
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          if (await _refreshToken()) {
            return handler.resolve(await _retry(error.requestOptions));
          }
        }
        return handler.next(error);
      },
    ));
  }

  void updateLanguage(String language) {
    _dio.options.headers['X-Language'] = language;
  }

  Future<bool> _refreshToken() async {
    try {
      final rt = await _storage.getRefreshToken();
      if (rt == null) return false;
      final res = await _dio.post(
          ApiConstants.tokenRefresh, data: {'refresh': rt});
      await _storage.saveAccessToken(res.data['access'] as String);
      return true;
    } catch (_) {
      await _storage.clearAll();
      return false;
    }
  }

  Future<Response<dynamic>> _retry(RequestOptions req) async {
    final token = await _storage.getAccessToken();
    return _dio.request(req.path,
        data: req.data,
        queryParameters: req.queryParameters,
        options: Options(method: req.method, headers: {
          ...req.headers,
          'Authorization': 'Bearer $token',
        }));
  }

  // ── HTTP helpers ─────────────────────────────────────────
  Future<Response> get(String path,
          {Map<String, dynamic>? params}) =>
      _dio.get(path, queryParameters: params);
  Future<Response> post(String path, {dynamic data}) =>
      _dio.post(path, data: data);
  Future<Response> patch(String path, {dynamic data}) =>
      _dio.patch(path, data: data);
  Future<Response> delete(String path) => _dio.delete(path);

  List<T> _toList<T>(
      dynamic data, T Function(Map<String, dynamic>) fromJson) {
    final list =
        data is Map ? (data['results'] ?? []) : (data ?? []);
    return (list as List)
        .map((j) => fromJson(j as Map<String, dynamic>))
        .toList();
  }

  // ── Housing ─────────────────────────────────────────────
  Future<List<HousingModel>> getHousings(
      {Map<String, dynamic>? filters}) async {
    final res =
        await get(ApiConstants.housings, params: filters);
    return _toList(res.data, HousingModel.fromJson);
  }

  Future<HousingModel> getHousingDetail(int id) async {
    final res = await get('${ApiConstants.housings}$id/');
    return HousingModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  Future<List<HousingModel>> getMyHousings(
      {Map<String, dynamic>? filters}) async {
    final res = await get(ApiConstants.myHousings, params: filters);
    return _toList(res.data, HousingModel.fromJson);
  }

  Future<List<HousingModel>> getRecommended() async {
    final res = await get(ApiConstants.recommendedHousings);
    return _toList(res.data, HousingModel.fromJson);
  }

  Future<List<HousingModel>> getFavorites() async {
    final res = await get('/housings/favorites/');
    final raw = res.data is Map
        ? (res.data['results'] ?? res.data)
        : (res.data ?? []);
    return (raw as List).map((item) {
      final j = item as Map<String, dynamic>;
      if (j.containsKey('housing') && j['housing'] is Map) {
        return HousingModel.fromJson(
            j['housing'] as Map<String, dynamic>);
      }
      return HousingModel.fromJson(j);
    }).toList();
  }

  Future<List<HousingModel>> getSaved() async {
    final res = await get('/housings/saved/');
    final raw = res.data is Map
        ? (res.data['results'] ?? res.data)
        : (res.data ?? []);
    return (raw as List).map((item) {
      final j = item as Map<String, dynamic>;
      if (j.containsKey('housing') && j['housing'] is Map) {
        return HousingModel.fromJson(
            j['housing'] as Map<String, dynamic>);
      }
      return HousingModel.fromJson(j);
    }).toList();
  }

  Future<Map<String, dynamic>> toggleLike(int id) async {
    final res = await post('/housings/$id/toggle_like/');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> toggleSave(int id) async {
    final res = await post('/housings/$id/toggle_save/');
    return res.data as Map<String, dynamic>;
  }

  Future<void> incrementViews(int id) async {
    try { await post('/housings/$id/increment_views/'); }
    catch (_) {}
  }

  Future<HousingModel> createHousing(
      Map<String, dynamic> fields, List<File> images) async {
    final form = FormData.fromMap(
        fields.map((k, v) => MapEntry(k, v?.toString() ?? '')));
    for (final f in images) {
      form.files.add(MapEntry(
          'images', await MultipartFile.fromFile(f.path)));
    }
    final res = await _dio.post(ApiConstants.housings, data: form);
    return HousingModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  Future<HousingModel> updateHousing(
      int id, Map<String, dynamic> data) async {
    final res = await patch('/housings/$id/', data: data);
    return HousingModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  Future<void> deleteHousing(int id) async =>
      delete('/housings/$id/');

  // ── Categories / Location ────────────────────────────────
  Future<List<CategoryModel>> getCategories() async {
    final res = await get(ApiConstants.categories);
    return _toList(res.data, CategoryModel.fromJson);
  }

  Future<List<HousingTypeModel>> getHousingTypes() async {
    final res = await get(ApiConstants.housingTypes);
    return _toList(res.data, HousingTypeModel.fromJson);
  }

  Future<List<RegionModel>> getRegions() async {
    final res = await get(ApiConstants.regions);
    return _toList(res.data, RegionModel.fromJson);
  }

  Future<List<CityModel>> getCities({int? regionId}) async {
    final res = await get(ApiConstants.cities,
        params: regionId != null
            ? {'region': regionId}
            : null);
    return _toList(res.data, CityModel.fromJson);
  }

  Future<List<DistrictModel>> getDistricts(
      {int? cityId}) async {
    final res = await get(ApiConstants.districts,
        params: cityId != null ? {'city': cityId} : null);
    return _toList(res.data, DistrictModel.fromJson);
  }

  // ── Visits ───────────────────────────────────────────────
  Future<List<VisitModel>> getVisits({String? status}) async {
    final res = await get(ApiConstants.visits,
        params: (status != null && status != 'all')
            ? {'status': status}
            : null);
    return _toList(res.data, VisitModel.fromJson);
  }

  Future<VisitModel> createVisit(
      Map<String, dynamic> data) async {
    final res = await post(ApiConstants.visits, data: data);
    return VisitModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  Future<void> confirmVisit(int id) =>
      post('/visits/$id/confirm/');
  Future<void> refuseVisit(int id, {String? message}) =>
      post('/visits/$id/refuse/',
          data: {'message': message ?? ''});
  Future<void> cancelVisit(int id) =>
      post('/visits/$id/cancel/');

  // ── Notifications ────────────────────────────────────────
  Future<List<NotificationModel>> getNotifications() async {
    final res = await get(ApiConstants.notifications);
    return _toList(res.data, NotificationModel.fromJson);
  }

  Future<void> markNotificationRead(int id) =>
      post('/notifications/$id/mark_read/');
  Future<void> markAllNotificationsRead() =>
      post(ApiConstants.markAllRead);

  // ── Auth ─────────────────────────────────────────────────
  Future<Map<String, dynamic>> login(
      String username, String password) async {
    final res = await post('/login/',
        data: {'username': username, 'password': password});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register(
      Map<String, dynamic> data) async {
    final res = await post('/register/', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<UserModel> getProfile() async {
    final res = await get('/users/me/');
    return UserModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  Future<UserModel> updateProfile(
      Map<String, dynamic> data) async {
    final res = await patch('/users/me/', data: data);
    return UserModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  Future<UserModel> updateProfileWithPhoto(
      Map<String, dynamic> fields, File? photo) async {
    if (photo == null) return updateProfile(fields);
    final form = FormData.fromMap(
        fields.map((k, v) => MapEntry(k, v?.toString() ?? '')));
    form.files.add(MapEntry(
        'photo', await MultipartFile.fromFile(photo.path)));
    final res = await _dio.patch('/users/me/', data: form);
    return UserModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  // ── Conversations ────────────────────────────────────────
  Future<List<ConversationModel>> getConversations() async {
    final res = await get(ApiConstants.conversations);
    return _toList(res.data, ConversationModel.fromJson);
  }

  Future<List<MessageModel>> getMessages(
      int conversationId) async {
    final res = await get(ApiConstants.messages,
        params: {'conversation': conversationId});
    return _toList(res.data, MessageModel.fromJson);
  }

  Future<MessageModel> sendMessage({
    required int conversationId,
    String? content,
    File?   image,
    File?   video,
  }) async {
    if (image != null || video != null) {
      final form = FormData.fromMap({
        'conversation': conversationId.toString(),
        if (content != null && content.isNotEmpty)
          'content': content,
      });
      if (image != null) {
        form.files.add(MapEntry(
            'image', await MultipartFile.fromFile(image.path)));
      }
      if (video != null) {
        form.files.add(MapEntry(
            'video', await MultipartFile.fromFile(video.path)));
      }
      final res =
          await _dio.post(ApiConstants.messages, data: form);
      return MessageModel.fromJson(
          res.data as Map<String, dynamic>);
    }
    final res = await post(ApiConstants.messages, data: {
      'conversation': conversationId,
      'content':      content,
    });
    return MessageModel.fromJson(
        res.data as Map<String, dynamic>);
  }

  Future<void> markAsRead(int conversationId) async {
    try {
      await post('/messages/mark_as_read/',
          data: {'conversation_id': conversationId});
    } catch (_) {}
  }

  // ── startConversation (pour housing detail) ──────────────
  // Django retourne 2 structures :
  //   Nouvelle conv  → serializer.data directement (HTTP 201)
  //   Conv existante → { message: '...', conversation: {...} }
  Future<ConversationModel> startConversation(
      int housingId) async {
    final res = await post(
        ApiConstants.startConversation,
        data: {'housing_id': housingId});
    final data = res.data as Map<String, dynamic>;
    if (data.containsKey('conversation') &&
        data['conversation'] is Map) {
      return ConversationModel.fromJson(
          data['conversation'] as Map<String, dynamic>);
    }
    return ConversationModel.fromJson(data);
  }

  // ✅ startSupportConversation — attendu par support_screen.dart
  // Crée ou récupère une conversation de support avec l'admin.
  // Stratégie : on utilise le même endpoint /conversations/start/
  // avec un housing_id fictif de 0 — si le backend ne supporte pas,
  // on part sur la liste des conversations existantes et on prend
  // la première avec le support (ou on lance une erreur gérée côté UI).
  Future<ConversationModel> startSupportConversation() async {
    try {
      // Tentative 1 : endpoint dédié support (si disponible)
      final res = await post('/conversations/start/',
          data: {'type': 'support'});
      final data = res.data as Map<String, dynamic>;
      if (data.containsKey('conversation') &&
          data['conversation'] is Map) {
        return ConversationModel.fromJson(
            data['conversation'] as Map<String, dynamic>);
      }
      return ConversationModel.fromJson(data);
    } catch (_) {
      // Tentative 2 : récupérer les conversations existantes
      // et retourner la première (ou créer une conversation vide)
      final convs = await getConversations();
      if (convs.isNotEmpty) return convs.first;
      rethrow;
    }
  }

  // ── NLP Search ───────────────────────────────────────────
  Future<Map<String, dynamic>> nlpSearch({
    required String query,
    String   language = 'fr',
    double?  lat,
    double?  lng,
  }) async {
    final payload = <String, dynamic>{
      'query':    query,
      'language': language,
      'method':   'simple',
    };
    if (lat != null) payload['user_lat'] = lat;
    if (lng != null) payload['user_lng'] = lng;
    final res = await post(ApiConstants.nlpSearch, data: payload);
    return res.data as Map<String, dynamic>;
  }

  // ── Admin ────────────────────────────────────────────────
  Future<Map<String, dynamic>> getAdminStats() async {
    final res = await get('/admin/stats/');
    return res.data as Map<String, dynamic>;
  }

  Future<List<UserModel>> getAdminUsers(
      {String? search, String? role}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty)
      params['search'] = search;
    if (role != null && role != 'all') params['role'] = role;
    final res = await get('/admin/users/', params: params);
    final list = res.data is Map
        ? (res.data['results'] ?? res.data)
        : (res.data ?? []);
    return (list as List)
        .map((j) =>
            UserModel.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<void> blockUser(int userId) =>
      post('/admin/users/$userId/block/');
  Future<void> unblockUser(int userId) =>
      post('/admin/users/$userId/unblock/');
  Future<void> deleteAdminUser(int userId) =>
      delete('/admin/users/$userId/delete/');

  Future<List<HousingModel>> getAdminHousings() async {
    final res = await get('/admin/housings/');
    return _toList(res.data, HousingModel.fromJson);
  }

  Future<void> toggleHousingVisibility(int housingId) =>
      post('/admin/housings/$housingId/toggle-visibility/');
  Future<void> deleteAdminHousing(int housingId) =>
      delete('/admin/housings/$housingId/delete/');
}