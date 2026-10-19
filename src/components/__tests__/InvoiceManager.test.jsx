import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InvoiceManager from '../InvoiceManager';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('InvoiceManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchInvoices handles missing error appropriately', async () => {
    // Setup the mock to simulate a network error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Failed to fetch'),
        }),
      }),
    });

    render(<InvoiceManager />);

    // Wait for the component to handle the error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching invoices:', 'Failed to fetch');
    });

    // Check if the component still renders properly, loading should be false and invoices should be empty
    expect(screen.getByText('No invoices yet. Create your first invoice above.')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
