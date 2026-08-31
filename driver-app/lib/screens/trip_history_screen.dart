import 'package:flutter/material.dart';
import '../core/network/api_service.dart';
import '../models/trip.dart';
import 'trip_details_screen.dart';

class TripHistoryScreen extends StatefulWidget {
  const TripHistoryScreen({super.key});

  @override
  State<TripHistoryScreen> createState() => _TripHistoryScreenState();
}

class _TripHistoryScreenState extends State<TripHistoryScreen> {
  List<Trip> _trips = [];
  bool _isLoading = true;
  String _selectedStatus = 'COMPLETED';

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() {
      _isLoading = true;
    });

    final list = await ApiService.getTripHistory(status: _selectedStatus.isEmpty ? null : _selectedStatus);

    if (!mounted) return;
    setState(() {
      _trips = list;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Trip History'),
      ),
      body: Column(
        children: [
          // Filter Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF1E293B),
            child: Row(
              children: [
                const Text('Filter:', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                const SizedBox(width: 12),
                ChoiceChip(
                  label: const Text('Completed'),
                  selected: _selectedStatus == 'COMPLETED',
                  onSelected: (val) {
                    if (val) {
                      setState(() => _selectedStatus = 'COMPLETED');
                      _fetchHistory();
                    }
                  },
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('All Trips'),
                  selected: _selectedStatus == '',
                  onSelected: (val) {
                    if (val) {
                      setState(() => _selectedStatus = '');
                      _fetchHistory();
                    }
                  },
                ),
              ],
            ),
          ),

          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
                : _trips.isEmpty
                    ? const Center(
                        child: Text('No trip records found.', style: TextStyle(color: Color(0xFF94A3B8))),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _trips.length,
                        itemBuilder: (ctx, i) {
                          final trip = _trips[i];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              contentPadding: const EdgeInsets.all(16),
                              title: Text(
                                trip.destination,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                              ),
                              subtitle: Padding(
                                padding: const EdgeInsets.only(top: 8.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Vehicle: ${trip.vehicle?.vehicleName ?? "N/A"} (${trip.vehicle?.vehicleNumber ?? "N/A"})',
                                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Date: ${trip.startTime.toLocal().toString().substring(0, 10)}',
                                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Text(
                                          'Distance: ${trip.totalKm?.toStringAsFixed(1) ?? "0"} KM',
                                          style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 13),
                                        ),
                                        const SizedBox(width: 16),
                                        Text(
                                          'Cash: ₹${trip.cashAmount?.toStringAsFixed(0) ?? "0"}',
                                          style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              trailing: const Icon(Icons.chevron_right, color: Color(0xFF64748B)),
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => TripDetailsScreen(trip: trip),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
