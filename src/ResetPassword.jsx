import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://MadEthan6.github.io/peosta-cleaning-services/'
    });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Password reset email sent! Check your inbox.');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit">Send Reset Email</button>
      </form>
      {message && <p>{message}</p>}
      <p>
        <a href="/">Back to Login</a>
      </p>
    </div>
  );
};

export default ResetPassword;