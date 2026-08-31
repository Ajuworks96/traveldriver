import React, { useState, useEffect } from 'react';
import type { Vehicle } from '../types/api';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { exportToCSV } from '../utils/export';
import { Car, Plus, Search, Trash2, Download } from 'lucide-react';

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Add Vehicle Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: '', vehicleName: '', model: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Status Toggle
  const [statusTargetVehicle, setStatusTargetVehicle] = useState<Vehicle | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Delete Target Vehicle
  const [deleteTargetVehicle, setDeleteTargetVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState(false);

  // Bulk Delete Modal
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/vehicles?limit=100${search ? `&search=${search}` : ''}`);
      setVehicles(res.data.data);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(vehicles.map((v) => v.id));
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

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vehicleNumber || !newVehicle.vehicleName || !newVehicle.model) {
      setFormError('Vehicle Number, Name, and Model are required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await apiClient.post('/admin/vehicles', newVehicle);
      setIsAddModalOpen(false);
      setNewVehicle({ vehicleNumber: '', vehicleName: '', model: '' });
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTargetVehicle) return;
    try {
      setTogglingStatus(true);
      const nextStatus = statusTargetVehicle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await apiClient.patch(`/admin/vehicles/${statusTargetVehicle.id}/status`, { status: nextStatus });
      setStatusTargetVehicle(null);
      fetchVehicles();
    } catch (err) {
      console.error('Failed to toggle vehicle status', err);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteTargetVehicle) return;
    try {
      setDeletingVehicle(true);
      setDeleteError(null);
      await apiClient.delete(`/admin/vehicles/${deleteTargetVehicle.id}`);
      setDeleteTargetVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setDeletingVehicle(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkDeleting(true);
      setDeleteError(null);
      await apiClient.post('/admin/vehicles/bulk-delete', { ids: selectedIds });
      setIsBulkDeleteModalOpen(false);
      setSelectedIds([]);
      fetchVehicles();
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to bulk delete vehicles');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExportVehicles = () => {
    exportToCSV('fleet_vehicles_report', vehicles, [
      { key: 'vehicleName', label: 'Vehicle Name / Make' },
      { key: 'vehicleNumber', label: 'Registration Number' },
      { key: 'model', label: 'Model Year' },
      { key: 'status', label: 'Status' },
      { key: '_count.trips', label: 'Total Trips Completed' },
      { key: 'createdAt', label: 'Added Date', transform: (v) => new Date(v).toLocaleDateString() },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            Fleet Vehicle Registry
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Manage agency vehicles, registration numbers, models, and bulk fleet deletion
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

          <button onClick={handleExportVehicles} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} style={{ color: '#059669' }} />
            <span>Export Excel / CSV</span>
          </button>

          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
            <Plus size={18} />
            <span>Add Fleet Vehicle</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card-clean" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={18} style={{ color: '#64748B' }} />
        <input
          type="text"
          placeholder="Search by registration number, vehicle name, or model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ flex: 1, border: 'none', boxShadow: 'none', padding: '4px' }}
        />
      </div>

      {/* Fleet Table */}
      <div className="card-clean" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px' }}><LoadingSpinner /></div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No fleet vehicles found matching query.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={vehicles.length > 0 && selectedIds.length === vehicles.length}
                      onChange={handleSelectAll}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </th>
                  <th>Vehicle Info</th>
                  <th>Registration No</th>
                  <th>Model Year</th>
                  <th>Total Trips</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v.id)}
                        onChange={() => handleToggleSelect(v.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#F0FDFA',
                          color: '#0D9488',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Car size={20} />
                        </div>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{v.vehicleName}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#2563EB', fontFamily: 'monospace' }}>
                        {v.vehicleNumber}
                      </span>
                    </td>
                    <td style={{ color: '#64748B' }}>{v.model}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{v._count?.trips ?? 0} Trips</span>
                    </td>
                    <td><Badge status={v.status ?? 'ACTIVE'} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setStatusTargetVehicle(v)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: v.status === 'ACTIVE' ? '#EF4444' : '#16A34A',
                            cursor: 'pointer',
                          }}
                        >
                          {v.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteTargetVehicle(v)}
                          title="Delete Vehicle"
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

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Fleet Vehicle"
      >
        <form onSubmit={handleCreateVehicle}>
          {formError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', color: '#EF4444', fontSize: '0.8125rem', marginBottom: '16px' }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Vehicle Registration Number *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. KA-01-AB-1234"
              value={newVehicle.vehicleNumber}
              onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vehicle Name / Make *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Toyota Innova Crysta"
              value={newVehicle.vehicleName}
              onChange={(e) => setNewVehicle({ ...newVehicle, vehicleName: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Model / Variant *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2.4 VX 7-STR (2023)"
              value={newVehicle.model}
              onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal Status Toggle */}
      <ConfirmationModal
        isOpen={!!statusTargetVehicle}
        onClose={() => setStatusTargetVehicle(null)}
        onConfirm={handleToggleStatus}
        title="Toggle Fleet Status"
        message={`Are you sure you want to ${statusTargetVehicle?.status === 'ACTIVE' ? 'deactivate' : 'activate'} ${statusTargetVehicle?.vehicleName} (${statusTargetVehicle?.vehicleNumber})?`}
        isLoading={togglingStatus}
      />

      {/* Delete Vehicle Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetVehicle}
        onClose={() => { setDeleteTargetVehicle(null); setDeleteError(null); }}
        onConfirm={handleDeleteVehicle}
        title="Delete Fleet Vehicle"
        message={deleteError || `Are you sure you want to permanently delete vehicle "${deleteTargetVehicle?.vehicleName}" (${deleteTargetVehicle?.vehicleNumber})?`}
        isLoading={deletingVehicle}
      />

      {/* Bulk Delete Vehicles Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => { setIsBulkDeleteModalOpen(false); setDeleteError(null); }}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Fleet Vehicles"
        message={deleteError || `Are you sure you want to permanently delete all ${selectedIds.length} selected fleet vehicles?`}
        isLoading={bulkDeleting}
      />
    </div>
  );
};
