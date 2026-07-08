import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// We need to mock the environment variables before importing the module
vi.stubEnv('VITE_SUPABASE_URL', 'https://mock-supabase-url.com');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key');

// Mock createClient
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({ mockClient: true })),
  };
});

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('exports a supabase client initialized with environment variables', async () => {
    // Import dynamically after mocking the env variables
    const { supabase } = await import('../supabaseClient.js');

    expect(createClient).toHaveBeenCalledWith(
      'https://mock-supabase-url.com',
      'mock-anon-key'
    );
    expect(supabase).toEqual({ mockClient: true });
  });

  it('createSecondaryClient initializes a secondary client with correct auth options', async () => {
    const { createSecondaryClient } = await import('../supabaseClient.js');

    const secondaryClient = createSecondaryClient();

    expect(createClient).toHaveBeenCalledWith(
      'https://mock-supabase-url.com',
      'mock-anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
    expect(secondaryClient).toEqual({ mockClient: true });
  });
});
