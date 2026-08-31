import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading data...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#94a3b8' }}>
    <Loader2 className="spinner" size={36} style={{ animation: 'spin 1s linear infinite', color: '#38bdf8' }} />
    <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);
