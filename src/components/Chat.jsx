import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Send, MessageSquare, User, Circle } from 'lucide-react';

export default function Chat({ userId }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      
      // Subscribe to real-time message changes
      const channel = supabase
        .channel(`chat-room-${userId}-${selectedUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const newMsg = payload.new;
            // Check if this message belongs to the current conversation
            const isRelevant = 
              (newMsg.sender_id === userId && newMsg.recipient_id === selectedUser.id) ||
              (newMsg.sender_id === selectedUser.id && newMsg.recipient_id === userId);
            
            if (isRelevant) {
              setMessages(prev => [...prev, newMsg]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId); // Don't list self

      if (error) throw error;
      setUsers(data || []);
      if (data && data.length > 0) {
        setSelectedUser(data[0]); // Default to first user
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input instantly

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          recipient_id: selectedUser.id,
          content: messageText
        });

      if (error) throw error;
      
      // Note: The real-time subscription will catch this and insert it into state,
      // but let's make sure if subscription fails, it displays. (Supabase realtime handles it!)
    } catch (err) {
      alert('Error sending message: ' + err.message);
    }
  };

  return (
    <div className="chat-container">
      {/* Users Sidebar */}
      <div className="chat-users-list">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignCenter: 'center', gap: 8 }}>
          <MessageSquare size={18} style={{ color: 'var(--color-primary-light)' }} />
          <h4 style={{ color: 'white', fontSize: '1rem' }}>Team Direct Texts</h4>
        </div>
        
        {loadingUsers ? (
          <div style={{ padding: 20, color: '#64748b' }}>Loading team list...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 20, color: '#64748b', fontSize: '0.9rem' }}>No other team members found.</div>
        ) : (
          users.map((user) => (
            <div 
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`chat-user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
            >
              <div className="chat-user-avatar">
                {user.full_name?.charAt(0) || 'E'}
              </div>
              <div className="chat-user-info">
                <div className="chat-user-name" style={{ color: selectedUser?.id === user.id ? '#2dd4bf' : 'white' }}>
                  {user.full_name}
                </div>
                <div className="chat-user-role">
                  {user.role === 'owner' ? '👑 Owner' : '📋 Employee'}
                </div>
              </div>
              <Circle size={8} fill="var(--color-success)" stroke="none" style={{ color: 'var(--color-success)' }} />
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            {/* Active User Header */}
            <div className="chat-header flex align-center gap-4">
              <div className="chat-user-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                {selectedUser.full_name?.charAt(0) || 'E'}
              </div>
              <div>
                <h4 style={{ color: 'white', fontSize: '0.95rem' }}>{selectedUser.full_name}</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Direct text channel • {selectedUser.role === 'owner' ? 'Company Owner' : 'Cleaning Team'}
                </p>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="chat-messages">
              {loadingMessages ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Loading texts...</div>
              ) : messages.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0', fontSize: '0.9rem' }}>
                  No messages yet. Send a text to start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.sender_id === userId;
                  return (
                    <div 
                      key={msg.id} 
                      className={`chat-message-bubble ${isSentByMe ? 'chat-message-sent' : 'chat-message-received'}`}
                    >
                      <p>{msg.content}</p>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        display: 'block', 
                        textAlign: 'right', 
                        marginTop: 4,
                        opacity: 0.8
                      }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Text ${selectedUser.full_name}...`}
                className="form-input chat-input"
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', borderRadius: '12px' }}>
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
            <MessageSquare size={48} style={{ marginBottom: 16 }} />
            <p>Select a team member to start direct texting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
