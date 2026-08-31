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
      _recentTrips = history.take(4).toList();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Driver Console',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_outlined, size: 26, color: Color(0xFF2563EB)),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ProfileScreen()),
              ).then((_) => _loadDashboardData());
            },
          ),
        ],
      ),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480), // Centered Mobile Container on Web
          child: RefreshIndicator(
            onRefresh: _loadDashboardData,
            color: const Color(0xFF2563EB),
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF2563EB)))
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Driver Welcome Hero Header Card
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 26,
                                backgroundColor: const Color(0xFF2563EB),
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
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _currentUser?.email ?? 'driver@travelagency.com',
                                      style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Active Trip Status Banner or Start New Trip Card
                        if (_activeTrip != null) ...[
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFBBF7D0), width: 1.5),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF16A34A).withOpacity(0.08),
                                  blurRadius: 16,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDCFCE7),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: const Color(0xFF86EFAC)),
                                      ),
                                      child: Row(
                                        children: const [
                                          Icon(Icons.circle, size: 8, color: Color(0xFF16A34A)),
                                          SizedBox(width: 6),
                                          Text(
                                            'TRIP IN PROGRESS',
                                            style: TextStyle(
                                              color: Color(0xFF15803D),
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEFF6FF),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        _activeTrip!.vehicle?.vehicleNumber ?? '',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF2563EB),
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  _activeTrip!.destination,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Start Odometer: ${NumberFormat.decimalPattern().format(_activeTrip!.startKm)} KM',
                                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500),
                                ),
                                const SizedBox(height: 18),
                                ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => ActiveTripScreen(trip: _activeTrip!),
                                      ),
                                    ).then((_) => _loadDashboardData());
                                  },
                                  icon: const Icon(Icons.navigation_rounded, size: 20),
                                  label: const Text('View & Close Active Trip'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF16A34A),
                                    foregroundColor: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ] else ...[
                          // Start Trip Action Card
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.03),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Container(
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: const Icon(Icons.navigation_rounded, size: 28, color: Color(0xFF2563EB)),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Ready for a new assignment?',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'No active trip in progress right now',
                                  style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                ),
                                const SizedBox(height: 20),
                                ElevatedButton.icon(
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(builder: (_) => const StartTripScreen()),
                                    ).then((_) => _loadDashboardData());
                                  },
                                  icon: const Icon(Icons.add_circle_outline_rounded, size: 20),
                                  label: const Text('Start New Trip'),
                                ),
                              ],
                            ),
                          ),
                        ],

                        const SizedBox(height: 28),

                        // Recent Trips Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Recent Trip History',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => const TripHistoryScreen()),
                                );
                              },
                              child: const Text(
                                'View All',
                                style: TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        if (_recentTrips.isEmpty)
                          Container(
                            padding: const EdgeInsets.all(28),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: const Text(
                              'No completed trip logs recorded yet.',
                              style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                          )
                        else
                          ..._recentTrips.map((trip) => Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.02),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 42,
                                      height: 42,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF0FDFA),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.check_circle_rounded, color: Color(0xFF16A34A), size: 22),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            trip.destination,
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 15),
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            '${trip.vehicle?.vehicleName ?? "Vehicle"} • ${trip.totalKm?.toStringAsFixed(0) ?? "0"} KM',
                                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w500),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      '₹${trip.cashAmount?.toStringAsFixed(0) ?? "0"}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF16A34A),
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                              )),
                      ],
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}

// Simple Helper for Formatting Numbers
class NumberFormat {
  static NumberFormat decimalPattern() => NumberFormat();
  String format(num value) => value.toStringAsFixed(0);
}
