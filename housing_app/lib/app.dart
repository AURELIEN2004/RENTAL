// ============================================
// lib/app.dart
// ============================================

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/l10n/app_localizations.dart';
import 'data/providers/auth_provider.dart';
import 'data/providers/theme_provider.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/main_navigation.dart';
import 'screens/housing/housing_detail_screen.dart';
import 'screens/housing/add_housing_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/support/support_screen.dart';
import 'screens/preferences/preferences_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/visits/visits_screen.dart';
import 'screens/messaging/chat_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, theme, _) => L10nProvider(
        language: theme.language,
        child: MaterialApp(
          title: 'RentAL',
          debugShowCheckedModeBanner: false,
          theme:     AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: theme.isDarkMode ? ThemeMode.dark : ThemeMode.light,
          home: const SplashScreen(),
          routes: {
            '/login':         (_) => const LoginScreen(),
            '/register':      (_) => const RegisterScreen(),
            '/home':          (_) => const MainNavigation(),
            '/notifications': (_) => const NotificationsScreen(),
            '/visits':        (_) => const VisitsScreen(),
            '/add-housing':   (_) => const AddHousingScreen(),
            '/edit-profile':  (_) => const EditProfileScreen(),
            '/support':       (_) => const SupportScreen(),
            '/preferences':   (_) => const PreferencesScreen(),
          },
          onGenerateRoute: (settings) {
            final name = settings.name ?? '';
            if (name == '/chat') {
              final args = settings.arguments;
              if (args is Map<String, dynamic>) {
                return MaterialPageRoute(
                    builder: (_) => ChatScreen.fromArgs(args),
                    settings: settings);
              }
              return MaterialPageRoute(
                  builder: (_) => const MainNavigation());
            }
            if (name.startsWith('/housing/')) {
              final id = int.tryParse(
                  name.replaceFirst('/housing/', ''));
              if (id != null) {
                return MaterialPageRoute(
                    builder: (_) => HousingDetailScreen(housingId: id),
                    settings: settings);
              }
            }
            return MaterialPageRoute(
                builder: (_) => const MainNavigation());
          },
        ),
      ),
    );
  }
}







