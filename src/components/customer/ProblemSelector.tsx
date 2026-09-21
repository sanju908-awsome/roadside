import React from 'react';
import { ProblemType } from '../../types';
import { PROBLEM_CATEGORIES, ProblemCategoryInfo } from '../../data/mockData';
import {
  AlertCircle,
  BatteryCharging,
  Disc,
  Fuel,
  OctagonAlert,
  ShieldAlert,
  Thermometer,
  Wrench,
  Zap,
} from 'lucide-react';

interface ProblemSelectorProps {
  selectedProblem: ProblemType | null;
  onSelectProblem: (problem: ProblemType) => void;
  problemDescription: string;
  onChangeDescription: (desc: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BatteryCharging,
  AlertCircle,
  Disc,
  Fuel,
  Thermometer,
  OctagonAlert,
  Zap,
  ShieldAlert,
  Wrench,
};

export const ProblemSelector: React.FC<ProblemSelectorProps> = ({
  selectedProblem,
  onSelectProblem,
  problemDescription,
  onChangeDescription,
}) => {
  const currentCategory = PROBLEM_CATEGORIES.find((p) => p.id === selectedProblem);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500">
          Select Vehicle Breakdown Issue
        </label>
        {selectedProblem && (
          <span className="text-xs font-black text-[#E23744] bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
            {selectedProblem}
          </span>
        )}
      </div>

      {/* Problem Grid with Zomato Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {PROBLEM_CATEGORIES.map((cat: ProblemCategoryInfo) => {
          const IconComponent = ICON_MAP[cat.iconName] || Wrench;
          const isSelected = selectedProblem === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              id={`problem-cat-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectProblem(cat.id)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start justify-between min-h-[105px] group relative cursor-pointer ${
                isSelected
                  ? 'bg-red-50/90 border-[#E23744] text-[#E23744] shadow-md ring-2 ring-[#E23744]/20 scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-red-200 hover:bg-slate-50/80 hover:shadow-xs'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-[#E23744] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 group-hover:bg-red-50 group-hover:text-[#E23744]'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="w-full mt-2">
                <span
                  className={`block text-xs font-black tracking-tight line-clamp-1 ${
                    isSelected ? 'text-[#E23744]' : 'text-slate-900'
                  }`}
                >
                  {cat.label}
                </span>
                <span className="block text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                  Est. ₹{cat.suggestedMinPrice} - ₹{cat.suggestedMaxPrice}
                </span>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E23744]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Description Field */}
      <div className="pt-1">
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Additional breakdown details (Optional)
        </label>
        <input
          type="text"
          value={problemDescription}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="e.g. Car won't crank, heard clicking noise, stranded in rain..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:border-[#E23744] transition-all"
        />
      </div>
    </div>
  );
};
