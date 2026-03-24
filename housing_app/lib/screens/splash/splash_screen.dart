// // /// ============================================
// // // lib/screens/splash/splash_screen.dart
// // // ============================================



import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../data/providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _anim;
  late Animation<double>   _fade;
  late Animation<double>   _scale;

  @override
  void initState() {
    super.initState();

    _anim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _anim, curve: const Interval(0, 0.6)),
    );
    _scale = Tween<double>(begin: 0.7, end: 1).animate(
      CurvedAnimation(parent: _anim, curve: Curves.elasticOut),
    );
    _anim.forward();

    // ✅ FIX : addPostFrameCallback garantit que _init() s'exécute
    // APRÈS le premier build → plus de "setState during build"
    WidgetsBinding.instance.addPostFrameCallback((_) => _init());
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  Future<void> _init() async {
    final auth = context.read<AuthProvider>();

    await Future.wait([
      auth.checkAuth(),
      Future.delayed(const Duration(milliseconds: 2000)),
    ]);

    if (!mounted) return;

    if (auth.isAuthenticated) {
      Navigator.of(context).pushReplacementNamed('/home');
    } else {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Center(
        child: AnimatedBuilder(
          animation: _anim,
          builder: (_, __) => FadeTransition(
            opacity: _fade,
            child: ScaleTransition(
              scale: _scale,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.4),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.home_work_rounded,
                      color: Colors.white,
                      size: 48,
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'RentAL',
                    style: TextStyle(
                      color: AppColors.textDark,
                      fontSize: 34,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),

                  const Text(
                    'Trouvez votre chez-vous au Cameroun',
                    style: TextStyle(
                      color: AppColors.textSecondaryDark,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 56),

                  const SizedBox(
                    width: 28,
                    height: 28,
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                      strokeWidth: 2.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}