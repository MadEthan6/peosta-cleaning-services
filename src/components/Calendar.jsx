import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Shield, Sparkles } from 'lucide-react';

const PACKAGES = [
  { id: 'standard', name: 'Standard Home Cleaning', pricePerSqFt: 0.12, icon: '🏠', desc: 'Dusting, vacuuming, mopping, bathrooms, kitchen, and tidying up.' },
  { id: 'deep', name: 'Deep Home Cleaning', pricePerSqFt: 0.20, icon: '✨', desc: 'Standard cleaning + baseboards, inside oven/fridge, cabinets, and windows.' },
  { id: 'commercial', name: 'Commercial Office Cleaning', pricePerSqFt: 0.15, icon: '🏢', desc: 'Desks, trash removal, restrooms, breakrooms, and high-traffic floor care.' }
];

const TIME_SLOTS = ['08:00 AM', '11:00 AM', '02:00 PM', '05:00 PM'];

export default function Calendar({ onBookingComplete }) {
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);
  const [sqFt, setSqFt] = useState(1500);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  
  // Basic date math
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const calculatedPrice = Math.max(90, Math.round(sqFt * selectedPackage.pricePerSqFt));

  const handleDayClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    if (date >= new Date().setHours(0,0,0,0)) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time slot first!');
      return;
    }

    const bookingDetails = {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      servicePackage: selectedPackage.name,
      scheduledAt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), parseInt(selectedTime)),
      price: calculatedPrice,
      status: 'pending',
      paymentStatus: 'unpaid'
    };

    onBookingComplete(bookingDetails);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 12 }}>Schedule Your Cleaning</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
          Select a package, customize your size, pick a convenient date, and secure your booking in minutes.
        </p>
      </div>

      <div className="grid grid-2">
        {/* Step 1: Package & Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--color-primary)' }}>1.</span> Customize Services
          </h3>
          
          <div className="form-group">
            <label className="form-label">Select Cleaning Package</label>
            <div className="flex flex-col gap-4">
              {PACKAGES.map((pkg) => (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius)',
                    border: `2px solid ${selectedPackage.id === pkg.id ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    backgroundColor: selectedPackage.id === pkg.id ? 'rgba(13, 148, 136, 0.05)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 16,
                    transition: 'var(--transition)'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{pkg.icon}</span>
                  <div>
                    <h4 style={{ color: selectedPackage.id === pkg.id ? 'var(--color-primary)' : 'inherit' }}>{pkg.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{pkg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 24 }}>
            <div className="flex justify-between form-label">
              <label>Home/Office Size (Sq Ft)</label>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{sqFt} Sq Ft</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="6000" 
              step="100" 
              value={sqFt} 
              onChange={(e) => setSqFt(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
            <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>500 sq ft</span>
              <span>6,000+ sq ft</span>
            </div>
          </div>

          <div className="gradient-fresh" style={{ padding: 24, borderRadius: 'var(--radius)', color: 'white', marginTop: 32 }}>
            <div className="flex justify-between align-center">
              <div>
                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.9 }}>ESTIMATED PRICE</span>
                <h3 style={{ fontSize: '2rem', color: 'white', marginTop: 4 }}>${calculatedPrice}</h3>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', opacity: 0.9 }}>
                <p>Includes all equipment</p>
                <p>& cleaning supplies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Date & Contact Details */}
        <div className="card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--color-primary)' }}>2.</span> Choose Time & Booking Details
          </h3>

          {/* Month Selector */}
          <div className="flex align-center justify-between" style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: '1.1rem' }}>{monthNames[currentMonth]} {currentYear}</h4>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: 6, borderRadius: '8px' }}><ChevronLeft size={18} /></button>
              <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: 6, borderRadius: '8px' }}><ChevronRight size={18} /></button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentYear, currentMonth, day);
              const isPast = date < new Date().setHours(0, 0, 0, 0);
              const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;

              return (
                <div 
                  key={day} 
                  onClick={() => !isPast && handleDayClick(day)}
                  className={`calendar-day-cell ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                >
                  <span className="calendar-day-number">{day}</span>
                </div>
              );
            })}
          </div>

          {selectedDate && (
            <div className="animate-fade-in" style={{ marginTop: 24 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> Available Slots for {selectedDate.toLocaleDateString()}
              </label>
              <div className="calendar-slots">
                {TIME_SLOTS.map((slot) => (
                  <div 
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`calendar-slot-button ${selectedTime === slot ? 'selected' : ''}`}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Contact & Location Information</h4>
            
            <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="form-input" placeholder="John Doe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input type="email" required value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="form-input" placeholder="john@example.com" />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input type="tel" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="form-input" placeholder="(563) 555-0100" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Service Address</label>
                <input type="text" required value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="form-input" placeholder="123 Main St, Peosta, IA" />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: 16 }}
              disabled={!selectedDate || !selectedTime}
            >
              Book & Pay ${calculatedPrice}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
