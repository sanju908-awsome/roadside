import React from 'react';
import { MechanicShop } from '../../types';
import { Clock, MapPin, ShieldCheck, Sparkles, Star, Truck, Wrench, Zap } from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface MechanicCardProps {
  mechanic: MechanicShop;
  distanceKm: number;
  etaMinutes: number;
  isSelected: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
  onRequest: () => void;
}

export const MechanicCard: React.FC<MechanicCardProps> = ({
  mechanic,
  distanceKm,
  etaMinutes,
  isSelected,
  onSelect,
  onViewProfile,
  onRequest,
}) => {
  return (
    <div
      id={`mechanic-card-${mechanic.id}`}
      onClick={onSelect}
      className={`group relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-[#E23744] shadow-xl ring-2 ring-[#E23744]/20 scale-[1.01]'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      {/* Top Photography with Zomato Badges */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={mechanic.imageUrl}
          alt={mechanic.shopName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {mechanic.isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#24963F] text-white shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>ONLINE NOW</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 text-slate-300 backdrop-blur-md">
              BUSY / OFFLINE
            </span>
          )}

          {mechanic.skills.some((s) => s.toLowerCase().includes('towing')) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30">
              <Truck className="w-3.5 h-3.5" />
              <span>Towing Crane</span>
            </span>
          )}
        </div>

        {/* 15-Min Speed Rescue Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-[#E23744] text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{etaMinutes} Mins ETA</span>
          </span>
        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <span className="text-[11px] font-extrabold text-red-300 uppercase tracking-wider block">
              {mechanic.yearsOfExperience} Years Garage Experience
            </span>
            <h4 className="font-black text-lg sm:text-xl text-white leading-tight flex items-center gap-1.5 font-heading">
              <span>{mechanic.shopName}</span>
              {mechanic.isVerified && (
                <ShieldCheck className="w-5 h-5 text-[#24963F] fill-white flex-shrink-0" />
              )}
            </h4>
          </div>

          {/* Zomato Green Rating Badge */}
          <div className="bg-[#24963F] text-white px-2.5 py-1 rounded-xl font-black text-sm flex items-center gap-1 shadow-md">
            <span>{mechanic.rating.toFixed(1)}</span>
            <Star className="w-3.5 h-3.5 fill-white text-white" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 space-y-3.5 text-left">
        {/* Location & Pricing Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1 truncate max-w-[200px]">
            <MapPin className="w-3.5 h-3.5 text-[#E23744] flex-shrink-0" />
            <span className="truncate">{mechanic.address}</span>
          </div>
          <span className="font-bold text-slate-800 font-mono text-xs">
            {distanceKm.toFixed(1)} km away
          </span>
        </div>

        {/* Specialization Tags (Zomato Cuisine style tags) */}
        <div className="flex flex-wrap gap-1.5">
          {mechanic.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Estimated Service Cost
            </span>
            <span className="text-base font-black text-slate-900 font-mono">
              {formatINR(mechanic.pricingRange.min)} - {formatINR(mechanic.pricingRange.max)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile();
              }}
              className="px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Profile
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequest();
              }}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#E23744] hover:bg-[#D32332] active:scale-95 transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>REQUEST NOW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
