import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return {
          bg: '#ECFDF5',
          text: '#047857',
          border: '1px solid #A7F3D0',
        };
      case 'COMPLETED':
        return {
          bg: '#EFF6FF',
          text: '#1D4ED8',
          border: '1px solid #BFDBFE',
        };
      case 'INACTIVE':
        return {
          bg: '#F1F5F9',
          text: '#475569',
          border: '1px solid #CBD5E1',
        };
      default:
        return {
          bg: '#F8FAFC',
          text: '#64748B',
          border: '1px solid #E2E8F0',
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.text,
        border: style.border,
        letterSpacing: '0.025em',
      }}
    >
      {status}
    </span>
  );
};
