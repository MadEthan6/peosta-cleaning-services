import React, { useState } from 'react';
import { Calendar, Shield, Sparkles, CreditCard, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, user, profile, onLogout, setAuthRole, setIsRegistering }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
            <div className="dropdown-container">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.9rem' }}
              >
                <User size={16} />
                <span>{profile?.full_name || 'My Account'}</span>
                <ChevronDown size={14} />
              </button>
              
              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Signed in as</p>
                      <p className="dropdown-header-email">{user.email}</p>
                      <p className="dropdown-header-role">{profile?.role || 'user'}</p>
                    </div>
                    
                    {profile?.role === 'owner' && (
                      <button 
                        onClick={() => { setCurrentTab('dashboard'); setDropdownOpen(false); }} 
                        className="dropdown-item"
                      >
                        <LayoutDashboard size={16} /> Owner Dashboard
                      </button>
                    )}
                    {profile?.role === 'employee' && (
                      <button 
                        onClick={() => { setCurrentTab('dashboard'); setDropdownOpen(false); }} 
                        className="dropdown-item"
                      >
                        <LayoutDashboard size={16} /> Employee Dashboard
                      </button>
                    )}
                    {profile?.role === 'client' && (
                      <button 
                        onClick={() => { setCurrentTab('dashboard'); setDropdownOpen(false); }} 
                        className="dropdown-item"
                      >
                        <LayoutDashboard size={16} /> Client Dashboard
                      </button>
                    )}
                    {!profile && (
                      <button 
                        onClick={() => { setCurrentTab('dashboard'); setDropdownOpen(false); }} 
                        className="dropdown-item"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </button>
                    )}
                    
                    <button 
                      onClick={() => { onLogout(); setDropdownOpen(false); }} 
                      className="dropdown-item dropdown-item-danger"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="dropdown-container">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.9rem' }}
              >
                <Shield size={16} /> Portal Access <ChevronDown size={14} />
              </button>
              
              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                  <div className="dropdown-menu">
                    <button 
                      onClick={() => {
                        setAuthRole('client');
                        setIsRegistering(false);
                        setCurrentTab('portal-login');
                        setDropdownOpen(false);
                      }} 
                      className="dropdown-item"
                    >
                      <User size={16} /> Client Portal
                    </button>
                    <button 
                      onClick={() => {
                        setAuthRole('employee');
                        setIsRegistering(false);
                        setCurrentTab('portal-login');
                        setDropdownOpen(false);
                      }} 
                      className="dropdown-item"
                      style={{ borderTop: '1px solid var(--border-color)' }}
                    >
                      <Shield size={16} /> Staff Portal
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

