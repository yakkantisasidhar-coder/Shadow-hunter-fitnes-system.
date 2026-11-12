import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Edit, 
  Bell, 
  Layers, 
  DollarSign, 
  Phone, 
  MapPin, 
  Sparkles,
  Save,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Gym, GymTrainer, GymCustomPlan, GymAttendanceRecord, GymMemberRecord } from '../../types';

interface GymOperationsScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymOperationsScreen: React.FC<GymOperationsScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'plans' | 'staff'>('profile');
  const [gym, setGym] = useState<Gym | null>(null);
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [plans, setPlans] = useState<GymCustomPlan[]>([]);
  const [attendance, setAttendance] = useState<GymAttendanceRecord[]>([]);
  const [members, setMembers] = useState<GymMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    capacity: 250,
    facilitiesText: ''
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // New Plan Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    monthlyFee: 2000,
    billingCycle: 'monthly' as GymCustomPlan['billingCycle'],
    durationMonths: 1,
    featuresText: 'Full Facility Access\nLocker Room & Showers'
  });

  // Check-in Modal
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const gymId = user?.gymId || 'gym-apex-1';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gymRes, plansRes, attRes, memRes] = await Promise.all([
        api.getGymDetails(gymId),
        api.getGymPlans(gymId),
        api.getGymAttendance(gymId),
        api.getGymMembers(gymId)
      ]);

      const g = gymRes.gym;
      setGym(g);
      setTrainers(gymRes.trainers || []);
      setPlans(plansRes.plans || []);
      setAttendance(attRes.attendance || []);
      setMembers(memRes.members || []);

      if (g) {
        setProfileForm({
          name: g.name,
          address: g.address,
          city: g.city,
          phone: g.phone,
          capacity: g.capacity,
          facilitiesText: (g.facilities || []).join(', ')
        });
      }

      if (memRes.members?.length > 0 && !selectedMemberId) {
        setSelectedMemberId(memRes.members[0].id);
      }
    } catch (err) {
      console.error('Failed to load gym operations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const facilities = profileForm.facilitiesText.split(',').map(s => s.trim()).filter(Boolean);
      await api.updateGymProfile(gymId, {
        name: profileForm.name,
        address: profileForm.address,
        city: profileForm.city,
        phone: profileForm.phone,
        capacity: profileForm.capacity,
        facilities
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      fetchData();
    } catch (err: any) {
      alert(`Failed to save facility profile: ${err.message}`);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = planForm.featuresText.split('\n').map(s => s.trim()).filter(Boolean);
      await api.createGymPlan(gymId, {
        name: planForm.name,
        monthlyFee: planForm.monthlyFee,
        billingCycle: planForm.billingCycle,
        durationMonths: planForm.durationMonths,
        features
      });
      setShowPlanModal(false);
      setPlanForm({
        name: '',
        monthlyFee: 2000,
        billingCycle: 'monthly',
        durationMonths: 1,
        featuresText: 'Full Facility Access\nLocker Room & Showers'
      });
      fetchData();
    } catch (err: any) {
      alert(`Failed to create plan: ${err.message}`);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    try {
      await api.checkInMember(gymId, selectedMemberId);
      setShowCheckInModal(false);
      fetchData();
    } catch (err: any) {
      alert(`Check-in failed: ${err.message}`);
    }
  };

  const handleCheckOut = async (attendanceId: string) => {
    try {
      await api.checkOutMember(gymId, attendanceId);
      fetchData();
    } catch (err: any) {
      alert(`Check-out failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('gym-manage')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Gym Portal</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Gym Operations & Facility Suite
          </h1>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Configure commercial gym profile, manage custom membership plans, supervise staff, and log athlete attendance.
          </p>
        </div>
      </div>

      {/* Operations Navigation Tabs */}
      <div className="flex border-b border-surface-borderLight dark:border-surface-borderDark gap-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <Building2 size={16} />
          <span>Facility Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <Clock size={16} />
          <span>Member Attendance Log ({attendance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <Layers size={16} />
          <span>Membership Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <UserCheck size={16} />
          <span>Staff & Trainers ({trainers.length})</span>
        </button>
      </div>

      {/* TAB 1: FACILITY PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="max-w-2xl p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-2">
              <Building2 size={18} className="text-primary" />
              <span>Commercial Facility Specifications</span>
            </h3>
            {profileSaved && (
              <span className="text-xs font-bold text-emerald-500 flex items-center space-x-1">
                <CheckCircle2 size={14} />
                <span>Saved successfully</span>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Gym Name *</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Street Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">City / Region</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Contact Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Maximum Athlete Capacity</label>
              <input
                type="number"
                value={profileForm.capacity}
                onChange={(e) => setProfileForm({ ...profileForm, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Amenities & Facilities (comma-separated)</label>
            <textarea
              rows={2}
              value={profileForm.facilitiesText}
              onChange={(e) => setProfileForm({ ...profileForm, facilitiesText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Save size={16} />
            <span>Save Facility Specifications</span>
          </button>
        </form>
      )}

      {/* TAB 2: ATTENDANCE TRACKING */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
            <div>
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Daily Check-in & Attendance Ledger
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Monitor live floor presence, keycard entries, and training session duration.
              </p>
            </div>
            <button
              onClick={() => setShowCheckInModal(true)}
              className="px-3.5 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Check-in Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light/50 dark:bg-[#1b1926]/50 text-surface-mutedLight dark:text-surface-mutedDark font-black uppercase text-[10px]">
                  <th className="py-2.5 px-3">Athlete</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Check-in Time</th>
                  <th className="py-2.5 px-3">Check-out Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-surface-mutedLight font-medium">
                      No attendance check-ins logged today.
                    </td>
                  </tr>
                ) : (
                  attendance.map(a => (
                    <tr key={a.id} className="hover:bg-surface-light/30 dark:hover:bg-[#1b1926]/30">
                      <td className="py-2.5 px-3 font-bold text-textPrimary-light dark:text-textPrimary-dark">{a.memberName}</td>
                      <td className="py-2.5 px-3 text-surface-mutedLight dark:text-surface-mutedDark">{a.date}</td>
                      <td className="py-2.5 px-3 font-mono">{new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {a.checkOutTime ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-400">Completed</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 animate-pulse">On Floor</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {!a.checkOutTime && (
                          <button
                            onClick={() => handleCheckOut(a.id)}
                            className="px-2.5 py-1 rounded-lg bg-surface-light dark:bg-[#1b1926] text-primary dark:text-primary-light font-bold text-[10px] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERSHIP PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Configured Facility Membership Tiers
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Set monthly membership pricing, renewal cycles, and included facility amenities.
              </p>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-3.5 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create New Tier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(p => (
              <div key={p.id} className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-surface-mutedLight dark:text-surface-mutedDark block">{p.billingCycle} Cycle</span>
                  <h4 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">{p.name}</h4>
                  <p className="text-2xl font-black text-primary dark:text-primary-light my-3">₹{p.monthlyFee}<span className="text-xs font-normal text-surface-mutedLight"> / mo</span></p>
                  
                  <ul className="space-y-1.5 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                    {p.features?.map((f, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center text-xs">
                  <span className="text-[10px] text-emerald-400 font-bold">Active Public Plan</span>
                  <button className="text-primary hover:underline font-bold text-xs cursor-pointer">
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STAFF & TRAINERS */}
      {activeTab === 'staff' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
            <div>
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Certified Coaching & Operations Staff
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Facility coaches guiding member routines, split progressions, and safety cues.
              </p>
            </div>
            <button
              onClick={() => onNavigate('gym-trainers')}
              className="px-3.5 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
            >
              <UserCheck size={14} />
              <span>Manage Trainers Portal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainers.map(t => (
              <div key={t.id} className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">Coach {t.name}</h4>
                  <p className="text-[11px] font-bold text-primary dark:text-primary-light">{t.specialty}</p>
                  <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">{t.bio}</p>
                </div>
                <div className="text-right whitespace-nowrap pl-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-surface-borderLight dark:bg-surface-borderDark text-surface-mutedLight block">
                    {t.experienceYears} Yrs CSCS
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 mt-1 block">
                    {t.assignedClientsCount || 0} Clients
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECK-IN MODAL */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Quick Member Check-in
              </h3>
              <button onClick={() => setShowCheckInModal(false)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Active Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                >
                  {members.filter(m => m.status === 'active').map(m => (
                    <option key={m.id} value={m.id}>{m.userName} ({m.planName})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold cursor-pointer"
                >
                  Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Create Custom Membership Plan
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Plan Title *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Off-Peak Powerlifter Access"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Monthly Fee (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.monthlyFee}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Billing Cycle</label>
                  <select
                    value={planForm.billingCycle}
                    onChange={(e: any) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Included Features (one per line)</label>
                <textarea
                  rows={3}
                  value={planForm.featuresText}
                  onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
