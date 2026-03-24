// // ============================================
// // lib/data/models/visit_model.dart
// // ============================================

class VisitModel {
  final int id;
  final int housingId;
  final String housingTitle;
  final String? housingImage;
  final int? housingPrice;
  final String? housingAddress;
  final String? locataireName;
  final String? locatairePhone;
  final String? ownerName;
  final DateTime date;
  final String time;
  final String status;
  final String? message;
  final String? responseMessage;
  final DateTime createdAt;

  const VisitModel({
    required this.id,
    required this.housingId,
    required this.housingTitle,
    this.housingImage,
    this.housingPrice,
    this.housingAddress,
    this.locataireName,
    this.locatairePhone,
    this.ownerName,
    required this.date,
    required this.time,
    required this.status,
    this.message,
    this.responseMessage,
    required this.createdAt,
  });

  factory VisitModel.fromJson(Map<String, dynamic> json) => VisitModel(
        id: json['id'] ?? 0,
        housingId: json['housing'] ?? 0,
        housingTitle: json['housing_title'] ?? '',
        housingImage: json['housing_image'],
        housingPrice: json['housing_price'],
        housingAddress: json['housing_address'],
        locataireName: json['locataire_name'],
        locatairePhone: json['locataire_phone'],
        ownerName: json['owner_name'],
        date: json['date'] != null
            ? DateTime.tryParse(json['date']) ?? DateTime.now()
            : DateTime.now(),
        time: json['time'] ?? '09:00',
        status: json['status'] ?? 'attente',
        message: json['message'],
        responseMessage: json['response_message'],
        createdAt: json['created_at'] != null
            ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
            : DateTime.now(),
      );

  Map<String, dynamic> toJson() => {
        'housing': housingId,
        'date': '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
        'time': time,
        'message': message ?? '',
      };

  bool get isUpcoming {
    final parts = time.split(':');
    final h = int.tryParse(parts.isNotEmpty ? parts[0] : '9') ?? 9;
    final m = int.tryParse(parts.length > 1 ? parts[1] : '0') ?? 0;
    final visitDt = DateTime(date.year, date.month, date.day, h, m);
    return visitDt.isAfter(DateTime.now());
  }

  String get statusLabel {
    switch (status) {
      case 'confirme':
        return 'Confirmée';
      case 'refuse':
        return 'Refusée';
      case 'annule':
        return 'Annulée';
      default:
        return 'En attente';
    }
  }

  String get statusLabelEn {
    switch (status) {
      case 'confirme':
        return 'Confirmed';
      case 'refuse':
        return 'Refused';
      case 'annule':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  }
}