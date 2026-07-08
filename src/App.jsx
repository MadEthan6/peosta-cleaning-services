import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import BookingCalendar from './components/Calendar';
import JobChecklist from './components/JobChecklist';
import PhotoUploader from './components/PhotoUploader';
import Chat from './components/Chat';
import { 
  Sparkles, Clock, MapPin, User, DollarSign, CheckCircle2, 
  Calendar as CalendarIcon, ChevronRight, Image as ImageIcon, 
  MessageSquare, Plus, Phone, Mail, FileText, Check, Lock, 
  PlusCircle, Eye, EyeOff, ShieldAlert, Award, Star, ListChecks
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // home, book, pay, portal-login, dashboard
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Authentication states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authRole, setAuthRole] = useState('employee');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Payments states
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceClientName, setInvoiceClientName] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payingBooking, setPayingBooking] = useState(null);

  // Simulated Credit Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardPaying, setCardPaying] = useState(false);

  // Employee Dashboard States
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('jobs'); // jobs, chat, new-job
  const [loadingJobs, setLoadingJobs] = useState(false);

  // New Job Creation State (for Owner role)
  const [newJobClientName, setNewJobClientName] = useState('');
  const [newJobClientEmail, setNewJobClientEmail] = useState('');
  const [newJobClientPhone, setNewJobClientPhone] = useState('');
  const [newJobAddress, setNewJobAddress] = useState('');
  const [newJobPrice, setNewJobPrice] = useState('');
  const [newJobPackage, setNewJobPackage] = useState('Standard Clean');
  const [newJobDate, setNewJobDate] = useState('');
  const [newJobEmployeeId, setNewJobEmployeeId] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);

  useEffect(() => {
    // Check active auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchJobs();
      if (profile.role === 'owner') {
        fetchEmployees();
      }
    }
  }, [profile]);

  const fetchProfile = async (uid) => {
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchJobs = async () => {
    if (!profile) return;
    setLoadingJobs(true);
    try {
      let query = supabase.from('jobs').select('*, employee:profiles(*)').order('scheduled_at', { ascending: true });
      
      // If employee, only show jobs assigned to them
      if (profile.role === 'employee') {
        query = query.eq('employee_id', profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');
      if (error) throw error;
      setAllEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            full_name: authFullName,
            role: authRole
          }
        }
      });

      if (error) throw error;
      
      // Seed profile record if trigger takes time
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: authFullName,
          email: authEmail,
          role: authRole
        });

      alert('Registration successful! Logging you in...');
      setUser(data.user);
      setIsRegistering(false);
      setCurrentTab('dashboard');
    } catch (err) {
      alert('Registration Error: ' + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) throw error;
      setUser(data.user);
      setCurrentTab('dashboard');
    } catch (err) {
      alert('Login Error: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentTab('home');
  };

  // Client side schedule booking complete callback
  const handleBookingComplete = (bookingDetails) => {
    setPayingBooking(bookingDetails);
    setInvoiceAmount(bookingDetails.price);
    setInvoiceClientName(bookingDetails.clientName);
    setInvoiceEmail(bookingDetails.clientEmail);
    // Open payment portal modal/tab
    setCurrentTab('pay');
  };

  const handleCustomInvoicePay = (e) => {
    e.preventDefault();
    if (!invoiceAmount || parseFloat(invoiceAmount) <= 0) {
      alert('Please enter a valid invoice amount.');
      return;
    }
    // Simple verification
  };

  const processSimulatedPayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      alert('Please fill in all credit card details.');
      return;
    }

    setCardPaying(true);

    // Simulate 2 seconds Stripe latency
    setTimeout(async () => {
      try {
        if (payingBooking) {
          // It's a booking checkout, save job directly to Database marked as PAID
          const { error } = await supabase
            .from('jobs')
            .insert({
              client_name: payingBooking.clientName,
              client_email: payingBooking.clientEmail,
              client_phone: payingBooking.clientPhone,
              address: payingBooking.clientAddress,
              service_package: payingBooking.servicePackage,
              scheduled_at: payingBooking.scheduledAt,
              price: payingBooking.price,
              status: 'pending',
              payment_status: 'paid'
            });

          if (error) throw error;
        } else {
          // It's a custom invoice payment, save a custom job entry as complete & paid
          const { error } = await supabase
            .from('jobs')
            .insert({
              client_name: invoiceClientName,
              client_email: invoiceEmail,
              client_phone: 'Custom Online Payment',
              address: 'Online Billing Client',
              service_package: 'Invoice Payment',
              scheduled_at: new Date(),
              price: parseFloat(invoiceAmount),
              status: 'completed',
              payment_status: 'paid'
            });

          if (error) throw error;
        }

        setPaymentSuccess(true);
        setPayingBooking(null);
        setInvoiceAmount('');
        setInvoiceClientName('');
        setInvoiceEmail('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
      } catch (err) {
        alert('Payment processing failed: ' + err.message);
      } finally {
        setCardPaying(false);
      }
    }, 2000);
  };

  // Owner action: Create a new job manually and assign it
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          client_name: newJobClientName,
          client_email: newJobClientEmail,
          client_phone: newJobClientPhone,
          address: newJobAddress,
          service_package: newJobPackage,
          price: parseFloat(newJobPrice),
          scheduled_at: new Date(newJobDate),
          employee_id: newJobEmployeeId || null,
          status: newJobEmployeeId ? 'assigned' : 'pending',
          payment_status: 'unpaid'
        });

      if (error) throw error;
      alert('Job successfully created!');
      
      // Reset forms
      setNewJobClientName('');
      setNewJobClientEmail('');
      setNewJobClientPhone('');
      setNewJobAddress('');
      setNewJobPrice('');
      setNewJobDate('');
      setNewJobEmployeeId('');
      setDashboardTab('jobs');
      fetchJobs();
    } catch (err) {
      alert('Error creating job: ' + err.message);
    }
  };

  // Update job status (for employees)
  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Error updating job status: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Show navigation bar unless inside the employee dashboard */}
      {currentTab !== 'dashboard' && (
        <Navbar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}

      <main style={{ flexGrow: 1, backgroundColor: currentTab === 'dashboard' ? '#0f172a' : 'var(--bg-main)' }}>
        
        {/* VIEW: HOME LANDING PAGE */}
        {currentTab === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="gradient-bg" style={{ color: 'white', padding: '100px 0 120px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 24, fontSize: '0.85rem', fontWeight: 600 }}>
                  <Sparkles size={16} style={{ color: 'var(--color-primary-light)' }} /> Sparkling Results, Every Single Time
                </div>
                <h1 style={{ fontSize: '3.75rem', color: 'white', fontWeight: 850, lineHeight: 1.15, maxWidth: 850, margin: '0 auto 24px auto', fontFamily: 'var(--font-family-heading)' }}>
                  A Sparkling Home, <span style={{ color: 'var(--color-primary-light)' }}>Every Time.</span>
                </h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: 620, margin: '0 auto 40px auto', lineHeight: 1.6 }}>
                  Experience the gold standard in professional cleaning for homes and businesses in Peosta. Precision, care, and a spotless finish.
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setCurrentTab('book')} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-secondary)' }}>
                    Book Your Cleaning
                  </button>
                  <button onClick={() => setCurrentTab('pay')} className="btn btn-outline" style={{ padding: '16px 36px', fontSize: '1.1rem', color: 'white', borderColor: 'white' }}>
                    Pay Invoice Online
                  </button>
                </div>
              </div>
              
              {/* Background Glow */}
              <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '80%', height: '150%', background: 'radial-gradient(ellipse at center, rgba(45,212,191,0.15) 0%, rgba(13,148,136,0) 70%)', transform: 'rotate(-15deg)', pointerEvents: 'none' }} />
            </section>

            {/* Core Services */}
            <section style={{ padding: '80px 0' }} id="services">
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What We Do</span>
                  <h2 style={{ fontSize: '2.25rem', marginTop: 8 }}>Our Cleaning Expertise</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: 8 }}>Tailored solutions to meet the exacting standards of your space.</p>
                </div>

                <div className="grid grid-3">
                  <div className="card flex flex-col justify-between">
                    <div>
                      <div className="flex align-center justify-center" style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--color-primary)', fontSize: '1.5rem', marginBottom: 20 }}>🧹</div>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Standard Cleaning</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>Perfect for maintaining a pristine home environment on a regular basis.</p>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Dusting & Wiping</li>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Vacuuming & Mopping</li>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Bathroom Sanitation</li>
                      </ul>
                    </div>
                    <button onClick={() => setCurrentTab('book')} className="btn btn-outline" style={{ width: '100%', padding: '10px' }}>Book Standard Clean</button>
                  </div>

                  <div className="card flex flex-col justify-between" style={{ border: '2px solid var(--color-primary)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'var(--color-primary)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, uppercase: 'true' }}>POPULAR</div>
                    <div>
                      <div className="flex align-center justify-center" style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--color-primary)', fontSize: '1.5rem', marginBottom: 20 }}>✨</div>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Deep Cleaning</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>A comprehensive, top-to-bottom scrub for those who need a fresh start.</p>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Baseboards & Blinds</li>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Appliance Interiors</li>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Deep Carpet Scrub</li>
                      </ul>
                    </div>
                    <button onClick={() => setCurrentTab('book')} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>Book Deep Clean</button>
                  </div>

                  <div className="card flex flex-col justify-between">
                    <div>
                      <div className="flex align-center justify-center" style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--color-primary)', fontSize: '1.5rem', marginBottom: 20 }}>🏢</div>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Commercial Cleaning</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>Professional-grade solutions for offices, retail, and corporate spaces.</p>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> After-Hours Services</li>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Workspace Sanitization</li>
                        <li className="flex align-center gap-2"><span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> Restroom Maintenance</li>
                      </ul>
                    </div>
                    <button onClick={() => setCurrentTab('book')} className="btn btn-outline" style={{ width: '100%', padding: '10px' }}>Book Commercial Clean</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust and Values */}
            <section style={{ padding: '80px 0', backgroundColor: '#f1f5f9' }}>
              <div className="container grid grid-2" style={{ alignItems: 'center', gap: 60 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Peosta Quality</span>
                  <h2 style={{ fontSize: '2.25rem', margin: '8px 0 20px 0' }}>Why Peosta Cleaning Services Stands Out</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
                    We believe cleaning is about more than just making surfaces look tidy. It's about safety, health, and peace of mind. Every employee on our team is fully vetted, background checked, and trained in medical-grade sanitizing standards.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex align-center gap-4">
                      <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,148,136,0.1)' }}><Check size={16} /></div>
                      <span style={{ fontWeight: 600 }}>Fully insured, licensed, and bonded professionals.</span>
                    </div>
                    <div className="flex align-center gap-4">
                      <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,148,136,0.1)' }}><Check size={16} /></div>
                      <span style={{ fontWeight: 600 }}>Stripe-certified secure payments and flat rates.</span>
                    </div>
                    <div className="flex align-center gap-4">
                      <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,148,136,0.1)' }}><Check size={16} /></div>
                      <span style={{ fontWeight: 600 }}>Real-time photo verification of progress and damage reporting.</span>
                    </div>
                  </div>
                </div>

                <div className="card flex flex-col gap-6" style={{ borderLeft: '6px solid var(--color-primary)', padding: '40px 32px' }}>
                  <div className="flex align-center gap-2" style={{ color: 'var(--color-warning)' }}>
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                  </div>
                  <blockquote style={{ fontSize: '1.2rem', fontWeight: 500, fontStyle: 'italic', color: 'var(--color-secondary)' }}>
                    "The online scheduler was incredibly convenient, and the cleaners did an absolutely spotless job on our commercial office in Peosta. Being able to review everything and pay online via Stripe was a breeze!"
                  </blockquote>
                  <div className="flex align-center gap-3">
                    <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                      S
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>Sarah Miller</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operations Manager, Peosta Logistics</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: BOOKING CALENDAR */}
        {currentTab === 'book' && (
          <BookingCalendar onBookingComplete={handleBookingComplete} />
        )}

        {/* VIEW: CUSTOM INVOICE PAYMENT PAGE */}
        {currentTab === 'pay' && (
          <div className="container flex justify-center" style={{ padding: '60px 24px' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 500 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <CreditCardIconWrapper />
                <h3 style={{ fontSize: '1.75rem', marginTop: 16 }}>Secure Invoice Payment</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                  Powered by Stripe • Peosta Cleaning Services
                </p>
              </div>

              {paymentSuccess ? (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ color: 'var(--color-success)', display: 'inline-flex', padding: 16, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', marginBottom: 16 }}>
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Payment Successful!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
                    Your transaction has completed successfully. A receipt will be emailed to your inbox.
                  </p>
                  <button 
                    onClick={() => {
                      setPaymentSuccess(false);
                      setCurrentTab('home');
                    }} 
                    className="btn btn-primary"
                  >
                    Return to Homepage
                  </button>
                </div>
              ) : (
                <div>
                  {payingBooking ? (
                    <div style={{ backgroundColor: 'rgba(13, 148, 136, 0.05)', border: '1px solid rgba(13, 148, 136, 0.15)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 24 }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>Booking Checkout Summary</h4>
                      <p style={{ fontSize: '0.85rem', marginTop: 4 }}><strong>Package:</strong> {payingBooking.servicePackage}</p>
                      <p style={{ fontSize: '0.85rem' }}><strong>Location:</strong> {payingBooking.clientAddress}</p>
                      <p style={{ fontSize: '0.85rem' }}><strong>Date:</strong> {payingBooking.scheduledAt.toLocaleDateString()} at {payingBooking.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 8 }}><strong>Total Due:</strong> ${payingBooking.price}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleCustomInvoicePay} style={{ marginBottom: 24 }}>
                      <div className="form-group">
                        <label className="form-label">Client Name</label>
                        <input type="text" required value={invoiceClientName} onChange={(e) => setInvoiceClientName(e.target.value)} className="form-input" placeholder="Your Name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" required value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} className="form-input" placeholder="client@example.com" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Invoice / Payment Amount ($)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                          <input type="number" required min="1" step="0.01" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} className="form-input" style={{ paddingLeft: 32 }} placeholder="0.00" />
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Simulated Credit Card Form */}
                  <form onSubmit={processSimulatedPayment} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: 16 }}>Card Information</h4>
                    
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input 
                        type="text" 
                        required 
                        maxLength="19"
                        value={cardNumber} 
                        onChange={(e) => {
                          const formatted = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                          setCardNumber(formatted);
                        }} 
                        className="form-input" 
                        placeholder="4242 4242 4242 4242" 
                      />
                    </div>

                    <div className="grid grid-2" style={{ gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Expiration Date</label>
                        <input 
                          type="text" 
                          required 
                          maxLength="5"
                          value={cardExpiry} 
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value.length === 2 && !value.includes('/')) {
                              value += '/';
                            }
                            setCardExpiry(value);
                          }} 
                          className="form-input" 
                          placeholder="MM/YY" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVC / CVV</label>
                        <input 
                          type="text" 
                          required 
                          maxLength="4"
                          value={cardCvc} 
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))} 
                          className="form-input" 
                          placeholder="123" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '14px', marginTop: 16 }}
                      disabled={cardPaying}
                    >
                      {cardPaying ? 'Processing Payment...' : `Pay $${payingBooking ? payingBooking.price : invoiceAmount || '0.00'}`}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: PORTAL LOGIN / REGISTER */}
        {currentTab === 'portal-login' && (
          <div className="container flex justify-center" style={{ padding: '80px 24px' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 450 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 12, borderRadius: '12px', backgroundColor: 'rgba(13,148,136,0.1)' }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ fontSize: '1.75rem', marginTop: 16 }}>
                  {isRegistering ? 'Register Portal Account' : 'Employee Login'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                  Peosta Cleaning Portal Access
                </p>
              </div>

              <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                {isRegistering && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" required value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} className="form-input" placeholder="Jane Doe" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Portal Role</label>
                      <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} className="form-input">
                        <option value="employee">Cleaning Employee</option>
                        <option value="owner">Company Owner</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="form-input" placeholder="jane@peostacleaning.com" />
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={authPassword} 
                      onChange={(e) => setAuthPassword(e.target.value)} 
                      className="form-input" 
                      placeholder="••••••••" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {isRegistering ? 'Already have a portal account?' : "Don't have a portal login yet?"}
                </span>{' '}
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}
                >
                  {isRegistering ? 'Sign In Instead' : 'Register Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: EMPLOYEE PORTAL DASHBOARD (FULL SCREEN INTEGRATED PORTAL) */}
        {currentTab === 'dashboard' && profile && (
          <div className="dashboard-container">
            {/* Sidebar Navigation */}
            <div className="sidebar">
              <div>
                <div className="sidebar-logo">
                  Peosta Portal
                </div>
                <div className="sidebar-menu">
                  <div 
                    onClick={() => { setDashboardTab('jobs'); setSelectedJob(null); }}
                    className={`sidebar-item ${dashboardTab === 'jobs' ? 'active' : ''}`}
                  >
                    <ListChecks size={20} /> Cleaning Jobs
                  </div>
                  <div 
                    onClick={() => setDashboardTab('chat')}
                    className={`sidebar-item ${dashboardTab === 'chat' ? 'active' : ''}`}
                  >
                    <MessageSquare size={20} /> Chat / Direct Text
                  </div>
                  {profile.role === 'owner' && (
                    <div 
                      onClick={() => setDashboardTab('new-job')}
                      className={`sidebar-item ${dashboardTab === 'new-job' ? 'active' : ''}`}
                    >
                      <PlusCircle size={20} /> Create New Job
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ padding: '16px 0', borderTop: '1px solid #334155', marginBottom: 16 }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>{profile.full_name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>Role: {profile.role}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline"
                  style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444', padding: '8px' }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="dashboard-content">
              
              {/* SUBTAB: JOBS STREAM */}
              {dashboardTab === 'jobs' && (
                <div>
                  {!selectedJob ? (
                    <div>
                      <div className="dashboard-header">
                        <div>
                          <h2 style={{ fontSize: '2rem', color: 'white' }}>Assigned Cleanings</h2>
                          <p style={{ color: '#94a3b8', marginTop: 4 }}>Select a job below to see the checklists, damages, progress, and photos.</p>
                        </div>
                        <button onClick={fetchJobs} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
                          Refresh Stream
                        </button>
                      </div>

                      {loadingJobs ? (
                        <div style={{ color: '#94a3b8' }}>Loading jobs stream...</div>
                      ) : jobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #334155', borderRadius: 'var(--radius-lg)', color: '#64748b' }}>
                          <ListChecks size={40} style={{ marginBottom: 12 }} />
                          <p>No jobs currently assigned to you.</p>
                        </div>
                      ) : (
                        <div className="grid grid-2" style={{ gap: 24 }}>
                          {jobs.map((job) => (
                            <div 
                              key={job.id}
                              onClick={() => setSelectedJob(job)}
                              className="card dashboard-card hover-scale"
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="flex justify-between align-center" style={{ marginBottom: 16 }}>
                                <span className={`badge badge-${job.status}`}>{job.status}</span>
                                <span className={`badge badge-${job.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                                  {job.payment_status}
                                </span>
                              </div>

                              <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: 8 }}>{job.client_name}</h3>
                              <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignCenter: 'center', gap: 6, marginBottom: 6 }}>
                                <MapPin size={14} /> {job.address}
                              </p>
                              <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignCenter: 'center', gap: 6, marginBottom: 12 }}>
                                <CalendarIcon size={14} /> {new Date(job.scheduled_at).toLocaleDateString()} • {new Date(job.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>

                              <div className="flex justify-between align-center" style={{ borderTop: '1px solid #334155', paddingTop: 12, marginTop: 12 }}>
                                <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                                  Type: <strong>{job.service_package}</strong>
                                </span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                                  ${job.price}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ACTIVE JOB VIEW */
                    <div>
                      <div style={{ marginBottom: 24 }}>
                        <button 
                          onClick={() => { setSelectedJob(null); fetchJobs(); }}
                          className="btn btn-secondary" 
                          style={{ padding: '8px 16px', fontSize: '0.85rem', marginBottom: 16 }}
                        >
                          ← Back to Jobs Stream
                        </button>
                        
                        <div className="flex justify-between align-center">
                          <div>
                            <h2 style={{ fontSize: '2.25rem', color: 'white' }}>{selectedJob.client_name}</h2>
                            <p style={{ color: '#94a3b8', display: 'flex', alignCenter: 'center', gap: 6, marginTop: 4 }}>
                              <MapPin size={16} /> {selectedJob.address}
                            </p>
                          </div>
                          
                          <div className="flex gap-4">
                            {selectedJob.status !== 'completed' ? (
                              <>
                                {selectedJob.status === 'assigned' && (
                                  <button onClick={() => handleUpdateJobStatus(selectedJob.id, 'in_progress')} className="btn btn-primary" style={{ backgroundColor: '#c084fc', color: 'black' }}>
                                    Start Cleaning Job
                                  </button>
                                )}
                                {selectedJob.status === 'in_progress' && (
                                  <button onClick={() => handleUpdateJobStatus(selectedJob.id, 'completed')} className="btn btn-primary" style={{ backgroundColor: 'var(--color-success)' }}>
                                    Complete Job
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="badge badge-completed" style={{ padding: '10px 16px', fontSize: '0.9rem' }}>Job Completed</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-2" style={{ gap: 32, marginTop: 32 }}>
                        {/* Checklist Section */}
                        <div className="card dashboard-card">
                          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignCenter: 'center', gap: 8 }}>
                            <ListChecks size={20} style={{ color: 'var(--color-primary-light)' }} /> Service Checklist
                          </h3>
                          <JobChecklist jobId={selectedJob.id} userId={profile.id} />
                        </div>

                        {/* Photos Section */}
                        <div className="card dashboard-card">
                          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignCenter: 'center', gap: 8 }}>
                            <Camera size={20} style={{ color: 'var(--color-primary-light)' }} /> Damage & Progress Photos
                          </h3>
                          <PhotoUploader jobId={selectedJob.id} userId={profile.id} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB: CHAT */}
              {dashboardTab === 'chat' && (
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: 24 }}>Portal Team Chat</h2>
                  <Chat userId={profile.id} />
                </div>
              )}

              {/* SUBTAB: CREATE NEW JOB (OWNER ONLY) */}
              {dashboardTab === 'new-job' && profile.role === 'owner' && (
                <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
                  <div className="card dashboard-card">
                    <h2 style={{ fontSize: '1.75rem', color: 'white', marginBottom: 24, display: 'flex', alignCenter: 'center', gap: 8 }}>
                      <PlusCircle size={24} style={{ color: 'var(--color-primary-light)' }} /> Create & Assign Cleaning Job
                    </h2>

                    <form onSubmit={handleCreateJob}>
                      <div className="grid grid-2" style={{ gap: 16 }}>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Client Name</label>
                          <input type="text" required value={newJobClientName} onChange={(e) => setNewJobClientName(e.target.value)} className="form-input" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }} placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Client Phone</label>
                          <input type="tel" required value={newJobClientPhone} onChange={(e) => setNewJobClientPhone(e.target.value)} className="form-input" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }} placeholder="(563) 555-0199" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ color: 'white' }}>Client Email</label>
                        <input type="email" required value={newJobClientEmail} onChange={(e) => setNewJobClientEmail(e.target.value)} className="form-input" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }} placeholder="john@example.com" />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ color: 'white' }}>Cleaning Address</label>
                        <input type="text" required value={newJobAddress} onChange={(e) => setNewJobAddress(e.target.value)} className="form-input" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }} placeholder="123 Broad St, Peosta, IA" />
                      </div>

                      <div className="grid grid-3" style={{ gap: 16 }}>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Package</label>
                          <select value={newJobPackage} onChange={(e) => setNewJobPackage(e.target.value)} className="form-input" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }}>
                            <option value="Standard Clean">Standard Clean</option>
                            <option value="Deep Clean">Deep Clean</option>
                            <option value="Commercial Clean">Commercial Clean</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Price ($)</label>
                          <input type="number" required value={newJobPrice} onChange={(e) => setNewJobPrice(e.target.value)} className="form-input" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }} placeholder="150" />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Schedule Date</label>
                          <input type="datetime-local" required value={newJobDate} onChange={(e) => setNewJobDate(e.target.value)} className="form-input" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }} />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="form-label" style={{ color: 'white' }}>Assign Employee</label>
                        <select 
                          value={newJobEmployeeId} 
                          onChange={(e) => setNewJobEmployeeId(e.target.value)} 
                          className="form-input" 
                          style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' }}
                        >
                          <option value="">Unassigned (Keep in booking pool)</option>
                          {allEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</option>
                          ))}
                        </select>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                        Create & Deploy Job
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      {currentTab !== 'dashboard' && (
        <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '60px 0 40px 0', borderTop: '1px solid #1e293b' }}>
          <div className="container grid grid-3" style={{ gap: 40, marginBottom: 40 }}>
            <div>
              <div className="flex align-center gap-2" style={{ color: 'white', marginBottom: 16 }}>
                <Sparkles style={{ color: 'var(--color-primary-light)' }} />
                <h4 style={{ color: 'white', fontSize: '1.2rem' }}>Peosta Cleaning Services</h4>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                Premium home and commercial office cleaning services in Peosta, Iowa and surrounding Dubuque counties.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'white', marginBottom: 16 }}>Contact Us</h4>
              <p style={{ fontSize: '0.9rem', display: 'flex', alignCenter: 'center', gap: 8, marginBottom: 8 }}><Phone size={16} /> +1 (563) 555-0199</p>
              <p style={{ fontSize: '0.9rem', display: 'flex', alignCenter: 'center', gap: 8 }}><Mail size={16} /> contact@peostacleaning.com</p>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: 16 }}>Site Links</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
                <li><button onClick={() => setCurrentTab('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Home Page</button></li>
                <li><button onClick={() => setCurrentTab('book')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Book Service</button></li>
                <li><button onClick={() => setCurrentTab('portal-login')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Employee Portal</button></li>
              </ul>
            </div>
          </div>

          <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: 24, textAlign: 'center', fontSize: '0.8rem' }}>
            <p>&copy; {new Date().getFullYear()} Peosta Cleaning Services. All rights reserved. Secure Payments Powered by Stripe.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function CreditCardIconWrapper() {
  return (
    <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 16, borderRadius: '50%', backgroundColor: 'rgba(13,148,136,0.1)' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    </div>
  );
}
