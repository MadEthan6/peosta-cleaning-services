import React from 'react';
import { Calendar, Shield, Sparkles, MessageSquare, CreditCard } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, user, onLogout }) {
  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
      <div className="container flex align-center justify-between">
        <div className="flex align-center gap-2" style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('home')}>
          <div className="gradient-fresh" style={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>Peosta Cleaning</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Services</span>
          </div>
        </div>

        <nav className="flex align-center gap-8">
          <button 
            onClick={() => setCurrentTab('home')} 
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: currentTab === 'home' ? 700 : 500,
              color: currentTab === 'home' ? 'var(--color-primary)' : 'var(--text-muted)'
            }}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentTab('book')} 
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: currentTab === 'book' ? 700 : 500,
              color: currentTab === 'book' ? 'var(--color-primary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Calendar size={18} /> Book Online
          </button>
          <button 
            onClick={() => setCurrentTab('pay')} 
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: currentTab === 'pay' ? 700 : 500,
              color: currentTab === 'pay' ? 'var(--color-primary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <CreditCard size={18} /> Pay Invoice
          </button>
        </nav>

        <div className="flex align-center gap-4">
          {user ? (
            <>
              <button 
                onClick={() => setCurrentTab('dashboard')} 
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.9rem' }}
              >
                <Shield size={16} /> Portal Dashboard
              </button>
              <button 
                onClick={onLogout} 
                className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => setCurrentTab('portal-login')} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <Shield size={16} /> Employee Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
