
// lib/data/models/housing_model.dart
//
// CORRECTION BUG "type '_JsonMap' is not a subtype of type 'int?'" :
//
// Django retourne 2 structures selon l'endpoint :
//
//  HousingListSerializer (GET /housings/)  →  champs PLATS :
//    "category": 1,               ← int
//    "city": 5,                   ← int
//    "owner": 3,                  ← int
//    "owner_name": "Jean",        ← String séparé
//    "category_name": "Studio",   ← String séparé
//
//  HousingDetailSerializer (GET /housings/{id}/) → objets IMBRIQUÉS :
//    "category": {"id": 1, "name": "Studio"},   ← Map
//    "city":     {"id": 5, "name": "Yaoundé"},   ← Map
//    "owner":    {"id": 3, "username": "Jean"},  ← Map
//
// Solution : helper _parseId() qui accepte int OU Map{"id":...}
//            et helper _parseName() qui extrait le nom de la Map

// ── Helper : extrait un int depuis int OU Map{"id":...} ──────
int? _parseId(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is Map) return (value['id'] as num?)?.toInt();
  if (value is String) return int.tryParse(value);
  return null;
}

// ── Helper : extrait un String nom depuis Map{"name":...} ────
String? _parseName(dynamic value, {String field = 'name'}) {
  if (value == null) return null;
  if (value is Map) return value[field] as String?;
  if (value is String) return value;
  return null;
}

class HousingModel {
  final int id;
  final String title;
  final String displayName;
  final String description;
  final int price;
  final int area;
  final int rooms;
  final int bathrooms;
  final String status;
  final String? video;
  final String? virtual360;
  final String? additionalFeatures;
  final int viewsCount;
  final int likesCount;
  final bool isVisible;
  final bool isLiked;
  final bool isSaved;
  final DateTime createdAt;

  // Relations — toujours des int? en interne
  final int? ownerId;
  final String? ownerName;
  final String? ownerPhoto;
  final String? ownerPhone;

  final int? categoryId;
  final String? categoryName;

  final int? housingTypeId;
  final String? typeName;

  final int? regionId;
  final String? regionName;

  final int? cityId;
  final String? cityName;

  final int? districtId;
  final String? districtName;

  final double? latitude;
  final double? longitude;
  final String? mainImage;
  final List<HousingImage>? images;

  const HousingModel({
    required this.id,
    required this.title,
    required this.displayName,
    required this.description,
    required this.price,
    required this.area,
    required this.rooms,
    required this.bathrooms,
    required this.status,
    this.video,
    this.virtual360,
    this.additionalFeatures,
    this.viewsCount = 0,
    this.likesCount = 0,
    this.isVisible = true,
    this.isLiked = false,
    this.isSaved = false,
    required this.createdAt,
    this.ownerId,
    this.ownerName,
    this.ownerPhoto,
    this.ownerPhone,
    this.categoryId,
    this.categoryName,
    this.housingTypeId,
    this.typeName,
    this.regionId,
    this.regionName,
    this.cityId,
    this.cityName,
    this.districtId,
    this.districtName,
    this.latitude,
    this.longitude,
    this.mainImage,
    this.images,
  });

