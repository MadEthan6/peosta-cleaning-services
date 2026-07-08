import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DollarSign, Save, RefreshCw, Tag, Plus, Trash2, TrendingUp } from 'lucide-react';

const COMPETITOR_RATES = [
  { name: 'Dubuque Area Average', standard: '0.10–0.15', deep: '0.18–0.25', commercial: '0.13–0.18' },
  { name: 'Typical Hourly (Standard)', standard: '$35–$75/hr', deep: '$55–$100/hr', commercial: '$40–$80/hr' },
  { name: 'Peosta/East DBQ Market', standard: '0.10–0.13', deep: '0.16–0.22', commercial: '0.12–0.16' },
];

const inputStyle = {
  backgroundColor: '#0f172a', borderColor: '#334155', color: 'white',
  border: '1px solid #334155', borderRadius: 8, padding: '10px 14px',
  fontSize: '0.95rem', width: '100%', outline: 'none',
};

export default function OwnerSettings() {
  const [rates, setRates] = useState({ standard_rate: 0.12, deep_rate: 0.20, commercial_rate: 0.15 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Promo codes
  const [promoCodes, setPromoCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(10);
  const [addingCode, setAddingCode] = useState(false);

  // Stripe keys state
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [savingStripe, setSavingStripe] = useState(false);
  const [savedStripe, setSavedStripe] = useState(false);

  useEffect(() => {
    fetchRates();
    fetchPromoCodes();
    fetchStripeKeys();
  }, []);

  const fetchStripeKeys = async () => {
    try {
      const { data } = await supabase.from('business_settings').select('*').eq('id', 1).maybeSingle();
      if (data) {
        setStripePublishableKey(data.stripe_publishable_key || '');
        setStripeSecretKey(data.stripe_secret_key || '');
      }
    } catch (err) {
      console.error('Error fetching Stripe keys:', err);
    }
  };

  const handleSaveStripe = async () => {
    setSavingStripe(true);
    try {
      const { error } = await supabase.from('business_settings').upsert({
        id: 1,
        stripe_publishable_key: stripePublishableKey,
        stripe_secret_key: stripeSecretKey,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) throw error;
      setSavedStripe(true);
      setTimeout(() => setSavedStripe(false), 3000);
    } catch (err) {
      alert('Error saving Stripe keys: ' + err.message);
    } finally {
      setSavingStripe(false);
    }
  };

  const fetchRates = async () => {
    const { data } = await supabase.from('pricing_rates').select('*').eq('id', 1).maybeSingle();
    if (data) setRates({ standard_rate: parseFloat(data.standard_rate), deep_rate: parseFloat(data.deep_rate), commercial_rate: parseFloat(data.commercial_rate) });
  };

  const fetchPromoCodes = async () => {
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    if (data) setPromoCodes(data);
  };

  const handleSaveRates = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('pricing_rates').upsert({
        id: 1,
        standard_rate: rates.standard_rate,
        deep_rate: rates.deep_rate,
        commercial_rate: rates.commercial_rate,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving rates: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCode = async () => {
    if (!newCode.trim()) return;
    setAddingCode(true);
    try {
      const { error } = await supabase.from('promo_codes').insert({
        code: newCode.trim().toUpperCase(),
        discount_percent: parseInt(newDiscount),
        active: true
      });
      if (error) throw error;
      setNewCode('');
      setNewDiscount(10);
      fetchPromoCodes();
    } catch (err) {
      alert('Error adding code: ' + err.message);
    } finally {
      setAddingCode(false);
    }
  };

  const handleToggleCode = async (id, active) => {
    await supabase.from('promo_codes').update({ active: !active }).eq('id', id);
    fetchPromoCodes();
  };

  const handleDeleteCode = async (id) => {
    if (!confirm('Delete this promo code?')) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    fetchPromoCodes();
  };

  const ratePercent = (rate) => `$${rate}/sq ft → ~$${Math.round(rate * 1500)}/avg home`;

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: 8 }}>Owner Settings</h2>
      <p style={{ color: '#94a3b8', marginBottom: 32 }}>Configure pricing, promo codes, and business settings.</p>

      {/* Pricing Rates + Competitor Comparison */}
      <div className="grid grid-2" style={{ gap: 24, marginBottom: 24 }}>
        {/* Dynamic Pricing */}
        <div className="card dashboard-card">
          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={20} style={{ color: 'var(--color-primary-light)' }} /> Pricing Per Square Foot
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 24 }}>
            These rates populate the booking calculator in real-time.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { key: 'standard_rate', label: '🏠 Standard Cleaning Rate', min: 0.05, max: 0.30, step: 0.01 },
              { key: 'deep_rate', label: '✨ Deep Cleaning Rate', min: 0.10, max: 0.50, step: 0.01 },
              { key: 'commercial_rate', label: '🏢 Commercial Cleaning Rate', min: 0.05, max: 0.40, step: 0.01 },
            ].map(({ key, label, min, max, step }) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>{label}</label>
                  <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>${rates[key].toFixed(2)}/sq ft</span>
                </div>
                <input
                  type="range"
                  min={min} max={max} step={step}
                  value={rates[key]}
                  onChange={(e) => setRates(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#2dd4bf' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{ratePercent(rates[key])}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveRates}
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 24, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Save size={18} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Pricing Rates'}
          </button>
          {saved && (
            <p style={{ textAlign: 'center', color: '#10b981', fontSize: '0.85rem', marginTop: 8 }}>
              ✓ Rates updated — booking page will reflect immediately.
            </p>
          )}
        </div>

        {/* Competitor Rate Comparison */}
        <div className="card dashboard-card">
          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} style={{ color: '#f59e0b' }} /> Peosta/Dubuque Market Rates
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 20 }}>
            Local competitor benchmarks to guide your pricing strategy.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  {['Market / Source', 'Standard', 'Deep', 'Commercial'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', borderBottom: '1px solid #334155', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_RATES.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 500 }}>{row.name}</td>
                    <td style={{ padding: '10px 12px', color: '#10b981' }}>{row.standard}</td>
                    <td style={{ padding: '10px 12px', color: '#10b981' }}>{row.deep}</td>
                    <td style={{ padding: '10px 12px', color: '#10b981' }}>{row.commercial}</td>
                  </tr>
                ))}
                {/* Your current rates row */}
                <tr style={{ backgroundColor: 'rgba(45,212,191,0.07)', borderTop: '2px solid #2dd4bf' }}>
                  <td style={{ padding: '10px 12px', color: '#2dd4bf', fontWeight: 700 }}>⭐ Your Current Rates</td>
                  <td style={{ padding: '10px 12px', color: '#2dd4bf', fontWeight: 700 }}>${rates.standard_rate.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', color: '#2dd4bf', fontWeight: 700 }}>${rates.deep_rate.toFixed(2)}</td>
                  <td style={{ padding: '10px 12px', color: '#2dd4bf', fontWeight: 700 }}>${rates.commercial_rate.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 20, padding: 16, borderRadius: 8, backgroundColor: '#0f172a', border: '1px solid #334155' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              📊 <strong style={{ color: '#e2e8f0' }}>Market intel:</strong> The Dubuque metro averages $35–$75/hr for standard home cleaning.
              At {sqFtRange(rates.standard_rate)} sq ft, you're {ratePosition(rates.standard_rate)} the local range — a competitive position for Peosta.
            </p>
          </div>
        </div>
      </div>

      {/* Promo Codes Manager */}
      <div className="card dashboard-card">
        <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag size={20} style={{ color: 'var(--color-primary-light)' }} /> Promo Code Manager
        </h3>

        {/* Add new code */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="PROMO CODE"
            style={{ ...inputStyle, flex: 1, minWidth: 140, fontFamily: 'monospace', letterSpacing: '0.05em' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>Discount %:</span>
            <input
              type="number"
              min="1" max="100"
              value={newDiscount}
              onChange={(e) => setNewDiscount(e.target.value)}
              style={{ ...inputStyle, width: 80 }}
            />
          </div>
          <button
            onClick={handleAddCode}
            disabled={addingCode || !newCode.trim()}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
          >
            <Plus size={16} /> Add Code
          </button>
        </div>

        {/* Codes list */}
        {promoCodes.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No promo codes yet. Create one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {promoCodes.map(code => (
              <div key={code.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                padding: '12px 16px', borderRadius: 8, backgroundColor: '#0f172a', border: `1px solid ${code.active ? '#334155' : '#1e293b'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: code.active ? '#2dd4bf' : '#64748b', fontSize: '1rem', letterSpacing: '0.05em' }}>
                    {code.code}
                  </span>
                  <span style={{ background: code.active ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.2)', color: code.active ? '#10b981' : '#64748b', padding: '2px 10px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600 }}>
                    {code.active ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>{code.discount_percent}% off</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleToggleCode(code.id, code.active)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    {code.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteCode(code.id)}
                    style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function sqFtRange(rate) {
  const avg = Math.round(rate * 1500);
  return `~$${avg} (1500`;
}

function ratePosition(rate) {
  if (rate < 0.10) return 'below';
  if (rate <= 0.15) return 'within';
  return 'above';
}
