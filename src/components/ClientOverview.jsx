import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, CheckCircle2, RefreshCw, DollarSign, MessageSquare, Play, Sparkles, User } from 'lucide-react';

export default function ClientOverview({ clientEmail, onNavigate, onDashboardTabChange }) {
  const [nextJob, setNextJob] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientEmail) fetchDashboardData();
  }, [clientEmail]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch completed jobs stats
      const { data: allJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*, employee:profiles(*)')
        .eq('client_email', clientEmail);
      if (jobsError) throw jobsError;

      const completed = (allJobs || []).filter(j => j.status === 'completed');
      setCompletedCount(completed.length);
      setTotalSpent(completed.reduce((sum, j) => sum + parseFloat(j.price || 0), 0));

      // 2. Fetch next upcoming job
      const upcoming = (allJobs || [])
        .filter(j => j.status !== 'completed')
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      if (upcoming.length > 0) setNextJob(upcoming[0]);

      // 3. Find active recurring frequencies
      const recurring = (allJobs || [])
        .filter(j => j.frequency && j.frequency !== 'one-time' && j.status !== 'completed');
      
      // Deduplicate subscriptions by package
      const subs = [];
      const seen = new Set();
      for (const j of recurring) {
        const key = `${j.service_package}-${j.frequency}`;
        if (!seen.has(key)) {
          seen.add(key);
          subs.push(j);
        }
      }
      setActiveSubscriptions(subs);

    } catch (err) {
      console.error('Error fetching client overview data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Completed Cleanings', value: completedCount, color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 size={24} /> },
    { label: 'Total Invested', value: `$${totalSpent.toFixed(2)}`, color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', icon: <DollarSign size={24} /> },
    { label: 'Active Subscriptions', value: activeSubscriptions.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <RefreshCw size={24} /> },
  ];

  if (loading) {
    return <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading your overview...</p>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles style={{ color: 'var(--color-primary-light)' }} /> Welcome Back!
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 4 }}>Here is a summary of your Peosta Cleaning home services.</p>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ background: card.bg, border: `1px solid ${card.color}30`, borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
              <p style={{ color: card.color, fontSize: '1.75rem', fontWeight: 800, marginTop: 6 }}>{card.value}</p>
            </div>
            <div style={{ color: card.color }}>{card.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Next Cleaning & Active Subs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Next Cleaning */}
          <div className="card dashboard-card">
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} style={{ color: 'var(--color-primary-light)' }} /> Next Scheduled Service
            </h3>

            {nextJob ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h4 style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 700 }}>{nextJob.service_package}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 4 }}>📍 {nextJob.address}</p>
                  <p style={{ color: 'var(--color-primary-light)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>
                    📅 {new Date(nextJob.scheduled_at).toLocaleDateString()} at {new Date(nextJob.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {nextJob.employee && (
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={14} /> Cleaner: <strong>{nextJob.employee.full_name}</strong>
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge badge-${nextJob.status}`} style={{ display: 'inline-block', marginBottom: 8 }}>{nextJob.status}</span>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2dd4bf' }}>${parseFloat(nextJob.price).toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
                <p>No cleanings scheduled currently.</p>
                <button onClick={() => onNavigate('book')} className="btn btn-primary" style={{ marginTop: 12, padding: '8px 20px', fontSize: '0.85rem' }}>
                  Book Cleaning
                </button>
              </div>
            )}
          </div>

          {/* Active Subscriptions */}
          <div className="card dashboard-card">
            <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={20} style={{ color: '#f59e0b' }} /> Recurring Subscriptions
            </h3>
            {activeSubscriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeSubscriptions.map((sub, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 8, backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                    <div>
                      <h4 style={{ color: 'white', fontSize: '0.95rem' }}>{sub.service_package}</h4>
                      <p style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, marginTop: 2 }}>🔄 {sub.frequency.toUpperCase()}</p>
                    </div>
                    <span style={{ color: '#2dd4bf', fontWeight: 700 }}>${parseFloat(sub.price).toFixed(2)} / cleaning</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No active recurring plans. Save up to 10% by booking weekly or bi-weekly cleanings!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="card dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: 8 }}>Quick Actions</h3>
          
          <button onClick={() => onNavigate('book')} className="btn btn-primary" style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Calendar size={16} /> Book Cleaning
          </button>
          
          <button onClick={() => onNavigate('pay')} className="btn btn-secondary" style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <DollarSign size={16} /> Pay Invoice
          </button>

          <button onClick={() => onDashboardTabChange('chat')} className="btn btn-outline" style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: '#334155', color: '#94a3b8' }}>
            <MessageSquare size={16} /> Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}