  factory HousingModel.fromJson(Map<String, dynamic> json) {
    // ── Images ───────────────────────────────────────────────
    List<HousingImage>? imagesList;
    if (json['images'] is List) {
      imagesList = (json['images'] as List)
          .map((img) => img is Map<String, dynamic>
              ? HousingImage.fromJson(img)
              : HousingImage(id: 0, image: img.toString(), isMain: false))
          .toList();
    }

    // ── owner : peut être int (list) ou Map (detail) ─────────
    final ownerRaw = json['owner'];
    final int? ownerIdParsed = _parseId(ownerRaw);
    // owner_name : champ plat (list) OU owner.username (detail)
    final String? ownerNameParsed = json['owner_name'] as String?
        ?? _parseName(ownerRaw, field: 'username')
        ?? _parseName(ownerRaw, field: 'first_name');
    final String? ownerPhotoParsed = json['owner_photo'] as String?
        ?? (ownerRaw is Map ? ownerRaw['photo'] as String? : null);
    final String? ownerPhoneParsed = json['owner_phone'] as String?
        ?? (ownerRaw is Map ? ownerRaw['phone'] as String? : null);

    // ── category : peut être int (list) ou Map (detail) ──────
    final categoryRaw = json['category'];
    final int? categoryIdParsed = _parseId(categoryRaw);
    final String? categoryNameParsed =
        json['category_name'] as String? ?? _parseName(categoryRaw);

    // ── housing_type : peut être int (list) ou Map (detail) ──
    final typeRaw = json['housing_type'];
    final int? typeIdParsed = _parseId(typeRaw);
    final String? typeNameParsed =
        json['type_name'] as String? ?? _parseName(typeRaw);

    // ── region : peut être int (list) ou Map (detail) ────────
    final regionRaw = json['region'];
    final int? regionIdParsed = _parseId(regionRaw);
    final String? regionNameParsed =
        json['region_name'] as String? ?? _parseName(regionRaw);

    // ── city : peut être int (list) ou Map (detail) ───────────
    final cityRaw = json['city'];
    final int? cityIdParsed = _parseId(cityRaw);
    final String? cityNameParsed =
        json['city_name'] as String? ?? _parseName(cityRaw);

    // ── district : peut être int (list) ou Map (detail) ──────
    final districtRaw = json['district'];
    final int? districtIdParsed = _parseId(districtRaw);
    final String? districtNameParsed =
        json['district_name'] as String? ?? _parseName(districtRaw);

    // ── main_image : direct (list) ou extraire des images (detail)
    String? mainImageParsed = json['main_image'] as String?;
    if (mainImageParsed == null && imagesList != null) {
      final mainImg = imagesList.where((i) => i.isMain).isNotEmpty
          ? imagesList.firstWhere((i) => i.isMain)
          : (imagesList.isNotEmpty ? imagesList.first : null);
      mainImageParsed = mainImg?.image;
    }

    return HousingModel(
      id:          (json['id'] as num).toInt(),
      title:       json['title'] as String? ?? '',
      displayName: json['display_name'] as String? ?? json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      price:       (json['price'] as num?)?.toInt() ?? 0,
      area:        (json['area'] as num?)?.toInt() ?? 0,
      rooms:       (json['rooms'] as num?)?.toInt() ?? 0,
      bathrooms:   (json['bathrooms'] as num?)?.toInt() ?? 0,
      status:      json['status'] as String? ?? 'disponible',
      video:       json['video'] as String?,
      virtual360:  json['virtual_360'] as String?,
      additionalFeatures: json['additional_features'] as String?,
      viewsCount:  (json['views_count'] as num?)?.toInt() ?? 0,
      likesCount:  (json['likes_count'] as num?)?.toInt() ?? 0,
      isVisible:   json['is_visible'] as bool? ?? true,
      isLiked:     json['is_liked'] as bool? ?? false,
      isSaved:     json['is_saved'] as bool? ?? false,
      createdAt:   json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
      ownerId:          ownerIdParsed,
      ownerName:        ownerNameParsed,
      ownerPhoto:       ownerPhotoParsed,
      ownerPhone:       ownerPhoneParsed,
      categoryId:       categoryIdParsed,
      categoryName:     categoryNameParsed,
      housingTypeId:    typeIdParsed,
      typeName:         typeNameParsed,
      regionId:         regionIdParsed,
      regionName:       regionNameParsed,
      cityId:           cityIdParsed,
      cityName:         cityNameParsed,
      districtId:       districtIdParsed,
      districtName:     districtNameParsed,
      latitude:  (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      mainImage: mainImageParsed,
      images:    imagesList,
    );
  }

  Map<String, dynamic> toJson() => {
    'id':           id,
    'title':        title,
    'description':  description,
    'price':        price,
    'area':         area,
    'rooms':        rooms,
    'bathrooms':    bathrooms,
    'status':       status,
    if (categoryId  != null) 'category':     categoryId,
    if (housingTypeId != null) 'housing_type': housingTypeId,
    if (cityId      != null) 'city':         cityId,
    if (districtId  != null) 'district':     districtId,
    if (additionalFeatures != null) 'additional_features': additionalFeatures,
  };

  HousingModel copyWith({
    int?    price,
    int?    likesCount,
    bool?   isLiked,
    bool?   isSaved,
    String? status,
    String? mainImage,
    List<HousingImage>? images,
  }) {
    return HousingModel(
      id:               id,
      title:            title,
      displayName:      displayName,
      description:      description,
      price:            price ?? this.price,
      area:             area,
      rooms:            rooms,
      bathrooms:        bathrooms,
      status:           status ?? this.status,
      video:            video,
      virtual360:       virtual360,
      additionalFeatures: additionalFeatures,
      viewsCount:       viewsCount,
      likesCount:       likesCount ?? this.likesCount,
      isVisible:        isVisible,
      isLiked:          isLiked ?? this.isLiked,
      isSaved:          isSaved ?? this.isSaved,
      createdAt:        createdAt,
      ownerId:          ownerId,
      ownerName:        ownerName,
      ownerPhoto:       ownerPhoto,
      ownerPhone:       ownerPhone,
      categoryId:       categoryId,
      categoryName:     categoryName,
      housingTypeId:    housingTypeId,
      typeName:         typeName,
      regionId:         regionId,
      regionName:       regionName,
      cityId:           cityId,
      cityName:         cityName,
      districtId:       districtId,
      districtName:     districtName,
      latitude:         latitude,
      longitude:        longitude,
      mainImage:        mainImage ?? this.mainImage,
      images:           images ?? this.images,
    );
  }

  // ── Computed ─────────────────────────────────────────────
  String get locationStr {
    final parts = <String>[];
    if (districtName != null && districtName!.isNotEmpty) parts.add(districtName!);
    if (cityName     != null && cityName!.isNotEmpty)     parts.add(cityName!);
    return parts.isNotEmpty ? parts.join(', ') : 'Cameroun';
  }

  bool get hasCoords  => latitude != null && longitude != null;
  bool get hasVideo   => video != null && video!.isNotEmpty;
  bool get isNew      => DateTime.now().difference(createdAt).inDays <= 7;
}

// ── HousingImage ─────────────────────────────────────────────
class HousingImage {
  final int    id;
  final String image;
  final bool   isMain;

