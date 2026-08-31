import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'There are no items matching your criteria at this moment.',
  action,
}) => (
  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '1rem', borderRadius: '50%', color: '#64748b', marginBottom: '1rem' }}>
      <Inbox size={32} />
    </div>
    <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{title}</h4>
    <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '360px', textAlign: 'center', marginBottom: '1.25rem' }}>{message}</p>
    {action}
  </div>
);
