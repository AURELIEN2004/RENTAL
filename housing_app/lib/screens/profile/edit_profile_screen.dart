// lib/screens/profile/edit_profile_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_localizations.dart';
import '../../data/providers/auth_provider.dart';
import '../../data/providers/theme_provider.dart';
import '../../data/services/api_service.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});
  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _form        = GlobalKey<FormState>();
  final _firstCtrl   = TextEditingController();
  final _lastCtrl    = TextEditingController();
  final _emailCtrl   = TextEditingController();
  final _phoneCtrl   = TextEditingController();
  final _passCtrl    = TextEditingController();
  final _confCtrl    = TextEditingController();
  File?  _photo;
  bool   _saving     = false;
  bool   _obscureP   = true;
  bool   _obscureC   = true;
  bool   _showPass   = false;
  final  _api        = ApiService();

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    if (user != null) {
      _firstCtrl.text = user.firstName ?? '';
      _lastCtrl.text  = user.lastName  ?? '';
      _emailCtrl.text = user.email;
      _phoneCtrl.text = user.phone     ?? '';
    }
  }

  @override
  void dispose() {
    _firstCtrl.dispose(); _lastCtrl.dispose();
    _emailCtrl.dispose(); _phoneCtrl.dispose();
    _passCtrl.dispose();  _confCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery, imageQuality: 80);
    if (picked != null) setState(() => _photo = File(picked.path));
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final fields = {
        'first_name': _firstCtrl.text.trim(),
        'last_name':  _lastCtrl.text.trim(),
        'email':      _emailCtrl.text.trim(),
        'phone':      _phoneCtrl.text.trim(),
        if (_passCtrl.text.isNotEmpty) 'password': _passCtrl.text,
      };
      final user = await _api.updateProfileWithPhoto(fields, _photo);
      // Mettre à jour le provider
      await context.read<AuthProvider>().updateProfile(fields);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Profil mis à jour ✓'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Erreur : $e'),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
        ));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark    = context.watch<ThemeProvider>().isDarkMode;
    final user      = context.watch<AuthProvider>().user;
    final l10n      = context.l10n;
    final bg        = isDark ? AppColors.bgDark : AppColors.bgLight;
    final textColor = isDark ? AppColors.textDark : AppColors.textLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: bg,
        title: Text(l10n.editProfile,
            style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        iconTheme: IconThemeData(color: textColor),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(width: 18, height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                : const Text('Enregistrer',
                    style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Avatar ───────────────────────────────────
              Center(
                child: GestureDetector(
                  onTap: _pickPhoto,
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 52,
                        backgroundColor: AppColors.primary.withOpacity(0.15),
                        backgroundImage: _photo != null
                            ? FileImage(_photo!) as ImageProvider
                            : (user?.photo != null ? NetworkImage(user!.photo!) : null),
                        child: (_photo == null && user?.photo == null)
                            ? Text(user?.initials ?? 'U',
                                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.primary))
                            : null,
                      ),
                      Positioned(
                        bottom: 2, right: 2,
                        child: Container(
                          width: 28, height: 28,
                          decoration: BoxDecoration(
                            color: AppColors.primary, shape: BoxShape.circle,
                            border: Border.all(color: bg, width: 2),
                          ),
                          child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 6),
              const Center(
                child: Text('Appuyez pour changer la photo',
                    style: TextStyle(color: AppColors.textMutedDark, fontSize: 12)),
              ),
              const SizedBox(height: 28),

              _sectionLabel('Informations personnelles', isDark),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _field(_firstCtrl, 'Prénom', Icons.person_outline_rounded, isDark, required: true)),
                  const SizedBox(width: 12),
                  Expanded(child: _field(_lastCtrl, 'Nom', Icons.person_outline_rounded, isDark)),
                ],
              ),
              const SizedBox(height: 12),
              _field(_emailCtrl, 'Email', Icons.email_outlined, isDark,
                  keyboardType: TextInputType.emailAddress, required: true,
                  validator: (v) => v != null && v.contains('@') ? null : 'Email invalide'),
              const SizedBox(height: 12),
              _field(_phoneCtrl, 'Téléphone', Icons.phone_outlined, isDark,
                  keyboardType: TextInputType.phone,
                  validator: (v) => v != null && v.length >= 9 ? null : 'Numéro invalide'),
              const SizedBox(height: 24),

              // ── Changer mot de passe ──────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _sectionLabel('Mot de passe', isDark),
                  TextButton(
                    onPressed: () => setState(() => _showPass = !_showPass),
                    child: Text(_showPass ? 'Annuler' : 'Modifier',
                        style: const TextStyle(color: AppColors.primary, fontSize: 12)),
                  ),
                ],
              ),
              if (_showPass) ...[
                const SizedBox(height: 12),
                _field(_passCtrl, 'Nouveau mot de passe', Icons.lock_outline_rounded, isDark,
                    obscure: _obscureP,
                    suffix: IconButton(
                      icon: Icon(_obscureP ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          size: 18, color: AppColors.textMutedDark),
                      onPressed: () => setState(() => _obscureP = !_obscureP),
                    ),
                    validator: (v) => v == null || v.isEmpty || v.length >= 8 ? null : 'Min 8 caractères'),
                const SizedBox(height: 12),
                _field(_confCtrl, 'Confirmer le mot de passe', Icons.lock_outline_rounded, isDark,
                    obscure: _obscureC,
                    suffix: IconButton(
                      icon: Icon(_obscureC ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          size: 18, color: AppColors.textMutedDark),
                      onPressed: () => setState(() => _obscureC = !_obscureC),
                    ),
                    validator: (v) => _passCtrl.text.isEmpty || v == _passCtrl.text
                        ? null : 'Mots de passe différents'),
              ],
              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _saving
                      ? const SizedBox(width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Enregistrer les modifications',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionLabel(String text, bool isDark) => Text(text,
      style: TextStyle(
          color: isDark ? AppColors.textDark : AppColors.textLight,
          fontWeight: FontWeight.bold, fontSize: 15));

  Widget _field(TextEditingController ctrl, String label, IconData icon, bool isDark, {
    bool obscure = false, Widget? suffix, TextInputType keyboardType = TextInputType.text,
    bool required = false, String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: ctrl,
      obscureText: obscure,
      keyboardType: keyboardType,
      style: TextStyle(color: isDark ? AppColors.textDark : AppColors.textLight, fontSize: 14),
      validator: validator ?? (required ? (v) => v == null || v.trim().isEmpty ? 'Champ requis' : null : null),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight, fontSize: 13),
        prefixIcon: Icon(icon, color: AppColors.textMutedDark, size: 18),
        suffixIcon: suffix,
        filled: true,
        fillColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.danger)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
    );
  }
}