  const HousingImage({required this.id, required this.image, required this.isMain});

  factory HousingImage.fromJson(Map<String, dynamic> json) => HousingImage(
    id:     (json['id'] as num?)?.toInt() ?? 0,
    image:  json['image'] as String? ?? '',
    isMain: json['is_main'] as bool? ?? false,
  );
}

// ── CategoryModel ────────────────────────────────────────────
class CategoryModel {
  final int    id;
  final String name;
  final String? description;

  const CategoryModel({required this.id, required this.name, this.description});

  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
    id:          (json['id'] as num).toInt(),
    name:        json['name'] as String? ?? '',
    description: json['description'] as String?,
  );
}

// ── HousingTypeModel ─────────────────────────────────────────
class HousingTypeModel {
  final int    id;
  final String name;

  const HousingTypeModel({required this.id, required this.name});

  factory HousingTypeModel.fromJson(Map<String, dynamic> json) =>
      HousingTypeModel(id: (json['id'] as num).toInt(), name: json['name'] as String? ?? '');
}

// ── RegionModel ──────────────────────────────────────────────
class RegionModel {
  final int    id;
  final String name;

  const RegionModel({required this.id, required this.name});

  factory RegionModel.fromJson(Map<String, dynamic> json) =>
      RegionModel(id: (json['id'] as num).toInt(), name: json['name'] as String? ?? '');
}

// ── CityModel ────────────────────────────────────────────────
class CityModel {
  final int    id;
  final String name;
  final int    regionId;

  const CityModel({required this.id, required this.name, required this.regionId});

  factory CityModel.fromJson(Map<String, dynamic> json) => CityModel(
    id:       (json['id'] as num).toInt(),
    name:     json['name'] as String? ?? '',
    regionId: _parseId(json['region']) ?? 0,
  );
}

// ── DistrictModel ────────────────────────────────────────────
class DistrictModel {
  final int    id;
  final String name;
  final int    cityId;

  const DistrictModel({required this.id, required this.name, required this.cityId});

  factory DistrictModel.fromJson(Map<String, dynamic> json) => DistrictModel(
    id:     (json['id'] as num).toInt(),
    name:   json['name'] as String? ?? '',
    cityId: _parseId(json['city']) ?? 0,
  );
}