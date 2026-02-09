import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _userController = TextEditingController();
  final _passController = TextEditingController();
  bool _isLoading = false;
  bool _canBiometric = false;

  @override
  void initState() {
    super.initState();
    _checkBiometrics();
  }

  Future<void> _checkBiometrics() async {
    final api = context.read<ApiService>();
    final canUse = await api.canUseBiometrics();
    if (mounted) {
      setState(() => _canBiometric = canUse);
      if (canUse) {
        // Optional: Auto-trigger biometrics on open
        _handleBiometricAuth();
      }
    }
  }

  void _handleBiometricAuth() async {
    final api = context.read<ApiService>();
    final success = await api.authenticateWithBiometrics();
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Identity Verified')),
      );
    }
  }

  void _handleLogin() async {
    if (_userController.text.isEmpty || _passController.text.isEmpty) return;
    setState(() => _isLoading = true);
    final success = await context.read<ApiService>().login(_userController.text, _passController.text);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification Failed: Invalid Credentials')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.settings_backup_restore_rounded),
          onPressed: () => context.read<ApiService>().setUrl(''), 
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Authentication',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'Secure access to your infrastructure',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 48),
            TextField(
              controller: _userController,
              decoration: InputDecoration(
                labelText: 'Administrator ID',
                prefixIcon: const Icon(Icons.person_outline_rounded),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _passController,
              decoration: InputDecoration(
                labelText: 'Access Key',
                prefixIcon: const Icon(Icons.lock_outline_rounded),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7000FF),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isLoading 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Authorize Login', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
            if (_canBiometric) ...[
              const SizedBox(height: 24),
              Center(
                child: TextButton.icon(
                  onPressed: _handleBiometricAuth,
                  icon: const Icon(Icons.fingerprint_rounded, color: Colors.cyanAccent),
                  label: const Text('Unlock with Biometrics', style: TextStyle(color: Colors.cyanAccent)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
