// lib/data/models/notification_model.dart
class NotificationModel {
  final int id;
  final String type;
  final String title;
  final String message;
  final String? link;
  final bool isRead;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.link,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      NotificationModel(
        id: json['id'],
        type: json['type'] ?? 'admin',
        title: json['title'] ?? '',
        message: json['message'] ?? '',
        link: json['link'],
        isRead: json['is_read'] ?? false,
        createdAt: json['created_at'] != null
            ? DateTime.tryParse(json['created_at']) ?? DateTime.now()
            : DateTime.now(),
      );

  NotificationModel copyWith({bool? isRead}) => NotificationModel(
    id: id,
    type: type,
    title: title,
    message: message,
    link: link,
    isRead: isRead ?? this.isRead,
    createdAt: createdAt,
  );

  String get iconName {
    switch (type) {
      case 'message': return 'message';
      case 'visit':
      case 'visit_confirmed':
      case 'visit_refused': return 'event';
      case 'new_housing': return 'home';
      default: return 'info';
    }
  }
}

