import 'package:flutter/material.dart';
import '../models/trip.dart';
import 'close_trip_screen.dart';

class ActiveTripScreen extends StatelessWidget {
  final Trip trip;

  const ActiveTripScreen({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Active Trip Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0x2610B981),
                border: Border.all(color: const Color(0x6610B981)),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(Icons.navigation_rounded, size: 48, color: Color(0xFF10B981)),
                  const SizedBox(height: 12),
                  const Text(
                    'IN TRANSIT',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    trip.destination,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Trip Metric Details
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  _detailRow(
                    icon: Icons.directions_car,
                    label: 'Assigned Vehicle',
                    value: '${trip.vehicle?.vehicleName ?? "Vehicle"} (${trip.vehicle?.vehicleNumber ?? "N/A"})',
                  ),
                  const Divider(color: Color(0xFF334155), height: 24),
                  _detailRow(
                    icon: Icons.speed,
                    label: 'Starting Odometer (KM)',
                    value: '${trip.startKm.toStringAsFixed(1)} KM',
                  ),
                  const Divider(color: Color(0xFF334155), height: 24),
                  _detailRow(
                    icon: Icons.access_time,
                    label: 'Trip Started At',
                    value: trip.startTime.toLocal().toString().substring(0, 16),
                  ),
                  if (trip.notes != null && trip.notes!.isNotEmpty) ...[
                    const Divider(color: Color(0xFF334155), height: 24),
                    _detailRow(
                      icon: Icons.notes,
                      label: 'Trip Notes',
                      value: trip.notes!,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 32),

            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (_) => CloseTripScreen(trip: trip),
                  ),
                );
              },
              icon: const Icon(Icons.check_circle_rounded, size: 24),
              label: const Text('END & CLOSE TRIP'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF43F5E),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow({required IconData icon, required String label, required String value}) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF38BDF8), size: 22),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
            ],
          ),
        ),
      ],
    );
  }
}
