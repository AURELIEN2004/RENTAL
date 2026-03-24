// ============================================
// lib/core/utils/validators.dart
// ============================================

class Validators {
  // Validation email
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'L\'email est requis';
    }
    
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    
    if (!emailRegex.hasMatch(value)) {
      return 'Email invalide';
    }
    
    return null;
  }

  // Validation mot de passe
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le mot de passe est requis';
    }
    
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    // Vérifie qu'il contient au moins une lettre et un chiffre
    if (!value.contains(RegExp(r'[A-Za-z]')) || 
        !value.contains(RegExp(r'[0-9]'))) {
      return 'Le mot de passe doit contenir des lettres et des chiffres';
    }
    
    return null;
  }

  // Validation confirmation mot de passe
  static String? validateConfirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) {
      return 'Confirmez votre mot de passe';
    }
    
    if (value != password) {
      return 'Les mots de passe ne correspondent pas';
    }
    
    return null;
  }

  // Validation nom d'utilisateur
  static String? validateUsername(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le nom d\'utilisateur est requis';
    }
    
    if (value.length < 3) {
      return 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (value.length > 30) {
      return 'Le nom ne peut pas dépasser 30 caractères';
    }
    
    // Vérifie que le nom ne contient que des caractères alphanumériques et underscores
    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(value)) {
      return 'Le nom ne peut contenir que des lettres, chiffres et underscores';
    }
    
    return null;
  }

  // Validation téléphone
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le numéro de téléphone est requis';
    }
    
    // Format camerounais : +237XXXXXXXXX ou 6XXXXXXXX
    final phoneRegex = RegExp(r'^(\+237|237)?[6][0-9]{8}$');
    
    if (!phoneRegex.hasMatch(value.replaceAll(' ', ''))) {
      return 'Numéro de téléphone invalide (ex: 659887452)';
    }
    
    return null;
  }

  // Validation prix
  static String? validatePrice(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le prix est requis';
    }
    
    final price = int.tryParse(value);
    if (price == null) {
      return 'Prix invalide';
    }
    
    if (price < 0) {
      return 'Le prix doit être positif';
    }
    
    if (price < 5000) {
      return 'Le prix minimum est 5000 FCFA';
    }
    
    return null;
  }

  // Validation superficie
  static String? validateArea(String? value) {
    if (value == null || value.isEmpty) {
      return 'La superficie est requise';
    }
    
    final area = int.tryParse(value);
    if (area == null) {
      return 'Superficie invalide';
    }
    
    if (area < 1) {
      return 'La superficie doit être positive';
    }
    
    if (area > 10000) {
      return 'Superficie trop grande (max 10000m²)';
    }
    
    return null;
  }

  // Validation nombre de pièces
  static String? validateRooms(String? value) {
    if (value == null || value.isEmpty) {
      return 'Requis';
    }
    
    final rooms = int.tryParse(value);
    if (rooms == null) {
      return 'Invalide';
    }
    
    if (rooms < 1) {
      return 'Min: 1';
    }
    
    if (rooms > 20) {
      return 'Max: 20';
    }
    
    return null;
  }

  // Validation titre
  static String? validateTitle(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le titre est requis';
    }
    
    if (value.length < 10) {
      return 'Le titre doit contenir au moins 10 caractères';
    }
    
    if (value.length > 100) {
      return 'Le titre ne peut pas dépasser 100 caractères';
    }
    
    return null;
  }

  // Validation description
  static String? validateDescription(String? value) {
    if (value == null || value.isEmpty) {
      return 'La description est requise';
    }
    
    if (value.length < 20) {
      return 'La description doit contenir au moins 20 caractères';
    }
    
    if (value.length > 1000) {
      return 'La description ne peut pas dépasser 1000 caractères';
    }
    
    return null;
  }

  // Validation URL
  static String? validateUrl(String? value) {
    if (value == null || value.isEmpty) {
      return null; // URL optionnelle
    }
    
    final urlRegex = RegExp(
      r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$',
    );
    
    if (!urlRegex.hasMatch(value)) {
      return 'URL invalide';
    }
    
    return null;
  }

  // Validation message
  static String? validateMessage(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le message ne peut pas être vide';
    }
    
    if (value.length > 2000) {
      return 'Le message ne peut pas dépasser 2000 caractères';
    }
    
    return null;
  }

  // Validation générique (non vide)
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName est requis';
    }
    return null;
  }

  // Validation numérique générique
  static String? validateNumber(String? value, {int? min, int? max}) {
    if (value == null || value.isEmpty) {
      return 'Requis';
    }
    
    final number = int.tryParse(value);
    if (number == null) {
      return 'Nombre invalide';
    }
    
    if (min != null && number < min) {
      return 'Min: $min';
    }
    
    if (max != null && number > max) {
      return 'Max: $max';
    }
    
    return null;
  }

  // Validation date
  static String? validateDate(DateTime? value) {
    if (value == null) {
      return 'La date est requise';
    }
    
    final now = DateTime.now();
    if (value.isBefore(now)) {
      return 'La date doit être dans le futur';
    }
    
    final maxDate = now.add(const Duration(days: 90));
    if (value.isAfter(maxDate)) {
      return 'La date ne peut pas dépasser 90 jours';
    }
    
    return null;
  }
}
