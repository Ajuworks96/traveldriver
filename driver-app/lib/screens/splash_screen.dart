import 'package:flutter/material.dart';
import '../core/storage/auth_storage.dart';
import 'login_screen.dart';
import 'main_navigation_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(seconds: 2));
    final token = await AuthStorage.getToken();
    final user = await AuthStorage.getUser();

    if (!mounted) return;

    if (token != null && user != null && user.role == 'DRIVER') {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFDBEAFE)),
              ),
              child: const Icon(
                Icons.navigation_rounded,
                size: 56,
                color: Color(0xFF2563EB),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'DriveSync Mobile',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Driver Operations Console',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(color: Color(0xFF2563EB)),
          ],
        ),
      ),
    );
  }
}
