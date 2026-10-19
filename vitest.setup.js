import '@testing-library/jest-dom';
import { vi } from 'vitest';

process.env.VITE_SUPABASE_URL = 'https://mock.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'mock-key'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
