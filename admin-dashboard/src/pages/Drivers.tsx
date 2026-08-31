import React, { useState, useEffect } from 'react';
import type { User, Trip } from '../types/api';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { exportToCSV } from '../utils/export';
import { 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle,
  TrendingUp,
  DollarSign,
  Trash2,
  Download
} from 'lucide-react';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selection state for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Add Driver Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Driver Profile Modal
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [driverTrips, setDriverTrips] = useState<Trip[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Status Toggle
  const [statusTargetDriver, setStatusTargetDriver] = useState<User | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Delete Target Driver
  const [deleteTargetDriver, setDeleteTargetDriver] = useState<User | null>(null);
  const [deletingDriver, setDeletingDriver] = useState(false);

  // Bulk Delete Confirmation
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/drivers?limit=100${search ? `&search=${search}` : ''}`);
      setDrivers(res.data.data);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(drivers.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenProfile = async (driver: User) => {
    setSelectedDriver(driver);
    try {
      setLoadingProfile(true);
      const res = await apiClient.get(`/admin/drivers/${driver.id}`);
      setSelectedDriver(res.data.data);
      setDriverTrips(res.data.data.trips || []);
    } catch (err) {
      console.error('Failed to load driver profile', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.email || !newDriver.password) {
      setFormError('Name, Email, and Password are required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await apiClient.post('/admin/drivers', newDriver);
      setIsAddModalOpen(false);
      setNewDriver({ name: '', email: '', phone: '', password: '' });
      fetchDrivers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create driver account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTargetDriver) return;
    try {
      setTogglingStatus(true);
      const nextStatus = statusTargetDriver.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await apiClient.patch(`/admin/drivers/${statusTargetDriver.id}/status`, { status: nextStatus });
      setStatusTargetDriver(null);
      fetchDrivers();
    } catch (err) {
      console.error('Failed to toggle driver status', err);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDeleteDriver = async () => {
    if (!deleteTargetDriver) return;
    try {
      setDeletingDriver(true);
      setDeleteError(null);
      await apiClient.delete(`/admin/drivers/${deleteTargetDriver.id}`);
      setDeleteTargetDriver(null);
      fetchDrivers();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete driver');
    } finally {
      setDeletingDriver(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkDeleting(true);
      setDeleteError(null);
      await apiClient.post('/admin/drivers/bulk-delete', { ids: selectedIds });
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      fetchDrivers();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to bulk delete drivers');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExportDrivers = () => {
    exportToCSV('drivers_roster_report', drivers, [
      { key: 'name', label: 'Driver Full Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'status', label: 'Status' },
      { key: '_count.trips', label: 'Total Trips Completed' },
      { key: 'createdAt', label: 'Registration Date', transform: (v) => new Date(v).toLocaleDateString() },
    ]);
  };

  const completedTripsCount = driverTrips.filter((t) => t.status === 'COMPLETED').length;
  const totalKmDriven = driverTrips.reduce((acc, t) => acc + Number(t.totalKm || 0), 0);
  const totalCashCollected = driverTrips.reduce((acc, t) => acc + Number(t.cashAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            Driver Roster & Profiles
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Manage agency drivers, status activation, performance history, and bulk driver deletion
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: '#FEF2F2',
                color: '#EF4444',
                border: '1px solid #FEE2E2',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={16} />
              <span>Bulk Delete ({selectedIds.length})</span>
            </button>
          )}

          <button onClick={handleExportDrivers} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} style={{ color: '#059669' }} />
            <span>Export Excel / CSV</span>
          </button>

          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            <UserPlus size={18} />
            <span>Add New Driver</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card-clean" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} style={{ color: '#64748B' }} />
        <input
          type="text"
          placeholder="Search by driver name, email address, or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ flex: 1, border: 'none', boxShadow: 'none', padding: '4px' }}
        />
      </div>

      {/* Drivers Roster Table */}
      <div className="card-clean" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px' }}><LoadingSpinner /></div>
        ) : drivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No driver records found matching query.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={drivers.length > 0 && selectedIds.length === drivers.length}
                      onChange={handleSelectAll}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </th>
                  <th>Driver Info</th>
                  <th>Contact Phone</th>
                  <th>Total Trips</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(driver.id)}
                        onChange={() => handleToggleSelect(driver.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#DBEAFE',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}>
                          {driver.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{driver.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#475569' }}>
                        <Phone size={14} style={{ color: '#64748B' }} />
                        <span>{driver.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>
                        {driver._count?.trips ?? 0} Trips
                      </span>
                    </td>
                    <td><Badge status={driver.status ?? 'ACTIVE'} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenProfile(driver)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => setStatusTargetDriver(driver)}
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: driver.status === 'ACTIVE' ? '#EF4444' : '#16A34A',
                            cursor: 'pointer',
                          }}
                        >
                          {driver.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteTargetDriver(driver)}
                          title="Delete Driver"
                          style={{
                            padding: '6px 8px',
                            fontSize: '0.8125rem',
                            borderRadius: '8px',
                            backgroundColor: '#FEF2F2',
                            color: '#EF4444',
                            border: '1px solid #FEE2E2',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={14} />
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

      {/* Driver Profile Modal */}
      <Modal
        isOpen={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        title="Driver Operational Profile"
      >
        {selectedDriver && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.25rem',
              }}>
                {selectedDriver.name[0].toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
                    {selectedDriver.name}
                  </h3>
                  <Badge status={selectedDriver.status} />
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {selectedDriver.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {selectedDriver.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} style={{ color: '#16A34A' }} /> Total Completed
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                  {completedTripsCount} Trips
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} style={{ color: '#2563EB' }} /> Total Distance
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563EB', marginTop: '4px' }}>
                  {totalKmDriven.toLocaleString()} KM
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={14} style={{ color: '#16A34A' }} /> Cash Collected
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16A34A', marginTop: '4px' }}>
                  ₹{totalCashCollected.toLocaleString()}
                </div>
              </div>
            </div>

            {loadingProfile ? (
              <LoadingSpinner message="Loading driver trip log..." />
            ) : (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                  Assigned Trip Activity History
                </h4>
                {driverTrips.length === 0 ? (
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', textAlign: 'center', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                    No trip assignments recorded for this driver.
                  </div>
                ) : (
                  <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Destination</th>
                          <th>Vehicle</th>
                          <th>Distance</th>
                          <th>Cash</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverTrips.map((t) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600 }}>{t.destination}</td>
                            <td style={{ fontSize: '0.8125rem' }}>{t.vehicle?.vehicleName} ({t.vehicle?.vehicleNumber})</td>
                            <td style={{ fontWeight: 600 }}>{t.totalKm ? `${t.totalKm} KM` : '-'}</td>
                            <td style={{ color: '#16A34A', fontWeight: 600 }}>₹{t.cashAmount ?? 0}</td>
                            <td><Badge status={t.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Driver Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Driver Account"
      >
        <form onSubmit={handleCreateDriver}>
          {formError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', color: '#EF4444', fontSize: '0.8125rem', marginBottom: '16px' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Ramesh Kumar"
              value={newDriver.name}
              onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="driver@travelagency.com"
              value={newDriver.email}
              onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={newDriver.phone}
              onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={newDriver.password}
              onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Registering...' : 'Register Driver'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal Status Toggle */}
      <ConfirmationModal
        isOpen={!!statusTargetDriver}
        onClose={() => setStatusTargetDriver(null)}
        onConfirm={handleToggleStatus}
        title="Toggle Driver Status"
        message={`Are you sure you want to ${statusTargetDriver?.status === 'ACTIVE' ? 'deactivate' : 'activate'} ${statusTargetDriver?.name}?`}
        isLoading={togglingStatus}
      />

      {/* Single Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetDriver}
        onClose={() => { setDeleteTargetDriver(null); setDeleteError(null); }}
        onConfirm={handleDeleteDriver}
        title="Delete Driver Record"
        message={deleteError || `Are you sure you want to permanently delete driver "${deleteTargetDriver?.name}" (${deleteTargetDriver?.email})?`}
        isLoading={deletingDriver}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => { setIsBulkDeleteModalOpen(false); setDeleteError(null); }}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Drivers"
        message={deleteError || `Are you sure you want to permanently delete all ${selectedIds.length} selected driver records?`}
        isLoading={bulkDeleting}
      />
    </div>
  );
};
