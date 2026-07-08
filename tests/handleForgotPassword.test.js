import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleForgotPassword from '../src/handleForgotPassword';
import { supabase } from '../src/supabaseClient';

// Mock supabase client
vi.mock('../src/supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

describe('handleForgotPassword', () => {
  let alertMock;

  beforeEach(() => {
    alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  it('should alert if no email is provided', async () => {
    await handleForgotPassword('');
    expect(alertMock).toHaveBeenCalledWith('Please enter your email address first.');
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('should call supabase.auth.resetPasswordForEmail and alert success if no error', async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });

    await handleForgotPassword('test@example.com');

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: 'https://MadEthan6.github.io/peosta-cleaning-services/',
    });
    expect(alertMock).toHaveBeenCalledWith('Password reset email sent!');
  });

  it('should call supabase.auth.resetPasswordForEmail and alert error message if error occurs', async () => {
    const mockError = { message: 'User not found' };
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: mockError });

    await handleForgotPassword('test@example.com');

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: 'https://MadEthan6.github.io/peosta-cleaning-services/',
    });
    expect(alertMock).toHaveBeenCalledWith('Error: User not found');
  });
});
