import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Bell,
  Car,
  ChevronDown,
  Clock,
  HelpCircle,
  History,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenEmergency: () => void;
  onOpenChat: () => void;
  onOpenNotifications: () => void;
  onSwitchView: (view: 'dashboard' | 'history' | 'vehicles') => void;
  activeView: string;
  onOpenCustomerLogin: () => void;
  onOpenMechanicLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenEmergency,
  onOpenChat,
  onOpenNotifications,
  onSwitchView,
  activeView,
  onOpenCustomerLogin,
  onOpenMechanicLogin,
}) => {
  const {
    currentRole,
    currentUser,
    switchRole,
    logout,
    notifications,
    activeRequest,
    customerLocation,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-900 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo & Location (Zomato Style) */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              onClick={() => onSwitchView('dashboard')}
              className="cursor-pointer flex items-center gap-2 group select-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E23744] flex items-center justify-center text-white font-black shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-heading">
                    ROAD
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#E23744] mx-0.5">//</span>
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#E23744] font-heading">
                    SIDE
                  </span>
                </div>
                <span className="hidden sm:block text-[9px] font-extrabold tracking-widest text-slate-400 uppercase -mt-1">
                  15-MIN ON-DEMAND ROADSIDE RESCUE
                </span>
              </div>
            </div>

            {/* Zomato-style Location Indicator with GPS badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-[#E23744]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  Your Breakdown Location
                </span>
                <span className="font-extrabold text-slate-800 truncate max-w-[170px] mt-0.5">
                  {customerLocation.address || 'Benz Circle, Vijayawada'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSwitchView('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeView === 'dashboard'
                  ? 'bg-red-50 text-[#E23744]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Assistance Radar</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchView('history')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeView === 'history'
                  ? 'bg-red-50 text-[#E23744]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Bookings & Invoices</span>
            </button>
          </nav>

          {/* Right Action Icons & Auth Portal Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SOS Immediate Emergency Button (Zomato Express Style) */}
            <button
              type="button"
              id="global-emergency-sos-btn"
              onClick={onOpenEmergency}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#E23744] hover:bg-[#D32332] active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-red-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">15-MIN SOS</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E23744] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Chat button */}
            <button
              type="button"
              onClick={onOpenChat}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:block"
              title="Live Technician Chat"
            >
              <MessageSquare className="w-5 h-5" />
              {activeRequest && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>

            {/* Separate Portals Switcher / Profile Badge */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all text-left"
                >
                  <img
                    src={
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
                    }
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden sm:block pr-1">
                    <span className="text-xs font-black text-slate-900 block leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">
                      {currentRole === 'CUSTOMER' ? 'Motorist' : 'Workshop Pro'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scaleUp text-xs font-semibold text-slate-700">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-extrabold text-slate-900 text-sm">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          switchRole(currentRole === 'CUSTOMER' ? 'MECHANIC' : 'CUSTOMER');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800 font-bold"
                      >
                        <Wrench className="w-4 h-4 text-amber-500" />
                        <span>Switch to {currentRole === 'CUSTOMER' ? 'Workshop Portal' : 'Customer View'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSwitchView('history');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                      >
                        <History className="w-4 h-4 text-slate-400" />
                        <span>My Request History</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                          onOpenCustomerLogin();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Customer Login Button */}
                <button
                  type="button"
                  onClick={onOpenCustomerLogin}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-800 transition-all"
                >
                  Log In
                </button>

                {/* Mechanic Owner Portal Button */}
                <button
                  type="button"
                  onClick={onOpenMechanicLogin}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Wrench className="w-3 h-3 text-amber-400" />
                  <span>Partner Portal</span>
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-2 text-sm font-bold animate-fadeIn">
            <button
              type="button"
              onClick={() => {
                onSwitchView('dashboard');
                setIsMobileNavOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-50 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-[#E23744]" />
              <span>Assistance Radar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSwitchView('history');
                setIsMobileNavOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-50 flex items-center gap-2"
            >
              <History className="w-4 h-4 text-[#E23744]" />
              <span>Bookings & Invoices</span>
            </button>
            <div className="pt-2 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onOpenCustomerLogin();
                }}
                className="flex-1 py-2 rounded-xl bg-red-50 text-[#E23744] text-center"
              >
                Customer Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onOpenMechanicLogin();
                }}
                className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-center"
              >
                Workshop Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
