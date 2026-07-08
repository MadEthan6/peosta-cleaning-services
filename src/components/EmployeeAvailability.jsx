import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, CheckCircle2, Save } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function EmployeeAvailability({ employeeId }) {
  const [availability, setAvailability] = useState(
    Array.from({ length: 7 }, (_, i) => ({ day_of_week: i, available: i >= 1 && i <= 5 }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [employeeId]);

  const fetchAvailability = async () => {
    const { data } = await supabase
      .from('employee_availability')
      .select('*')
      .eq('employee_id', employeeId);
    
    if (data && data.length > 0) {
      const map = Object.fromEntries(data.map(d => [d.day_of_week, d.available]));
      setAvailability(Array.from({ length: 7 }, (_, i) => ({
        day_of_week: i,
        available: map[i] !== undefined ? map[i] : (i >= 1 && i <= 5)
      })));
    }
  };

  const toggleDay = (dayIndex) => {
    setAvailability(prev => prev.map(d => 
      d.day_of_week === dayIndex ? { ...d, available: !d.available } : d
    ));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts = availability.map(d => ({
        employee_id: employeeId,
        day_of_week: d.day_of_week,
        available: d.available
      }));
      const { error } = await supabase
        .from('employee_availability')
        .upsert(upserts, { onConflict: 'employee_id,day_of_week' });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving availability: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: 8 }}>My Availability</h2>
      <p style={{ color: '#94a3b8', marginBottom: 28 }}>Toggle the days you're available for cleanings. The owner will use this to schedule jobs.</p>

      <div className="card dashboard-card" style={{ maxWidth: 480 }}>
        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} style={{ color: 'var(--color-primary-light)' }} /> Weekly Availability
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {DAYS.map((day, i) => {
            const avail = availability[i];
            return (
              <div
                key={i}
                onClick={() => toggleDay(i)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${avail.available ? '#2dd4bf' : '#334155'}`,
                  backgroundColor: avail.available ? 'rgba(45,212,191,0.07)' : '#0f172a',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontWeight: 600, color: avail.available ? '#e2e8f0' : '#64748b' }}>{day}</span>
                <div style={{
                  width: 48, height: 26, borderRadius: 999,
                  backgroundColor: avail.available ? '#2dd4bf' : '#334155',
                  position: 'relative', transition: 'background 0.2s'
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: avail.available ? 22 : 2,
                    width: 20, height: 20, borderRadius: '50%', backgroundColor: 'white',
                    transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Availability'}
        </button>
        {saved && (
          <p style={{ textAlign: 'center', color: '#10b981', fontSize: '0.85rem', marginTop: 8 }}>
            ✓ Availability updated successfully!
          </p>
        )}
      </div>
    </div>
  );
}
