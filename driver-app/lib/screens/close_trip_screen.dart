import 'package:flutter/material.dart';
import '../models/trip.dart';
import '../core/network/api_service.dart';

class CloseTripScreen extends StatefulWidget {
  final Trip trip;

  const CloseTripScreen({super.key, required this.trip});

  @override
  State<CloseTripScreen> createState() => _CloseTripScreenState();
}

class _CloseTripScreenState extends State<CloseTripScreen> {
  final _formKey = GlobalKey<FormState>();
  final _closingKmController = TextEditingController();
  final _cashController = TextEditingController(text: '0');
  final _notesController = TextEditingController();

  double _previewTotalKm = 0.0;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _closingKmController.addListener(_updatePreviewKm);
  }

  void _updatePreviewKm() {
    final closing = double.tryParse(_closingKmController.text.trim());
    if (closing != null && closing >= widget.trip.startKm) {
      setState(() {
        _previewTotalKm = closing - widget.trip.startKm;
      });
    } else {
      setState(() {
        _previewTotalKm = 0.0;
      });
    }
  }

  Future<void> _confirmAndSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final closingKm = double.tryParse(_closingKmController.text.trim());
    final cash = double.tryParse(_cashController.text.trim());

    if (closingKm == null || closingKm < widget.trip.startKm) {
      setState(() {
        _errorMessage = 'Closing KM cannot be lower than starting KM (${widget.trip.startKm} KM)';
      });
      return;
    }

    if (cash == null || cash < 0) {
      setState(() {
        _errorMessage = 'Cash collection cannot be negative';
      });
      return;
    }

    // Confirmation dialog before closing trip
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Confirm Trip Completion', style: TextStyle(color: Colors.white)),
        content: Text(
          'Complete trip to "${widget.trip.destination}" with Closing KM $closingKm and Cash Collection ₹$cash?',
          style: const TextStyle(color: Color(0xFFCBD5E1)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            child: const Text('CONFIRM CLOSE', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final result = await ApiService.closeTrip(
      tripId: widget.trip.id,
      closingKm: closingKm,
      cashAmount: cash,
      notes: _notesController.text.trim(),
    );

    setState(() {
      _isSubmitting = false;
    });

    if (result['success'] == true) {
      final Trip completedTrip = result['trip'];
      if (!mounted) return;

      // Show Trip Completion Dialog with backend calculated Total KM
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Color(0xFF10B981), size: 28),
              SizedBox(width: 10),
              Text('Trip Completed!', style: TextStyle(color: Colors.white)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Backend Reconciled Trip Summary:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
              const SizedBox(height: 12),
              Text('Total Distance: ${completedTrip.totalKm?.toStringAsFixed(1) ?? "0"} KM', style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 6),
              Text('Cash Collected: ₹${completedTrip.cashAmount?.toStringAsFixed(0) ?? "0"}', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
              },
              child: const Text('BACK TO CONSOLE'),
            ),
          ],
        ),
      );

      if (!mounted) return;
      Navigator.of(context).pop();
    } else {
      setState(() {
        _errorMessage = result['message'] ?? 'Failed to close trip';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete & Close Trip'),
      ),
      body: SingleChildScrollView(
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

              // Reference Starting KM Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Starting Odometer:', style: TextStyle(color: Color(0xFF94A3B8))),
                    Text(
                      '${widget.trip.startKm.toStringAsFixed(1)} KM',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Closing Odometer Reading (KM) *',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _closingKmController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 16, color: Colors.white),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Closing KM is required';
                  final num = double.tryParse(val.trim());
                  if (num == null) return 'Enter a valid number';
                  if (num < widget.trip.startKm) return 'Cannot be lower than start KM (${widget.trip.startKm})';
                  return null;
                },
                decoration: const InputDecoration(
                  hintText: 'e.g. 45400.0',
                  prefixIcon: Icon(Icons.speed, color: Color(0xFF64748B)),
                  suffixText: 'KM',
                ),
              ),
              const SizedBox(height: 12),

              // Live Preview Total KM Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0x1A38BDF8),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0x3338BDF8)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Preview Distance:', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 13)),
                    Text(
                      '${_previewTotalKm.toStringAsFixed(1)} KM',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF38BDF8)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Cash Collected Amount (₹) *',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _cashController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 16, color: Colors.white),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Cash amount is required';
                  final num = double.tryParse(val.trim());
                  if (num == null || num < 0) return 'Cash cannot be negative';
                  return null;
                },
                decoration: const InputDecoration(
                  hintText: '0.00',
                  prefixIcon: Icon(Icons.currency_rupee, color: Color(0xFF64748B)),
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Closing Notes (Optional)',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _notesController,
                maxLines: 2,
                style: const TextStyle(fontSize: 15, color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Add end of trip comments...',
                  prefixIcon: Icon(Icons.note, color: Color(0xFF64748B)),
                ),
              ),
              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _confirmAndSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.black,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5),
                      )
                    : const Text('SUBMIT & COMPLETE TRIP'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
