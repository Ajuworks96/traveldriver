import 'package:flutter/material.dart';
import '../core/network/api_service.dart';
import 'driver_dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter both email and password';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await ApiService.login(email, password);

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const DriverDashboardScreen()),
      );
    } else {
      setState(() {
        _errorMessage = result['message'] ?? 'Login failed. Please verify credentials.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.navigation_rounded,
                    size: 48,
                    color: Color(0xFF2563EB),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Driver Sign In',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Enter your registered driver account credentials',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 32),

              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: const Color(0x26F43F5E),
                    border: Border.all(color: const Color(0x66F43F5E)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Color(0xFFF87171)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Color(0xFFF87171), fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),

              const Text(
                'Email Address',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(fontSize: 16, color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'driver@travelagency.com',
                  prefixIcon: Icon(Icons.email_outlined, color: Color(0xFF64748B)),
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Password',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: const TextStyle(fontSize: 16, color: Colors.white),
                decoration: const InputDecoration(
                  hintText: '••••••••',
                  prefixIcon: Icon(Icons.lock_outline, color: Color(0xFF64748B)),
                ),
              ),
              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5),
                      )
                    : const Text(
                        'SIGN IN',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
