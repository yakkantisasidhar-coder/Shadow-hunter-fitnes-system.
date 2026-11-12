import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  Plus, 
  Calendar, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  UserX,
  Edit,
  Eye,
  X,
  Phone,
  Mail,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GymMemberRecord, GymTrainer, GymCustomPlan } from '../../types';

interface GymMemberManagementScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymMemberManagementScreen: React.FC<GymMemberManagementScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<GymMemberRecord[]>([]);
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [plans, setPlans] = useState<GymCustomPlan[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expired' | 'suspended' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);

  // Selected Member for Profile Modal
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    userName: '',
    userEmail: '',
    phone: '',
    whatsappNumber: '',
    countryCode: '+91',
    whatsappConsent: true,
    consentSource: 'in_person' as 'in_person' | 'app_signup' | 'digital_form',
    planId: '',
    monthlyFee: 2500,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    assignedTrainerId: '',
    fitnessGoal: 'Muscle Building & Hypertrophy'
  });

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<GymMemberRecord | null>(null);

  const gymId = user?.gymId || 'gym-apex-1';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memRes, gymRes, plansRes] = await Promise.all([
        api.getGymMembers(gymId),
        api.getGymDetails(gymId),
        api.getGymPlans(gymId)
      ]);
      setMembers(memRes.members || []);
      setTrainers(gymRes.trainers || []);
      setPlans(plansRes.plans || []);
      if (plansRes.plans?.length > 0 && !addForm.planId) {
        setAddForm(prev => ({
          ...prev,
          planId: plansRes.plans[0].id,
          monthlyFee: plansRes.plans[0].monthlyFee
        }));
      }
    } catch (err) {
      console.error('Failed to load gym members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAction = async (memberId: string, action: 'approve' | 'reject', trainerId?: string) => {
    try {
      await api.handleGymMemberAction(gymId, memberId, action, trainerId);
      fetchData();
    } catch (err) {
      console.error('Failed to update member application:', err);
    }
  };

  const handleToggleSuspend = async (member: GymMemberRecord) => {
    const newStatus = member.status === 'suspended' ? 'active' : 'suspended';
    try {
      await api.setGymMemberStatus(gymId, member.id, newStatus);
      fetchData();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleViewProfile = async (memberId: string) => {
    try {
      setDetailsLoading(true);
      const res = await api.getGymMemberDetails(gymId, memberId);
      setSelectedMemberDetails(res);
    } catch (err: any) {
      alert(`Failed to load member profile: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.userName || !addForm.userEmail) return;

    try {
      const selectedPlan = plans.find(p => p.id === addForm.planId);
      const selectedTrainer = trainers.find(t => t.id === addForm.assignedTrainerId);

      await api.addGymMember(gymId, {
        ...addForm,
        planName: selectedPlan?.name || 'Standard Membership',
        assignedTrainerName: selectedTrainer?.name
      });

      setShowAddModal(false);
      setAddForm({
        userName: '',
        userEmail: '',
        phone: '',
        whatsappNumber: '',
        countryCode: '+91',
        whatsappConsent: true,
        consentSource: 'in_person',
        planId: plans[0]?.id || '',
        monthlyFee: plans[0]?.monthlyFee || 2500,
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        assignedTrainerId: '',
        fitnessGoal: 'Muscle Building & Hypertrophy'
      });
      fetchData();
    } catch (err: any) {
      alert(`Failed to add member: ${err.message}`);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const selectedPlan = plans.find(p => p.id === editingMember.planId);
      const selectedTrainer = trainers.find(t => t.id === editingMember.assignedTrainerId);

      await api.updateGymMember(gymId, editingMember.id, {
        ...editingMember,
        planName: selectedPlan?.name || editingMember.planName,
        assignedTrainerName: selectedTrainer?.name || editingMember.assignedTrainerName
      });

      setEditingMember(null);
      fetchData();
    } catch (err: any) {
      alert(`Failed to update membership: ${err.message}`);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.userName.toLowerCase().includes(search.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone && m.phone.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  const activeCount = members.filter(m => m.status === 'active').length;
  const pendingCount = members.filter(m => m.status === 'pending').length;
  const expiredCount = members.filter(m => m.status === 'expired').length;
  const suspendedCount = members.filter(m => m.status === 'suspended').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Pending Review</span>;
      case 'expired':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">Expired</span>;
      case 'suspended':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Suspended</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">Inactive</span>;
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
            Member Management & Rosters
          </h1>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Complete lifecycle oversight: Track active athletes, renewal expiries, attendance progress, and custom memberships.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Plus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase text-surface-mutedLight dark:text-surface-mutedDark">Total Enrolled</span>
          <p className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-0.5">{members.length} Athletes</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase text-emerald-500">Active Good Standing</span>
          <p className="text-xl font-black text-emerald-500 mt-0.5">{activeCount} Members</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase text-rose-500">Expired Memberships</span>
          <p className="text-xl font-black text-rose-500 mt-0.5">{expiredCount} Expired</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase text-amber-500">Suspended / Pending</span>
          <p className="text-xl font-black text-amber-500 mt-0.5">{suspendedCount + pendingCount} Accounts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Status Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
          {(['all', 'active', 'pending', 'expired', 'suspended', 'inactive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-[#252330] text-surface-mutedLight dark:text-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
              }`}
            >
              {tab} {tab === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-2.5 text-surface-mutedLight dark:text-surface-mutedDark" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Members Roster Table */}
      <div className="bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light/50 dark:bg-[#1b1926]/50 text-surface-mutedLight dark:text-surface-mutedDark font-black uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Member Info</th>
                <th className="py-3.5 px-4">Membership Plan</th>
                <th className="py-3.5 px-4">Start / Expiry Date</th>
                <th className="py-3.5 px-4">Assigned Coach</th>
                <th className="py-3.5 px-4">Fitness Progress</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-surface-mutedLight dark:text-surface-mutedDark font-medium">
                    Loading facility member roster...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-surface-mutedLight dark:text-surface-mutedDark">
                    <Users className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="font-bold">No members found matching your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-light/30 dark:hover:bg-[#1b1926]/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                          {m.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-textPrimary-light dark:text-textPrimary-dark">{m.userName}</p>
                          <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">{m.userEmail}</p>
                          {m.phone && <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">{m.phone}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-textPrimary-light dark:text-textPrimary-dark">{m.planName || 'Apex Gold All-Access'}</p>
                      <p className="text-[11px] text-primary dark:text-primary-light font-bold">₹{m.monthlyFee || 2500}/mo</p>
                      {m.outstandingBalance && m.outstandingBalance > 0 ? (
                        <span className="text-[10px] text-rose-500 font-bold block">Due: ₹{m.outstandingBalance}</span>
                      ) : null}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="text-[11px]">
                          <span className="text-surface-mutedLight dark:text-surface-mutedDark">Start:</span>{' '}
                          <span className="font-medium">{m.startDate || '2026-09-01'}</span>
                        </p>
                        <p className="text-[11px]">
                          <span className="text-surface-mutedLight dark:text-surface-mutedDark">Expires:</span>{' '}
                          <span className={`font-bold ${m.status === 'expired' ? 'text-rose-500' : 'text-textPrimary-light dark:text-textPrimary-dark'}`}>
                            {m.expiryDate || '2026-12-01'}
                          </span>
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {m.assignedTrainerName ? `Coach ${m.assignedTrainerName}` : 'Unassigned'}
                      </p>
                      <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                        {m.fitnessGoal || 'General Fitness'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-400">
                          <Flame size={12} />
                          <span>{m.workoutsCompleted || 0} Sessions Logged</span>
                        </div>
                        <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block">
                          Last: {m.lastActive ? new Date(m.lastActive).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(m.status)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {m.status === 'pending' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleAction(m.id, 'approve', trainers[0]?.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px] hover:bg-emerald-600 transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle size={12} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleAction(m.id, 'reject')}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-[10px] hover:bg-rose-500 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <XCircle size={12} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleViewProfile(m.id)}
                            title="View Full Member Profile & Progress"
                            className="p-1.5 rounded-lg bg-surface-light dark:bg-[#1b1926] hover:bg-primary hover:text-white text-surface-mutedLight dark:text-surface-mutedDark transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setEditingMember(m)}
                            title="Edit Membership Plan & Dates"
                            className="p-1.5 rounded-lg bg-surface-light dark:bg-[#1b1926] hover:bg-primary hover:text-white text-surface-mutedLight dark:text-surface-mutedDark transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(m)}
                            title={m.status === 'suspended' ? 'Restore Active Status' : 'Temporarily Suspend Member'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              m.status === 'suspended' 
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                                : 'bg-surface-light dark:bg-[#1b1926] hover:bg-amber-500 hover:text-white text-surface-mutedLight dark:text-surface-mutedDark'
                            }`}
                          >
                            <UserX size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW MEMBER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-2">
                <Users size={18} className="text-primary" />
                <span>Register New Member</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Full Athlete Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.userName}
                  onChange={(e) => setAddForm({ ...addForm, userName: e.target.value })}
                  placeholder="e.g. Brandon Stark"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addForm.userEmail}
                    onChange={(e) => setAddForm({ ...addForm, userEmail: e.target.value })}
                    placeholder="brandon@athlete.com"
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddForm(prev => ({
                        ...prev,
                        phone: val,
                        whatsappNumber: !prev.whatsappNumber || prev.whatsappNumber === prev.phone ? val : prev.whatsappNumber
                      }));
                    }}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  />
                </div>
              </div>

              {/* WhatsApp Contact & Explicit Consent Section */}
              <div className="p-3.5 rounded-2xl bg-primary/5 dark:bg-[#1b1926] border border-primary/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-primary dark:text-primary-light flex items-center space-x-1.5">
                    <span>📱 WhatsApp Communication</span>
                  </span>
                  <label className="flex items-center space-x-1.5 text-[10px] font-bold cursor-pointer text-textPrimary-light dark:text-textPrimary-dark">
                    <input
                      type="checkbox"
                      checked={addForm.whatsappConsent}
                      onChange={(e) => setAddForm({ ...addForm, whatsappConsent: e.target.checked })}
                      className="accent-primary"
                    />
                    <span>Has Explicit Consent</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block font-bold text-surface-mutedLight dark:text-surface-mutedDark mb-0.5">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={addForm.whatsappNumber}
                      onChange={(e) => setAddForm({ ...addForm, whatsappNumber: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-surface-mutedLight dark:text-surface-mutedDark mb-0.5">Consent Source</label>
                    <select
                      value={addForm.consentSource}
                      onChange={(e: any) => setAddForm({ ...addForm, consentSource: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                    >
                      <option value="in_person">In-Person Form</option>
                      <option value="digital_form">Digital Form</option>
                      <option value="app_signup">App Registration</option>
                    </select>
                  </div>
                </div>
                <p className="text-[9px] text-surface-mutedLight dark:text-surface-mutedDark italic">
                  * Explicit member consent is mandated by Meta Policy before dispatching automated WhatsApp greetings or renewals.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Membership Plan</label>
                  <select
                    value={addForm.planId}
                    onChange={(e) => {
                      const p = plans.find(plan => plan.id === e.target.value);
                      setAddForm({
                        ...addForm,
                        planId: e.target.value,
                        monthlyFee: p?.monthlyFee || 2500
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.monthlyFee}/mo)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Monthly Fee (₹ INR)</label>
                  <input
                    type="number"
                    value={addForm.monthlyFee}
                    onChange={(e) => setAddForm({ ...addForm, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Membership Start</label>
                  <input
                    type="date"
                    value={addForm.startDate}
                    onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Membership Expiry</label>
                  <input
                    type="date"
                    value={addForm.expiryDate}
                    onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Assigned Coach</label>
                  <select
                    value={addForm.assignedTrainerId}
                    onChange={(e) => setAddForm({ ...addForm, assignedTrainerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  >
                    <option value="">Unassigned</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>Coach {t.name} ({t.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Fitness Target</label>
                  <input
                    type="text"
                    value={addForm.fitnessGoal}
                    onChange={(e) => setAddForm({ ...addForm, fitnessGoal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold text-surface-mutedLight hover:text-textPrimary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold cursor-pointer"
                >
                  Save Member Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MEMBERSHIP */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Edit Membership: {editingMember.userName}
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e: any) => setEditingMember({ ...editingMember, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={editingMember.monthlyFee || 2500}
                    onChange={(e) => setEditingMember({ ...editingMember, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingMember.startDate || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingMember.expiryDate || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Assigned Coach</label>
                <select
                  value={editingMember.assignedTrainerId || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, assignedTrainerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                >
                  <option value="">Unassigned</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>Coach {t.name} ({t.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold text-surface-mutedLight hover:text-textPrimary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW MEMBER PROFILE & PROGRESS */}
      {selectedMemberDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-lg">
                  {selectedMemberDetails.member.userName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
                    {selectedMemberDetails.member.userName}
                  </h3>
                  <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                    {selectedMemberDetails.member.userEmail} &bull; {selectedMemberDetails.member.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedMemberDetails(null)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Membership Overview Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926]">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Status</span>
                <span className="font-bold text-emerald-400 capitalize">{selectedMemberDetails.member.status}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926]">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Plan</span>
                <span className="font-bold text-primary dark:text-primary-light">{selectedMemberDetails.member.planName}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926]">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Expiry</span>
                <span className="font-bold">{selectedMemberDetails.member.expiryDate || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926]">
                <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Balance Due</span>
                <span className="font-bold text-rose-500">₹{selectedMemberDetails.member.outstandingBalance || 0}</span>
              </div>
            </div>

            {/* Workout & Fitness Progress Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-1.5">
                <Activity size={14} className="text-primary" />
                <span>Fitness & Workout Activity History</span>
              </h4>

              {selectedMemberDetails.workoutLogs?.length === 0 ? (
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark italic">
                  No verified workout sessions recorded yet by this member.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedMemberDetails.workoutLogs?.map((w: any) => (
                    <div key={w.id} className="p-3 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-textPrimary-light dark:text-textPrimary-dark">{w.programTitle || 'Gym Training Session'}</p>
                        <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">{new Date(w.completedAt).toLocaleDateString()} &bull; {w.durationMinutes} mins</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary dark:text-primary-light">{w.caloriesBurned} kcal</span>
                        <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block">{w.totalVolumeKg} kg volume</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attendance History */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-1.5">
                <Clock size={14} className="text-primary" />
                <span>Recent Facility Check-ins</span>
              </h4>

              {selectedMemberDetails.attendance?.length === 0 ? (
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark italic">
                  No check-ins recorded this month.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedMemberDetails.attendance?.slice(0, 4).map((att: any) => (
                    <div key={att.id} className="p-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark">
                      <p className="font-bold">{att.date}</p>
                      <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                        In: {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {att.checkOutTime ? ` • Out: ${new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' • Active'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing & Invoice Records */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-1.5">
                <DollarSign size={14} className="text-emerald-500" />
                <span>Invoices & Membership Dues</span>
              </h4>

              {selectedMemberDetails.invoices?.length === 0 ? (
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark italic">
                  No invoices generated.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {selectedMemberDetails.invoices?.map((inv: any) => (
                    <div key={inv.id} className="p-3 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center">
                      <div>
                        <p className="font-bold">{inv.billingMonth}</p>
                        <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">Due: {inv.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">₹{inv.amount}</span>
                        <span className={`block text-[10px] font-bold ${inv.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMemberDetails(null)}
                className="px-5 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
