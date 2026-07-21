import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckSquare, Square, Plus, Trash2 } from 'lucide-react';

export default function TodoTasks({ jobId, userRole, userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (jobId) fetchTasks();
  }, [jobId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      const { error } = await supabase.from('todo_tasks').insert({
        job_id: jobId,
        title: newTask.trim(),
        created_by: userId,
        completed: false
      });
      if (error) throw error;
      setNewTask('');
      fetchTasks();
    } catch (err) {
      alert('Error adding task: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const { error } = await supabase
        .from('todo_tasks')
        .update({
          completed: !task.completed,
          completed_by: !task.completed ? userId : null
        })
        .eq('id', task.id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      console.error('Error updating task:', err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    await supabase.from('todo_tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div>
      {tasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {completedCount} / {tasks.length} tasks completed
            </span>
            <span style={{ color: completedCount === tasks.length ? '#10b981' : '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
              {completedCount === tasks.length ? '✓ All done!' : `${tasks.length - completedCount} remaining`}
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 999, backgroundColor: '#334155', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(completedCount / tasks.length) * 100}%`, backgroundColor: '#10b981', transition: 'width 0.3s ease', borderRadius: 999 }} />
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading tasks...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {tasks.map(task => (
            <div
              key={task.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                backgroundColor: task.completed ? 'rgba(16,185,129,0.07)' : '#0f172a',
                border: `1px solid ${task.completed ? 'rgba(16,185,129,0.2)' : '#1e293b'}`,
                transition: 'all 0.2s'
              }}
            >
              <button
                onClick={() => handleToggleTask(task)}
                aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
                title={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.completed ? '#10b981' : '#64748b', display: 'flex', flexShrink: 0 }}
              >
                {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              <span style={{
                flexGrow: 1, fontSize: '0.9rem',
                color: task.completed ? '#64748b' : '#e2e8f0',
                textDecoration: task.completed ? 'line-through' : 'none'
              }}>
                {task.title}
              </span>
              {(userRole === 'owner') && (
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  aria-label="Delete task"
                  title="Delete task"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', display: 'flex', flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
              No tasks yet{userRole === 'owner' ? ' — add some below.' : '.'}
            </p>
          )}
        </div>
      )}

      {/* Add task (owner only) */}
      {(userRole === 'owner' || userRole === 'employee') && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a task..."
            style={{
              flexGrow: 1, backgroundColor: '#0f172a', border: '1px solid #334155',
              color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: '0.9rem', outline: 'none'
            }}
          />
          <button
            onClick={handleAddTask}
            disabled={adding || !newTask.trim()}
            aria-label="Add new task"
            title={adding ? "Adding task..." : (!newTask.trim() ? "Enter a task name to add" : "Add new task")}
            className="btn btn-primary"
            style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
