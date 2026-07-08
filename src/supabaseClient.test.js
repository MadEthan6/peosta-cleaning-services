import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Setup environment variables before importing the module
vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'example-anon-key');

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({})),
  };
});

describe('supabaseClient', () => {
  let supabase, createSecondaryClient;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import module to allow env vars to be read during module evaluation
    vi.resetModules();
    const module = await import('./supabaseClient');
    supabase = module.supabase;
    createSecondaryClient = module.createSecondaryClient;
  });

  it('should export a primary supabase client configured with env vars', () => {
    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'example-anon-key'
    );
    expect(supabase).toBeDefined();
  });

  it('should export createSecondaryClient that creates a client with specific auth settings', () => {
    const secondaryClient = createSecondaryClient();

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'example-anon-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
    expect(secondaryClient).toBeDefined();
  });
});
