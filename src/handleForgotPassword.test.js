import { describe, it, expect, vi, beforeEach } from 'vitest';
import handleForgotPassword from './handleForgotPassword';
import { supabase } from './supabaseClient';

// Mock supabaseClient
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

describe('handleForgotPassword', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Spy on window.alert and mock its implementation to prevent actual alerts during tests
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should alert if email is not provided', async () => {
    await handleForgotPassword('');

    expect(window.alert).toHaveBeenCalledWith("Please enter your email address first.");
    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('should call supabase.auth.resetPasswordForEmail and alert success if successful', async () => {
    // Mock successful reset
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });

    const email = 'test@example.com';
    await handleForgotPassword(email);

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
      redirectTo: 'https://MadEthan6.github.io/peosta-cleaning-services/',
    });
    expect(window.alert).toHaveBeenCalledWith("Password reset email sent!");
  });

  it('should call supabase.auth.resetPasswordForEmail and alert error if unsuccessful', async () => {
    // Mock failed reset
    const mockError = { message: 'User not found' };
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: mockError });

    const email = 'test@example.com';
    await handleForgotPassword(email);

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
      redirectTo: 'https://MadEthan6.github.io/peosta-cleaning-services/',
    });
    expect(window.alert).toHaveBeenCalledWith("Error: User not found");
  });
});
