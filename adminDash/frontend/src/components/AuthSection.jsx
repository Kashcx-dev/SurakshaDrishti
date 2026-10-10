import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Users,
  Zap,
  MapPin,
  Crosshair,
  UserPlus,
  LogIn,
  Phone,
  Mail,
  Home,
  Heart,
  Sparkles,
  Building2,
  ChevronRight,
  Key,
  Globe,
  Compass,
  Radio,
  Flame
} from 'lucide-react';
import { apiService, checkGeofenceRedZoneStatus } from '../utils/api';
import { useToast } from './Toast';

const DEMO_ACCOUNTS = [
  {
    id: 'ndrf',
    role: 'NDRF',
    badge: 'NDRF COMMAND',
    badgeColor: 'bg-blue-900/10 text-blue-800 border-blue-200/80',
    title: 'NDRF Incident Commander',
    name: 'Cmdr. Rajesh Verma',
    rank: '04 Battalion Field Lead',
    district: 'Wayanad Sector 4 (Meppadi)',
    officer_mode: 'ON_SITE',
    email: 'ndrf.command@mha.gov.in',
    username: 'ndrf_admin',
  },
  {
    id: 'sdma',
    role: 'SDMA',
    badge: 'STATE AUTHORITY',
    badgeColor: 'bg-emerald-900/10 text-emerald-800 border-emerald-200/80',
    title: 'SDMA Operations Officer',
    name: 'Dr. Ananya Nair',
    rank: 'State Emergency Operations Hub',
    district: 'Kerala State Ops (Trivandrum)',
    officer_mode: 'OFF_SITE',
    email: 'operations@keralasdma.gov.in',
    username: 'sdma_officer',
  },
  {
    id: 'ddma',
    role: 'DDMA',
    badge: 'DISTRICT COLLECTOR',
    badgeColor: 'bg-amber-900/10 text-amber-800 border-amber-200/80',
    title: 'DDMA District Magistrate',
    name: 'Arvind Swaminathan, IAS',
    rank: 'District Collector & DM',
    district: 'Wayanad Central Collectorate',
    officer_mode: 'OFF_SITE',
    email: 'collector.wayanad@kerala.gov.in',
    username: 'collector_wayanad',
  },
  {
    id: 'fire',
    role: 'FIRE_FORCE',
    badge: 'FIRE & RESCUE',
    badgeColor: 'bg-rose-900/10 text-rose-800 border-rose-200/80',
    title: 'Fire & Rescue Station Lead',
    name: 'Officer Thomas Mathew',
    rank: 'Forward Tactical Rescue Post',
    district: 'Chooralmala SAR Post',
    officer_mode: 'ON_SITE',
    email: 'rescue.wayanad@keralafire.gov.in',
    username: 'fire_rescue_01',
  },
];

