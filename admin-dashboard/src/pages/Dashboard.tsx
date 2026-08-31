import React, { useState, useEffect } from 'react';
import type { DashboardStats, Trip } from '../types/api';
import { apiClient } from '../api/client';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { exportToCSV } from '../utils/export';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Car, 
  Navigation, 
  CheckCircle2, 
  MapPin, 
  IndianRupee, 
  Calendar,
  RefreshCw,
  ArrowRight,
  UserPlus,
  Plus,
  Download
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [preset, setPreset] = useState<'all' | 'today' | 'month'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [statsRes, activeTripsRes] = await Promise.all([
        apiClient.get(`/admin/dashboard?${params.toString()}`),
        apiClient.get('/admin/trips?status=ACTIVE&limit=10'),
      ]);

      setStats(statsRes.data.data);
      setActiveTrips(activeTripsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [startDate, endDate]);

  const handlePresetSelect = (selectedPreset: 'all' | 'today' | 'month') => {
    setPreset(selectedPreset);
    const now = new Date();
    if (selectedPreset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (selectedPreset === 'month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const firstDayStr = `${year}-${month}-01`;
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(firstDayStr);
      setEndDate(todayStr);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleExportDashboardReport = () => {
    if (!stats) return;
    const summaryData = [
      { Metric: 'Total Registered Drivers', Value: stats.totalDrivers, Notes: `${stats.activeDrivers} Active on Roster` },
      { Metric: 'Total Fleet Vehicles', Value: stats.totalVehicles, Notes: `${stats.activeVehicles} Operational Units` },
      { Metric: 'Active Trips In-Transit', Value: stats.activeTrips, Notes: 'Currently Running' },
      { Metric: 'Completed Trips', Value: stats.completedTrips, Notes: `Filtered Date Range (${startDate || 'All'} to ${endDate || 'All'})` },
      { Metric: 'Total Distance (KM)', Value: `${stats.totalKm} KM`, Notes: 'Reconciled Odometer Total' },
      { Metric: 'Total Cash Collection (INR)', Value: `₹${stats.totalCash}`, Notes: 'Total Cash Reconciled' },
    ];

    exportToCSV(`executive_dashboard_report_${preset}`, summaryData, [
      { key: 'Metric', label: 'Dashboard Metric' },
      { key: 'Value', label: 'Recorded Value' },
      { key: 'Notes', label: 'Filter / Category Details' },
    ]);
  };

  if (loading && !stats) {
    return <LoadingSpinner />;
  }

  const cards = [
    {
      title: 'Total Drivers',
      value: stats?.totalDrivers ?? 0,
      sub: `${stats?.activeDrivers ?? 0} active on roster`,
      icon: Users,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      title: 'Fleet Vehicles',
      value: stats?.totalVehicles ?? 0,
      sub: `${stats?.activeVehicles ?? 0} operational units`,
      icon: Car,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      title: 'Active Trips Now',
      value: stats?.activeTrips ?? 0,
      sub: 'Currently in-transit',
      icon: Navigation,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      title: 'Completed Trips',
      value: stats?.completedTrips ?? 0,
      sub: 'Finished assignments',
      icon: CheckCircle2,
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
    },
    {
      title: 'Total Distance',
      value: `${Number(stats?.totalKm ?? 0).toLocaleString()} KM`,
      sub: 'Odometer total',
      icon: MapPin,
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
    },
    {
      title: 'Cash Collection',
      value: `₹${Number(stats?.totalCash ?? 0).toLocaleString()}`,
      sub: 'Driver cash total',
      icon: IndianRupee,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header & Range Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#FFFFFF',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '2px' }}>
            Fleet logistics, active trip monitoring, and revenue reconciliation
          </p>
        </div>

        {/* Date Filter Component & Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Presets */}
          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            <button
              onClick={() => handlePresetSelect('all')}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: preset === 'all' ? '#FFFFFF' : 'transparent',
                color: preset === 'all' ? '#2563EB' : '#64748B',
                boxShadow: preset === 'all' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              All Time
            </button>
            <button
              onClick={() => handlePresetSelect('today')}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: preset === 'today' ? '#FFFFFF' : 'transparent',
                color: preset === 'today' ? '#2563EB' : '#64748B',
                boxShadow: preset === 'today' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Today
            </button>
            <button
              onClick={() => handlePresetSelect('month')}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: preset === 'month' ? '#FFFFFF' : 'transparent',
                color: preset === 'month' ? '#2563EB' : '#64748B',
                boxShadow: preset === 'month' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              This Month
            </button>
          </div>

          {/* Custom Date Pickers */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F8FAFC',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}>
            <Calendar size={16} style={{ color: '#64748B' }} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setPreset('all'); setStartDate(e.target.value); }}
              style={{
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.8125rem',
                outline: 'none',
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setPreset('all'); setEndDate(e.target.value); }}
              style={{
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.8125rem',
                outline: 'none',
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>

          <button
            onClick={handleExportDashboardReport}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
          >
            <Download size={16} style={{ color: '#059669' }} />
            <span>Export Report</span>
          </button>

          <button
            onClick={fetchDashboard}
            title="Refresh Data"
            style={{
              padding: '8px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Balanced 2x3 Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
      }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="premium-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>
                  {card.title}
                </span>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={22} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748B' }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Active Trips Monitor Table (8 Cols) */}
        <div style={{ gridColumn: 'span 8' }} className="premium-card">
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
                Live Active Trips
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                Ongoing driver assignments currently in transit
              </p>
            </div>

            <button
              onClick={() => navigate('/trips')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#2563EB',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>View All Trips</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {activeTrips.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <Navigation size={28} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                No Trips Currently Active
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '360px', margin: '0 auto' }}>
                Active driver assignments will appear here in real-time when started from the driver mobile app.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Destination</th>
                    <th>Start Odometer</th>
                    <th>Start Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{trip.driver?.name}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{trip.vehicle?.vehicleName}</div>
                        <span className="plate-badge" style={{ marginTop: '2px' }}>
                          {trip.vehicle?.vehicleNumber}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{trip.destination}</td>
                      <td style={{ fontWeight: 700, color: '#2563EB' }}>
                        {Number(trip.startKm).toLocaleString()} KM
                      </td>
                      <td style={{ color: '#64748B', fontSize: '0.8125rem' }}>
                        {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <Badge status={trip.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts (4 Cols) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="premium-card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>
              Management Shortcuts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/drivers')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
              >
                <UserPlus size={18} style={{ color: '#2563EB' }} />
                <span>Register Driver Account</span>
              </button>

              <button
                onClick={() => navigate('/vehicles')}
                className="btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
              >
                <Plus size={18} style={{ color: '#059669' }} />
                <span>Add Fleet Vehicle</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
