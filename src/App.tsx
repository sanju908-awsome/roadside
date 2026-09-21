/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { RequestHistoryView } from './components/customer/RequestHistoryView';
import { MechanicDashboard } from './components/mechanic/MechanicDashboard';
import { CustomerLoginPage } from './components/auth/CustomerLoginPage';
import { MechanicLoginPage } from './components/auth/MechanicLoginPage';
import { EmergencyModal } from './components/common/EmergencyModal';
import { ChatDrawer } from './components/common/ChatDrawer';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import {
  Compass,
  History,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentRole,
    switchRole,
    currentUser,
    activeRequest,
    historyRequests,
    createRequest,
  } = useApp();

  const [customerView, setCustomerView] = useState<'dashboard' | 'history'>('dashboard');
  const [authView, setAuthView] = useState<'none' | 'customer_login' | 'mechanic_login'>('none');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // If user navigated to Customer Login Page
  if (authView === 'customer_login') {
    return (
      <CustomerLoginPage
        onSuccess={() => {
          switchRole('CUSTOMER');
          setAuthView('none');
        }}
        onSwitchToMechanicLogin={() => setAuthView('mechanic_login')}
        onExploreAsGuest={() => setAuthView('none')}
      />
    );
  }

  // If user navigated to Mechanic Owner Login Page
  if (authView === 'mechanic_login') {
    return (
      <MechanicLoginPage
        onSuccess={() => {
          switchRole('MECHANIC');
          setAuthView('none');
        }}
        onSwitchToCustomerLogin={() => setAuthView('customer_login')}
        onExploreAsGuest={() => setAuthView('none')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans selection:bg-[#E23744]/20 selection:text-[#E23744]">
      {/* Global Zomato-Style Header */}
      <Navbar
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onSwitchView={(v) => {
          if (v === 'history') setCustomerView('history');
          else setCustomerView('dashboard');
        }}
        activeView={customerView}
        onOpenCustomerLogin={() => setAuthView('customer_login')}
        onOpenMechanicLogin={() => setAuthView('mechanic_login')}
      />

      {/* Role Navigation Strip */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Subnav links */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {currentRole === 'CUSTOMER' ? (
              <>
                <button
                  type="button"
                  id="customer-subnav-dashboard-btn"
                  onClick={() => setCustomerView('dashboard')}
                  className={`py-2 px-4 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    customerView === 'dashboard'
                      ? 'bg-[#E23744] text-white shadow-md shadow-red-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Assistance Radar & 3D Garage</span>
                </button>

                <button
                  type="button"
                  id="customer-subnav-history-btn"
                  onClick={() => setCustomerView('history')}
                  className={`py-2 px-4 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    customerView === 'history'
                      ? 'bg-[#E23744] text-white shadow-md shadow-red-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>My Bookings & Invoices ({historyRequests.length + (activeRequest ? 1 : 0)})</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2 font-heading">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Workshop Partner Dispatch Console
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  Receiving Live SOS
                </span>
              </div>
            )}
          </div>

          {/* User Mode & Switch Portals */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {currentRole === 'CUSTOMER' ? 'Vehicle Owner Portal' : 'Certified Workshop Portal'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (currentRole === 'CUSTOMER') {
                  setAuthView('mechanic_login');
                } else {
                  setAuthView('customer_login');
                }
              }}
              className="font-extrabold text-[#E23744] hover:underline cursor-pointer"
            >
              {currentRole === 'CUSTOMER' ? 'Switch to Workshop Portal →' : 'Switch to Vehicle Owner Portal →'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'CUSTOMER' ? (
          customerView === 'dashboard' ? (
            <CustomerDashboard
              onOpenChat={() => setIsChatOpen(true)}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
            />
          ) : (
            <RequestHistoryView
              requests={historyRequests}
              activeRequest={activeRequest}
              onViewActive={() => setCustomerView('dashboard')}
            />
          )
        ) : (
          <MechanicDashboard />
        )}
      </main>

      {/* Emergency Assistance Radar SOS Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onConfirmSOS={(mechId) => {
          createRequest(mechId, 'BATTERY', 'EMERGENCY SOS: Immediate roadside triage requested.');
        }}
      />

      {/* Real-time In-App Chat Drawer */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Real-time Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
