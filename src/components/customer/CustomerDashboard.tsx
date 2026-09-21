import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MechanicShop, ProblemType } from '../../types';
import { VehicleSelector } from '../vehicle/VehicleSelector';
import { ProblemSelector } from './ProblemSelector';
import { MechanicCard } from './MechanicCard';
import { MechanicProfileModal } from './MechanicProfileModal';
import { BookingModal } from './BookingModal';
import { LiveTrackingView } from './LiveTrackingView';
import { ServiceSummaryModal } from './ServiceSummaryModal';
import { RatingModal } from './RatingModal';
import { InteractiveMapView } from '../map/InteractiveMapView';
import {
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react';
import { calculateDistanceKm, calculateETA } from '../../utils/geo';

interface CustomerDashboardProps {
  onOpenChat: () => void;
  onOpenEmergency: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenChat,
  onOpenEmergency,
}) => {
  const {
    currentUser,
    customerLocation,
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    selectedProblem,
    setSelectedProblem,
    problemDescription,
    mechanics,
    activeRequest,
    mechanicLiveLocation,
    createRequest,
    cancelRequest,
    submitRating,
    markArrived,
    startService,
    completeService,
    addNotification,
  } = useApp();

  // Local UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);
  const [minRating, setMinRating] = useState<number>(4.0);
  const [selectedMechanicForProfile, setSelectedMechanicForProfile] = useState<MechanicShop | null>(null);
  const [selectedMechanicForBooking, setSelectedMechanicForBooking] = useState<MechanicShop | null>(null);
  const [selectedMechanicId, setSelectedMechanicId] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [mobileViewTab, setMobileViewTab] = useState<'list' | 'map'>('list');

  // Check if there is an active mission in progress
  const hasActiveMission =
    activeRequest && activeRequest.status !== 'COMPLETED' && activeRequest.status !== 'CANCELLED';

  // If request just completed and not yet rated, trigger summary modal
  React.useEffect(() => {
    if (activeRequest && activeRequest.status === 'COMPLETED' && !activeRequest.rating) {
      setShowSummaryModal(true);
    }
  }, [activeRequest]);

  // Filtering mechanics based on search query, problem category, distance, rating
  const filteredMechanics = mechanics.filter((mech) => {
    // 1. Search text filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = mech.shopName.toLowerCase().includes(q);
      const matchOwner = mech.ownerName.toLowerCase().includes(q);
      const matchAddress = mech.address.toLowerCase().includes(q);
      const matchSkill = mech.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchOwner && !matchAddress && !matchSkill) return false;
    }

    // 2. Problem capability filter
    if (selectedProblem) {
      const matchProblem = mech.supportedProblems.includes(selectedProblem);
      const matchSkill = mech.skills.some((s) =>
        s.toLowerCase().includes(selectedProblem.toLowerCase())
      );
      if (!matchProblem && !matchSkill) return false;
    }

    // 3. Distance filter
    const dist = calculateDistanceKm(customerLocation.coords, mech.coords);
    if (dist > maxDistanceKm) return false;

    // 4. Rating filter
    if (mech.rating < minRating) return false;

    return true;
  });

  const handleBookingConfirm = () => {
    if (!selectedMechanicForBooking) return;

    try {
      createRequest(
        selectedMechanicForBooking.id,
        selectedProblem || 'ENGINE',
        problemDescription
      );
      setSelectedMechanicForBooking(null);
      addNotification('Request Sent!', `Dispatched request to ${selectedMechanicForBooking.shopName}`, 'success');
    } catch (err: any) {
      addNotification('Booking Error', err.message || 'Failed to dispatch request', 'alert');
    }
  };

  const handleRatingSubmit = (stars: number, feedback: string) => {
    if (activeRequest) {
      submitRating(activeRequest.id, stars, feedback);
      setShowRatingModal(false);
      addNotification('Review Posted!', `Thank you for rating ${activeRequest.mechanicShopName}`, 'success');
    }
  };

  // If there's an active mission, render the live dispatch & Google Maps tracking screen
  if (hasActiveMission && activeRequest) {
    return (
      <div className="space-y-6">
        <LiveTrackingView
          request={activeRequest}
          mechanicLiveCoords={mechanicLiveLocation}
          onBack={() => {}}
          onCancel={() => cancelRequest(activeRequest.id)}
          onOpenChat={onOpenChat}
          onCall={() => {
            addNotification('Calling Technician', `Dialing ${activeRequest.mechanicOwnerName}...`, 'info');
          }}
          onAdvanceToArrived={() => markArrived(activeRequest.id)}
          onAdvanceToStartService={() => startService(activeRequest.id)}
          onAdvanceToCompleteService={() =>
            completeService(activeRequest.id, 450, 'Roadside diagnostics & battery jump start completed.')
          }
        />

        <ServiceSummaryModal
          isOpen={showSummaryModal}
          request={activeRequest}
          onProceedToRating={() => {
            setShowSummaryModal(false);
            setShowRatingModal(true);
          }}
        />

        <RatingModal
          isOpen={showRatingModal}
          request={activeRequest}
          onSubmit={handleRatingSubmit}
          onSkip={() => setShowRatingModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zomato-Style Hero Search & Location Headline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#E23744] text-xs font-black tracking-wide uppercase mb-2">
              <Zap className="w-3.5 h-3.5 fill-[#E23744]" />
              <span>Instant Roadside Rescue • Average 15 Min Arrival</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading leading-tight">
              Top Mechanics in <span className="text-[#E23744]">Vijayawada</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
              Select your vehicle problem below. Verified workshops nearby are ready to dispatch mechanics with live tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenEmergency}
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-[#E23744] hover:bg-[#D32332] active:scale-95 text-white font-black text-sm shadow-lg shadow-red-500/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>INSTANT 15-MIN SOS</span>
          </button>
        </div>

        {/* Zomato Search & Quick Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garage name, technician, puncture, battery, towing..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:border-[#E23744] transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <div className="flex items-center gap-2 h-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
              <MapPin className="w-4 h-4 text-[#E23744] flex-shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                  Radar Radius
                </span>
                <select
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer mt-0.5"
                >
                  <option value={3}>Within 3 km (Fastest)</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km (Standard)</option>
                  <option value={20}>Within 20 km (Wide)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sm:col-span-3">
            <div className="flex items-center gap-2 h-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                  Rating Filter
                </span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer mt-0.5"
                >
                  <option value={3.5}>★ 3.5+ & Above</option>
                  <option value={4.0}>★ 4.0+ Highly Rated</option>
                  <option value={4.5}>★ 4.5+ Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle: List vs Map */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setMobileViewTab('list')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mobileViewTab === 'list'
              ? 'bg-[#E23744] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Workshops ({filteredMechanics.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileViewTab('map')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mobileViewTab === 'map'
              ? 'bg-[#E23744] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Google Map</span>
        </button>
      </div>

      {/* Main Split Layout: 45% Left Panel + 55% Right Google Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Vehicle 3D Garage, Problem Selector, Workshops */}
        <div
          className={`lg:col-span-5 space-y-6 ${
            mobileViewTab === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* 1. Realistic 3D Vehicle Showcase & Garage */}
          <VehicleSelector
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            onAddVehicle={addVehicle}
            onUpdateVehicle={updateVehicle}
            onDeleteVehicle={deleteVehicle}
          />

          {/* 2. Problem Selector Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#E23744] uppercase tracking-wider block">
                  Select Issue
                </span>
                <h3 className="text-base font-black font-heading text-slate-900">
                  What happened to your vehicle?
                </h3>
              </div>
              <span className="text-xs font-black text-[#E23744] bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                {selectedProblem || 'Any Issue'}
              </span>
            </div>

            <ProblemSelector
              selectedProblem={selectedProblem}
              onSelectProblem={setSelectedProblem}
              problemDescription={problemDescription}
              onChangeDescription={(desc) => setSelectedProblem(selectedProblem, desc)}
            />
          </div>

          {/* 3. Nearby Mechanics Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base font-heading">
                Available Workshops Nearby
              </h3>
              <span className="text-xs font-black bg-[#E23744] text-white px-2.5 py-0.5 rounded-full font-mono shadow-xs">
                {filteredMechanics.length}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-bold">Sorted by nearest ETA</span>
          </div>

          {/* 4. Mechanics Cards List */}
          <div className="space-y-4">
            {filteredMechanics.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-black text-slate-800 text-sm">No workshops match this filter</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try expanding the search radius or resetting the problem category.
                </p>
              </div>
            ) : (
              filteredMechanics.map((mech) => {
                const dist = calculateDistanceKm(customerLocation.coords, mech.coords);
                const eta = calculateETA(dist);
                const isSelected = selectedMechanicId === mech.id;

                return (
                  <MechanicCard
                    key={mech.id}
                    mechanic={mech}
                    distanceKm={dist}
                    etaMinutes={eta}
                    isSelected={isSelected}
                    onSelect={() => setSelectedMechanicId(mech.id)}
                    onViewProfile={() => setSelectedMechanicForProfile(mech)}
                    onRequest={() => setSelectedMechanicForBooking(mech)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Right 7 Cols: Full Real Google Map View */}
        <div
          className={`lg:col-span-7 sticky top-24 ${
            mobileViewTab === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
            <InteractiveMapView
              customerCoords={customerLocation.coords}
              mechanics={filteredMechanics}
              selectedMechanicId={
                selectedMechanicId ||
                selectedMechanicForProfile?.id ||
                selectedMechanicForBooking?.id
              }
              onSelectMechanic={(id) => {
                setSelectedMechanicId(id);
                const found = mechanics.find((m) => m.id === id);
                if (found) setSelectedMechanicForProfile(found);
              }}
              height="calc(100vh - 9rem)"
              showSearchAreaBadge={true}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMechanicForProfile && (
        <MechanicProfileModal
          isOpen={true}
          mechanic={selectedMechanicForProfile}
          distanceKm={calculateDistanceKm(customerLocation.coords, selectedMechanicForProfile.coords)}
          onClose={() => setSelectedMechanicForProfile(null)}
          onRequest={() => {
            const m = selectedMechanicForProfile;
            setSelectedMechanicForProfile(null);
            setSelectedMechanicForBooking(m);
          }}
          onCall={() => addNotification('Calling Workshop', `Dialing ${selectedMechanicForProfile.phone}...`, 'info')}
          onMessage={onOpenChat}
        />
      )}

      {selectedMechanicForBooking && (
        <BookingModal
          isOpen={true}
          mechanic={selectedMechanicForBooking}
          customerName={currentUser?.name || 'Sanju Kumar'}
          vehicle={selectedVehicle}
          problem={selectedProblem || 'ENGINE'}
          problemDescription={problemDescription}
          location={customerLocation}
          distanceKm={calculateDistanceKm(customerLocation.coords, selectedMechanicForBooking.coords)}
          etaMinutes={calculateETA(calculateDistanceKm(customerLocation.coords, selectedMechanicForBooking.coords))}
          onClose={() => setSelectedMechanicForBooking(null)}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
};
