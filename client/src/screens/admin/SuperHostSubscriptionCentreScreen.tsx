import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Users, 
  UserCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  Edit3, 
  Sparkles,
  Percent,
  Layers,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';

interface SuperHostSubscriptionCentreScreenProps {
  onNavigate: (screen: string, param?: string) => void;
}

export const SuperHostSubscriptionCentreScreen: React.FC<SuperHostSubscriptionCentreScreenProps> = ({ onNavigate }) => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGym, setSelectedGym] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    planId: 'plan-enterprise',
    planName: 'Shadow Hunter Enterprise Tier',
    status: 'active',
    expiryDate: '',
    maxMembers: 1000,
    maxStaff: 50,
    discountPercent: 0,
    notes: ''
  });

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const res = await api.getSubscriptionCentreGyms(searchQuery);
      setGyms(res.gyms || []);
    } catch (err) {
      console.error('Failed to load subscription centre gyms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, [searchQuery]);

  const copyToClipboard = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedGym(item);
    setEditForm({
      planId: item.entitlement.planId || 'plan-enterprise',
      planName: item.entitlement.planName || 'Enterprise Tier',
      status: item.entitlement.status || 'active',
      expiryDate: item.entitlement.expiryDate ? item.entitlement.expiryDate.split('T')[0] : '',
      maxMembers: item.entitlement.maxMembers || 500,
      maxStaff: item.entitlement.maxStaff || 20,
      discountPercent: item.entitlement.discountPercent || 0,
      notes: item.entitlement.notes || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEntitlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGym) return;

    try {
      await api.updateGymEntitlement({
        gymId: selectedGym.gym.id,
        ...editForm
      });
      alert('Subscription entitlement and backend limits updated successfully!');
      setEditModalOpen(false);
      fetchGyms();
    } catch (err: any) {
      alert(err.message || 'Failed to update entitlement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Super Admin Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              Super Host Subscription & Entitlement Control Centre
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Master Clearance
            </span>
          </div>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Centrally lookup gyms by permanent ID or registered email, manage SaaS plan tiers, adjust member/staff limits, and enforce entitlements.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex items-center space-x-3">
        <Search size={18} className="text-surface-mutedLight dark:text-surface-mutedDark" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Gym Name, Permanent ID (e.g. GYM-000125), Owner Email, or Region..."
          className="w-full bg-transparent border-none text-xs font-medium focus:outline-none text-textPrimary-light dark:text-textPrimary-dark placeholder:text-surface-mutedLight"
        />
      </div>

      {/* Gym Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((item) => {
          const gym = item.gym;
          const ent = item.entitlement;
          const isSuspended = ent.status === 'suspended';

          return (
            <div
              key={gym.id}
              className={`p-6 rounded-3xl bg-white dark:bg-[#252330] border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                isSuspended
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : 'border-surface-borderLight dark:border-surface-borderDark hover:border-primary/40'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-black text-primary px-2 py-0.5 rounded bg-primary/10 flex items-center space-x-1">
                        <span>{item.gymPermanentId}</span>
                        <button
                          onClick={() => copyToClipboard(item.gymPermanentId)}
                          className="hover:opacity-75"
                          title="Copy Permanent ID"
                        >
                          <Copy size={11} />
                        </button>
                      </span>
                      {copiedId === item.gymPermanentId && (
                        <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
                      {gym.name}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    ent.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                    ent.status === 'trial' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {ent.status}
                  </span>
                </div>

                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                  Owner: <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark">{gym.ownerName}</span> ({item.ownerPermanentId})
                </p>
                <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                  {gym.ownerEmail} &bull; {gym.city}
                </p>

                {/* Plan Metrics */}
                <div className="mt-4 p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-surface-mutedLight">SaaS Plan</span>
                    <span className="font-black text-primary">{ent.planName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-surface-mutedLight">Member Limit</span>
                    <span className="font-extrabold">{ent.currentMembers} / {ent.maxMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-surface-mutedLight">Staff Seats</span>
                    <span className="font-extrabold">{ent.currentStaff} / {ent.maxStaff}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-surface-mutedLight">Renewal Expiry</span>
                    <span className="font-bold text-amber-500">
                      {new Date(ent.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Active Entitled Features */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase text-surface-mutedLight block mb-1">
                    Entitled Platform Features
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(ent.enabledFeatures || []).map((feat: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 font-medium">
                        {feat.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex-1 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Edit3 size={13} />
                  <span>Manage Entitlements</span>
                </button>

                <button
                  onClick={() => onNavigate('public-gym', gym.id)}
                  className="px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5"
                  title="View Public Gym Profile"
                >
                  Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Entitlement Modal */}
      {editModalOpen && selectedGym && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl p-6 max-w-lg w-full space-y-4 border border-surface-borderLight dark:border-surface-borderDark shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
              Modify Subscription Entitlements: {selectedGym.gym.name}
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Permanent ID: <span className="font-mono text-primary font-bold">{selectedGym.gymPermanentId}</span>
            </p>

            <form onSubmit={handleSaveEntitlement} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Subscription Plan Tier</label>
                <select
                  value={editForm.planName}
                  onChange={(e) => setEditForm({ ...editForm, planName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                >
                  <option value="Shadow Hunter Starter Tier">Starter Tier (Up to 150 members)</option>
                  <option value="Shadow Hunter Pro Partner">Pro Tier (Up to 500 members)</option>
                  <option value="Shadow Hunter Enterprise Tier">Enterprise Tier (Up to 2,000 members)</option>
                  <option value="Custom Athletic Network Tier">Custom Network Franchise Tier</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Entitlement Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  >
                    <option value="active">Active Standing</option>
                    <option value="trial">Trial Access</option>
                    <option value="grace_period">Grace Period</option>
                    <option value="suspended">Suspended Access</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Renewal Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Max Authorized Members</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={10000}
                    value={editForm.maxMembers}
                    onChange={(e) => setEditForm({ ...editForm, maxMembers: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Max Staff Accounts</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={editForm.maxStaff}
                    onChange={(e) => setEditForm({ ...editForm, maxStaff: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Authorized Discount Percentage (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editForm.discountPercent}
                  onChange={(e) => setEditForm({ ...editForm, discountPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Super Host Administrative Audit Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Reason for extension, plan modification, or special override..."
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-surface-borderLight dark:border-surface-borderDark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-md"
                >
                  Enforce Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
