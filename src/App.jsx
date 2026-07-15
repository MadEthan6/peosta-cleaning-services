import React, { useState, useEffect, useRef } from 'react';
import { supabase, createSecondaryClient } from './supabaseClient';
import Navbar from './components/Navbar';
import BookingCalendar from './components/Calendar';
import JobChecklist from './components/JobChecklist';
import PhotoUploader from './components/PhotoUploader';
import Chat from './components/Chat';
import OwnerSettings from './components/OwnerSettings';
import InvoiceManager from './components/InvoiceManager';
import TodoTasks from './components/TodoTasks';
import RatingTip from './components/RatingTip';
import ClientHistory from './components/ClientHistory';
import EmployeeAvailability from './components/EmployeeAvailability';
import ClientOverview from './components/ClientOverview';
import AccountManager from './components/AccountManager';
import ClientInvoices from './components/ClientInvoices';
import {
  Sparkles, Clock, MapPin, User, DollarSign, CheckCircle2,
  Calendar as CalendarIcon, ChevronRight, Image as ImageIcon,
  MessageSquare, Plus, Phone, Mail, FileText, Check, Lock,
  PlusCircle, Eye, EyeOff, ShieldAlert, Award, Star, ListChecks,
  Camera, Settings, Receipt, History, CalendarDays, BarChart2,
  Users, LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState(null);

  // Custom Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const lower = msg.toLowerCase();
      // Determine type based on keywords
      let type = 'info';
      if (lower.includes('error') || lower.includes('failed') || lower.includes('invalid') || lower.includes('missing')) {
        type = 'error';
      } else if (lower.includes('success') || lower.includes('applied') || lower.includes('completed') || lower.includes('sent')) {
        type = 'success';
      } else if (lower.includes('warning') || lower.includes('please fill') || lower.includes('⚠️')) {
        type = 'warning';
      }
      addToast(msg, type);
    };

    window.toast = {
      success: (msg) => addToast(msg, 'success'),
      error: (msg) => addToast(msg, 'error'),
      info: (msg) => addToast(msg, 'info'),
      warning: (msg) => addToast(msg, 'warning')
    };

    return () => {
      window.alert = originalAlert;
      delete window.toast;
    };
  }, []);

  // Auth states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authAddress, setAuthAddress] = useState('');
  const [authRole, setAuthRole] = useState('client');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Address search states for registration
  const [regAddressSuggestions, setRegAddressSuggestions] = useState([]);
  const [regShowSuggestions, setRegShowSuggestions] = useState(false);
  const [regAddressLoading, setRegAddressLoading] = useState(false);
  const regAddressTimeoutRef = useRef(null);

  const handleRegAddressChange = (val) => {
    setAuthAddress(val);

    // ⚡ Bolt Optimization: Debounce Nominatim API calls to prevent strict rate limit (1 request/second) and IP blocking
    if (regAddressTimeoutRef.current) clearTimeout(regAddressTimeoutRef.current);

    if (val.length < 4) {
      setRegAddressSuggestions([]);
      return;
    }

    setRegAddressLoading(true);
    regAddressTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=us`);
        const data = await res.json();
        setRegAddressSuggestions(data || []);
        setRegShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching registration address suggestions:', err);
      } finally {
        setRegAddressLoading(false);
      }
    }, 500);
  };

  // Payment states
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceClientName, setInvoiceClientName] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payingBooking, setPayingBooking] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardPaying, setCardPaying] = useState(false);

  // Dashboard states
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('jobs');
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Owner: create job
  const [newJobClientName, setNewJobClientName] = useState('');
  const [newJobClientEmail, setNewJobClientEmail] = useState('');
  const [newJobClientPhone, setNewJobClientPhone] = useState('');
  const [newJobAddress, setNewJobAddress] = useState('');
  const [newJobPrice, setNewJobPrice] = useState('');
  const [newJobPackage, setNewJobPackage] = useState('Standard Clean');
  const [newJobDate, setNewJobDate] = useState('');
  const [newJobEmployeeId, setNewJobEmployeeId] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);

  // Owner autocomplete states
  const [ownerAddressSuggestions, setOwnerAddressSuggestions] = useState([]);
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);
  const ownerAddressTimeoutRef = useRef(null);

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

  const handleOwnerPhoneChange = (val) => {
    const formatted = formatPhoneNumber(val);
    setNewJobClientPhone(formatted);
  };

  const handleOwnerAddressChange = (val) => {
    setNewJobAddress(val);

    // ⚡ Bolt Optimization: Debounce Nominatim API calls to prevent strict rate limit (1 request/second) and IP blocking
    if (ownerAddressTimeoutRef.current) clearTimeout(ownerAddressTimeoutRef.current);

    if (val.length < 4) {
      setOwnerAddressSuggestions([]);
      return;
    }

    ownerAddressTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=us`);
        const data = await res.json();
        setOwnerAddressSuggestions(data || []);
        setShowOwnerSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 500);
  };

  // Stripe integration & forgot password states
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [useSimulatedCard, setUseSimulatedCard] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Owner: create employee
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeFullName, setEmployeeFullName] = useState('');
  const [creatingEmployee, setCreatingEmployee] = useState(false);

  useEffect(() => {
    // 1. Check active auth session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      }
    });

    // 2. Listen for auth changes, including password recovery redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentTab('reset-password-form');
      }
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // 3. Fetch Stripe Publishable Key
    const fetchStripeKey = async () => {
      try {
        const { data } = await supabase.from('business_settings').select('stripe_publishable_key').eq('id', 1).maybeSingle();
        if (data?.stripe_publishable_key) {
          setStripePublishableKey(data.stripe_publishable_key);
        }
      } catch (err) {
        console.error('Error fetching Stripe key:', err);
      }
    };
    fetchStripeKey();

    // 4. Handle success/cancel redirect params from Stripe checkout session
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      const id = params.get('id');
      const type = params.get('type');
      if (id && type) {
        const updatePaymentStatus = async () => {
          try {
            if (type === 'booking') {
              await supabase.from('jobs').update({ payment_status: 'paid' }).eq('id', id);
            } else if (type === 'invoice') {
              await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
            }
            setPaymentSuccess(true);
            setCurrentTab('pay');
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err) {
            console.error('Error updating payment status:', err);
          }
        };
        updatePaymentStatus();
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchJobs();
      if (profile.role === 'owner') fetchEmployees();
    }
  }, [profile]);

  const fetchProfile = async (uid, email) => {
    setLoadingProfile(true);
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error && !data) {
        throw error;
      }

      setProfile(data);
      if (data) {
        if (data.role === 'client') {
          setDashboardTab('overview');
        } else {
          setDashboardTab('jobs');
        }
      }
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
      if (profile.role === 'employee') query = query.eq('employee_id', profile.id);
      else if (profile.role === 'client') query = query.eq('client_email', profile.email);
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
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'employee');
      if (error) throw error;
      setAllEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const resolvedRole = 'client';
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: { data: { full_name: authFullName, role: resolvedRole } }
      });
      if (error) throw error;

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: authFullName,
        email: authEmail,
        role: resolvedRole,
        phone: authPhone || null,
        address: authAddress || null
      });
      if (profileError) throw profileError;

      alert('Registration successful! Please check your email to verify your account, then log in.');
      setIsRegistering(false);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!authEmail) {
      alert('Please enter your email address first.');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;
      alert('A password reset link has been sent to ' + authEmail + '. Please check your inbox.');
      setIsForgotPassword(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('Password updated successfully! You can now log in.');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentTab('portal-login');
    } catch (err) {
      alert('Error updating password: ' + err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handlePayInvoiceDirect = async (invoice) => {
    if (!stripePublishableKey) {
      alert('Stripe checkout is not configured. Please add Stripe credentials in Settings.');
      return;
    }
    try {
      const sessionPayload = {
        amount: parseFloat(invoice.amount),
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        service_package: invoice.notes || 'Peosta Cleaning Services Invoice',
        success_url: `https://MadEthan6.github.io/peosta-cleaning-services/?payment_success=true&id=${invoice.id}&type=invoice`,
        cancel_url: window.location.href,
        invoice_id: invoice.id
      };
      
      const { data, error } = await supabase.functions.invoke('stripe-checkout', { body: sessionPayload });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Stripe session URL not returned');
      }
    } catch (err) {
      alert('Payment redirect failed: ' + err.message);
    }
  };

  const handleStripePayment = async (e) => {
    if (e) e.preventDefault();

    if (!stripePublishableKey) {
      alert('Real payments are not configured yet (Stripe credentials missing). Please use the simulated sandbox card payment option.');
      return;
    }

    setCardPaying(true);
    try {
      let targetId = '';
      let payloadType = 'booking';

      if (payingBooking) {
        // Create job record first as pending + unpaid so we have a reference
        const { data, error } = await supabase
          .from('jobs')
          .insert({
            client_name: payingBooking.clientName,
            client_email: payingBooking.clientEmail,
            client_phone: payingBooking.clientPhone,
            address: payingBooking.clientAddress,
            service_package: payingBooking.servicePackage,
            scheduled_at: payingBooking.scheduledAt,
            price: payingBooking.price,
            frequency: payingBooking.frequency || 'one-time',
            status: 'pending',
            payment_status: 'unpaid'
          })
          .select()
          .single();
        if (error) throw error;
        targetId = data.id;
      } else {
        // Custom invoice payment - create invoice record as unpaid first
        const { data, error } = await supabase
          .from('invoices')
          .insert({
            client_name: invoiceClientName,
            client_email: invoiceEmail,
            amount: parseFloat(invoiceAmount),
            notes: 'Stripe invoice payment',
            status: 'unpaid'
          })
          .select()
          .single();
        if (error) throw error;
        targetId = data.id;
        payloadType = 'invoice';
      }

      // Invoke Supabase Edge Function to generate Stripe Checkout Session
      const { data: resData, error: funcError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          amount: parseFloat(payingBooking ? payingBooking.price : invoiceAmount),
          client_name: payingBooking ? payingBooking.clientName : invoiceClientName,
          client_email: payingBooking ? payingBooking.clientEmail : invoiceEmail,
          service_package: payingBooking ? payingBooking.servicePackage : 'Peosta Cleaning Services Invoice',
          frequency: payingBooking ? payingBooking.frequency : 'one-time',
          metadata: {
            success_url: window.location.origin + window.location.pathname,
            cancel_url: window.location.origin + window.location.pathname,
            type: payloadType,
            job_id: payloadType === 'booking' ? targetId : undefined,
            invoice_id: payloadType === 'invoice' ? targetId : undefined
          }
        }
      });

      if (funcError) throw new Error(funcError.message);
      if (!resData?.url) throw new Error('No checkout URL returned from payment server.');

      // Redirect to Stripe checkout page
      window.location.href = resData.url;

    } catch (err) {
      alert('Stripe Error: ' + err.message);
      setCardPaying(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentTab('home');
    setDashboardTab('jobs');
  };

  const handleBookingComplete = (bookingDetails) => {
    setPayingBooking(bookingDetails);
    setInvoiceAmount(bookingDetails.price);
    setInvoiceClientName(bookingDetails.clientName);
    setInvoiceEmail(bookingDetails.clientEmail);
    setCurrentTab('pay');
  };

  const handleCustomInvoicePay = (e) => { e.preventDefault(); };

  const processSimulatedPayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      alert('Please fill in all credit card details.');
      return;
    }
    setCardPaying(true);
    setTimeout(async () => {
      try {
        if (payingBooking) {
          const { error } = await supabase.from('jobs').insert({
            client_name: payingBooking.clientName,
            client_email: payingBooking.clientEmail,
            client_phone: payingBooking.clientPhone,
            address: payingBooking.clientAddress,
            service_package: payingBooking.servicePackage,
            scheduled_at: payingBooking.scheduledAt,
            price: payingBooking.price,
            frequency: payingBooking.frequency || 'one-time',
            status: 'pending',
            payment_status: 'paid'
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('jobs').insert({
            client_name: invoiceClientName,
            client_email: invoiceEmail,
            client_phone: 'Custom Online Payment',
            address: 'Online Billing Client',
            service_package: 'Invoice Payment',
            scheduled_at: new Date(),
            price: parseFloat(invoiceAmount),
            frequency: 'one-time',
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

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('jobs').insert({
        client_name: newJobClientName,
        client_email: newJobClientEmail,
        client_phone: newJobClientPhone,
        address: newJobAddress,
        service_package: newJobPackage,
        price: parseFloat(newJobPrice),
        scheduled_at: new Date(newJobDate),
        employee_id: newJobEmployeeId || null,
        frequency: 'one-time',
        status: newJobEmployeeId ? 'assigned' : 'pending',
        payment_status: 'unpaid'
      });
      if (error) throw error;
      alert('Job successfully created!');
      setNewJobClientName(''); setNewJobClientEmail(''); setNewJobClientPhone('');
      setNewJobAddress(''); setNewJobPrice(''); setNewJobDate(''); setNewJobEmployeeId('');
      setDashboardTab('jobs');
      fetchJobs();
    } catch (err) {
      alert('Error creating job: ' + err.message);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setCreatingEmployee(true);
    try {
      const secondarySupabase = createSecondaryClient();
      const { data, error } = await secondarySupabase.auth.signUp({
        email: employeeEmail,
        password: employeePassword,
        options: { data: { full_name: employeeFullName, role: 'employee' } }
      });
      if (error) throw error;
      if (!data?.user) throw new Error('No user data returned.');

      const { error: profileError } = await secondarySupabase.from('profiles').insert({
        id: data.user.id,
        full_name: employeeFullName,
        email: employeeEmail,
        role: 'employee'
      });
      if (profileError) throw profileError;

      alert(`Employee account for ${employeeFullName} created successfully!`);
      setEmployeeEmail(''); setEmployeePassword(''); setEmployeeFullName('');
      setDashboardTab('jobs');
      fetchEmployees();
    } catch (err) {
      alert('Error creating employee: ' + err.message);
    } finally {
      setCreatingEmployee(false);
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
      if (error) throw error;
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Error updating job status: ' + err.message);
    }
  };

  // Sidebar items per role
  const sidebarItems = {
    owner: [
      { id: 'jobs', icon: <ListChecks size={20} />, label: 'All Jobs' },
      { id: 'invoices', icon: <Receipt size={20} />, label: 'Invoices' },
      { id: 'accounts', icon: <Users size={20} />, label: 'Accounts' },
      { id: 'chat', icon: <MessageSquare size={20} />, label: 'Team Chat' },
      { id: 'new-job', icon: <PlusCircle size={20} />, label: 'Create Job' },
      { id: 'create-employee', icon: <User size={20} />, label: 'Create Employee' },
      { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
    ],
    employee: [
      { id: 'jobs', icon: <ListChecks size={20} />, label: 'My Jobs' },
      { id: 'availability', icon: <CalendarDays size={20} />, label: 'My Availability' },
      { id: 'chat', icon: <MessageSquare size={20} />, label: 'Team Chat' },
    ],
    client: [
      { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
      { id: 'history', icon: <History size={20} />, label: 'My Bookings' },
      { id: 'invoices', icon: <Receipt size={20} />, label: 'My Invoices' },
      { id: 'chat', icon: <MessageSquare size={20} />, label: 'Support Chat' },
    ],
  };

  const currentRole = simulatedRole || profile?.role || 'client';
  const activeSidebarItems = profile ? (sidebarItems[currentRole] || sidebarItems.client) : [];

  const inputStyleDark = { backgroundColor: '#0f172a', borderColor: '#334155', color: 'white' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {currentTab !== 'dashboard' && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          profile={profile}
          onLogout={handleLogout}
          setAuthRole={setAuthRole}
          setIsRegistering={setIsRegistering}
        />
      )}

      <main style={{ flexGrow: 1, backgroundColor: currentTab === 'dashboard' ? '#0f172a' : 'var(--bg-main)' }}>

        {/* ── HOME ─────────────────────────────────────────────────────── */}
        {currentTab === 'home' && (
          <div>
            {/* Hero */}
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

                </div>
              </div>
              <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '80%', height: '150%', background: 'radial-gradient(ellipse at center, rgba(45,212,191,0.15) 0%, rgba(13,148,136,0) 70%)', transform: 'rotate(-15deg)', pointerEvents: 'none' }} />
            </section>

            {/* Services */}
            <section style={{ padding: '80px 0' }} id="services">
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What We Do</span>
                  <h2 style={{ fontSize: '2.25rem', marginTop: 8 }}>Our Cleaning Expertise</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: 8 }}>Tailored solutions to meet the exacting standards of your space.</p>
                </div>

                <div className="grid grid-3">
                  {[
                    { icon: '🧹', name: 'Standard Cleaning', desc: 'Perfect for maintaining a pristine home environment on a regular basis.', items: ['Dusting & Wiping', 'Vacuuming & Mopping', 'Bathroom Sanitation'], highlight: false },
                    { icon: '✨', name: 'Deep Cleaning', desc: 'A comprehensive, top-to-bottom scrub for those who need a fresh start.', items: ['Baseboards & Blinds', 'Appliance Interiors', 'Deep Carpet Scrub'], highlight: true },
                    { icon: '🏢', name: 'Commercial Cleaning', desc: 'Professional-grade solutions for offices, retail, and corporate spaces.', items: ['After-Hours Services', 'Workspace Sanitization', 'Restroom Maintenance'], highlight: false },
                  ].map(({ icon, name, desc, items, highlight }) => (
                    <div key={name} className="card flex flex-col justify-between" style={highlight ? { border: '2px solid var(--color-primary)', position: 'relative', overflow: 'hidden' } : {}}>
                      {highlight && <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'var(--color-primary)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>POPULAR</div>}
                      <div>
                        <div className="flex align-center justify-center" style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'rgba(13,148,136,0.1)', color: 'var(--color-primary)', fontSize: '1.5rem', marginBottom: 20 }}>{icon}</div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: 12 }}>{name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>{desc}</p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          {items.map(item => (
                            <li key={item} className="flex align-center gap-2">
                              <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button onClick={() => setCurrentTab('book')} className={`btn ${highlight ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', padding: '10px' }}>Book {name.split(' ')[0]} Clean</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Trust */}
            <section style={{ padding: '80px 0', backgroundColor: '#f1f5f9' }}>
              <div className="container grid grid-2" style={{ alignItems: 'center', gap: 60 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Peosta Quality</span>
                  <h2 style={{ fontSize: '2.25rem', margin: '8px 0 20px 0' }}>Why Peosta Cleaning Services Stands Out</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
                    We believe cleaning is about more than just making surfaces look tidy. It's about safety, health, and peace of mind. Every employee on our team is fully vetted, background checked, and trained in medical-grade sanitizing standards.
                  </p>
                  <div className="flex flex-col gap-4">
                    {['Fully insured, licensed, and bonded professionals.', 'Stripe-certified secure payments and flat rates.', 'Real-time photo verification of progress and damage reporting.'].map(text => (
                      <div key={text} className="flex align-center gap-4">
                        <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,148,136,0.1)' }}><Check size={16} /></div>
                        <span style={{ fontWeight: 600 }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card flex flex-col gap-6" style={{ borderLeft: '6px solid var(--color-primary)', padding: '40px 32px' }}>
                  <div className="flex align-center gap-2" style={{ color: 'var(--color-warning)' }}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={20} fill="currentColor" />)}
                  </div>
                  <blockquote style={{ fontSize: '1.2rem', fontWeight: 500, fontStyle: 'italic', color: 'var(--color-secondary)' }}>
                    "The online scheduler was incredibly convenient, and the cleaners did an absolutely spotless job on our commercial office in Peosta."
                  </blockquote>
                  <div className="flex align-center gap-3">
                    <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>S</div>
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

        {currentTab === 'book' && (
          <BookingCalendar 
            onBookingComplete={handleBookingComplete} 
            user={user}
            profile={profile}
            onNavigate={setCurrentTab}
            setAuthRole={setAuthRole}
            setIsRegistering={setIsRegistering}
          />
        )}

        {/* ── PAY INVOICE ──────────────────────────────────────────────── */}
        {currentTab === 'pay' && (
          <div className="container flex justify-center" style={{ padding: '60px 24px' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 500 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <CreditCardIconWrapper />
                <h3 style={{ fontSize: '1.75rem', marginTop: 16 }}>Secure Invoice Payment</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Powered by Stripe • Peosta Cleaning Services</p>
              </div>

              {paymentSuccess ? (
                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ color: 'var(--color-success)', display: 'inline-flex', padding: 16, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', marginBottom: 16 }}>
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Payment Successful!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
                    Your transaction has completed. A receipt will be emailed to your inbox.
                  </p>
                  {payingBooking?.frequency && payingBooking.frequency !== 'one-time' && (
                    <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: 16 }}>
                      ✓ {payingBooking.frequency.charAt(0).toUpperCase() + payingBooking.frequency.slice(1)} recurring service activated!
                    </p>
                  )}
                  <button onClick={() => { setPaymentSuccess(false); setCurrentTab('home'); }} className="btn btn-primary">
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
                      <p style={{ fontSize: '0.85rem' }}><strong>Date:</strong> {payingBooking.scheduledAt.toLocaleDateString()}</p>
                      {payingBooking.frequency && payingBooking.frequency !== 'one-time' && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}><strong>Frequency:</strong> {payingBooking.frequency}</p>
                      )}
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

                  {stripePublishableKey && !useSimulatedCard ? (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24, textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
                        A secure checkout session will be created on Stripe for <strong>${payingBooking ? payingBooking.price : invoiceAmount || '0.00'}</strong>.
                      </p>
                      <button
                        onClick={handleStripePayment}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', marginBottom: 16 }}
                        disabled={cardPaying}
                      >
                        {cardPaying ? 'Redirecting to Stripe...' : 'Pay with Stripe Checkout'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={processSimulatedPayment} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: 0 }}>Simulated Card Information</h4>

                      </div>
                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <input type="text" required maxLength="19" value={cardNumber} onChange={(e) => { const formatted = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim(); setCardNumber(formatted); }} className="form-input" placeholder="4242 4242 4242 4242" />
                      </div>
                      <div className="grid grid-2" style={{ gap: 16 }}>
                        <div className="form-group">
                          <label className="form-label">Expiration Date</label>
                          <input type="text" required maxLength="5" value={cardExpiry} onChange={(e) => { let v = e.target.value; if (v.length === 2 && !v.includes('/')) v += '/'; setCardExpiry(v); }} className="form-input" placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVC / CVV</label>
                          <input type="text" required maxLength="4" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))} className="form-input" placeholder="123" />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 16 }} disabled={cardPaying}>
                        {cardPaying ? 'Processing Payment...' : `Simulate Pay $${payingBooking ? payingBooking.price : invoiceAmount || '0.00'}`}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PORTAL LOGIN ──────────────────────────────────────────────── */}
        {currentTab === 'portal-login' && (
          <div className="container flex justify-center" style={{ padding: '80px 24px' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 450 }}>
              {isForgotPassword ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 12, borderRadius: '12px', backgroundColor: 'rgba(13,148,136,0.1)' }}>
                      <Lock size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', marginTop: 16 }}>Forgot Password</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                      Reset your Peosta Cleaning portal password
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="form-input"
                        placeholder="jane@example.com"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginBottom: 16 }}>
                      Send Reset Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="btn btn-outline"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      Back to Sign In
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 12, borderRadius: '12px', backgroundColor: 'rgba(13,148,136,0.1)' }}>
                      <Lock size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', marginTop: 16 }}>
                      {isRegistering ? 'Create Your Account' : (authRole === 'client' ? 'Client Sign In' : 'Staff Sign In')}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Peosta Cleaning Portal Access</p>
                  </div>

                  {/* Only show client signup toggle — employees can't self-register */}
                  {authRole === 'employee' && (
                    <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.85rem', color: '#ef4444' }}>
                      <ShieldAlert size={14} style={{ display: 'inline', marginRight: 6 }} />
                      Staff accounts are created by the owner. If you need access, contact your manager.
                    </div>
                  )}

                  <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                    {isRegistering && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input type="text" required value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} className="form-input" placeholder="Jane Doe" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone Number (optional)</label>
                          <input 
                            type="tel" 
                            value={authPhone} 
                            onChange={(e) => setAuthPhone(formatPhoneNumber(e.target.value))} 
                            className="form-input" 
                            placeholder="(563) 555-0100" 
                          />
                        </div>
                        <div className="form-group" style={{ position: 'relative' }}>
                          <label className="form-label">Service Address (optional)</label>
                          <input 
                            type="text" 
                            value={authAddress} 
                            onChange={(e) => handleRegAddressChange(e.target.value)} 
                            onFocus={() => regAddressSuggestions.length > 0 && setRegShowSuggestions(true)}
                            className="form-input" 
                            placeholder="123 Main St, Peosta, IA" 
                          />
                          {regShowSuggestions && regAddressSuggestions.length > 0 && (
                            <>
                              <div onClick={() => setRegShowSuggestions(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                              <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                                backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8,
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', marginTop: 4, padding: 4,
                                display: 'flex', flexDirection: 'column', gap: 2
                              }}>
                                {regAddressSuggestions.map((sug, i) => (
                                  <div
                                    key={i}
                                    onClick={() => {
                                      setAuthAddress(sug.display_name);
                                      setRegShowSuggestions(false);
                                      setRegAddressSuggestions([]);
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
                        </div>
                      </>
                    )}
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="form-input" placeholder="jane@example.com" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                        {!isRegistering && authRole === 'client' && (
                          <button
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input type={showPassword ? 'text' : 'password'} required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="form-input" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                      {isRegistering ? 'Create Account' : 'Sign In'}
                    </button>
                  </form>

                  {/* Client can self-register; employees cannot */}
                  {authRole === 'client' && (
                    <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {isRegistering ? 'Already have an account?' : "New client? Create an account to track your bookings."}
                      </span>{' '}
                      <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {isRegistering ? 'Sign In Instead' : 'Sign Up Free'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'reset-password-form' && (
          <div className="container flex justify-center" style={{ padding: '80px 24px' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 450 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 12, borderRadius: '12px', backgroundColor: 'rgba(13,148,136,0.1)' }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ fontSize: '1.75rem', marginTop: 16 }}>Set New Password</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                  Enter your new secure password below
                </p>
              </div>

              <form onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={updatingPassword}>
                  {updatingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── EMAIL VERIFICATION GATE ──────────────────────────────────── */}
        {currentTab === 'dashboard' && user && !user.email_confirmed_at && (
          <div className="container flex justify-center" style={{ padding: '80px 24px' }}>
            <div className="card text-center animate-fade-in" style={{ width: '100%', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: 16, borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', marginBottom: 20 }}>
                <Mail size={48} />
              </div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-secondary)', marginBottom: 12 }}>Verify Your Email</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                A verification link has been sent to <strong>{user.email}</strong>. Please check your inbox and verify your email to access your dashboard.
              </p>
              <div className="flex flex-col gap-4" style={{ width: '100%' }}>
                <button onClick={async () => { const { error } = await supabase.auth.resend({ type: 'signup', email: user.email }); alert(error ? 'Error: ' + error.message : 'Verification email resent!'); }} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Resend Verification Email
                </button>
                <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', padding: '12px', borderColor: '#ef4444', color: '#ef4444' }}>
                  Cancel / Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FULL DASHBOARD ───────────────────────────────────────────── */}
        {currentTab === 'dashboard' && profile && user && user.email_confirmed_at && (
          <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
              <div>
                <div className="sidebar-logo">Peosta Portal</div>
                <div className="sidebar-menu">
                  {activeSidebarItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => { setDashboardTab(item.id); setSelectedJob(null); }}
                      className={`sidebar-item ${dashboardTab === item.id ? 'active' : ''}`}
                    >
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ padding: '16px 0', borderTop: '1px solid #334155', marginBottom: 16 }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>{profile.full_name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                    Role: {profile.role} {simulatedRole && <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>(Simulated Client)</span>}
                  </p>
                  {profile.role === 'owner' && (
                    <button
                      onClick={() => {
                        if (simulatedRole === 'client') {
                          setSimulatedRole(null);
                          setDashboardTab('jobs');
                        } else {
                          setSimulatedRole('client');
                          setDashboardTab('overview');
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: simulatedRole === 'client' ? '#ef4444' : 'var(--color-primary)', color: 'white' }}
                    >
                      {simulatedRole === 'client' ? '❌ Exit Client View' : '👁️ View as Client'}
                    </button>
                  )}
                </div>
                <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444', padding: '8px' }}>
                  Sign Out
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="dashboard-content">
              {simulatedRole && (
                <div style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '10px 20px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
                  <span>⚠️ Simulation Mode: Viewing dashboard as a {simulatedRole}.</span>
                  <button 
                    onClick={() => {
                      setSimulatedRole(null);
                      setDashboardTab('jobs');
                    }}
                    style={{ backgroundColor: '#0f172a', color: '#f59e0b', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800 }}
                  >
                    Exit Client View
                  </button>
                </div>
              )}

              {/* ── JOBS ── */}
              {dashboardTab === 'jobs' && (
                <div>
                  {!selectedJob ? (
                    <div>
                      <div className="dashboard-header">
                        <div>
                          <h2 style={{ fontSize: '2rem', color: 'white' }}>
                            {currentRole === 'owner' ? 'All Cleaning Jobs' : currentRole === 'employee' ? 'My Assigned Jobs' : 'My Bookings'}
                          </h2>
                          <p style={{ color: '#94a3b8', marginTop: 4 }}>
                            {currentRole === 'employee' ? 'Select a job to view checklist, tasks, photos, and update status.' : 'View and manage all active cleanings.'}
                          </p>
                        </div>
                        <button onClick={fetchJobs} className="btn btn-secondary" style={{ padding: '10px 18px' }}>Refresh</button>
                      </div>

                      {loadingJobs ? (
                        <div style={{ color: '#94a3b8' }}>Loading jobs...</div>
                      ) : jobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #334155', borderRadius: 'var(--radius-lg)', color: '#64748b' }}>
                          <ListChecks size={40} style={{ marginBottom: 12 }} />
                          <p>No jobs found.</p>
                        </div>
                      ) : (
                        <div className="grid grid-2" style={{ gap: 24 }}>
                          {jobs.map((job) => (
                            <div key={job.id} onClick={() => setSelectedJob(job)} className="card dashboard-card hover-scale" style={{ cursor: 'pointer' }}>
                              <div className="flex justify-between align-center" style={{ marginBottom: 16 }}>
                                <span className={`badge badge-${job.status}`}>{job.status}</span>
                                <span className={`badge badge-${job.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>{job.payment_status}</span>
                              </div>
                              <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: 8 }}>{job.client_name}</h3>
                              <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><MapPin size={14} /> {job.address}</p>
                              <p style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><CalendarIcon size={14} /> {new Date(job.scheduled_at).toLocaleDateString()} • {new Date(job.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              {job.frequency && job.frequency !== 'one-time' && (
                                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginBottom: 8, display: 'inline-block' }}>🔄 {job.frequency}</span>
                              )}
                              <div className="flex justify-between align-center" style={{ borderTop: '1px solid #334155', paddingTop: 12, marginTop: 4 }}>
                                <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Type: <strong>{job.service_package}</strong></span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>${job.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── ACTIVE JOB VIEW ── */
                    <div>
                      <button onClick={() => { setSelectedJob(null); fetchJobs(); }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', marginBottom: 16 }}>
                        ← Back to Jobs
                      </button>

                      <div className="flex justify-between align-center" style={{ marginBottom: 24 }}>
                        <div>
                          <h2 style={{ fontSize: '2.25rem', color: 'white' }}>{selectedJob.client_name}</h2>
                          <p style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                            <MapPin size={16} /> {selectedJob.address}
                            <button
                              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address)}`, '_blank')}
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4, height: 'auto', border: '1px solid #475569' }}
                            >
                              🗺️ Get Directions
                            </button>
                          </p>
                          {selectedJob.frequency && selectedJob.frequency !== 'one-time' && (
                            <span style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: 4, display: 'block' }}>🔄 {selectedJob.frequency} recurring</span>
                          )}
                        </div>
                        <div className="flex gap-4">
                          {selectedJob.status !== 'completed' ? (
                            <>
                              {selectedJob.status === 'assigned' && (
                                <button onClick={() => handleUpdateJobStatus(selectedJob.id, 'in_progress')} className="btn btn-primary" style={{ backgroundColor: '#c084fc', color: 'black' }}>Start Job</button>
                              )}
                              {selectedJob.status === 'in_progress' && (
                                <button onClick={() => handleUpdateJobStatus(selectedJob.id, 'completed')} className="btn btn-primary" style={{ backgroundColor: 'var(--color-success)' }}>Complete Job</button>
                              )}
                            </>
                          ) : (
                            <span className="badge badge-completed" style={{ padding: '10px 16px', fontSize: '0.9rem' }}>Job Completed</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-2" style={{ gap: 32 }}>
                        {/* Checklist */}
                        <div className="card dashboard-card">
                          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ListChecks size={20} style={{ color: 'var(--color-primary-light)' }} /> Service Checklist
                          </h3>
                          <JobChecklist jobId={selectedJob.id} userId={profile.id} />
                        </div>

                        {/* Todo Tasks */}
                        <div className="card dashboard-card">
                          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CheckCircle2 size={20} style={{ color: '#c084fc' }} /> Job Tasks
                          </h3>
                          <TodoTasks jobId={selectedJob.id} userRole={currentRole} userId={profile.id} />
                        </div>
                      </div>

                      {/* Photos */}
                      <div className="card dashboard-card" style={{ marginTop: 24 }}>
                        <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Camera size={20} style={{ color: 'var(--color-primary-light)' }} /> Damage & Progress Photos
                        </h3>
                        <PhotoUploader jobId={selectedJob.id} userId={profile.id} />
                      </div>

                      {/* Rating/Tip (client only for completed jobs) */}
                      {currentRole === 'client' && selectedJob.status === 'completed' && (
                        <div className="card dashboard-card" style={{ marginTop: 24 }}>
                          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Star size={20} style={{ color: '#f59e0b' }} /> Rate & Tip Your Cleaner
                          </h3>
                          <RatingTip job={selectedJob} clientId={profile.id} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── INVOICES (owner) ── */}
              {dashboardTab === 'invoices' && currentRole === 'owner' && (
                <InvoiceManager />
              )}

              {/* ── CHAT ── */}
              {dashboardTab === 'chat' && (
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: 24 }}>
                    {currentRole === 'client' ? 'Support Chat' : 'Portal Team Chat'}
                  </h2>
                  <Chat userId={profile.id} />
                </div>
              )}

              {/* ── CREATE JOB (owner) ── */}
              {dashboardTab === 'new-job' && currentRole === 'owner' && (
                <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
                  <div className="card dashboard-card">
                    <h2 style={{ fontSize: '1.75rem', color: 'white', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PlusCircle size={24} style={{ color: 'var(--color-primary-light)' }} /> Create & Assign Cleaning Job
                    </h2>
                    <form onSubmit={handleCreateJob}>
                      <div className="grid grid-2" style={{ gap: 16 }}>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Client Name</label>
                          <input type="text" required value={newJobClientName} onChange={(e) => setNewJobClientName(e.target.value)} className="form-input" style={inputStyleDark} placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Client Phone</label>
                          <input type="tel" required value={newJobClientPhone} onChange={(e) => handleOwnerPhoneChange(e.target.value)} className="form-input" style={inputStyleDark} placeholder="(563) 555-0199" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ color: 'white' }}>Client Email</label>
                        <input type="email" required value={newJobClientEmail} onChange={(e) => setNewJobClientEmail(e.target.value)} className="form-input" style={inputStyleDark} placeholder="john@example.com" />
                      </div>
                      <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label" style={{ color: 'white' }}>Cleaning Address</label>
                        <input 
                          type="text" 
                          required 
                          value={newJobAddress} 
                          onChange={(e) => handleOwnerAddressChange(e.target.value)} 
                          onFocus={() => ownerAddressSuggestions.length > 0 && setShowOwnerSuggestions(true)}
                          className="form-input" 
                          style={inputStyleDark} 
                          placeholder="123 Broad St, Peosta, IA" 
                        />
                        {showOwnerSuggestions && ownerAddressSuggestions.length > 0 && (
                          <>
                            <div onClick={() => setShowOwnerSuggestions(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} />
                            <div style={{
                              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                              backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8,
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', marginTop: 4, padding: 4,
                              display: 'flex', flexDirection: 'column', gap: 2
                            }}>
                              {ownerAddressSuggestions.map((sug, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    setNewJobAddress(sug.display_name);
                                    setShowOwnerSuggestions(false);
                                    setOwnerAddressSuggestions([]);
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
                      </div>
                      <div className="grid grid-3" style={{ gap: 16 }}>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Package</label>
                          <select value={newJobPackage} onChange={(e) => setNewJobPackage(e.target.value)} className="form-input" style={inputStyleDark}>
                            <option>Standard Clean</option>
                            <option>Deep Clean</option>
                            <option>Commercial Clean</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Price ($)</label>
                          <input type="number" required value={newJobPrice} onChange={(e) => setNewJobPrice(e.target.value)} className="form-input" style={inputStyleDark} placeholder="150" />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ color: 'white' }}>Schedule Date</label>
                          <input type="datetime-local" required value={newJobDate} onChange={(e) => setNewJobDate(e.target.value)} className="form-input" style={inputStyleDark} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="form-label" style={{ color: 'white' }}>Assign Employee</label>
                        <select value={newJobEmployeeId} onChange={(e) => setNewJobEmployeeId(e.target.value)} className="form-input" style={inputStyleDark}>
                          <option value="">Unassigned</option>
                          {allEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>Create & Deploy Job</button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── CREATE EMPLOYEE (owner) ── */}
              {dashboardTab === 'create-employee' && currentRole === 'owner' && (
                <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
                  <div className="card dashboard-card">
                    <h2 style={{ fontSize: '1.75rem', color: 'white', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <User size={24} style={{ color: 'var(--color-primary-light)' }} /> Create Employee Account
                    </h2>
                    <form onSubmit={handleCreateEmployee}>
                      <div className="form-group">
                        <label className="form-label" style={{ color: 'white' }}>Full Name</label>
                        <input type="text" required value={employeeFullName} onChange={(e) => setEmployeeFullName(e.target.value)} className="form-input" style={inputStyleDark} placeholder="Jane Doe" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ color: 'white' }}>Email Address</label>
                        <input type="email" required value={employeeEmail} onChange={(e) => setEmployeeEmail(e.target.value)} className="form-input" style={inputStyleDark} placeholder="jane@peostacleaning.com" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="form-label" style={{ color: 'white' }}>Password</label>
                        <input type="password" required value={employeePassword} onChange={(e) => setEmployeePassword(e.target.value)} className="form-input" style={inputStyleDark} placeholder="••••••••" />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={creatingEmployee}>
                        {creatingEmployee ? 'Creating Account...' : 'Create Employee Account'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── OWNER SETTINGS ── */}
              {dashboardTab === 'settings' && currentRole === 'owner' && (
                <OwnerSettings />
              )}

              {/* ── EMPLOYEE AVAILABILITY ── */}
              {dashboardTab === 'availability' && currentRole === 'employee' && (
                <EmployeeAvailability employeeId={profile.id} />
              )}

              {/* ── CLIENT BOOKING HISTORY ── */}
              {dashboardTab === 'history' && currentRole === 'client' && (
                <ClientHistory clientEmail={profile.email} clientId={profile.id} />
              )}

              {/* ── CLIENT INVOICES ── */}
              {dashboardTab === 'invoices' && currentRole === 'client' && (
                <ClientInvoices 
                  clientEmail={profile.email} 
                  onPayInvoice={handlePayInvoiceDirect} 
                />
              )}

              {/* ── CLIENT OVERVIEW (DASHBOARD HOME) ── */}
              {dashboardTab === 'overview' && currentRole === 'client' && (
                <ClientOverview 
                  clientEmail={profile.email} 
                  onNavigate={setCurrentTab} 
                  onDashboardTabChange={setDashboardTab} 
                />
              )}

              {/* ── OWNER ACCOUNTS MANAGER ── */}
              {dashboardTab === 'accounts' && currentRole === 'owner' && (
                <AccountManager />
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
              <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Phone size={16} /> +1 (563) 555-0199</p>
              <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} /> contact@peostacleaning.com</p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: 16 }}>Site Links</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
                <li><button onClick={() => setCurrentTab('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Home Page</button></li>
                <li><button onClick={() => setCurrentTab('book')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Book Service</button></li>
                <li><button onClick={() => { setAuthRole('client'); setCurrentTab('portal-login'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Client Sign In</button></li>
                <li><button onClick={() => { setAuthRole('employee'); setCurrentTab('portal-login'); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>Staff Sign In</button></li>
              </ul>
            </div>
          </div>
          <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: 24, textAlign: 'center', fontSize: '0.8rem' }}>
            <p>&copy; {new Date().getFullYear()} Peosta Cleaning Services. All rights reserved. Secure Payments Powered by Stripe.</p>
          </div>
        </footer>
      )}

      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        width: 'calc(100% - 48px)', maxWidth: 360, pointerEvents: 'none'
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideInToast {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .toast-notification {
            animation: slideInToast 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />
        {toasts.map(t => {
          const colors = {
            success: { bg: '#064e3b', border: '#059669', text: '#ecfdf5', icon: '✅' },
            error: { bg: '#7f1d1d', border: '#dc2626', text: '#fef2f2', icon: '❌' },
            info: { bg: '#1e3a8a', border: '#2563eb', text: '#eff6ff', icon: 'ℹ️' },
            warning: { bg: '#78350f', border: '#d97706', text: '#fffbeb', icon: '⚠️' }
          }[t.type] || { bg: '#1e293b', border: '#475569', text: '#f8fafc', icon: '🔔' };

          return (
            <div
              key={t.id}
              className="toast-notification"
              style={{
                pointerEvents: 'auto',
                background: colors.bg,
                borderLeft: `6px solid ${colors.border}`,
                borderRadius: 12,
                padding: '16px 20px',
                color: colors.text,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.25rem', display: 'flex', alignSelf: 'center' }}>{colors.icon}</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>
                  {t.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none', border: 'none', color: colors.text, opacity: 0.5,
                  cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold', padding: 0,
                  lineHeight: 1, outline: 'none'
                }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.5}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
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
