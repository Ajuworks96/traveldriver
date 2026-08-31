import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Car, 
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { branding } = useBranding();

  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/trips', label: 'Trips Audit', icon: MapPin },
    { path: '/drivers', label: 'Driver Roster', icon: Users },
    { path: '/vehicles', label: 'Fleet Vehicles', icon: Car },
    { path: '/staff', label: 'Staff & Admins', icon: ShieldCheck },
  ];

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid #F1F5F9',
      }}>
        <img
          src="/logo.svg"
          alt="Brand Logo"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            objectFit: 'contain',
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ 
            fontSize: '0.9375rem', 
            fontWeight: 800, 
            color: '#0F172A', 
            letterSpacing: '-0.02em', 
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {branding.agencyName}
          </h1>
          <span style={{ 
            fontSize: '0.6875rem', 
            fontWeight: 500, 
            color: '#64748B',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {branding.tagline}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ padding: '0 12px 8px', fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Menu Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? (branding.primaryColor || '#2563EB') : '#475569',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #F1F5F9' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#EF4444',
            backgroundColor: '#FEF2F2',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
