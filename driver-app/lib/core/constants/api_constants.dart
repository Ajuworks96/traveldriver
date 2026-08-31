import 'package:flutter/foundation.dart';

class ApiConstants {
  // Dynamically determines API endpoint for Web, macOS Desktop, or Android Emulator
  static String get baseUrl {
    const customUrl = String.fromEnvironment('API_URL');
    if (customUrl.isNotEmpty) return customUrl;

    if (kIsWeb || defaultTargetPlatform == TargetPlatform.macOS || defaultTargetPlatform == TargetPlatform.iOS) {
      return 'http://localhost:5001/api/v1';
    }

    // Android Emulator loopback IP alias
    return 'http://10.0.2.2:5001/api/v1';
  }

  // Auth endpoints
  static const String login = '/auth/login';
  static const String me = '/auth/me';

  // Trip endpoints
  static const String trips = '/trips';
  static const String activeTrip = '/trips/active';

  // Driver vehicle listing endpoint
  static const String vehicles = '/vehicles';
}
