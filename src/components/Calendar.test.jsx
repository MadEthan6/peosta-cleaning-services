import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BookingCalendar from './Calendar';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              standard_rate: 0.12,
              deep_rate: 0.20,
              commercial_rate: 0.15
            },
            error: null
          })
        }))
      }))
    }))
  }
}));

describe('BookingCalendar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic options and default selections', async () => {
    render(<BookingCalendar onBookingComplete={vi.fn()} />);

    expect(screen.getByText(/Standard Home Cleaning/i)).toBeInTheDocument();
    expect(screen.getByText(/Deep Home Cleaning/i)).toBeInTheDocument();

    // In the DOM there's <div>One-Time</div> and also <div>Weekly</div>
    const oneTimeEls = screen.getAllByText(/One-Time/i);
    expect(oneTimeEls.length).toBeGreaterThan(0);
    const weeklyEls = screen.getAllByText(/Weekly/i);
    expect(weeklyEls.length).toBeGreaterThan(0);

    await waitFor(() => {
      const priceEls = screen.getAllByText(/\$180/i);
      expect(priceEls.length).toBeGreaterThan(0);
    });
  });

  test('updates price when changing square footage and package', async () => {
    render(<BookingCalendar onBookingComplete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText(/\$180/i).length).toBeGreaterThan(0);
    });

    const deepCleanPackage = screen.getAllByText(/Deep Home Cleaning/i).find(el => el.tagName === 'H4').closest('div[style*="cursor: pointer"]');
    fireEvent.click(deepCleanPackage);

    await waitFor(() => {
      expect(screen.getAllByText(/\$300/i).length).toBeGreaterThan(0);
    });

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 2000 } });

    await waitFor(() => {
      expect(screen.getAllByText(/\$400/i).length).toBeGreaterThan(0);
    });
  });

  test('applies frequency discount', async () => {
    render(<BookingCalendar onBookingComplete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getAllByText(/\$180/i).length).toBeGreaterThan(0);
    });

    const weeklyOption = screen.getAllByText(/Weekly/i).find(el => el.tagName === 'DIV' && el.style.fontWeight === '600').closest('div[style*="cursor: pointer"]');
    fireEvent.click(weeklyOption);

    await waitFor(() => {
      expect(screen.getAllByText(/\$162/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/10% recurring discount applied!/i)).toBeInTheDocument();
    });
  });

  test('submits form with correctly calculated price and selections', async () => {
    const mockOnBookingComplete = vi.fn();
    render(<BookingCalendar onBookingComplete={mockOnBookingComplete} />);

    await waitFor(() => {
        expect(screen.getAllByText(/\$180/i).length).toBeGreaterThan(0);
    });

    const nextMonthBtn = screen.getAllByRole('button').find(el => el.innerHTML.includes('lucide-chevron-right'));
    fireEvent.click(nextMonthBtn);

    const day15 = screen.getAllByText('15').find(el => el.classList.contains('calendar-day-number'));
    fireEvent.click(day15.parentElement);

    // Wait for time slots to appear
    await waitFor(() => {
        expect(screen.getByText('08:00 AM')).toBeInTheDocument();
    });

    // 2. Pick a time slot
    fireEvent.click(screen.getByText('08:00 AM'));

    // 3. Fill out the form
    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'Jane Test');
    await userEvent.type(screen.getByPlaceholderText('john@example.com'), 'jane@test.com');
    await userEvent.type(screen.getByPlaceholderText('(563) 555-0100'), '555-123-4567');
    await userEvent.type(screen.getByPlaceholderText('123 Main St, Peosta, IA'), '456 Test Ave');

    // 4. Submit the form
    const submitBtn = screen.getByRole('button', { name: /Book & Pay \$180/i });
    fireEvent.click(submitBtn);

    // 5. Verify onBookingComplete was called with correct data
    await waitFor(() => {
      expect(mockOnBookingComplete).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockOnBookingComplete.mock.calls[0][0];
    expect(calledWith).toMatchObject({
        price: 180,
        frequency: 'one-time',
        clientName: 'Jane Test',
        clientEmail: 'jane@test.com',
        clientPhone: '555-123-4567',
        clientAddress: '456 Test Ave',
        servicePackage: 'Standard Home Cleaning',
        status: 'pending',
        paymentStatus: 'unpaid'
    });
    // Check scheduledAt
    expect(calledWith.scheduledAt).toBeInstanceOf(Date);
    expect(calledWith.scheduledAt.getDate()).toBe(15);
  });
});
