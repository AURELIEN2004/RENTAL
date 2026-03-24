
// lib/data/providers/housing_provider.dart
import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/housing_model.dart';
import '../services/api_service.dart';

class HousingProvider with ChangeNotifier {
  final _api = ApiService();

  List<HousingModel>     _housings    = [];
  List<HousingModel>     _recommended = [];
  List<HousingModel>     _favorites   = [];
  List<HousingModel>     _saved       = [];
  List<HousingModel>     _myHousings  = [];
  List<CategoryModel>    _categories  = [];
  List<HousingTypeModel> _types       = [];
  List<RegionModel>      _regions     = [];
  List<CityModel>        _cities      = [];
  List<DistrictModel>    _districts   = [];

  bool    _isLoading     = false;
  bool    _isLoadingMore = false;
  String? _error;

  // Filtres actifs
  int?    _categoryId;
  int?    _housingTypeId;
  int?    _cityId;
  int?    _districtId;
  int?    _regionId;
  int?    _minPrice;
  int?    _maxPrice;
  int?    _minRooms;
  int?    _minArea;
  String? _searchQuery;
  String? _status;

  // ── Getters ─────────────────────────────────────────────
  List<HousingModel>     get housings    => _housings;
  List<HousingModel>     get recommended => _recommended;
  List<HousingModel>     get favorites   => _favorites;
  List<HousingModel>     get saved       => _saved;
  List<HousingModel>     get myHousings  => _myHousings;
  List<CategoryModel>    get categories  => _categories;
  List<HousingTypeModel> get housingTypes => _types;
  List<RegionModel>      get regions     => _regions;
  List<CityModel>        get cities      => _cities;
  List<DistrictModel>    get districts   => _districts;
  bool    get isLoading     => _isLoading;
  bool    get isLoadingMore => _isLoadingMore;
  String? get error         => _error;

  Map<String, dynamic> get activeFilters {
    final f = <String, dynamic>{'status': _status ?? 'disponible'};
    if (_categoryId != null)    f['category']     = _categoryId;
    if (_housingTypeId != null) f['housing_type']  = _housingTypeId;
    if (_regionId != null)      f['region']        = _regionId;
    if (_cityId != null)        f['city']          = _cityId;
    if (_districtId != null)    f['district']      = _districtId;
    if (_minPrice != null)      f['min_price']     = _minPrice;
    if (_maxPrice != null)      f['max_price']     = _maxPrice;
    if (_minRooms != null)      f['rooms__gte']    = _minRooms;
    if (_minArea != null)       f['min_area']      = _minArea;
    if (_searchQuery != null && _searchQuery!.isNotEmpty) {
      f['search'] = _searchQuery;
    }
    return f;
  }

  int get activeFilterCount {
    int n = 0;
    if (_categoryId != null)                        n++;
    if (_housingTypeId != null)                     n++;
    if (_cityId != null)                            n++;
    if (_minPrice != null || _maxPrice != null)     n++;
    if (_minRooms != null)                          n++;
    if (_minArea != null)                           n++;
    return n;
  }

  // ── Fetch ────────────────────────────────────────────────
  Future<void> fetchHousings({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      _error = null;
      notifyListeners();
    }
    try {
      _housings = await _api.getHousings(filters: activeFilters);
    } catch (e) {
      _error = e.toString();
      debugPrint('fetchHousings error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMore() async {
    if (_isLoadingMore) return;
    _isLoadingMore = true;
    notifyListeners();
    try {
      final more = await _api.getHousings(
          filters: {...activeFilters, 'offset': _housings.length});
      _housings.addAll(more);
    } catch (_) {}
    _isLoadingMore = false;
    notifyListeners();
  }

  Future<void> fetchRecommended() async {
    try {
      _recommended = await _api.getRecommended();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchCategories() async {
    try {
      _categories = await _api.getCategories();
      _types = await _api.getHousingTypes();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchRegions() async {
    try {
      _regions = await _api.getRegions();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchCities({int? regionId}) async {
    try {
      _cities = await _api.getCities(regionId: regionId);
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchDistricts({int? cityId}) async {
    try {
      _districts = await _api.getDistricts(cityId: cityId);
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchFavorites() async {
    try {
      _favorites = await _api.getFavorites();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchSaved() async {
    try {
      _saved = await _api.getSaved();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchMyHousings() async {
    _isLoading = true;
    notifyListeners();
    try {
      _myHousings = await _api.getMyHousings();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ── Toggle Like / Save ───────────────────────────────────
  Future<void> toggleLike(int id) async {
    try {
      final result = await _api.toggleLike(id);
      final isLiked  = result['liked'] == true;
      final newCount = (result['likes_count'] as num?)?.toInt() ?? 0;
      _update(_housings, id, (h) => h.copyWith(isLiked: isLiked, likesCount: newCount));
      _update(_myHousings, id, (h) => h.copyWith(isLiked: isLiked, likesCount: newCount));
      notifyListeners();
    } catch (_) {}
  }

  Future<void> toggleSave(int id) async {
    try {
      final result  = await _api.toggleSave(id);
      final isSaved = result['saved'] == true;
      _update(_housings, id, (h) => h.copyWith(isSaved: isSaved));
      _update(_myHousings, id, (h) => h.copyWith(isSaved: isSaved));
      notifyListeners();
    } catch (_) {}
  }

  void _update(List<HousingModel> list, int id,
      HousingModel Function(HousingModel) fn) {
    final idx = list.indexWhere((h) => h.id == id);
    if (idx != -1) list[idx] = fn(list[idx]);
  }

  // ── CRUD ─────────────────────────────────────────────────
  Future<bool> createHousing(
      Map<String, dynamic> fields, List<File> images) async {
    _isLoading = true;
    notifyListeners();
    try {
      final h = await _api.createHousing(fields, images);
      _myHousings.insert(0, h);
      return true;
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateHousing(int id, Map<String, dynamic> data) async {
    try {
      final updated = await _api.updateHousing(id, data);
      _update(_myHousings, id, (_) => updated);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteHousing(int id) async {
    try {
      await _api.deleteHousing(id);
      _myHousings.removeWhere((h) => h.id == id);
      _housings.removeWhere((h) => h.id == id);
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  // ── Filtres ──────────────────────────────────────────────
  void setFilters({
    int?    categoryId,
    int?    housingTypeId,
    int?    regionId,
    int?    cityId,
    int?    districtId,
    int?    minPrice,
    int?    maxPrice,
    int?    minRooms,
    int?    minArea,
    String? searchQuery,
    String? status,
    bool    fetch = true,
  }) {
    _categoryId    = categoryId;
    _housingTypeId = housingTypeId;
    _regionId      = regionId;
    _cityId        = cityId;
    _districtId    = districtId;
    _minPrice      = minPrice;
    _maxPrice      = maxPrice;
    _minRooms      = minRooms;
    _minArea       = minArea;
    _searchQuery   = searchQuery;
    _status        = status;
    if (fetch) fetchHousings();
  }

  void clearFilters() {
    _categoryId = _housingTypeId = _regionId = _cityId = _districtId =
        _minPrice = _maxPrice = _minRooms = _minArea = null;
    _searchQuery = _status = null;
    fetchHousings();
  }

  void clearData() {
    _housings = _favorites = _saved = _myHousings = _recommended = [];
    _error = null;
    notifyListeners();
  }
}