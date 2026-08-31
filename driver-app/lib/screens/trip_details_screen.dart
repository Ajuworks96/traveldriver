import 'package:flutter/material.dart';
import '../models/trip.dart';

class TripDetailsScreen extends StatelessWidget {
  final Trip trip;

  const TripDetailsScreen({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trip Summary'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: trip.status == 'COMPLETED' ? const Color(0xFF10B981) : const Color(0xFF38BDF8),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          trip.status,
                          style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Text(
                        trip.startTime.toLocal().toString().substring(0, 10),
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    trip.destination,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                children: [
                  _row('Vehicle', '${trip.vehicle?.vehicleName} (${trip.vehicle?.vehicleNumber})'),
                  const Divider(color: Color(0xFF334155), height: 20),
                  _row('Start Odometer', '${trip.startKm.toStringAsFixed(1)} KM'),
                  const Divider(color: Color(0xFF334155), height: 20),
                  _row('Closing Odometer', trip.closingKm != null ? '${trip.closingKm!.toStringAsFixed(1)} KM' : 'N/A'),
                  const Divider(color: Color(0xFF334155), height: 20),
                  _row('Total Distance', trip.totalKm != null ? '${trip.totalKm!.toStringAsFixed(1)} KM' : 'N/A', color: const Color(0xFF38BDF8)),
                  const Divider(color: Color(0xFF334155), height: 20),
                  _row('Cash Collected', '₹${trip.cashAmount?.toStringAsFixed(0) ?? "0"}', color: const Color(0xFF10B981)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String val, {Color color = Colors.white}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
        Text(val, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: color)),
      ],
    );
  }
}
