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
          content: Text('Trip started successfully!'),
          backgroundColor: Color(0xFF10B981),
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
      appBar: AppBar(
        title: const Text('Start New Trip'),
      ),
      body: _isLoadingVehicles
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
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
                          color: const Color(0x26F43F5E),
                          border: Border.all(color: const Color(0x66F43F5E)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Color(0xFFF87171), fontSize: 13),
                        ),
                      ),

                    const Text(
                      'Select Fleet Vehicle *',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<Vehicle>(
                      value: _selectedVehicle,
                      items: _vehicles.map((v) {
                        return DropdownMenuItem(
                          value: v,
                          child: Text(
                            '${v.vehicleName} (${v.vehicleNumber})',
                            style: const TextStyle(color: Colors.white, fontSize: 15),
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setState(() {
                          _selectedVehicle = val;
                        });
                      },
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.directions_car, color: Color(0xFF64748B)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Starting Odometer Reading (KM) *',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _startKmController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: const TextStyle(fontSize: 16, color: Colors.white),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Starting KM is required';
                        final num = double.tryParse(val.trim());
                        if (num == null || num < 0) return 'Enter a valid non-negative number';
                        return null;
                      },
                      decoration: const InputDecoration(
                        hintText: 'e.g. 45250.0',
                        prefixIcon: Icon(Icons.speed, color: Color(0xFF64748B)),
                        suffixText: 'KM',
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Trip Destination *',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _destinationController,
                      style: const TextStyle(fontSize: 16, color: Colors.white),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Destination is required';
                        return null;
                      },
                      decoration: const InputDecoration(
                        hintText: 'e.g. Bangalore Airport (BLR)',
                        prefixIcon: Icon(Icons.place, color: Color(0xFF64748B)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      'Notes / Remarks (Optional)',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _notesController,
                      maxLines: 2,
                      style: const TextStyle(fontSize: 15, color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Enter pick-up details or remarks...',
                        prefixIcon: Icon(Icons.note, color: Color(0xFF64748B)),
                      ),
                    ),
                    const SizedBox(height: 32),

                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _handleStartTrip,
                      child: _isSubmitting
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5),
                            )
                          : const Text('CONFIRM & START TRIP'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
