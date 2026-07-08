import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Plus, Send, CheckCircle2, Clock, DollarSign, Trash2, ExternalLink } from 'lucide-react';

const inputStyle = {
  backgroundColor: '#0f172a', borderColor: '#334155', color: 'white',
  border: '1px solid #334155', borderRadius: 8, padding: '10px 14px',
  fontSize: '0.95rem', width: '100%', outline: 'none',
};

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [clients, setClients] = useState([]);

  // Form state
  const [form, setForm] = useState({
    client_name: '', client_email: '', amount: '', notes: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('full_name', { ascending: true });
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients for dropdown:', err.message);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { error } = await supabase.from('invoices').insert({
        client_name: form.client_name,
        client_email: form.client_email,
        amount: parseFloat(form.amount),
        notes: form.notes || null,
        status: 'unpaid'
      });
      if (error) throw error;
      setForm({ client_name: '', client_email: '', amount: '', notes: '' });
      setShowCreate(false);
      fetchInvoices();
    } catch (err) {
      alert('Error creating invoice: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const markPaid = async (id) => {
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
    fetchInvoices();
  };

  const markSent = async (id) => {
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', id);
    fetchInvoices();
  };

  const deleteInvoice = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    fetchInvoices();
  };

  const totalUnpaid = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  const statusColor = { unpaid: '#f59e0b', sent: '#3b82f6', paid: '#10b981' };
  const statusIcon = { unpaid: <Clock size={14} />, sent: <Send size={14} />, paid: <CheckCircle2 size={14} /> };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: '2rem', color: 'white' }}>Invoice Management</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
        >
          <Plus size={18} /> New Invoice
        </button>
      </div>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>Track client payments, generate invoices, and monitor outstanding balances.</p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Outstanding', amount: totalUnpaid, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Collected', amount: totalPaid, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Invoices', amount: invoices.length, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', isCount: true },
        ].map(({ label, amount, color, bg, isCount }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 12, padding: 20 }}>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ color, fontSize: '1.75rem', fontWeight: 800, marginTop: 6 }}>
              {isCount ? amount : `$${amount.toFixed(2)}`}
            </p>
          </div>
        ))}
      </div>

      {/* Create Invoice Form */}
      {showCreate && (
        <div className="card dashboard-card animate-fade-in" style={{ marginBottom: 24 }}>
          <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: 20 }}>Create New Invoice</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Select Registered Client</label>
              <select
                required
                value={form.client_email}
                onChange={e => {
                  const selectedCli = clients.find(c => c.email === e.target.value);
                  setForm(p => ({
                    ...p,
                    client_email: e.target.value,
                    client_name: selectedCli ? selectedCli.full_name : ''
                  }));
                }}
                style={inputStyle}
              >
                <option value="">-- Choose registered client --</option>
                {clients.map(cli => (
                  <option key={cli.id} value={cli.email}>
                    {cli.full_name || 'Client'} ({cli.email})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Amount ($)</label>
                <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={inputStyle} placeholder="150.00" />
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={inputStyle} placeholder="Deep cleaning — 2200 sq ft" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" disabled={creating} className="btn btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} /> {creating ? 'Creating...' : 'Create Invoice'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice List */}
      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #334155', borderRadius: 12, color: '#64748b' }}>
          <FileText size={40} style={{ marginBottom: 12 }} />
          <p>No invoices yet. Create your first invoice above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {invoices.map(inv => (
            <div key={inv.id} className="card dashboard-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600 }}>{inv.client_name}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{inv.client_email}</p>
                    {inv.notes && <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 2 }}>{inv.notes}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2dd4bf' }}>${parseFloat(inv.amount).toFixed(2)}</span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: `${statusColor[inv.status]}20`, color: statusColor[inv.status],
                    padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600
                  }}>
                    {statusIcon[inv.status]} {inv.status.toUpperCase()}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {inv.status === 'unpaid' && (
                      <button onClick={() => markSent(inv.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Send size={12} /> Mark Sent
                      </button>
                    )}
                    {inv.status !== 'paid' && (
                      <button onClick={() => markPaid(inv.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#10b981' }}>
                        <CheckCircle2 size={12} /> Mark Paid
                      </button>
                    )}
                    <button onClick={() => deleteInvoice(inv.id)} style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
