import React, { useState } from 'react';
import { FuelType, Vehicle, VehicleType } from '../../types';
import { Vehicle3DViewer } from './Vehicle3DViewer';
import { Car, Check, Plus, Trash2, X } from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Omit<Vehicle, 'id' | 'userId'>) => void;
  onDelete?: (id: string) => void;
  initialVehicle?: Vehicle | null;
}

const VEHICLE_TYPES: VehicleType[] = ['Car', 'Bike', 'SUV', 'Truck', 'Van'];
const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
const PRESET_COLORS = [
  { name: 'Polar White', hex: '#E2E8F0' },
  { name: 'Stealth Black', hex: '#1E293B' },
  { name: 'Daytona Blue', hex: '#0284C7' },
  { name: 'Titanium Grey', hex: '#64748B' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Deep Navy', hex: '#0B1F4B' },
];

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialVehicle,
}) => {
  const [type, setType] = useState<VehicleType>(initialVehicle?.type || 'Car');
  const [brand, setBrand] = useState(initialVehicle?.brand || '');
  const [model, setModel] = useState(initialVehicle?.model || '');
  const [year, setYear] = useState<number>(initialVehicle?.year || 2023);
  const [fuelType, setFuelType] = useState<FuelType>(initialVehicle?.fuelType || 'Petrol');
  const [registrationNumber, setRegistrationNumber] = useState(
    initialVehicle?.registrationNumber || ''
  );
  const [color, setColor] = useState(initialVehicle?.color || '#0B1F4B');
  const [isDefault, setIsDefault] = useState(initialVehicle?.isDefault || false);

  if (!isOpen) return null;

  // Temporary vehicle object for 3D visual preview
  const previewVehicle: Vehicle = {
    id: initialVehicle?.id || 'temp',
    userId: 'cust_001',
    type,
    brand: brand || 'Vehicle',
    model: model || 'Model',
    year,
    fuelType,
    registrationNumber: registrationNumber || 'AP 16 XX 0000',
    color,
    isDefault,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) return;

    onSave({
      type,
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year) || 2023,
      fuelType,
      registrationNumber: registrationNumber.trim().toUpperCase() || 'AP 16 XX 0000',
      color,
      isDefault,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        id="vehicle-form-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#0B1F4B] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#00C2FF]" />
            <h3 className="text-lg font-bold font-heading">
              {initialVehicle ? 'Edit Vehicle Details' : 'Add Vehicle to Garage'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* 3D Vehicle Live Preview Canvas */}
          <div className="bg-gradient-to-b from-slate-900 to-[#0B1F4B] rounded-xl p-2 border border-slate-700 shadow-inner">
            <Vehicle3DViewer
              vehicle={previewVehicle}
              height={220}
              showControls={false}
              autoRotateSpeed={0.015}
            />
            <div className="text-center pb-1">
              <span className="text-[11px] text-slate-300 font-mono">
                {type.toUpperCase()} • {brand || 'Brand'} {model || 'Model'} ({year}) • {fuelType}
              </span>
            </div>
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Vehicle Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {VEHICLE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                    type === t
                      ? 'bg-[#0B1F4B] text-white border-[#00C2FF] ring-2 ring-[#00C2FF]/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Hyundai, Tata, Honda"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Model Name
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Creta SX(O), Nexon, Thar"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
              />
            </div>
          </div>

          {/* Year, Fuel Type, Registration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Model Year
              </label>
              <input
                type="number"
                min={1990}
                max={2026}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder="AP 16 AB 1234"
                className="w-full text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Vehicle Color (3D Finish)
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    color === c.hex ? 'ring-2 ring-[#00C2FF] scale-110' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.hex && (
                    <Check
                      className={`w-4 h-4 ${
                        c.hex === '#E2E8F0' ? 'text-slate-900' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Default Vehicle checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="set-as-default-checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-[#0B1F4B] focus:ring-[#00C2FF]"
            />
            <label htmlFor="set-as-default-checkbox" className="text-xs text-slate-700 font-medium">
              Set as primary / default vehicle for roadside assistance
            </label>
          </div>

          {/* Action Footer inside Form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {initialVehicle && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialVehicle.id);
                  onClose();
                }}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE VEHICLE</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                CANCEL
              </button>
              <button
                type="submit"
                id="save-vehicle-submit-btn"
                className="px-6 py-2 rounded-xl bg-[#0B1F4B] hover:bg-[#163D7A] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#00C2FF]" />
                <span>SAVE VEHICLE</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
