import 'package:flutter/material.dart';
import '../core/storage/auth_storage.dart';
import '../core/network/api_service.dart';
import '../models/user.dart';
import '../models/trip.dart';
import 'start_trip_screen.dart';
import 'active_trip_screen.dart';
import 'trip_history_screen.dart';
import 'profile_screen.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  User? _currentUser;
  Trip? _activeTrip;
  List<Trip> _recentTrips = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
    });

    final user = await AuthStorage.getUser();
    final activeTrip = await ApiService.getActiveTrip();
    final history = await ApiService.getTripHistory(status: 'COMPLETED');

    if (!mounted) return;

    setState(() {
      _currentUser = user;
      _activeTrip = activeTrip;
      _recentTrips = history.take(3).toList();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Trip Console'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle, size: 28),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              ).then((_) => _loadDashboardData());
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        color: const Color(0xFF38BDF8),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF38BDF8)))
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Welcome Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: const Color(0xFF0284C7),
                            child: Text(
                              _currentUser?.name.substring(0, 1).toUpperCase() ?? 'D',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Hello, ${_currentUser?.name ?? "Driver"}',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFF8FAFC),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _currentUser?.email ?? '',
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Active Trip Status Banner
                    if (_activeTrip != null) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0x2610B981),
                          border: Border.all(color: const Color(0x6610B981)),
                          borderRadius: BorderRadius.circular(16),
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
                                    color: const Color(0xFF10B981),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    'TRIP IN PROGRESS',
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Text(
                                  _activeTrip!.vehicle?.vehicleNumber ?? '',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF38BDF8),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Destination: ${_activeTrip!.destination}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Starting KM: ${_activeTrip!.startKm.toStringAsFixed(1)} KM',
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => ActiveTripScreen(trip: _activeTrip!),
                                  ),
                                ).then((_) => _loadDashboardData());
                              },
                              icon: const Icon(Icons.navigation_rounded),
                              label: const Text('VIEW & CLOSE ACTIVE TRIP'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.black,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      // Start Trip Large Action Button
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.add_road_rounded, size: 48, color: Color(0xFF38BDF8)),
                            const SizedBox(height: 12),
                            const Text(
                              'Ready for a new assignment?',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'No active trip in progress',
                              style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const StartTripScreen()),
                                ).then((_) => _loadDashboardData());
                              },
                              icon: const Icon(Icons.play_arrow_rounded, size: 28),
                              label: const Text('START NEW TRIP'),
                            ),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 24),

                    // Navigation Shortcuts & Recent Trips Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Recent Completed Trips',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFF8FAFC)),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const TripHistoryScreen()),
                            );
                          },
                          child: const Text('View All', style: TextStyle(color: Color(0xFF38BDF8))),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    if (_recentTrips.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(24),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'No completed trips recorded yet.',
                          style: TextStyle(color: Color(0xFF94A3B8)),
                        ),
                      )
                    else
                      ..._recentTrips.map((trip) => Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            child: ListTile(
                              leading: const Icon(Icons.check_circle_outline, color: Color(0xFF10B981)),
                              title: Text(
                                trip.destination,
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              subtitle: Text(
                                '${trip.vehicle?.vehicleName ?? "Vehicle"} • ${trip.totalKm?.toStringAsFixed(1) ?? "0"} KM',
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                              ),
                              trailing: Text(
                                '₹${trip.cashAmount?.toStringAsFixed(0) ?? "0"}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF10B981),
                                  fontSize: 15,
                                ),
                              ),
                            ),
                          )),
                  ],
                ),
              ),
      ),
    );
  }
}
