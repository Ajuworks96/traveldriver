import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { Modal } from '../common/Modal';
import { Search, Bell, ShieldCheck, Mail, User as UserIcon, LogOut, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { branding, updateBranding, resetBranding } = useBranding();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  // Form state for pitch customizer
  const [pitchName, setPitchName] = useState(branding.agencyName);
  const [pitchTagline, setPitchTagline] = useState(branding.tagline);
  const [pitchColor, setPitchColor] = useState(branding.primaryColor || '#2563EB');

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      agencyName: pitchName,
      tagline: pitchTagline,
      primaryColor: pitchColor,
    });
    setIsPitchModalOpen(false);
  };

  const handleApplyPreset = (presetName: string, presetTagline: string, color: string) => {
    setPitchName(presetName);
    setPitchTagline(presetTagline);
    setPitchColor(color);
  };

  return (
    <>
      <header style={{
        height: '60px',
        position: 'fixed',
        top: 0,
        right: 0,
        left: '240px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 30,
      }}>
        {/* Global Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '6px 12px',
          width: '320px',
        }}>
          <Search size={16} style={{ color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search trips, drivers, vehicles..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.8125rem',
              color: '#0F172A',
            }}
          />
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* White-Label Studio Pitch Button */}
          <button
            onClick={() => setIsPitchModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: '#F0FDFA',
              color: '#0D9488',
              border: '1px solid #CCFBF1',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} style={{ color: '#0D9488' }} />
            <span>White-Label Demo Studio</span>
          </button>

          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Bell size={18} />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0' }} />

          {/* Clickable Admin Profile Badge */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Click to view Admin Profile"
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: user?.role === 'SUPER_ADMIN' ? '#F59E0B' : (branding.primaryColor || '#2563EB'),
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                {user?.name || 'Administrator'}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {user?.email || 'admin@travelagency.com'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Admin Profile Overview"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Badge */}
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
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: user?.role === 'SUPER_ADMIN' ? '#F59E0B' : (branding.primaryColor || '#2563EB'),
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>{user?.email}</div>
              <div style={{ marginTop: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: user?.role === 'SUPER_ADMIN' ? '#FEF3C7' : '#EFF6FF',
                  color: user?.role === 'SUPER_ADMIN' ? '#B45309' : '#1D4ED8',
                  border: user?.role === 'SUPER_ADMIN' ? '1px solid #FCD34D' : '1px solid #BFDBFE',
                }}>
                  <ShieldCheck size={12} />
                  {user?.role === 'SUPER_ADMIN' ? 'SUPER ADMINISTRATOR' : 'ADMINISTRATOR'}
                </span>
              </div>
            </div>
          </div>

          {/* Privileges Summary */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserIcon size={14} /> Full Name
              </span>
              <strong style={{ color: '#0F172A' }}>{user?.name}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Registered Email
              </span>
              <strong style={{ color: '#0F172A' }}>{user?.email}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> System Access
              </span>
              <strong style={{ color: '#059669' }}>Full Trip Audit & Correction Override Enabled</strong>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#FEF2F2',
                color: '#EF4444',
                border: '1px solid #FEE2E2',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* White-Label Demo Customizer Modal */}
      <Modal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        title="White-Label Client Pitch Studio"
      >
        <form onSubmit={handleSaveBranding}>
          <div style={{ padding: '12px 16px', backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '10px', color: '#0D9488', fontSize: '0.8125rem', marginBottom: '20px' }}>
            <strong>Client Pitch Showcase:</strong> Type any Travel Agency name below to instantly rebrand the system live for client presentations!
          </div>

          {/* Presets */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">One-Click Client Demo Presets</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleApplyPreset('Royal Travels & Cabs', 'Premium Luxury Fleet', '#2563EB')}
                style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer' }}
              >
                Royal Travels
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('Kerala Tour & Cabs', 'Gods Own Country Fleets', '#059669')}
                style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '6px', cursor: 'pointer' }}
              >
                Kerala Cabs
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('Grand Holidays Logistics', 'Enterprise Transport', '#7C3AED')}
                style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#F3E8FF', color: '#7C3AED', border: '1px solid #DDD6FE', borderRadius: '6px', cursor: 'pointer' }}
              >
                Grand Holidays
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Client Agency Name *</label>
            <input
              type="text"
              className="form-input"
              value={pitchName}
              onChange={(e) => setPitchName(e.target.value)}
              placeholder="e.g. Royal Cabs & Travels"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Agency Tagline / Subtitle *</label>
            <input
              type="text"
              className="form-input"
              value={pitchTagline}
              onChange={(e) => setPitchTagline(e.target.value)}
              placeholder="e.g. Fleet Logistics Operations"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Primary Brand Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="color"
                value={pitchColor}
                onChange={(e) => setPitchColor(e.target.value)}
                style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{pitchColor}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => { resetBranding(); setIsPitchModalOpen(false); }}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem' }}
            >
              Reset Default
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setIsPitchModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Apply Client Branding Live
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
