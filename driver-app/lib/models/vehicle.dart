class Vehicle {
  final String id;
  final String vehicleNumber;
  final String vehicleName;
  final String model;
  final String? status;

  Vehicle({
    required this.id,
    required this.vehicleNumber,
    required this.vehicleName,
    required this.model,
    this.status,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String,
      vehicleNumber: json['vehicleNumber'] as String,
      vehicleName: json['vehicleName'] as String,
      model: json['model'] as String,
      status: json['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'vehicleNumber': vehicleNumber,
      'vehicleName': vehicleName,
      'model': model,
      'status': status,
    };
  }
}
