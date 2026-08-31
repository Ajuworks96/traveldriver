import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../storage/auth_storage.dart';
import '../../models/user.dart';
import '../../models/vehicle.dart';
import '../../models/trip.dart';

class ApiService {
  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthStorage.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // 1. Driver Login
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.login}');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final userData = User.fromJson(data['data']['user']);
        if (userData.role != 'DRIVER') {
          throw Exception('Access denied: Mobile app is for Drivers only');
        }
        await AuthStorage.saveSession(data['data']['accessToken'], userData);
        return {'success': true, 'user': userData};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'message': e.toString().replaceAll('Exception: ', '')};
    }
  }

  // 2. Fetch Active Trip
  static Future<Trip?> getActiveTrip() async {
    final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.activeTrip}');
    try {
      final headers = await _getHeaders();
      final response = await http.get(url, headers: headers);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true && data['data'] != null) {
        return Trip.fromJson(data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // 3. Start Trip
  static Future<Map<String, dynamic>> startTrip({
    required String vehicleId,
    required double startKm,
    required String destination,
    String? notes,
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.trips}');
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'vehicleId': vehicleId,
          'startKm': startKm,
          'destination': destination,
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 201 && data['success'] == true) {
        return {'success': true, 'trip': Trip.fromJson(data['data'])};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Failed to start trip'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network connection error'};
    }
  }

  // 4. Close Trip
  static Future<Map<String, dynamic>> closeTrip({
    required String tripId,
    required double closingKm,
    required double cashAmount,
    String? notes,
  }) async {
    final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.trips}/$tripId/close');
    try {
      final headers = await _getHeaders();
      final response = await http.patch(
        url,
        headers: headers,
        body: jsonEncode({
          'closingKm': closingKm,
          'cashAmount': cashAmount,
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'trip': Trip.fromJson(data['data'])};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Failed to close trip'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network connection error'};
    }
  }

  // 5. Fetch Driver Trip History
  static Future<List<Trip>> getTripHistory({String? status}) async {
    var uriStr = '${ApiConstants.baseUrl}${ApiConstants.trips}';
    if (status != null && status.isNotEmpty) {
      uriStr += '?status=$status';
    }
    final url = Uri.parse(uriStr);

    try {
      final headers = await _getHeaders();
      final response = await http.get(url, headers: headers);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List<dynamic> list = data['data'];
        return list.map((item) => Trip.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  // 6. Fetch Available Vehicles
  static Future<List<Vehicle>> getVehicles() async {
    final url = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.vehicles}?status=ACTIVE&limit=100');
    try {
      final headers = await _getHeaders();
      final response = await http.get(url, headers: headers);
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        final List<dynamic> list = data['data'];
        return list.map((item) => Vehicle.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
