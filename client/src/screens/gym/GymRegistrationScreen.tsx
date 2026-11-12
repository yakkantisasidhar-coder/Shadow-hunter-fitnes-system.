import React, { useState } from 'react';
import { Building2, ArrowLeft, Check, Plus, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface GymRegistrationScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymRegistrationScreen: React.FC<GymRegistrationScreenProps> = ({ onNavigate }) => {
  const { refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState<number>(300);
  const [partnershipTier, setPartnershipTier] = useState<'standard' | 'premium_collaboration'>('premium_collaboration');
  const [facilities, setFacilities] = useState<string[]>([
    'Olympic Weightlifting Platforms',
    'Sauna & Recovery Baths',
    'Cardio Deck'
  ]);
  const [newFacility, setNewFacility] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredGym, setRegisteredGym] = useState<any>(null);

  const addFacility = () => {
    if (!newFacility.trim()) return;
    setFacilities([...facilities, newFacility.trim()]);
    setNewFacility('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !phone) return;

    setLoading(true);
    try {
      const res = await api.registerGym({
        name,
        address,
        city,
        phone,
        capacity,
        facilities,
        partnershipTier
      });
      setRegisteredGym(res.gym);
      await refreshUser();
    } catch (err) {
      console.error('Gym registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (registeredGym) {
    return (
      <div className="max-w-lg mx-auto py-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mx-auto shadow-xl">
          <Building2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Facility Successfully Registered!
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            "{registeredGym.name}" is now live on the Shadow Hunter Fitness System.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-surface-mutedLight dark:text-surface-mutedDark">Unique Join Code:</span>
            <span className="font-black text-primary dark:text-primary-light text-base tracking-widest">{registeredGym.joinCode}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-surface-mutedLight dark:text-surface-mutedDark">Partnership Tier:</span>
            <span className="font-bold uppercase text-emerald-500">{registeredGym.partnershipTier}</span>
          </div>
          <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark pt-2 border-t border-surface-borderLight dark:border-surface-borderDark">
            Share this joining code with your members so they can link to your gym and access the 50% subscription discount.
          </p>
        </div>

        <button
          onClick={() => onNavigate('gym-manage')}
          className="w-full py-3 rounded-2xl gradient-btn-primary text-white text-xs font-bold"
        >
          Open Gym Owner Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => onNavigate('gym')}
          className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Gym Hub</span>
        </button>
        <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Register Commercial Gym Facility
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Establish an official digital presence for your commercial athletic club, gym, or fitness studio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1">Commercial Facility Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Metro Elite Performance Center"
            className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Physical Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="100 Commercial Way"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">City / Metropolitan Region</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Metropolis"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Active Athlete Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Partnership Tier */}
        <div>
          <label className="block text-xs font-bold mb-1.5">Collaboration Tier</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPartnershipTier('standard')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                partnershipTier === 'standard'
                  ? 'border-primary bg-primary/10 text-primary dark:text-primary-light font-bold'
                  : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
              }`}
            >
              <div className="text-xs font-bold">Standard Affiliation</div>
              <div className="text-[10px] opacity-80 mt-0.5">Up to 150 athletes, roster management</div>
            </button>
            <button
              type="button"
              onClick={() => setPartnershipTier('premium_collaboration')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                partnershipTier === 'premium_collaboration'
                  ? 'border-primary bg-primary/10 text-primary dark:text-primary-light font-bold'
                  : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
              }`}
            >
              <div className="text-xs font-bold">Premium Collaboration</div>
              <div className="text-[10px] opacity-80 mt-0.5">Enables 50% discount code + Unlimited members</div>
            </button>
          </div>
        </div>

        {/* Facilities list builder */}
        <div>
          <label className="block text-xs font-bold mb-1.5">Facility Amenities</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {facilities.map((fac, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-surface-light dark:bg-[#1b1926] text-xs font-semibold flex items-center space-x-1"
              >
                <span>{fac}</span>
                <button
                  type="button"
                  onClick={() => setFacilities(facilities.filter((_, i) => i !== idx))}
                  className="text-surface-mutedLight dark:text-surface-mutedDark hover:text-red-500 ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newFacility}
              onChange={(e) => setNewFacility(e.target.value)}
              placeholder="e.g., Cryotherapy Chamber, Turf Lane"
              className="flex-1 px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs"
            />
            <button
              type="button"
              onClick={addFacility}
              className="px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name}
          className="w-full py-3 rounded-xl gradient-btn-primary text-white font-bold text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50 mt-4"
        >
          <Building2 size={16} />
          <span>{loading ? 'Registering Facility...' : 'Complete Gym Registration'}</span>
        </button>
      </form>
    </div>
  );
};
