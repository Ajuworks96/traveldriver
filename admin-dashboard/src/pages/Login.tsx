import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('superadmin@travelagency.com');
  const [password, setPassword] = useState('SuperAdmin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(cleanEmail, cleanPassword);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetCredentials = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        padding: '40px 32px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
            Admin Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Travel Agency Trip Management System
          </p>
        </div>

        {/* Quick Demo Credential Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          justifyContent: 'center',
        }}>
          <button
            type="button"
            onClick={() => setPresetCredentials('superadmin@travelagency.com', 'SuperAdmin@123456')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '20px',
              border: email.trim() === 'superadmin@travelagency.com' ? '1px solid #2563EB' : '1px solid #E2E8F0',
              backgroundColor: email.trim() === 'superadmin@travelagency.com' ? '#EFF6FF' : '#F8FAFC',
              color: email.trim() === 'superadmin@travelagency.com' ? '#2563EB' : '#64748B',
              cursor: 'pointer',
            }}
          >
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => setPresetCredentials('admin@travelagency.com', 'Admin@123456')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '20px',
              border: email.trim() === 'admin@travelagency.com' ? '1px solid #2563EB' : '1px solid #E2E8F0',
              backgroundColor: email.trim() === 'admin@travelagency.com' ? '#EFF6FF' : '#F8FAFC',
              color: email.trim() === 'admin@travelagency.com' ? '#2563EB' : '#64748B',
              cursor: 'pointer',
            }}
          >
            Agency Admin
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '8px',
            color: '#EF4444',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="superadmin@travelagency.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input form-input-password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 5,
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontWeight: 600 }}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Console'}
          </button>
        </form>
      </div>
    </div>
  );
};
