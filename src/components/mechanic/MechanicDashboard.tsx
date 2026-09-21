import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncomingRequestCard } from './IncomingRequestCard';
import { ActiveJobView } from './ActiveJobView';
import { ShopProfileView } from './ShopProfileView';
import { JobHistoryView } from './JobHistoryView';
import {
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  History,
  LayoutDashboard,
  Navigation,
  Power,
  ShieldCheck,
  Store,
  TrendingUp,
  User,
  Wrench,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

type MechanicTab = 'dashboard' | 'active_job' | 'profile' | 'history';

export const MechanicDashboard: React.FC = () => {
  const {
    currentUser,
    mechanics,
    activeRequest,
    mechanicLiveLocation,
    mechanicStats,
    toggleMechanicAvailability,
    updateShopProfile,
    acceptRequest,
    rejectRequest,
    startTrip,
    markArrived,
    startService,
    completeService,
    addNotification,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<MechanicTab>('dashboard');
  const shop = mechanics.find((m) => m.id === 'mech_001') || mechanics[0];

  const hasIncomingPending = activeRequest && activeRequest.status === 'PENDING';
  const hasActiveMission =
    activeRequest && activeRequest.status !== 'PENDING' && activeRequest.status !== 'CANCELLED';

  const handleCallCustomer = () => {
    addNotification('Dialing Customer', `Calling ${activeRequest?.customerName} at ${activeRequest?.customerPhone}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar & Availability Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#00C2FF] uppercase block">
            Lead Technician Console
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 mt-0.5">
            Good evening, {currentUser?.name?.split(' ')[0] || 'Ravi'}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Store className="w-3.5 h-3.5 text-[#0B1F4B]" />
            <span>{shop.shopName}</span>
            <span>•</span>
            <span className="text-slate-500">{shop.address}</span>
          </p>
        </div>

        {/* Availability Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="mechanic-availability-toggle"
            onClick={toggleMechanicAvailability}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 ${
              shop.isAvailable
                ? 'bg-[#19C37D]/10 text-[#19C37D] border-2 border-[#19C37D] hover:bg-[#19C37D]/20'
                : 'bg-slate-100 text-slate-500 border-2 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                shop.isAvailable ? 'bg-[#19C37D] animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{shop.isAvailable ? 'AVAILABLE FOR JOBS' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setCurrentTab('dashboard')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            currentTab === 'dashboard'
              ? 'bg-[#0B1F4B] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('active_job')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap relative ${
            currentTab === 'active_job'
              ? 'bg-[#0B1F4B] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4 text-[#00C2FF]" />
          <span>Active Mission</span>
          {hasActiveMission && (
            <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('profile')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            currentTab === 'profile'
              ? 'bg-[#0B1F4B] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Shop & Services</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('history')}
          className={`py-2 px-3.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            currentTab === 'history'
              ? 'bg-[#0B1F4B] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Earnings & History</span>
        </button>
      </div>

      {/* Tab 1: Dashboard Overview */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Today's Jobs
              </span>
              <span className="text-2xl font-bold font-heading text-[#0B1F4B] mt-1 block">
                {mechanicStats.todayJobs}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Active dispatch queue</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Completed
              </span>
              <span className="text-2xl font-bold font-heading text-[#19C37D] mt-1 block">
                {mechanicStats.completedJobs}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">100% resolved</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Now
              </span>
              <span className="text-2xl font-bold font-heading text-[#00C2FF] mt-1 block">
                {hasActiveMission ? 1 : 0}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">En route / on site</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Today's Earnings
              </span>
              <span className="text-2xl font-bold font-heading text-[#0B1F4B] font-mono mt-1 block">
                {formatINR(mechanicStats.totalEarnings)}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Instant bank settlement</span>
            </div>
          </div>

          {/* Incoming Pending Request Section */}
          {hasIncomingPending && activeRequest && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Incoming Assistance Request Awaiting Acceptance
                </h3>
              </div>
              <IncomingRequestCard
                request={activeRequest}
                onAccept={() => {
                  acceptRequest(activeRequest.id);
                  setCurrentTab('active_job');
                }}
                onDecline={() => rejectRequest(activeRequest.id)}
              />
            </div>
          )}

          {/* Active Mission Quick Banner if in progress */}
          {hasActiveMission && activeRequest && (
            <div className="bg-gradient-to-r from-[#0B1F4B] to-[#163D7A] rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C2FF] block">
                  Active Mission in Progress
                </span>
                <h4 className="text-lg font-bold font-heading">
                  {activeRequest.customerName} • {activeRequest.vehicle.brand}{' '}
                  {activeRequest.vehicle.model} ({activeRequest.problem})
                </h4>
                <p className="text-xs text-slate-300">
                  Current Status: <span className="font-bold text-[#00C2FF]">{activeRequest.status}</span> •{' '}
                  {activeRequest.customerLocation.address}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentTab('active_job')}
                className="px-5 py-2.5 bg-[#00C2FF] hover:bg-cyan-300 text-[#0B1F4B] font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Navigation className="w-4 h-4" />
                <span>OPEN ACTIVE MISSION</span>
              </button>
            </div>
          )}

          {/* Recent Jobs Ledger Preview */}
          <JobHistoryView stats={mechanicStats} history={[]} />
        </div>
      )}

      {/* Tab 2: Active Job Mission */}
      {currentTab === 'active_job' && (
        <div>
          {hasActiveMission && activeRequest ? (
            <ActiveJobView
              request={activeRequest}
              mechanicLiveCoords={mechanicLiveLocation}
              onStartTrip={() => startTrip(activeRequest.id)}
              onMarkArrived={() => markArrived(activeRequest.id)}
              onStartService={() => startService(activeRequest.id)}
              onCompleteService={(price, notes) => {
                completeService(activeRequest.id, price, notes);
                setCurrentTab('dashboard');
              }}
              onOpenChat={() => {}}
              onCall={handleCallCustomer}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Navigation className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No Active Mission</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You do not have any accepted assistance requests right now. Keep your shop status as{' '}
                <strong className="text-emerald-600">AVAILABLE</strong> to receive incoming emergency dispatches.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Shop Profile */}
      {currentTab === 'profile' && (
        <ShopProfileView shop={shop} onUpdateShop={updateShopProfile} />
      )}

      {/* Tab 4: History */}
      {currentTab === 'history' && (
        <JobHistoryView stats={mechanicStats} history={[]} />
      )}
    </div>
  );
};
