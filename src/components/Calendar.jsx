import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, RefreshCw, Tag } from 'lucide-react';
import { supabase } from '../supabaseClient';

const DEFAULT_PACKAGES = [
  { id: 'standard', name: 'Standard Home Cleaning', pricePerSqFt: 0.12, icon: '🏠', desc: 'Dusting, vacuuming, mopping, bathrooms, kitchen, and tidying up.' },
  { id: 'deep', name: 'Deep Home Cleaning', pricePerSqFt: 0.20, icon: '✨', desc: 'Standard cleaning + baseboards, inside oven/fridge, cabinets, and windows.' },
  { id: 'commercial', name: 'Commercial Office Cleaning', pricePerSqFt: 0.15, icon: '🏢', desc: 'Desks, trash removal, restrooms, breakrooms, and high-traffic floor care.' }
];

const TIME_SLOTS = ['08:00 AM', '11:00 AM', '02:00 PM', '05:00 PM'];

const FREQUENCY_OPTIONS = [
  { id: 'one-time', label: 'One-Time', icon: '📅', desc: 'Single cleaning visit' },
  { id: 'weekly', label: 'Weekly', icon: '🔄', desc: 'Every week — save 10%' },
  { id: 'bi-weekly', label: 'Bi-Weekly', icon: '📆', desc: 'Every 2 weeks — save 5%' },
  { id: 'monthly', label: 'Monthly', icon: '🗓️', desc: 'Once a month' },
];

const FREQUENCY_DISCOUNT = { 'one-time': 0, 'weekly': 0.10, 'bi-weekly': 0.05, 'monthly': 0 };

