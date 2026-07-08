import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, MapPin, DollarSign, FileText, Star, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import RatingTip from './RatingTip';

const statusColor = { pending: '#94a3b8', assigned: '#3b82f6', in_progress: '#f59e0b', completed: '#10b981' };
const freqLabel = { 'one-time': 'One-time', 'weekly': 'Weekly', 'bi-weekly': 'Bi-Weekly', 'monthly': 'Monthly' };

export default function ClientHistory({ clientEmail, clientId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [clientEmail]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, employee:profiles(*)')
        .eq('client_email', clientEmail)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const upcoming = jobs.filter(j => j.status !== 'completed');
  const past = jobs.filter(j => j.status === 'completed');

  const downloadReceipt = (job) => {
    const lines = [
      '===== PEOSTA CLEANING SERVICES =====',
      'Receipt / Invoice',
      '=====================================',
      `Job ID:        ${job.id}`,
      `Client:        ${job.client_name}`,
      `Email:         ${job.client_email}`,
      `Address:       ${job.address}`,
      `Service:       ${job.service_package}`,
      `Frequency:     ${freqLabel[job.frequency] || 'One-time'}`,
      `Scheduled:     ${new Date(job.scheduled_at).toLocaleString()}`,
      `Status:        ${job.status.toUpperCase()}`,
      `Payment:       ${job.payment_status?.toUpperCase() || 'UNPAID'}`,
      '-------------------------------------',
      `TOTAL DUE:     $${parseFloat(job.price).toFixed(2)}`,
      '=====================================',
      'Thank you for choosing Peosta Cleaning Services!',
      'Questions? contact@peostacleaning.com',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${job.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const JobCard = ({ job, onClick }) => (
    <div
      onClick={() => onClick(job)}
      style={{
        padding: '18px 20px', borderRadius: 12, cursor: 'pointer',
        border: `1px solid ${selected?.id === job.id ? '#2dd4bf' : '#334155'}`,
        backgroundColor: selected?.id === job.id ? 'rgba(45,212,191,0.05)' : '#1e293b',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <span style={{
          background: `${statusColor[job.status]}20`, color: statusColor[job.status],
          padding: '3px 10px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700
        }}>
          {job.status.replace('_', ' ').toUpperCase()}
        </span>
        <span style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '1.1rem' }}>
          ${parseFloat(job.price).toFixed(2)}
        </span>
      </div>
      <p style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>{job.service_package}</p>
      <p style={{ color: '#94a3b8', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <MapPin size={12} /> {job.address}
      </p>
      <p style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Calendar size={12} /> {new Date(job.scheduled_at).toLocaleDateString()} at {new Date(job.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {job.frequency && job.frequency !== 'one-time' && (
          <span style={{ marginLeft: 8, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
            <RefreshCw size={10} /> {freqLabel[job.frequency]}
          </span>
        )}
      </p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: 8 }}>My Bookings</h2>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>View upcoming and past cleanings, download receipts, and leave reviews.</p>

      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading your bookings...</p>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #334155', borderRadius: 12, color: '#64748b' }}>
          <Calendar size={40} style={{ marginBottom: 12 }} />
          <p>No bookings found. Book your first cleaning on our website!</p>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: 24, alignItems: 'start' }}>
          {/* Left: job list */}
          <div>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Upcoming ({upcoming.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {upcoming.map(job => <JobCard key={job.id} job={job} onClick={setSelected} />)}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Past Cleanings ({past.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {past.map(job => <JobCard key={job.id} job={job} onClick={setSelected} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right: detail view */}
          {selected ? (
            <div className="card dashboard-card" style={{ position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: 4 }}>{selected.service_package}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{selected.address}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Date</span>
                  <span style={{ color: 'white' }}>{new Date(selected.scheduled_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Time</span>
                  <span style={{ color: 'white' }}>{new Date(selected.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Frequency</span>
                  <span style={{ color: '#f59e0b' }}>{freqLabel[selected.frequency] || 'One-time'}</span>
                </div>
                {selected.employee && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Cleaner</span>
                    <span style={{ color: 'white' }}>{selected.employee.full_name}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #334155' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 700 }}>Total Paid</span>
                  <span style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '1.1rem' }}>${parseFloat(selected.price).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => downloadReceipt(selected)}
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20, padding: 12 }}
              >
                <FileText size={16} /> Download Receipt (.txt)
              </button>

              {/* Rating/Tip Section */}
              <div style={{ borderTop: '1px solid #334155', paddingTop: 20 }}>
                <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={16} style={{ color: '#f59e0b' }} /> Rate & Tip Your Cleaner
                </h4>
                <RatingTip job={selected} clientId={clientId} />
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 20px', border: '1px dashed #334155', borderRadius: 12 }}>
              <FileText size={32} style={{ marginBottom: 10 }} />
              <p>Select a booking to view details, download a receipt, or leave a review.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