export default function AuthSection({ initialMode = 'signin', onClose, onAuthSuccess }) {
  const { addToast } = useToast();
  const [authMode, setAuthMode] = useState(initialMode); // 'signin' | 'signup'
  const [loginType, setLoginType] = useState('authority'); // Authority command desk only

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [tempAuthData, setTempAuthData] = useState(null);

  const [signupRole, setSignupRole] = useState('ndrf'); // 'ndrf' | 'sdma' | 'police' | 'fire_rescue'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [district, setDistrict] = useState('Wayanad Sector 4');
  const [familyMembers, setFamilyMembers] = useState('1');
  const [hasVulnerable, setHasVulnerable] = useState(false);
  const [detectedLoc, setDetectedLoc] = useState(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();

    return () => {
      document.body.style.overflow = originalOverflow;
      if (window.__lenis) window.__lenis.start();
    };
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const result = await checkGeofenceRedZoneStatus(coords.lat, coords.lng);
          if (result.inRedZone && result.zone) {
            setLocationStatus({ inRedZone: true, coords, name: result.zone.name });
          } else {
            setLocationStatus({ inRedZone: false, coords, name: null });
          }
          setDetectedLoc(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        },
        () => {
          setLocationStatus({ inRedZone: false, coords: null, name: null });
        },
        { timeout: 5000 }
      );
    } else {
      setLocationStatus({ inRedZone: false, coords: null, name: null });
    }
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectedLoc(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsDetectingGPS(false);
      },
      () => {
        setDetectedLoc('11.5583, 76.1384');
        setIsDetectingGPS(false);
      }
    );
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const trimmedUsername = username.trim();
    // Check if the officer has modified their password in real-time
    const updatedCustomPassword = localStorage.getItem(`suraksha_pwd_${trimmedUsername}`);

    let loginSuccessful = false;
    let authResult = await apiService.login({
      username: trimmedUsername,
      password,
      loginType,
      role: loginType,
    });
    loginSuccessful = authResult.success;

    setIsLoading(false);

    if (loginSuccessful && authResult) {
      if (authResult.requires2FA || authResult.token === 'mock-jwt-token-sih2026') {
        // Enforce 2FA Step
        setTempAuthData(authResult);
        setAuthMode('otp');
        addToast('Credentials verified. Please enter 2FA OTP.', 'info');
      } else {
        addToast('Authentication successful! Initializing tactical session...', 'success');
        setTimeout(() => {
          onAuthSuccess({
            token: authResult.token,
            user: authResult.user || {
              username: trimmedUsername,
              name: trimmedUsername.split('@')[0].toUpperCase(),
              role: loginType === 'authority' ? 'NDRF Tactical Command' : 'Resident Citizen',
              department: loginType === 'authority' ? 'NDRF' : 'Civilian',
            }
          });
        }, 700);
      }
    } else {
      const errText = authResult?.error || authResult?.message || 'Invalid credentials. Please verify your details.';
      addToast(errText, 'error');
      setMessage({ type: 'error', text: errText });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      addToast('Please enter a valid 6-digit OTP code.', 'error');
      return;
    }
    
    setIsLoading(true);
    
    // Call the backend OTP verification route
    const res = await apiService.verifyOtp({ 
      username: tempAuthData?.resolvedUsername || username, 
      otpCode 
    });

    setIsLoading(false);

    if (res.success && res.token) {
      addToast('2FA Verified! Initializing tactical session...', 'success');
      setTimeout(() => {
        onAuthSuccess({
          token: res.token,
          user: res.user || {
            username: username,
            name: username.split('@')[0].toUpperCase(),
            role: loginType === 'authority' ? 'NDRF Tactical Command' : 'Resident Citizen',
            department: loginType === 'authority' ? 'NDRF' : 'Civilian',
          }
        });
      }, 700);
    } else {
      addToast(res.error || res.message || 'Invalid 2FA OTP code.', 'error');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const res = await apiService.register({
      fullName,
      email,
      phone,
      password: signupPassword,
      role: signupRole,
      district,
      familyMembers: parseInt(familyMembers) || 1,
      hasVulnerable,
      coordinates: detectedLoc,
    });

    setIsLoading(false);

    if (res.success) {
      addToast('Account registered successfully! Redirecting...', 'success');
      setMessage({ type: 'success', text: 'Account registered successfully! Redirecting...' });
      setTimeout(() => {
        onAuthSuccess({
          user: {
            username: email || phone,
            name: fullName,
            role: signupRole,
            district,
            token: 'jwt_registered_' + Date.now(),
            emergencyId: res.emergencyId
          }
        });
      }, 800);
    } else {
      const errText = 'Registration failed. Please check your fields.';
      addToast(errText, 'error');
      setMessage({ type: 'error', text: errText });
    }
  };

  const handleLaunchDemoCase = (demo) => {
    setIsLoading(true);
    addToast(`Authorizing 1-Click Profile: ${demo.name} (${demo.role})...`, 'info');
    setTimeout(() => {
      setIsLoading(false);
      addToast(`Session Active: Welcome, ${demo.title}!`, 'success');
      onAuthSuccess({
        token: `jwt_demo_${demo.id}_${Date.now()}`,
        user: {
          username: demo.username,
          name: demo.name,
          fullName: `${demo.name} (${demo.role})`,
          role: demo.role,
          department: demo.rank,
          district: demo.district,
          officer_mode: demo.officer_mode,
          isDemoAccount: true,
        }
      });
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#090F16] flex flex-col w-screen h-screen overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Authentication portal"
    >
      {/* Red Zone Context Banner */}
      {locationStatus?.inRedZone && (
        <div className="flex items-center justify-between gap-3 px-6 py-2.5 bg-[#FFF5F2] border-b border-[#FADED4] text-xs shrink-0 z-30">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-[#B85C38] shrink-0" />
            <span className="text-[#5C544D] truncate">
              Red Zone Vicinity: <span className="text-[#1A1A1A] font-bold">{locationStatus.name}</span>
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-[#B85C38] text-white font-bold text-[10px] uppercase shrink-0">
            Priority Evac Pass Ready
          </span>
        </div>
      )}

      {/* Full-Screen Split Layout */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
        
        {/* ══════════════ LEFT PART: Clean Earth Surface with India visible from Orbit & Mission Overview (Hidden on Mobile) ══════════════ */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative bg-[#090F16] text-white p-6 lg:p-7 xl:p-8 flex-col justify-between overflow-hidden shrink-0 border-r border-white/10 h-full">
          {/* Background Clean Earth Surface from Space with India Prominently Visible (Compressed WebP, No text on image) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src="/login_earth_surface.webp" 
              alt="Planet Earth with Indian Subcontinent from Space Orbit" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out select-none"
            />
            {/* Atmospheric vignettes keeping the Indian subcontinent clear in the middle */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090F16]/95 via-transparent to-[#090F16]/70"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#090F16]/60"></div>
          </div>

          {/* Top Brand Header & Mission Headline */}
          <div className="relative z-10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <img 
                    src="/favicon.webp" 
                    alt="SurakshaDrishti" 
                    className="w-full h-full object-contain drop-shadow-md" 
                  />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                    SurakshaDrishti
                  </h3>
                  <p className="text-[10px] text-gray-300 font-mono tracking-wider uppercase">
                    National Disaster Decision Support System
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#8B7355]/30 border border-[#8B7355]/50 text-[#E8D7C3] uppercase font-bold shrink-0 backdrop-blur-md">
                SIH 28191
              </span>
            </div>

            <div className="pt-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md text-[10px] sm:text-[11px] font-mono font-medium text-emerald-300 mb-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ISRO SAR & IMD TELEMETRY • INDIA ORBIT
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                Predict. Protect. Relocate.
              </h2>
            </div>
          </div>

          {/* Spacer to keep the Indian subcontinent clearly visible in the middle */}
          <div className="flex-1 min-h-[80px]"></div>

          {/* Lower Part: 3 Application Core Pillars & Command Desk Footer */}
          <div className="relative z-10 mt-auto pt-3 flex flex-col gap-2.5">
            {/* 3 Boxes positioned at the very lower part of the image */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/65 backdrop-blur-md p-2 rounded-xl border border-white/15 shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-white mb-0.5 leading-tight">8-Char GeoHash</p>
                <p className="text-[9px] text-gray-300 leading-tight">Sub-meter hazard triage.</p>
              </div>

              <div className="bg-black/65 backdrop-blur-md p-2 rounded-xl border border-white/15 shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mb-1">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-white mb-0.5 leading-tight">GSM 3.4 Relay</p>
                <p className="text-[9px] text-gray-300 leading-tight">Zero-net corridors.</p>
              </div>

              <div className="bg-black/65 backdrop-blur-md p-2 rounded-xl border border-white/15 shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mb-1">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-white mb-0.5 leading-tight">Command Guard</p>
                <p className="text-[9px] text-gray-300 leading-tight">Ed25519 verification.</p>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                OFFICIAL COMMAND DESK
              </span>
              <span className="text-gray-300 font-semibold tracking-wider text-[9px]">AES-256-GCM ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT PART: Register / Sign In Fields (Wider, Non-scrollable on Desktop) ══════════════ */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-7 h-full bg-[#FDFBF7] p-4 sm:p-6 lg:p-7 xl:p-9 overflow-y-auto lg:overflow-hidden flex flex-col justify-between relative shadow-2xl">
            
            {/* Top Header & Close */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5 text-[#8B7355]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8B7355]">
                    Officer Access Portal
                  </span>
                </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                {authMode === 'otp'
                  ? 'Two-Factor Authentication'
                  : authMode === 'signup'
                  ? 'Field Personnel Registration'
                  : authMode === 'demo'
                  ? '1-Click Evaluation Profiles'
                  : 'Official Command Desk Sign In'}
              </h2>
              <p className="text-xs text-[#5C544D] mt-0.5">
                {authMode === 'otp'
                  ? 'Enter the secure OTP code sent to your official device'
                  : authMode === 'signup'
                  ? 'Register authorized field officers, SDRF/NDRF responders, or local disaster coordinators'
                  : authMode === 'demo'
                  ? 'Select any operational authority below for instant automated access into the tactical command console'
                  : 'Centralized access for NDRF, SDMA, Police, and Fire Rescue officers with pre-provisioned credentials'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F6F4F0] hover:bg-[#E8E1D5] text-[#5C544D] hover:text-[#1A1A1A] transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {authMode !== 'otp' && (
            <div className="flex rounded-xl bg-[#F6F4F0] p-1 mb-5 border border-[#E8E1D5]">
              <button
                type="button"
                onClick={() => setAuthMode('demo')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'demo'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#7A726A] hover:text-[#1A1A1A]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#8B7355]" />
                <span>1-Click Demo</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#7A726A] hover:text-[#1A1A1A]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-[#1A1A1A] shadow-xs'
                    : 'text-[#7A726A] hover:text-[#1A1A1A]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}

          {authMode === 'demo' ? (
            /* ================= MODE: 1-CLICK DEMO CASES ================= */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#F6F4F0] border border-[#E8E1D5]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#8B7355] text-white flex items-center justify-center shadow-2xs">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      Select an Official Evaluation Profile
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8B7355] font-bold uppercase bg-white px-2 py-0.5 rounded-full border border-[#E8E1D5]">
                    No Passwords Needed
                  </span>
                </div>
                <p className="text-[11px] text-[#5C544D] leading-relaxed">
                  Click any operational role below to immediately enter the command console with that officer's live jurisdiction & privileges:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleLaunchDemoCase(demo)}
                    disabled={isLoading}
                    className="group flex flex-col justify-between p-3.5 rounded-2xl bg-white hover:bg-[#FDFBF7] border border-[#E8E1D5] hover:border-[#8B7355] text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${demo.badgeColor}`}>
                          {demo.badge}
                        </span>
                        <span className="text-[10px] font-bold text-[#8B7355] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Launch <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#8B7355] transition-colors">
                        {demo.name}
                      </div>
                      <div className="text-xs text-[#7A726A] font-medium mt-0.5">
                        {demo.title}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#F2ECE2] flex items-center justify-between text-[10px] text-[#8C847A] font-mono">
                      <span className="truncate">{demo.district}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#F6F4F0] text-[#4A4238] font-bold uppercase shrink-0">
                        {demo.officer_mode}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs text-[#8B7355] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  Need official Gov / Service ID login? Switch to Sign In <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : authMode === 'otp' ? (
            /* ================= MODE: 2FA OTP ================= */
            <div>
              <div className="mb-4 p-3 bg-[#FFF5F2] rounded-xl border border-[#FADED4] flex items-center justify-center gap-2 text-[#B85C38] font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> Secure Auth Enforced
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C2A29] mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] font-mono tracking-[0.5em] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-3.5 rounded-xl bg-[#2D7A4F] hover:bg-[#256842] text-[#FDFBF7] font-medium text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
                >
                  {isLoading ? 'Verifying...' : 'Verify Secure Code'}
                  <CheckCircle2 className="w-4 h-4 opacity-80" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="w-full py-2 text-xs text-[#5C544D] hover:text-[#1A1A1A] underline transition-colors"
                >
                  Return to Sign In
                </button>
              </form>
            </div>
          ) : authMode === 'signup' ? (
            /* ================= MODE: PERSONNEL REGISTRATION ================= */
            <div>
              <div className="mb-4 p-3 bg-[#F6F4F0] rounded-xl border border-[#E8E1D5] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1A1A1A] font-bold text-xs sm:text-sm">
                  <UserPlus className="w-4 h-4 text-[#8B7355]" />
                  <span>Field & Responder Onboarding</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8E1D5] text-[#4A4238] font-bold uppercase">
                  Field Unit
                </span>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#2C2A29] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Inspector Rajesh Verma"
                      className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2A29] mb-1">Official Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rajesh.ndrf@gov.in"
                        className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C2A29] mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2A29] mb-1">Tactical Role</label>
                    <div className="relative">
                      <Shield className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8B7355] transition-colors cursor-pointer"
                      >
                        <option value="ndrf">NDRF Task Force</option>
                        <option value="sdma">SDMA Officer</option>
                        <option value="police">State Police Dispatch</option>
                        <option value="fire_rescue">Fire & Rescue</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2C2A29] mb-1">Assigned District</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Wayanad Sector 4"
                        className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2A29] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                    />
                  </div>
                </div>

                {/* GPS Coordinates */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#2C2A29]">Current Sector GPS</label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isDetectingGPS}
                      className="text-[11px] text-[#8B7355] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Crosshair className="w-3 h-3" />
                      {isDetectingGPS ? 'Detecting...' : 'Detect Coordinates'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={detectedLoc || ''}
                    onChange={(e) => setDetectedLoc(e.target.value)}
                    placeholder="e.g. 11.6854, 76.1320"
                    className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2 px-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] font-mono focus:outline-none focus:border-[#8B7355] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#2C2A29] hover:bg-[#1A1A1A] text-[#FDFBF7] font-medium text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5 mt-2"
                >
                  {isLoading ? 'Registering...' : 'Register Tactical Account'}
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </button>
              </form>
            </div>
          ) : (
            /* ================= MODE: PRE-PROVISIONED OFFICIAL SIGN IN ================= */
          <div>
            <div className="mb-4 p-3 bg-[#F6F4F0] rounded-xl border border-[#E8E1D5] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1A1A1A] font-bold text-xs sm:text-sm">
                <Shield className="w-4 h-4 text-[#8B7355]" />
                <span>Authorized Command Desk Access</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8E1D5] text-[#4A4238] font-bold uppercase">
                Pre-Provisioned
              </span>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C2A29] mb-1">
                  Official Gov Email / Service ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ndrf.command@mha.gov.in or ndrf_admin"
                    className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C2A29] mb-1">Password / Secure Passcode</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#7A726A]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FDFBF7] border border-[#E8E1D5] rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8C847A] focus:outline-none focus:border-[#8B7355] transition-colors"
                  />
                </div>
              </div>

              {/* 2FA Status */}
              <div className="flex flex-wrap items-center justify-end gap-2 text-xs pt-1">
                {locationStatus?.inRedZone ? (
                  <span className="text-[#B85C38] font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High Priority Bypass
                  </span>
                ) : (
                  <span className="text-[#2D7A4F] font-semibold flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> 2FA Encrypted Authentication Active
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#2C2A29] hover:bg-[#1A1A1A] text-[#FDFBF7] font-medium text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
              >
                {isLoading ? 'Authenticating...' : 'Sign In & Access Platform'}
                <ArrowRight className="w-4 h-4 opacity-80" />
              </button>

              {/* Notice for new or field personnel */}
              <div className="mt-4 pt-3 border-t border-[#E8E1D5] text-center space-y-1.5">
                <p className="text-[11px] text-[#5C544D]">
                  Officer credentials are pre-provisioned by Ministry/SDMA IT Command.
                </p>
                <p className="text-[10px] text-[#7A726A]">
                  For field incident reporting and citizen access, use the <span className="font-semibold text-[#8B7355]">SurakshaDrishti Civilian App</span>.
                </p>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
