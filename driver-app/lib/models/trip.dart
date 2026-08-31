import 'vehicle.dart';
import 'user.dart';

class Trip {
  final String id;
  final String driverId;
  final String vehicleId;
  final String destination;
  final double startKm;
  final double? closingKm;
  final double? totalKm;
  final double? cashAmount;
  final DateTime startTime;
  final DateTime? endTime;
  final String status;
  final String? notes;
  final Vehicle? vehicle;
  final User? driver;

  Trip({
    required this.id,
    required this.driverId,
    required this.vehicleId,
    required this.destination,
    required this.startKm,
    this.closingKm,
    this.totalKm,
    this.cashAmount,
    required this.startTime,
    this.endTime,
    required this.status,
    this.notes,
    this.vehicle,
    this.driver,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      return double.tryParse(value.toString()) ?? 0.0;
    }

    return Trip(
      id: json['id'] as String,
      driverId: json['driverId'] as String,
      vehicleId: json['vehicleId'] as String,
      destination: json['destination'] as String,
      startKm: parseDouble(json['startKm']),
      closingKm: json['closingKm'] != null ? parseDouble(json['closingKm']) : null,
      totalKm: json['totalKm'] != null ? parseDouble(json['totalKm']) : null,
      cashAmount: json['cashAmount'] != null ? parseDouble(json['cashAmount']) : null,
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: json['endTime'] != null ? DateTime.parse(json['endTime'] as String) : null,
      status: json['status'] as String,
      notes: json['notes'] as String?,
      vehicle: json['vehicle'] != null ? Vehicle.fromJson(json['vehicle']) : null,
      driver: json['driver'] != null ? User.fromJson(json['driver']) : null,
    );
  }
}
