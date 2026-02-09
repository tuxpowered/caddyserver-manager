import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'screens/setup_screen.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  MobileAds.instance.initialize();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ApiService()),
      ],
      child: const CaddyManagerApp(),
    ),
  );
}

class CaddyManagerApp extends StatelessWidget {
  const CaddyManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Caddy Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF00F2FF),
        scaffoldBackgroundColor: const Color(0xFF0B0D17),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00F2FF),
          secondary: Color(0xFF7000FF),
        ),
        cardTheme: CardTheme(
          color: const Color(0xFF161B22),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      home: Consumer<ApiService>(
        builder: (context, api, child) {
          if (!api.hasUrl) return const SetupScreen();
          if (!api.isAuthenticated) return const LoginScreen();
          return const DashboardScreen();
        },
      ),
    );
  }
}
