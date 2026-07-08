import { supabase } from './supabase';

const ResetPassword = () => {
  const [email, setEmail] = React.useState('');
  const [resetSent, setResetSent] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://MadEthan6.github.io/peosta-cleaning-services/',
    });
    if (error) {
      setError('Error: ' + error.message);
    } else {
      setResetSent(true);
      alert('Password reset email sent!');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      {resetSent ? (
        <p>Password reset instructions have been sent to your email.</p>
      ) : (
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Send Reset Instructions</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default ResetPassword;