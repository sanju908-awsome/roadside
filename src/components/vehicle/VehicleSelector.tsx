import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { Vehicle3DViewer } from './Vehicle3DViewer';
import { VehicleModal } from './VehicleModal';
import { Car, ChevronRight, Edit3, Fuel, Plus, Sparkles, Wrench } from 'lucide-react';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId'>) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSwitchDropdownOpen, setIsSwitchDropdownOpen] = useState(false);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Bar */}
      <div className="p-4 sm:px-5 bg-white text-slate-900 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E23744] animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Selected Vehicle for Dispatch
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="change-vehicle-btn"
            onClick={() => setIsSwitchDropdownOpen(!isSwitchDropdownOpen)}
            className="text-xs font-black text-[#E23744] hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>SWITCH VEHICLE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Switch Dropdown Menu */}
      {isSwitchDropdownOpen && (
        <div className="bg-slate-50 border-b border-slate-200 p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Your Registered Vehicles ({vehicles.length})
            </span>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="text-xs font-black text-[#E23744] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> ADD NEW VEHICLE
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {vehicles.map((v) => {
              const isCurrent = v.id === selectedVehicle?.id;
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    onSelectVehicle(v);
                    setIsSwitchDropdownOpen(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-white border-[#E23744] ring-2 ring-[#E23744]/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"
                      style={{ backgroundColor: v.color }}
                    />
                    <div>
                      <div className="font-black text-slate-900 text-xs">
                        {v.brand} {v.model}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {v.registrationNumber} • {v.type}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-black text-[#E23744] bg-red-50 px-2 py-0.5 rounded-md">
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3D Realistic Vehicle Interactive Stage */}
      <div className="p-3 sm:p-4">
        <Vehicle3DViewer
          vehicle={selectedVehicle}
          interactive={true}
          height={320}
          showControls={true}
        />
      </div>

      {/* Vehicle Spec Badges & Edit Button */}
      {selectedVehicle && (
        <div className="p-4 sm:px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-black text-slate-900 text-sm font-heading">
              {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
            </span>
            <span className="bg-white border border-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-lg text-[11px]">
              {selectedVehicle.registrationNumber}
            </span>
            <span className="bg-red-50 text-[#E23744] font-bold px-2 py-0.5 rounded-lg text-[11px]">
              {selectedVehicle.fuelType}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenEdit(selectedVehicle)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white transition-colors"
            title="Edit vehicle details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        initialVehicle={editingVehicle}
        onClose={() => setIsModalOpen(false)}
        onSave={(veh) => {
          if (editingVehicle) {
            onUpdateVehicle({ ...editingVehicle, ...veh });
          } else {
            onAddVehicle(veh);
          }
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
