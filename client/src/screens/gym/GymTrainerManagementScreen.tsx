import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, ArrowLeft, Mail, Award, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GymTrainer } from '../../types';

interface GymTrainerManagementScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymTrainerManagementScreen: React.FC<GymTrainerManagementScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [bio, setBio] = useState('');

  const gymId = user?.gymId || 'gym-apex-1';

  const fetchTrainers = async () => {
    try {
      const res = await api.getGymDetails(gymId);
      setTrainers(res.trainers || []);
    } catch (err) {
      console.error('Failed to load gym trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [user]);

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty) return;

    try {
      await api.addGymTrainer(gymId, {
        name,
        email,
        specialty,
        experienceYears,
        bio
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setSpecialty('');
      setBio('');
      fetchTrainers();
    } catch (err) {
      console.error('Error adding trainer:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('gym-manage')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Gym Portal</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Facility Trainer Roster
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Manage your certified strength coaches, nutrition specialists, and client caseloads.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5"
        >
          <Plus size={16} />
          <span>Add Facility Trainer</span>
        </button>
      </div>

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((tr) => (
          <div
            key={tr.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light">
                  {tr.specialty}
                </span>
                <span className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark">
                  {tr.experienceYears} Years Exp
                </span>
              </div>

              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Coach {tr.name}
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                {tr.bio}
              </p>
            </div>

            <div className="pt-4 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center text-xs">
              <span className="text-surface-mutedLight dark:text-surface-mutedDark">Active Athletes:</span>
              <span className="font-extrabold text-primary dark:text-primary-light">{tr.assignedClientsCount} Clients</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
              Register Facility Trainer
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Add a certified coach to your gym directory to guide member workout programs.
            </p>

            <form onSubmit={handleAddTrainer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold mb-1">Trainer Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Miller, CSCS"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coach@gym.com"
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Years Experience</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Specialization Focus</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Biomechanics & Olympic Weightlifting"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Bio / Credentials</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Certified conditioning coach specializing in strength..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
                >
                  Save Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
