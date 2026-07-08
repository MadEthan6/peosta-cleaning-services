import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, UserCheck, ShieldAlert, Mail, Calendar, Key, UserPlus } from 'lucide-react';

export default function AccountManager() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const employees = profiles.filter(p => p.role === 'employee');
  const clients = profiles.filter(p => p.role === 'client');

  if (loading) {
    return <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Loading account records...</p>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users style={{ color: 'var(--color-primary-light)' }} /> Account Management
        </h2>
        <p style={{ color: '#94a3b8', marginTop: 4 }}>
          View and monitor registered clients and active team employee accounts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Employees Column */}
        <div className="card dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={20} style={{ color: '#10b981' }} /> Team Staff ({employees.length})
            </h3>
          </div>

          {employees.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>
              No employees registered yet. Go to "Create Employee" tab to add staff.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {employees.map(emp => (
                <div key={emp.id} style={{ padding: 16, borderRadius: 8, backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                  <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>{emp.full_name || 'Staff Member'}</h4>
                  
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} /> {emp.email}
                  </p>
                  
                  {emp.created_at && (
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} /> Registered: {new Date(emp.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clients Column */}
        <div className="card dashboard-card">
          <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} style={{ color: '#2dd4bf' }} /> Registered Clients ({clients.length})
          </h3>

          {clients.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>
              No clients have registered portals yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {clients.map(cli => (
                <div key={cli.id} style={{ padding: 16, borderRadius: 8, backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                  <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>{cli.full_name || 'Client Portal'}</h4>
                  
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} /> {cli.email}
                  </p>
                  
                  {cli.created_at && (
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} /> Registered: {new Date(cli.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
