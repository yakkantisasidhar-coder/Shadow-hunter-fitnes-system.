import React, { useState } from 'react';
import { User, Mail, Calendar, Scale, Ruler, MapPin, Award, Shield, LogOut, Edit3, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileScreenProps {
  onNavigate: (screen: string, param?: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [age, setAge] = useState<number>(user?.age || 29);
  const [height, setHeight] = useState<number>(user?.height || 182);
  const [currentWeight, setCurrentWeight] = useState<number>(user?.currentWeight || 84);
  const [targetWeight, setTargetWeight] = useState<number>(user?.targetWeight || 80);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName,
        age,
        height,
        currentWeight,
        targetWeight
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Card Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5 text-center md:text-left">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
            alt="User profile"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/30 shadow-lg"
          />
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h2 className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark">
                {user?.fullName || 'Athlete'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary text-white">
                {user?.role?.replace('_', ' ') || 'Athlete'}
              </span>
            </div>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              {user?.email}
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-3 mt-2 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark">
              <span>Goal: {(user?.fitnessGoal || 'General Fitness').replace('_', ' ').toUpperCase()}</span>
              <span>&bull;</span>
              <span>{user?.workoutLocation === 'home' ? 'Home Athlete' : 'Gym Athlete'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('public-member', user?.id || 'user-athlete-1')}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary hover:text-white transition-colors"
          >
            Preview Public Card
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center space-x-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Edit3 size={15} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
          <button
            onClick={() => {
              logout();
              onNavigate('login');
            }}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Secure Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Edit Form or Stats View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
            Update Personal Biometrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Target (kg)</label>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-1.5"
          >
            <Check size={16} />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Current Weight</span>
            <span className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1 block">{user?.currentWeight || 84} kg</span>
            <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">Target: {user?.targetWeight || 80} kg</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Height & BMI</span>
            <span className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1 block">{user?.height || 182} cm</span>
            <span className="text-[11px] text-emerald-500 font-bold mt-0.5 block">BMI: 25.4 (Healthy)</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Membership Tier</span>
            <span className="text-xl font-black text-primary dark:text-primary-light mt-1 block uppercase">{user?.subscriptionTier || 'Free'}</span>
            <button onClick={() => onNavigate('subscriptions')} className="text-[11px] text-primary hover:underline font-bold mt-0.5 block">
              Upgrade Tier &rarr;
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Affiliated Facility</span>
            <span className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark mt-1 block truncate">
              {user?.gymName || 'Apex Performance'}
            </span>
            <span className="text-[11px] text-emerald-500 font-bold mt-0.5 block">Verified Member</span>
          </div>
        </div>
      )}
    </div>
  );
};
