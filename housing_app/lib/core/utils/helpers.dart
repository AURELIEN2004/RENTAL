// ============================================
// lib/core/utils/helpers.dart
// ============================================

import 'package:intl/intl.dart';

class Helpers {
  /// Formate un prix en FCFA
  static String formatPrice(int price) {
    final formatter = NumberFormat.currency(
      symbol: 'FCFA',
      decimalDigits: 0,
      locale: 'fr_FR',
    );
    return formatter.format(price);
  }
  
  /// Formate une date
  static String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy', 'fr_FR').format(date);
  }
  
  /// Formate une date relative (il y a X jours)
  static String formatRelativeTime(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays == 0) {
      return 'Aujourd\'hui';
    } else if (difference.inDays == 1) {
      return 'Hier';
    } else if (difference.inDays < 7) {
      return 'Il y a ${difference.inDays} jours';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return 'Il y a $weeks semaine${weeks > 1 ? 's' : ''}';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return 'Il y a $months mois';
    } else {
      final years = (difference.inDays / 365).floor();
      return 'Il y a $years an${years > 1 ? 's' : ''}';
    }
  }
  
  /// Tronque un texte
  static String truncateText(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }
  
  /// Valide un email
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(email);
  }
  
  /// Valide un numéro de téléphone camerounais
  static bool isValidPhone(String phone) {
    final phoneRegex = RegExp(r'^(\+237)?[26]\d{8}$');
    return phoneRegex.hasMatch(phone.replaceAll(' ', ''));
  }
  
  /// Calcule la distance entre deux points GPS (Haversine)
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double earthRadius = 6371; // km
    
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    
    final a = (sin(dLat / 2) * sin(dLat / 2)) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);
    
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    
    return earthRadius * c;
  }
  
  static double _toRadians(double degrees) {
    return degrees * (3.14159265359 / 180);
  }
  
  /// Importe math pour sin, cos, etc.
  static double sin(double radians) => 0.0; // Placeholder
  static double cos(double radians) => 0.0;
  static double atan2(double y, double x) => 0.0;
  static double sqrt(double value) => 0.0;
}