export default function BookingCalendar({ 
  onBookingComplete, 
  user, 
  profile, 
  onNavigate, 
  setAuthRole, 
  setIsRegistering 
}) {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState(DEFAULT_PACKAGES[0]);
  const [sqFt, setSqFt] = useState(1500);

  useEffect(() => {
    if (profile) {
      setClientName(profile.full_name || '');
      setClientEmail(profile.email || '');
      setClientPhone(profile.phone || '');
      setClientAddress(profile.address || '');
    }
  }, [profile]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [frequency, setFrequency] = useState('one-time');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // New state variables for availability and visual validations
  const [availabilities, setAvailabilities] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Address search states
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const length = phoneNumber.length;
    if (length < 4) return phoneNumber;
    if (length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (val) => {
    const formatted = formatPhoneNumber(val);
    setClientPhone(formatted);
    if (validationErrors.clientPhone) {
      setValidationErrors(prev => ({ ...prev, clientPhone: null }));
    }
  };

  const addressTimeout = React.useRef(null);

  const handleAddressChange = async (val) => {
    clearTimeout(addressTimeout.current);
    setClientAddress(val);
    if (validationErrors.clientAddress) {
      setValidationErrors(prev => ({ ...prev, clientAddress: null }));
    }
    if (val.length < 4) {
      setAddressSuggestions([]);
      return;
    }

    addressTimeout.current = setTimeout(async () => {
      setAddressLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=us`);
        const data = await res.json();
        setAddressSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setAddressLoading(false);
      }
    }, 500);
  };

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  // Fetch dynamic pricing rates and employee availabilities from DB
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_rates')
          .select('*')
          .eq('id', 1)
          .maybeSingle();
        
        if (data && !error) {
          const updatedPackages = [
            { ...DEFAULT_PACKAGES[0], pricePerSqFt: parseFloat(data.standard_rate) },
            { ...DEFAULT_PACKAGES[1], pricePerSqFt: parseFloat(data.deep_rate) },
            { ...DEFAULT_PACKAGES[2], pricePerSqFt: parseFloat(data.commercial_rate) },
          ];
          setPackages(updatedPackages);
          setSelectedPackage(updatedPackages[0]);
        }
      } catch (err) {
        console.log('Using default rates:', err.message);
      }
    };

    const fetchAvailabilities = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_availability')
          .select('day_of_week, available')
          .eq('available', true);
        if (data && !error) {
          setAvailabilities(data || []);
        }
      } catch (err) {
        console.error('Error fetching employee availabilities:', err);
      }
    };

    fetchRates();
    fetchAvailabilities();
  }, []);

  const isDayAvailable = (date) => {
    // Standard validation: prevent selection of past days
    if (date < new Date().setHours(0,0,0,0)) return false;
    
    // If no employee availabilities have been configured yet, default to allowing weekdays (Mon-Fri)
    if (availabilities.length === 0) {
      const day = date.getDay();
      return day >= 1 && day <= 5;
    }
    const dayOfWeek = date.getDay();
    return availabilities.some(a => a.day_of_week === dayOfWeek);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(prev => prev - 1); }
    else setCurrentMonth(prev => prev - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(prev => prev + 1); }
    else setCurrentMonth(prev => prev + 1);
  };

  const basePrice = Math.max(90, Math.round(sqFt * selectedPackage.pricePerSqFt));
  const freqDiscount = FREQUENCY_DISCOUNT[frequency] || 0;
  const promoDiscount = promoApplied ? promoApplied.discount_percent / 100 : 0;
  const discountedPrice = Math.round(basePrice * (1 - freqDiscount) * (1 - promoDiscount));

  const handleDayClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    if (isDayAvailable(date)) {
      setSelectedDate(date);
      // Reset selectedTime when date changes
      setSelectedTime(null);
      // Remove date validation error if present
      setValidationErrors(prev => ({ ...prev, selectedDate: null }));
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error || !data) {
        alert('Invalid or expired promo code.');
        setPromoApplied(null);
      } else {
        setPromoApplied(data);
        alert(`Promo code applied! ${data.discount_percent}% off your booking.`);
      }
    } catch (err) {
      alert('Error verifying promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!selectedDate) errs.selectedDate = 'Please pick a date on the calendar.';
    if (!selectedTime) errs.selectedTime = 'Please choose an available time slot.';
    if (!clientName.trim()) errs.clientName = 'Full Name is required.';
    
    if (!clientEmail.trim()) {
      errs.clientEmail = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(clientEmail)) {
      errs.clientEmail = 'Please enter a valid email address.';
    }
    
    if (!clientPhone.trim()) errs.clientPhone = 'Phone Number is required.';
    if (!clientAddress.trim()) errs.clientAddress = 'Service Address is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    const errs = validateForm();
    setValidationErrors(errs);

    if (Object.keys(errs).length > 0) {
      // Alert with details of what was missed
      alert('⚠️ Please fix the following before booking:\n\n' + Object.values(errs).join('\n'));
      
      // Scroll to the first error element
      const firstErrKey = Object.keys(errs)[0];
      const element = document.getElementsByName(firstErrKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    const bookingDetails = {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      servicePackage: selectedPackage.name,
      scheduledAt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), parseInt(selectedTime)),
      price: discountedPrice,
      frequency,
      promoCode: promoApplied?.code || null,
      status: 'pending',
      paymentStatus: 'unpaid'
    };

    if (user) {
      supabase.from('profiles').update({ phone: clientPhone, address: clientAddress }).eq('id', user.id).then(({ error }) => {
        if (error) console.error('Error auto-updating profile data on checkout:', error);
      });
    }

    onBookingComplete(bookingDetails);
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: 12 }}>Schedule Your Cleaning</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
          Select a package, choose your frequency, pick a date, and secure your booking in minutes.
        </p>
      </div>

      <div className="grid grid-2">
        {/* Left Column: Package, Frequency, Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Step 1: Package */}
          <div className="card">
            <h3 style={{ fontSize: '1.4rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--color-primary)' }}>1.</span> Choose Your Cleaning
            </h3>
            <div className="flex flex-col gap-4">
              {packages.map((pkg) => (
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
                    <h4 style={{ color: selectedPackage.id === pkg.id ? 'var(--color-primary)' : 'inherit' }}>
                      {pkg.name}
                      <span style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: 8, color: 'var(--text-muted)' }}>
                        (${pkg.pricePerSqFt}/sq ft)
                      </span>
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{pkg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Frequency */}
          <div className="card">
            <h3 style={{ fontSize: '1.4rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--color-primary)' }}>2.</span> <RefreshCw size={20} /> Cleaning Frequency
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setFrequency(opt.id)}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius)',
                    border: `2px solid ${frequency === opt.id ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    backgroundColor: frequency === opt.id ? 'rgba(13, 148, 136, 0.05)' : 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{opt.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: frequency === opt.id ? 'var(--color-primary)' : 'inherit' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</div>
                </div>
              ))}
            </div>

            {freqDiscount > 0 && (
              <div style={{ marginTop: 12, padding: '8px 16px', borderRadius: 'var(--radius)', backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 {Math.round(freqDiscount * 100)}% recurring discount applied!
              </div>
            )}
          </div>

          {/* Size Slider */}
          <div className="card">
            <div className="flex justify-between form-label" style={{ marginBottom: 8 }}>
              <label>Home/Office Size (Sq Ft)</label>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{sqFt.toLocaleString()} Sq Ft</span>
            </div>
            <input
              type="range" min="500" max="6000" step="100" value={sqFt}
              onChange={(e) => setSqFt(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
            <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>500 sq ft</span><span>6,000+ sq ft</span>
            </div>

            {/* Price Summary */}
            <div className="gradient-fresh" style={{ padding: 24, borderRadius: 'var(--radius)', color: 'white', marginTop: 20 }}>
              <div className="flex justify-between align-center">
                <div>
                  <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.9 }}>ESTIMATED PRICE</span>
                  {(freqDiscount > 0 || promoDiscount > 0) && (
                    <div style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '1rem', marginTop: 2 }}>${basePrice}</div>
                  )}
                  <h3 style={{ fontSize: '2rem', color: 'white', marginTop: 4 }}>${discountedPrice}</h3>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', opacity: 0.9 }}>
                  <p>{frequency === 'one-time' ? 'One-time payment' : `Billed ${frequency}`}</p>
                  <p>Includes all supplies</p>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div style={{ marginTop: 20 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={16} /> Promo Code (Optional)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="form-input"
                  placeholder="e.g. WELCOME10"
                  disabled={!!promoApplied}
                  style={{ flexGrow: 1, textTransform: 'uppercase' }}
                />
                {promoApplied ? (
                  <button
                    type="button"
                    onClick={() => { setPromoApplied(null); setPromoCode(''); }}
                    className="btn btn-outline"
                    style={{ borderColor: '#ef4444', color: '#ef4444', padding: '10px 16px', whiteSpace: 'nowrap' }}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="btn btn-secondary"
                    disabled={promoLoading || !promoCode.trim()}
                    style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
                  >
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {promoApplied && (
                <div style={{ marginTop: 6, fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                  ✓ Code "{promoApplied.code}" — {promoApplied.discount_percent}% off applied!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Date Picker & Contact */}
        <div className="card">
          <h3 style={{ fontSize: '1.4rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--color-primary)' }}>3.</span> Pick a Date & Time
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
          <div 
            name="selectedDate"
            style={{ 
              border: attemptedSubmit && validationErrors.selectedDate ? '2px solid #ef4444' : '1px solid transparent',
              borderRadius: '12px',
              padding: '6px',
              backgroundColor: attemptedSubmit && validationErrors.selectedDate ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
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
                const isDisabled = !isDayAvailable(date);
                const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
                return (
                  <div
                    key={day}
                    onClick={() => !isDisabled && handleDayClick(day)}
                    className={`calendar-day-cell ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                    style={isDisabled ? { cursor: 'not-allowed', opacity: 0.25 } : {}}
                  >
                    <span className="calendar-day-number">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {attemptedSubmit && validationErrors.selectedDate && (
            <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: 8, display: 'block', fontWeight: 600 }}>
              ⚠️ {validationErrors.selectedDate}
            </span>
          )}

          {selectedDate && (
            <div 
              name="selectedTime"
              className="animate-fade-in" 
              style={{ 
                marginTop: 24,
                border: attemptedSubmit && validationErrors.selectedTime ? '2px solid #ef4444' : '1px solid transparent',
                borderRadius: '12px',
                padding: attemptedSubmit && validationErrors.selectedTime ? '10px' : '0px',
                backgroundColor: attemptedSubmit && validationErrors.selectedTime ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> Available Slots for {selectedDate.toLocaleDateString()}
              </label>
              <div className="calendar-slots">
                {TIME_SLOTS.map((slot) => (
                  <div
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot);
                      setValidationErrors(prev => ({ ...prev, selectedTime: null }));
                    }}
                    className={`calendar-slot-button ${selectedTime === slot ? 'selected' : ''}`}
                  >
                    {slot}
                  </div>
                ))}
              </div>
              {attemptedSubmit && validationErrors.selectedTime && (
                <span style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: 8, display: 'block', fontWeight: 600 }}>
                  ⚠️ {validationErrors.selectedTime}
                </span>
              )}
            </div>
          )}

          {!user ? (
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '32px 24px', textAlign: 'center', marginTop: 32 }}>
              <h4 style={{ color: 'white', fontSize: '1.25rem', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                🔐 Account Required to Book
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                To secure your cleaning session, track your history, and authorize recurring appointments, please sign in or register for a free account.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthRole('client');
                    setIsRegistering(false);
                    onNavigate('portal-login');
                  }}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthRole('client');
                    setIsRegistering(true);
                    onNavigate('portal-login');
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 16 }}>4. Your Contact & Location</h4>

              <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: attemptedSubmit && validationErrors.clientName ? '#ef4444' : 'inherit' }}>Full Name</label>
                  <input 
                    type="text" 
                    name="clientName"
                    value={clientName} 
                    onChange={(e) => {
                      setClientName(e.target.value);
                      if (validationErrors.clientName) setValidationErrors(prev => ({ ...prev, clientName: null }));
                    }} 
                    className="form-input" 
                    placeholder="John Doe"
                    style={{
                      borderColor: attemptedSubmit && validationErrors.clientName ? '#ef4444' : 'var(--border-color)',
                      backgroundColor: attemptedSubmit && validationErrors.clientName ? '#fff5f5' : 'white'
                    }}
                  />
                  {attemptedSubmit && validationErrors.clientName && (
                    <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>{validationErrors.clientName}</span>
                  )}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: attemptedSubmit && validationErrors.clientEmail ? '#ef4444' : 'inherit' }}>Email Address</label>
                  <input 
                    type="email" 
                    name="clientEmail"
                    value={clientEmail} 
                    onChange={(e) => {
                      setClientEmail(e.target.value);
                      if (validationErrors.clientEmail) setValidationErrors(prev => ({ ...prev, clientEmail: null }));
                    }} 
                    className="form-input" 
                    placeholder="john@example.com"
                    style={{
                      borderColor: attemptedSubmit && validationErrors.clientEmail ? '#ef4444' : 'var(--border-color)',
                      backgroundColor: attemptedSubmit && validationErrors.clientEmail ? '#fff5f5' : 'white'
                    }}
                  />
                  {attemptedSubmit && validationErrors.clientEmail && (
                    <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>{validationErrors.clientEmail}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: attemptedSubmit && validationErrors.clientPhone ? '#ef4444' : 'inherit' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    name="clientPhone"
                    value={clientPhone} 
                    onChange={(e) => handlePhoneChange(e.target.value)} 
                    className="form-input" 
                    placeholder="(563) 555-0100"
                    style={{
                      borderColor: attemptedSubmit && validationErrors.clientPhone ? '#ef4444' : 'var(--border-color)',
                      backgroundColor: attemptedSubmit && validationErrors.clientPhone ? '#fff5f5' : 'white'
                    }}
                  />
                  {attemptedSubmit && validationErrors.clientPhone && (
                    <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>{validationErrors.clientPhone}</span>
                  )}
                </div>
                <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
                  <label className="form-label" style={{ color: attemptedSubmit && validationErrors.clientAddress ? '#ef4444' : 'inherit' }}>Service Address</label>
                  <input 
                    type="text" 
                    name="clientAddress"
                    value={clientAddress} 
                    onChange={(e) => handleAddressChange(e.target.value)} 
                    onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                    className="form-input" 
                    placeholder="123 Main St, Peosta, IA"
                    style={{
                      borderColor: attemptedSubmit && validationErrors.clientAddress ? '#ef4444' : 'var(--border-color)',
                      backgroundColor: attemptedSubmit && validationErrors.clientAddress ? '#fff5f5' : 'white'
                    }}
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <>
                      <div onClick={() => setShowSuggestions(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8,
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', marginTop: 4, padding: 4,
                        display: 'flex', flexDirection: 'column', gap: 2
                      }}>
                        {addressSuggestions.map((sug, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setClientAddress(sug.display_name);
                              setShowSuggestions(false);
                              setAddressSuggestions([]);
                            }}
                            style={{
                              padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                              color: '#e2e8f0', fontSize: '0.85rem', transition: 'all 0.15s',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2dd4bf20'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            📍 {sug.display_name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {attemptedSubmit && validationErrors.clientAddress && (
                    <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>{validationErrors.clientAddress}</span>
                  )}
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 16, border: '1px solid var(--border-color)', marginBottom: 16, fontSize: '0.9rem' }}>
                {frequency !== 'one-time' ? (
                  <p>💳 <strong>Recurring booking</strong> — You'll be directed to Stripe to set up automatic {frequency} payments of <strong>${discountedPrice}</strong>. Cancel anytime.</p>
                ) : (
                  <p>💳 <strong>One-time payment</strong> — You'll pay <strong>${discountedPrice}</strong> securely via Stripe after confirming your booking details.</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
              >
                {frequency !== 'one-time' ? `Set Up ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Service — $${discountedPrice}` : `Book & Pay $${discountedPrice}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
