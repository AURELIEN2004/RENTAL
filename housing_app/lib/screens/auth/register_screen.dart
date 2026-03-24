// // ============================================
// // lib/screens/auth/register_screen.dart
// // ============================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../data/providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _form      = GlobalKey<FormState>();
  final _userCtrl  = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  final _confCtrl  = TextEditingController();

  bool _obscurePass  = true;
  bool _obscureConf  = true;
  bool _isProprietaire = false;

  @override
  void dispose() {
    _userCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    _confCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_form.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final ok = await auth.register(
      username: _userCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      password: _passCtrl.text,
      isProprietaire: _isProprietaire,
    );

    if (!mounted) return;

    if (ok) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Erreur lors de l\'inscription'),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        foregroundColor: AppColors.textDark,
        title: const Text('Créer un compte'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _form,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _field(_userCtrl, 'Nom d\'utilisateur', Icons.person_outline_rounded,
                    validator: (v) => v == null || v.length < 3
                        ? 'Min 3 caractères'
                        : null),
                const SizedBox(height: 14),
                _field(_emailCtrl, 'Email', Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => v != null && v.contains('@')
                        ? null
                        : 'Email invalide'),
                const SizedBox(height: 14),
                _field(_phoneCtrl, 'Téléphone', Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                    hintText: '6XXXXXXXX',
                    validator: (v) => v == null || v.length < 9
                        ? 'Numéro invalide'
                        : null),
                const SizedBox(height: 14),
                _field(_passCtrl, 'Mot de passe', Icons.lock_outline_rounded,
                    obscure: _obscurePass,
                    suffix: _eyeBtn(_obscurePass,
                        () => setState(() => _obscurePass = !_obscurePass)),
                    validator: (v) => v != null && v.length >= 8
                        ? null
                        : 'Min 8 caractères'),
                const SizedBox(height: 14),
                _field(_confCtrl, 'Confirmer le mot de passe',
                    Icons.lock_outline_rounded,
                    obscure: _obscureConf,
                    suffix: _eyeBtn(_obscureConf,
                        () => setState(() => _obscureConf = !_obscureConf)),
                    validator: (v) => v == _passCtrl.text
                        ? null
                        : 'Mots de passe différents'),
                const SizedBox(height: 20),

                // ── Type de compte ─────────────────────────
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceDark,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderDark),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Type de compte',
                          style: TextStyle(
                              color: AppColors.textDark,
                              fontWeight: FontWeight.w600)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _roleCard(
                              title: 'Locataire',
                              subtitle: 'Je cherche',
                              icon: Icons.search_rounded,
                              selected: !_isProprietaire,
                              onTap: () =>
                                  setState(() => _isProprietaire = false),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _roleCard(
                              title: 'Propriétaire',
                              subtitle: 'Je loue',
                              icon: Icons.home_work_outlined,
                              selected: _isProprietaire,
                              onTap: () =>
                                  setState(() => _isProprietaire = true),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                Consumer<AuthProvider>(
                  builder: (_, auth, __) => ElevatedButton(
                    onPressed: auth.isLoading ? null : _register,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: auth.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('S\'inscrire',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Déjà un compte ?',
                        style: TextStyle(
                            color: AppColors.textSecondaryDark)),
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Se connecter',
                          style: TextStyle(color: AppColors.primary)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController ctrl,
    String label,
    IconData icon, {
    bool obscure = false,
    Widget? suffix,
    String? hintText,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: ctrl,
      obscureText: obscure,
      keyboardType: keyboardType,
      validator: validator,
      style: const TextStyle(color: AppColors.textDark, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        labelStyle:
            const TextStyle(color: AppColors.textSecondaryDark, fontSize: 13),
        hintStyle: const TextStyle(
            color: AppColors.textMutedDark, fontSize: 13),
        prefixIcon:
            Icon(icon, color: AppColors.textMutedDark, size: 20),
        suffixIcon: suffix,
        filled: true,
        fillColor: AppColors.surfaceDark,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide:
                const BorderSide(color: AppColors.borderDark)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide:
                const BorderSide(color: AppColors.borderDark)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(
                color: AppColors.primary, width: 1.5)),
        errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide:
                const BorderSide(color: AppColors.danger)),
      ),
    );
  }

  Widget _eyeBtn(bool obscure, VoidCallback onTap) => IconButton(
        icon: Icon(
          obscure
              ? Icons.visibility_off_outlined
              : Icons.visibility_outlined,
          color: AppColors.textMutedDark,
          size: 20,
        ),
        onPressed: onTap,
      );

  Widget _roleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withOpacity(0.15)
              : AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
                selected ? AppColors.primary : AppColors.borderDark,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon,
                color: selected
                    ? AppColors.primary
                    : AppColors.textSecondaryDark,
                size: 26),
            const SizedBox(height: 6),
            Text(title,
                style: TextStyle(
                    color: selected
                        ? AppColors.primary
                        : AppColors.textDark,
                    fontWeight: FontWeight.w600,
                    fontSize: 13)),
            Text(subtitle,
                style: const TextStyle(
                    color: AppColors.textSecondaryDark,
                    fontSize: 11)),
          ],
        ),
      ),
    );
  }
}