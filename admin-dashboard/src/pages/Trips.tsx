import React, { useState, useEffect } from 'react';
import type { Trip, User, Vehicle } from '../types/api';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { exportToCSV } from '../utils/export';
import { Search, Calendar, Edit3, ShieldAlert, Download } from 'lucide-react';

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Trip Modal
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Edit / Correct Trip State
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editForm, setEditForm] = useState({
    destination: '',
    startKm: '',
    closingKm: '',
    cashAmount: '',
    notes: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('destination', search);
      if (driverId) params.append('driverId', driverId);
      if (vehicleId) params.append('vehicleId', vehicleId);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', '50');

      const res = await apiClient.get(`/admin/trips?${params.toString()}`);
      setTrips(res.data.data);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        apiClient.get('/admin/drivers?limit=100'),
        apiClient.get('/admin/vehicles?limit=100'),
      ]);
      setDrivers(driversRes.data.data);
      setVehicles(vehiclesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch filter dropdowns', err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [search, driverId, vehicleId, status, startDate, endDate]);

  const handleOpenEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    setEditForm({
      destination: trip.destination,
      startKm: trip.startKm ? String(trip.startKm) : '',
      closingKm: trip.closingKm ? String(trip.closingKm) : '',
      cashAmount: trip.cashAmount !== undefined ? String(trip.cashAmount) : '0',
      notes: trip.notes || '',
    });
    setEditError(null);
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    try {
      setSavingEdit(true);
      setEditError(null);

      const payload = {
        destination: editForm.destination,
        startKm: parseFloat(editForm.startKm),
        ...(editForm.closingKm ? { closingKm: parseFloat(editForm.closingKm) } : {}),
        cashAmount: parseFloat(editForm.cashAmount || '0'),
        notes: editForm.notes,
      };

      await apiClient.patch(`/admin/trips/${editingTrip.id}`, payload);
      setEditingTrip(null);
      setSelectedTrip(null);
      fetchTrips();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to save trip correction');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleExportTrips = () => {
    exportToCSV('trips_audit_report', trips, [
      { key: 'destination', label: 'Destination' },
      { key: 'driver.name', label: 'Driver Name' },
      { key: 'driver.email', label: 'Driver Email' },
      { key: 'vehicle.vehicleName', label: 'Vehicle Name' },
      { key: 'vehicle.vehicleNumber', label: 'Vehicle Reg Number' },
      { key: 'startKm', label: 'Start KM' },
      { key: 'closingKm', label: 'Closing KM' },
      { key: 'totalKm', label: 'Total Distance (KM)' },
      { key: 'cashAmount', label: 'Cash Collection (INR)' },
      { key: 'status', label: 'Trip Status' },
      { key: 'startTime', label: 'Start Time', transform: (v) => new Date(v).toLocaleString() },
      { key: 'notes', label: 'Notes' },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            Trips Audit & Correction Console
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Audit trip records and correct driver odometer/cash errors with full admin privilege
          </p>
        </div>

        <button onClick={handleExportTrips} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Download size={16} style={{ color: '#059669' }} />
          <span>Export Excel / CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-clean" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px' }} className="form-input">
            <Search size={16} style={{ color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="form-select">
            <option value="">All Drivers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="form-select">
            <option value="">All Fleet Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.vehicleName} ({v.vehicleNumber})</option>
            ))}
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> Date Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
          />
          <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
            style={{ padding: '4px 10px', fontSize: '0.8125rem' }}
          />
          {(search || driverId || vehicleId || status || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setDriverId('');
                setVehicleId('');
                setStatus('');
                setStartDate('');
                setEndDate('');
              }}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Trips Table */}
      <div className="card-clean" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px' }}><LoadingSpinner /></div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No trip records found.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Odometer Reading</th>
                  <th>Total Distance</th>
                  <th>Cash Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{trip.destination}</td>
                    <td>{trip.driver?.name || 'N/A'}</td>
                    <td>
                      <div>{trip.vehicle?.vehicleName}</div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{trip.vehicle?.vehicleNumber}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#475569' }}>
                      Start: <strong>{trip.startKm}</strong> | End: <strong>{trip.closingKm ?? '-'}</strong>
                    </td>
                    <td style={{ fontWeight: 700, color: '#2563EB' }}>
                      {trip.totalKm ? `${Number(trip.totalKm).toLocaleString()} KM` : '-'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#16A34A' }}>
                      ₹{Number(trip.cashAmount ?? 0).toLocaleString()}
                    </td>
                    <td><Badge status={trip.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(trip)}
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            borderRadius: '8px',
                            backgroundColor: '#F59E0B',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit3 size={14} />
                          <span>Correct</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      <Modal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        title="Trip Audit Details"
      >
        {selectedTrip && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Trip Status</span>
              <Badge status={selectedTrip.status} />
            </div>

            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Destination</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>{selectedTrip.destination}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Driver Name</span>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTrip.driver?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedTrip.driver?.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Vehicle Fleet</span>
                <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedTrip.vehicle?.vehicleName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedTrip.vehicle?.vehicleNumber}</div>
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Start Odometer</span>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>{selectedTrip.startKm} KM</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Closing Odometer</span>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>{selectedTrip.closingKm ?? 'N/A'} KM</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Distance</span>
                <div style={{ fontWeight: 700, color: '#2563EB' }}>{selectedTrip.totalKm ?? 0} KM</div>
              </div>
            </div>

            <div style={{ padding: '14px 16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#047857' }}>Reconciled Cash Collection</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857' }}>₹{selectedTrip.cashAmount ?? 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
              <button
                onClick={() => handleOpenEditModal(selectedTrip)}
                className="btn-primary"
                style={{ backgroundColor: '#F59E0B' }}
              >
                <Edit3 size={16} />
                <span>Correct Driver Mistakes</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Trip Correction Modal */}
      <Modal
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        title="Admin Trip Correction & Audit"
      >
        <form onSubmit={handleSaveCorrection}>
          <div style={{ padding: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8125rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} />
            <span>Admin Privilege Override: Modifying starting/closing KM will automatically recalculate Total KM.</span>
          </div>

          {editError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', color: '#EF4444', fontSize: '0.8125rem', marginBottom: '16px' }}>
              {editError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Destination Address / Route *</label>
            <input
              type="text"
              className="form-input"
              value={editForm.destination}
              onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Starting Odometer (KM) *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={editForm.startKm}
                onChange={(e) => setEditForm({ ...editForm, startKm: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Closing Odometer (KM)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={editForm.closingKm}
                onChange={(e) => setEditForm({ ...editForm, closingKm: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reconciled Cash Collection (₹)</label>
            <input
              type="number"
              step="0.5"
              className="form-input"
              value={editForm.cashAmount}
              onChange={(e) => setEditForm({ ...editForm, cashAmount: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Admin Audit Notes / Correction Reason</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Corrected driver odometer typo from 12000 to 12500 KM"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setEditingTrip(null)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={savingEdit} className="btn-primary" style={{ backgroundColor: '#F59E0B' }}>
              {savingEdit ? 'Saving Correction...' : 'Save Admin Correction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
