import React, { useState } from 'react';
import { MechanicShop, MechanicServiceItem, VehicleType } from '../../types';
import {
  Camera,
  CheckCircle2,
  FileCheck,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  Wrench,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface ShopProfileViewProps {
  shop: MechanicShop;
  onUpdateShop: (updated: Partial<MechanicShop>) => void;
}

const ALL_VEHICLE_TYPES: VehicleType[] = ['Car', 'Bike', 'SUV', 'Truck', 'Van'];

export const ShopProfileView: React.FC<ShopProfileViewProps> = ({ shop, onUpdateShop }) => {
  const [shopName, setShopName] = useState(shop.shopName);
  const [ownerName, setOwnerName] = useState(shop.ownerName);
  const [phone, setPhone] = useState(shop.phone);
  const [email, setEmail] = useState(shop.email);
  const [address, setAddress] = useState(shop.address);
  const [description, setDescription] = useState(shop.description);
  const [services, setServices] = useState<MechanicServiceItem[]>(shop.services);
  const [skills, setSkills] = useState<string[]>(shop.skills);
  const [supportedVehicles, setSupportedVehicles] = useState<VehicleType[]>(shop.supportedVehicles);
  const [newSkillInput, setNewSkillInput] = useState('');

  // New Service Input state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(350);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const handleSave = () => {
    onUpdateShop({
      shopName,
      ownerName,
      phone,
      email,
      address,
      description,
      services,
      skills,
      supportedVehicles,
    });
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim() || skills.includes(newSkillInput.trim())) return;
    setSkills([...skills, newSkillInput.trim()]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const toggleVehicle = (vType: VehicleType) => {
    if (supportedVehicles.includes(vType)) {
      if (supportedVehicles.length > 1) {
        setSupportedVehicles(supportedVehicles.filter((v) => v !== vType));
      }
    } else {
      setSupportedVehicles([...supportedVehicles, vType]);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const item: MechanicServiceItem = {
      id: 'srv_' + Date.now(),
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || 'Standard express service',
      price: Number(newServicePrice) || 300,
      estimatedMinutes: 20,
    };
    setServices([...services, item]);
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice(350);
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header & Verification Status Banner */}
      <div className="bg-[#0B1F4B] p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#19C37D] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C2FF]">
              Workshop Management Portal
            </span>
          </div>
          <h2 className="text-2xl font-bold font-heading mt-1">{shop.shopName}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {shop.rating} ({shop.reviewsCount} reviews)
            </span>
            <span>•</span>
            <span>{shop.yearsOfExperience} years active</span>
            <span>•</span>
            <span className="text-slate-300">{shop.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shop.isVerified ? (
            <div className="flex items-center gap-1.5 bg-[#19C37D]/20 border border-[#19C37D] text-[#19C37D] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>VERIFIED WORKSHOP</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500 text-amber-300 px-3.5 py-1.5 rounded-xl text-xs font-bold">
              <span>VERIFICATION PENDING</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#00C2FF] hover:bg-cyan-300 text-[#0B1F4B] font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CHANGES</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: General Info & Services */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Shop Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              General Workshop Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00C2FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Owner / Lead Tech</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00C2FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00C2FF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Support Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00C2FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00C2FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Shop Description & Mission</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00C2FF]"
                />
              </div>
            </div>
          </div>

          {/* Services & Rate Card Management */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Services & Fixed Rates ({services.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Rates in INR (₹)</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {services.map((srv) => (
                <div key={srv.id} className="p-3 flex items-center justify-between hover:bg-white transition-colors text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{srv.name}</span>
                    <p className="text-[11px] text-slate-500">{srv.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0B1F4B] text-sm">{formatINR(srv.price)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(srv.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Service Form */}
            <form onSubmit={handleAddService} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Add New Service Offering</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Service Name (e.g. AC Gas Top-up)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="sm:col-span-2 p-2 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Brief description of service included..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B1F4B] hover:bg-[#163D7A] text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Supported Vehicles, Skills & Verification Docs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Supported Vehicle Types */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Supported Vehicles
            </h3>
            <p className="text-xs text-slate-500">
              Only incoming requests matching these types will be routed to your workshop.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {ALL_VEHICLE_TYPES.map((vType) => {
                const isSelected = supportedVehicles.includes(vType);
                return (
                  <button
                    key={vType}
                    type="button"
                    onClick={() => toggleVehicle(vType)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0B1F4B] text-white border-[#00C2FF]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{vType}</span>
                    {isSelected && <span className="text-[#00C2FF]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills & Badges */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Specialist Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill (e.g. ECU Scan)"
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-[#0B1F4B] text-white rounded-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Verification Documents Upload Sandbox */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Workshop Verification
              </h3>
              <ShieldCheck className="w-4 h-4 text-[#19C37D]" />
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">GST / Trade License</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified on file</span>
                </div>
                <FileCheck className="w-4 h-4 text-[#19C37D]" />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Garage Photos (Bay & Sign)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">✓ 4 photos approved</span>
                </div>
                <Camera className="w-4 h-4 text-[#19C37D]" />
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#00C2FF] text-slate-600 font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#00C2FF]" />
              <span>Upload Additional Certification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
