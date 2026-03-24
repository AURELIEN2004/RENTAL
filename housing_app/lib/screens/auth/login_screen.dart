// // ============================================
// // lib/screens/auth/login_screen.dart
// // ============================================


import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../data/providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _form     = GlobalKey<FormState>();
  final _userCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool  _obscure  = true;

  @override
  void dispose() {
    _userCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_form.currentState!.validate()) return;

    final auth = context.read<AuthProvider>();
    final ok   = await auth.login(
      _userCtrl.text.trim(),
      _passCtrl.text,
    );

    if (!mounted) return;

    if (ok) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Erreur de connexion'),
          backgroundColor: AppColors.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 32),
          child: Form(
            key: _form,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 32),

                // ── Logo ─────────────────────────────────
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(Icons.home_work_rounded,
                        color: Colors.white, size: 38),
                  ),
                ),
                const SizedBox(height: 28),

                // ── Titre ─────────────────────────────────
                const Text(
                  'Connexion',
                  style: TextStyle(
                    color: AppColors.textDark,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                const Text(
                  'Accédez à votre espace personnel',
                  style: TextStyle(
                    color: AppColors.textSecondaryDark,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),

                // ── Username ─────────────────────────────
                _buildField(
                  controller: _userCtrl,
                  label: 'Nom d\'utilisateur',
                  icon: Icons.person_outline_rounded,
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Champ requis' : null,
                ),
                const SizedBox(height: 16),

                // ── Password ─────────────────────────────
                _buildField(
                  controller: _passCtrl,
                  label: 'Mot de passe',
                  icon: Icons.lock_outline_rounded,
                  obscure: _obscure,
                  suffix: IconButton(
                    icon: Icon(
                      _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      color: AppColors.textMutedDark,
                      size: 20,
                    ),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Champ requis' : null,
                ),
                const SizedBox(height: 28),

                // ── Bouton connexion ─────────────────────
                Consumer<AuthProvider>(
                  builder: (_, auth, __) => ElevatedButton(
                    onPressed: auth.isLoading ? null : _login,
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
                        : const Text(
                            'Se connecter',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                  ),
                ),
                const SizedBox(height: 24),

                // ── Lien inscription ─────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Pas de compte ?',
                        style: TextStyle(
                            color: AppColors.textSecondaryDark, fontSize: 14)),
                    TextButton(
                      onPressed: () =>
                          Navigator.pushNamed(context, '/register'),
                      child: const Text('S\'inscrire',
                          style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600)),
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

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscure = false,
    Widget? suffix,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      validator: validator,
      style: const TextStyle(color: AppColors.textDark, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppColors.textSecondaryDark),
        prefixIcon: Icon(icon, color: AppColors.textMutedDark, size: 20),
        suffixIcon: suffix,
        filled: true,
        fillColor: AppColors.surfaceDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
      ),
    );
  }
}