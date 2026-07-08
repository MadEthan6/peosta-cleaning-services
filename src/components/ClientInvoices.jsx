import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FileText, Clock, CheckCircle2, CreditCard } from 'lucide-react';

export default function ClientInvoices({ clientEmail, onPayInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientEmail) fetchInvoices();
  }, [clientEmail]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_email', clientEmail)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching client invoices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = { unpaid: '#f59e0b', sent: '#3b82f6', paid: '#10b981' };
  const statusIcon = { unpaid: <Clock size={14} />, sent: <Clock size={14} />, paid: <CheckCircle2 size={14} /> };

  if (loading) {
    return <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading invoices...</p>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText style={{ color: 'var(--color-primary-light)' }} /> My Invoices
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 4 }}>
          Review outstanding statements and securely settle balances using Stripe.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #334155', borderRadius: 12, color: '#64748b' }}>
          <FileText size={40} style={{ marginBottom: 12 }} />
          <p>No invoices found for your account.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {invoices.map(inv => (
            <div key={inv.id} className="card dashboard-card" style={{ padding: '20px 24px', backgroundColor: '#1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h4 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 700 }}>Invoice Statement</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>Date: {new Date(inv.created_at).toLocaleDateString()}</p>
                  {inv.notes && (
                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: 8, fontStyle: 'italic' }}>
                      📋 {inv.notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Amount</p>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2dd4bf' }}>${parseFloat(inv.amount).toFixed(2)}</p>
                  </div>

                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: `${statusColor[inv.status]}20`, color: statusColor[inv.status],
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {statusIcon[inv.status]} {inv.status === 'sent' ? 'UNPAID' : inv.status.toUpperCase()}
                  </span>

                  {inv.status !== 'paid' ? (
                    <button
                      onClick={() => onPayInvoice(inv)}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', fontSize: '0.9rem', backgroundColor: '#10b981', color: 'white' }}
                    >
                      <CreditCard size={16} /> Pay Online
                    </button>
                  ) : (
                    <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={16} /> Settled on {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
