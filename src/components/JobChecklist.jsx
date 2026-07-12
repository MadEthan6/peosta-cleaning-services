import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { CheckSquare, Square, Plus, Trash2, ShieldAlert } from 'lucide-react';

const DEFAULT_TASKS = [
  'Vacuum all carpets and rugs',
  'Mop all hard floors',
  'Dust and wipe down all surfaces and furniture',
  'Sanitize kitchen counters, sink, and cabinet doors',
  'Clean inside microwave and wipe outside of appliances',
  'Scrub and sanitize toilets, showers, tubs, and bathroom sinks',
  'Empty all trash bins and replace liners',
  'Make beds (if clean linens are laid out)'
];

export default function JobChecklist({ jobId, userId }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchChecklist();
    }
  }, [jobId]);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('job_id', jobId)
        .order('task_description');

      if (error) throw error;

      if (data.length === 0) {
        // If there are no checklist items, seed default items
        await seedDefaultTasks();
      } else {
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching checklist:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultTasks = async () => {
    const itemsToInsert = DEFAULT_TASKS.map(task => ({
      job_id: jobId,
      task_description: task,
      is_completed: false
    }));

    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(itemsToInsert)
        .select();

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error seeding tasks:', err.message);
    }
  };

  const handleToggle = async (task) => {
    const updatedStatus = !task.is_completed;
    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({
          is_completed: updatedStatus,
          completed_at: updatedStatus ? new Date().toISOString() : null,
          completed_by: updatedStatus ? userId : null
        })
        .eq('id', task.id);

      if (error) throw error;

      setTasks(prev => prev.map(t => t.id === task.id ? { 
        ...t, 
        is_completed: updatedStatus,
        completed_at: updatedStatus ? new Date().toISOString() : null,
        completed_by: updatedStatus ? userId : null
      } : t));
    } catch (err) {
      alert('Error updating checklist item: ' + err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          job_id: jobId,
          task_description: newTask.trim(),
          is_completed: false
        })
        .select();

      if (error) throw error;

      setTasks(prev => [...prev, data[0]]);
      setNewTask('');
    } catch (err) {
      alert('Error adding checklist item: ' + err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ color: '#94a3b8' }}>Loading checklist...</div>;
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="flex justify-between align-center" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Job Completion Progress</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-primary-light)', fontWeight: 700 }}>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--color-primary-light)', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="flex align-center justify-between"
            style={{ 
              padding: '12px 16px', 
              borderRadius: 'var(--radius)', 
              backgroundColor: '#0f172a',
              border: `1px solid ${task.is_completed ? 'rgba(16, 185, 129, 0.2)' : '#334155'}`,
              transition: 'var(--transition)'
            }}
          >
            <div 
              className="flex align-center gap-4" 
              style={{ cursor: 'pointer', flexGrow: 1 }} 
              onClick={() => handleToggle(task)}
            >
              <div style={{ color: task.is_completed ? 'var(--color-success)' : '#94a3b8' }}>
                {task.is_completed ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
              <span style={{ 
                textDecoration: task.is_completed ? 'line-through' : 'none',
                color: task.is_completed ? '#64748b' : '#f8fafc'
              }}>
                {task.task_description}
              </span>
            </div>
            <button 
              onClick={() => handleDeleteTask(task.id)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.7}
              aria-label="Delete custom task"
              title="Delete custom task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} className="flex gap-2">
        <input 
          type="text" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="Add custom task (e.g., Clean under couch)..." 
          className="form-input" 
          style={{ flexGrow: 1, backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }} 
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '12px 18px', borderRadius: '12px' }}>
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
}
