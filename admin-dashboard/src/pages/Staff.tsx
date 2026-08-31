import React, { useState, useEffect } from 'react';
import type { User } from '../types/api';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Shield, Plus, Phone } from 'lucide-react';

export const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', password: '', role: 'ADMIN' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/staff');
      setStaffList(res.data.data);
    } catch (err) {
      console.error('Failed to fetch staff members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      setFormError('Name, Email, and Password are required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await apiClient.post('/admin/staff', newStaff);
      setIsAddModalOpen(false);
      setNewStaff({ name: '', email: '', phone: '', password: '', role: 'ADMIN' });
      fetchStaff();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            Administrative Staff Directory
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Manage agency administrators, super admins, and staff access privileges
          </p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Add Admin Staff</span>
        </button>
      </div>

      {/* Staff Roster Table */}
      <div className="card-clean" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px' }}><LoadingSpinner /></div>
        ) : staffList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No administrative staff records found.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Contact Info</th>
                  <th>Privilege Role</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: staff.role === 'SUPER_ADMIN' ? '#F59E0B' : '#2563EB',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}>
                          {staff.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{staff.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#475569' }}>
                        <Phone size={14} style={{ color: '#64748B' }} />
                        <span>{staff.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: staff.role === 'SUPER_ADMIN' ? '#FEF3C7' : '#EFF6FF',
                        color: staff.role === 'SUPER_ADMIN' ? '#B45309' : '#1D4ED8',
                        border: staff.role === 'SUPER_ADMIN' ? '1px solid #FCD34D' : '1px solid #BFDBFE',
                      }}>
                        <Shield size={12} />
                        {staff.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMINISTRATOR'}
                      </span>
                    </td>
                    <td>
                      <Badge status={staff.status || 'ACTIVE'} />
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                      {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Administrative Staff"
      >
        <form onSubmit={handleCreateStaff}>
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
              placeholder="e.g. Anjali Nair"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@travelagency.com"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Privilege Role *</label>
            <select
              className="form-select"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
            >
              <option value="ADMIN">Administrator</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={newStaff.password}
              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Creating...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
