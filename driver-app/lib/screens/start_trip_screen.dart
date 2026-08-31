import 'package:flutter/material.dart';
import '../core/network/api_service.dart';
import '../models/vehicle.dart';

class StartTripScreen extends StatefulWidget {
  const StartTripScreen({super.key});

  @override
  State<StartTripScreen> createState() => _StartTripScreenState();
}

class _StartTripScreenState extends State<StartTripScreen> {
  final _formKey = GlobalKey<FormState>();
  final _startKmController = TextEditingController();
  final _destinationController = TextEditingController();
  final _notesController = TextEditingController();

  List<Vehicle> _vehicles = [];
  Vehicle? _selectedVehicle;
  bool _isLoadingVehicles = true;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchVehicles();
  }

  Future<void> _fetchVehicles() async {
    final list = await ApiService.getVehicles();
    if (!mounted) return;
    setState(() {
      _vehicles = list;
      if (list.isNotEmpty) {
        _selectedVehicle = list.first;
      }
      _isLoadingVehicles = false;
    });
  }

  Future<void> _handleStartTrip() async {
    if (!_formKey.currentState!.validate() || _selectedVehicle == null) {
      if (_selectedVehicle == null) {
        setState(() {
          _errorMessage = 'Please select a vehicle from the list';
        });
      }
      return;
    }

    final startKm = double.tryParse(_startKmController.text.trim());
    if (startKm == null || startKm < 0) {
      setState(() {
        _errorMessage = 'Starting KM must be zero or greater';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final result = await ApiService.startTrip(
      vehicleId: _selectedVehicle!.id,
      startKm: startKm,
      destination: _destinationController.text.trim(),
      notes: _notesController.text.trim(),
    );

    setState(() {
      _isSubmitting = false;
    });

    if (result['success'] == true) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Trip initiated successfully!'),
          backgroundColor: Color(0xFF16A34A),
        ),
      );
      Navigator.of(context).pop();
    } else {
      setState(() {
        _errorMessage = result['message'] ?? 'Failed to start trip';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Start New Assignment',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          child: _isLoadingVehicles
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (_errorMessage != null)
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 20),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFCA5A5)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, color: Color(0xFFDC2626)),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    _errorMessage!,
                                    style: const TextStyle(color: Color(0xFF991B1B), fontSize: 13),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        const Text(
                          'Select Fleet Vehicle',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 8),

                        if (_vehicles.isEmpty)
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFDE68A)),
                            ),
                            child: const Text(
                              'No registered fleet vehicles found. Please contact Admin.',
                              style: TextStyle(color: Color(0xFFB45309), fontSize: 13),
                            ),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<Vehicle>(
                                value: _selectedVehicle,
                                isExpanded: true,
                                dropdownColor: Colors.white,
                                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF64748B)),
                                items: _vehicles.map((v) {
                                  return DropdownMenuItem<Vehicle>(
                                    value: v,
                                    child: Row(
                                      children: [
                                        const Icon(Icons.directions_car_filled_rounded, color: Color(0xFF2563EB), size: 20),
                                        const SizedBox(width: 10),
                                        Text(
                                          '${v.vehicleName} (${v.vehicleNumber})',
                                          style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                                onChanged: (val) {
                                  setState(() {
                                    _selectedVehicle = val;
                                  });
                                },
                              ),
                            ),
                          ),

                        const SizedBox(height: 20),

                        const Text(
                          'Starting Odometer Reading (KM)',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _startKmController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold),
                          decoration: const InputDecoration(
                            hintText: 'e.g. 45200',
                            prefixIcon: Icon(Icons.speed_rounded, color: Color(0xFF2563EB)),
                            suffixText: 'KM',
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Please enter current odometer reading';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 20),

                        const Text(
                          'Destination / Customer Name',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _destinationController,
                          style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
                          decoration: const InputDecoration(
                            hintText: 'e.g. Kochi Airport Drop / Grand Hyatt',
                            prefixIcon: Icon(Icons.place_rounded, color: Color(0xFF2563EB)),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Please enter trip destination or customer details';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 20),

                        const Text(
                          'Trip Notes (Optional)',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _notesController,
                          maxLines: 2,
                          style: const TextStyle(color: Color(0xFF0F172A)),
                          decoration: const InputDecoration(
                            hintText: 'e.g. Flight arrival @ 4:30 PM, AC Sedan requested',
                            prefixIcon: Icon(Icons.edit_note_rounded, color: Color(0xFF2563EB)),
                          ),
                        ),

                        const SizedBox(height: 32),

                        ElevatedButton.icon(
                          onPressed: _isSubmitting ? null : _handleStartTrip,
                          icon: _isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Icon(Icons.play_arrow_rounded, size: 24),
                          label: Text(_isSubmitting ? 'INITIATING TRIP...' : 'START TRIP NOW'),
                        ),
                      ],
                    ),
                  ),
                ),
        ),
      ),
    );
  }
}
