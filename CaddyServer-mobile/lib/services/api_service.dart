import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService extends ChangeNotifier {
  String? _baseUrl;
  String? _token;
  final _storage = const FlutterSecureStorage();
  final _auth = LocalAuthentication();
  Map<String, dynamic>? _publicSettings;

  ApiService() {
    _loadFromPrefs();
  }

  bool get hasUrl => _baseUrl != null && _baseUrl!.isNotEmpty;
  bool get isAuthenticated => _token != null;
  String? get baseUrl => _baseUrl;
  Map<String, dynamic>? get publicSettings => _publicSettings;

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _baseUrl = prefs.getString('api_url');
    _token = await _storage.read(key: 'auth_token');
    if (_baseUrl != null) {
      fetchPublicSettings();
    }
    notifyListeners();
  }

  Future<bool> setUrl(String url) async {
    try {
      if (url.isEmpty) {
         _baseUrl = null;
         final prefs = await SharedPreferences.getInstance();
         await prefs.remove('api_url');
         notifyListeners();
         return true;
      }
      if (!url.startsWith('http')) url = 'http://$url';
      if (url.endsWith('/')) url = url.substring(0, url.length - 1);

      final response = await http.get(Uri.parse('$url/api/ping')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        _baseUrl = url;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('api_url', url);
        fetchPublicSettings();
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Error setting URL: $e');
    }
    return false;
  }

  Future<bool> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        await _storage.write(key: 'auth_token', value: _token!);
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }
    return false;
  }

  Future<void> fetchPublicSettings() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/settings/public'));
      if (response.statusCode == 200) {
        _publicSettings = jsonDecode(response.body);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Public settings error: $e');
    }
  }

  Future<Map<String, dynamic>?> fetchSystemStatus() async {
    if (_baseUrl == null || _token == null) return null;
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/system/status'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('System status error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> fetchDomains() async {
    if (_baseUrl == null || _token == null) return null;
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/domains'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Domains fetch error: $e');
    }
    return null;
  }

  Future<bool> renewSsl(String domainId) async {
    if (_baseUrl == null || _token == null) return false;
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/domains/$domainId/ssl/renew'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('SSL renewal error: $e');
    }
    return false;
  }

  Future<bool> restartService() async {
    if (_baseUrl == null || _token == null) return false;
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/system/restart'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Restart error: $e');
    }
    return false;
  }

  Future<String?> fetchLogs() async {
    if (_baseUrl == null || _token == null) return null;
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/system/logs'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body)['logs'];
      }
    } catch (e) {
      debugPrint('Logs fetch error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> fetchStreams() async {
    if (_baseUrl == null || _token == null) return null;
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/streams'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Streams fetch error: $e');
    }
    return null;
  }

  Future<bool> canUseBiometrics() async {
    try {
      final hasToken = await _storage.read(key: 'auth_token') != null;
      if (!hasToken) return false;
      
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _auth.isDeviceSupported();
      return canAuthenticate;
    } catch (e) {
      return false;
    }
  }

  Future<bool> authenticateWithBiometrics() async {
    try {
      final bool didAuthenticate = await _auth.authenticate(
        localizedReason: 'Please authenticate to unlock Caddy Manager',
        options: const AuthenticationOptions(stickyAuth: true, biometricOnly: true),
      );
      if (didAuthenticate) {
        _token = await _storage.read(key: 'auth_token');
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Biometric auth error: $e');
    }
    return false;
  }

  void logout() async {
    _token = null;
    await _storage.delete(key: 'auth_token');
    notifyListeners();
  }
}
