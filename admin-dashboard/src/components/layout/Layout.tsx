import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar />
      <Navbar />
      <main style={{
        marginLeft: '240px',
        paddingTop: '60px',
        minHeight: '100vh',
      }}>
        <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
