// // ============================================
// // lib/data/models/user_model.dart
// // ============================================


class UserModel {
  final int id;
  final String username;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? photo;
  final bool isLocataire;
  final bool isProprietaire;
  final bool isStaff;

  const UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.firstName,
    this.lastName,
    this.phone,
    this.photo,
    this.isLocataire = false,
    this.isProprietaire = false,
    this.isStaff = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] ?? 0,
        username: json['username'] ?? '',
        email: json['email'] ?? '',
        firstName: json['first_name'],
        lastName: json['last_name'],
        phone: json['phone'],
        photo: json['photo'],
        isLocataire: json['is_locataire'] ?? false,
        isProprietaire: json['is_proprietaire'] ?? false,
        isStaff: json['is_staff'] ?? false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'email': email,
        'first_name': firstName,
        'last_name': lastName,
        'phone': phone,
        'photo': photo,
        'is_locataire': isLocataire,
        'is_proprietaire': isProprietaire,
      };

  String get fullName {
    final parts = [firstName ?? '', lastName ?? ''].where((s) => s.isNotEmpty);
    return parts.isNotEmpty ? parts.join(' ') : username;
  }

  String get initials {
    if (firstName != null && firstName!.isNotEmpty) {
      return firstName![0].toUpperCase();
    }
    return username.isNotEmpty ? username[0].toUpperCase() : 'U';
  }
}