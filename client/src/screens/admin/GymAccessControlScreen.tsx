import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Search, 
  Building2, 
  Key, 
  Check, 
  XCircle, 
  AlertTriangle, 
  History, 
  Users, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  UserCheck, 
  Edit3, 
  Trash2,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Gym, GymPermission, GymAccessRecord, AuditLogItem } from '../../types';

interface GymAccessControlScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymAccessControlScreen: React.FC<GymAccessControlScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'console' | 'history'>('console');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [gymsList, setGymsList] = useState<Gym[]>([]);
  const [authHistory, setAuthHistory] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Authorization Form State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGymIds, setSelectedGymIds] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<GymPermission[]>([
    'manage_gym_members',
    'view_member_profiles',
    'manage_memberships',
    'manage_monthly_bills',
    'record_payments',
    'view_financial_reports',
    'manage_gym_staff',
    'manage_attendance',
    'manage_gym_announcements',
    'edit_gym_info'
  ]);
  const [grantRole, setGrantRole] = useState<'gym_owner' | 'gym_staff'>('gym_owner');
  const [submitting, setSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // All 10 Granular Permissions per Master Specification
  const GRANULAR_PERMISSIONS: { id: GymPermission; label: string; desc: string }[] = [
    { id: 'manage_gym_members', label: 'Manage Gym Members', desc: 'Accept/reject roster applications and enroll athletes' },
    { id: 'view_member_profiles', label: 'View Member Profiles', desc: 'Inspect athlete biometrics, workout volume, and contacts' },
    { id: 'manage_memberships', label: 'Manage Memberships', desc: 'Configure membership tiers, dates, and renewal periods' },
    { id: 'manage_monthly_bills', label: 'Manage Monthly Bills', desc: 'Run monthly member billing runs and configure fee rates' },
    { id: 'record_payments', label: 'Record Payments', desc: 'Reconcile Cash, UPI, and online receipts against member dues' },
    { id: 'view_financial_reports', label: 'View Financial Reports', desc: 'Review cash flow, collections, and downloadable reports' },
    { id: 'manage_gym_staff', label: 'Manage Gym Staff', desc: 'Register coaches/trainers and oversee caseloads' },
    { id: 'manage_attendance', label: 'Manage Attendance', desc: 'Log live floor keycards, check-ins, and check-outs' },
    { id: 'manage_gym_announcements', label: 'Manage Announcements', desc: 'Broadcast official alerts and facility news bulletins' },
    { id: 'edit_gym_info', label: 'Edit Gym Information', desc: 'Modify facility operating profile, capacity, and amenities' }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, hRes] = await Promise.all([
        api.getGymAccessUsers(search),
        api.getGymAccessHistory()
      ]);
      setUsersList(uRes.users || []);
      setGymsList(uRes.gyms || []);
      setAuthHistory(hRes.history || []);

      if (uRes.users?.length > 0 && !selectedUser) {
        handleSelectUser(uRes.users[0]);
      }
    } catch (err) {
      console.error('Failed to load gym access control data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    const existingGymIds = Object.keys(u.gymAccess || {});
    if (existingGymIds.length > 0) {
      setSelectedGymIds(existingGymIds);
      const firstGrant = u.gymAccess[existingGymIds[0]];
      if (firstGrant?.permissions) {
        setSelectedPermissions(firstGrant.permissions);
      }
    } else {
      setSelectedGymIds(gymsList.length > 0 ? [gymsList[0].id] : ['gym-apex-1']);
      setSelectedPermissions(GRANULAR_PERMISSIONS.map(p => p.id));
    }
  };

  const toggleGymSelection = (gymId: string) => {
    if (selectedGymIds.includes(gymId)) {
      if (selectedGymIds.length > 1) {
        setSelectedGymIds(selectedGymIds.filter(id => id !== gymId));
      }
    } else {
      setSelectedGymIds([...selectedGymIds, gymId]);
    }
  };

  const togglePermission = (perm: GymPermission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(GRANULAR_PERMISSIONS.map(p => p.id));
  };

  const handleClearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  // 1. Confirm Authorization
  const handleConfirmAuthorization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || selectedGymIds.length === 0) return;

    try {
      setSubmitting(true);
      await api.grantGymAccess({
        userId: selectedUser.id,
        gymIds: selectedGymIds,
        permissions: selectedPermissions,
        role: grantRole
      });

      setNotificationMsg({
        type: 'success',
        text: `Privileges committed successfully: ${selectedUser.fullName} now has ${grantRole.toUpperCase()} authority over ${selectedGymIds.length} gym(s).`
      });
      setTimeout(() => setNotificationMsg(null), 4000);
      fetchData();
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: `Authorization grant failed: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Revoke Privileges for a specific Gym
  const handleRevokeGym = async (gymId: string) => {
    if (!selectedUser) return;
    if (!confirm(`Are you sure you want to revoke Gym Owner privileges for ${selectedUser.fullName} on this facility?`)) return;

    try {
      await api.revokeGymAccess(selectedUser.id, gymId);
      setNotificationMsg({ type: 'success', text: `Access revoked for gym '${gymId}'.` });
      setTimeout(() => setNotificationMsg(null), 3500);
      fetchData();
    } catch (err: any) {
      alert(`Revocation failed: ${err.message}`);
    }
  };

  // 3. Suspend / Restore Gym Access
  const handleToggleStatus = async (gymId: string, currentStatus: string) => {
    if (!selectedUser) return;
    const targetStatus = currentStatus === 'suspended' ? 'active' : 'suspended';

    try {
      await api.toggleGymAccessStatus(selectedUser.id, gymId, targetStatus);
      setNotificationMsg({ type: 'success', text: `Gym access status updated to '${targetStatus}'.` });
      setTimeout(() => setNotificationMsg(null), 3500);
      fetchData();
    } catch (err: any) {
      alert(`Status toggle failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#17151F] via-[#241f35] to-primary text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/30 text-white text-[10px] font-black uppercase tracking-wider mb-2 border border-primary/40">
            <ShieldCheck size={13} className="text-primary-light" />
            <span>CENTRAL PLATFORM HOST AUTHORITY</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            Gym Owner Access Control & RBAC
          </h1>
          <p className="text-xs text-white/80 mt-1 max-w-2xl">
            Grant and supervise Gym Owner clearances. Assign multiple facility scopes, audit granular permissions, and enforce server-side data isolation.
          </p>
        </div>

        <button
          onClick={() => onNavigate('admin')}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Back to Super Host Hub
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-borderLight dark:border-surface-borderDark gap-4">
        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'console'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <Key size={16} />
          <span>Authorization Console & Multi-Gym Scopes</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <History size={16} />
          <span>Complete Authorization History ({authHistory.length})</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-200 ${
          notificationMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
        }`}>
          {notificationMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* TAB 1: AUTHORIZATION CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Registered Users Selector (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#252330] rounded-3xl border border-surface-borderLight dark:border-surface-borderDark shadow-sm p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-2">
                <Users size={16} className="text-primary" />
                <span>Registered Platform Users ({usersList.length})</span>
              </h3>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-surface-mutedLight dark:text-surface-mutedDark" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or user ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              />
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {usersList.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const activeGrants = Object.values(u.gymAccess || {}).filter((g: any) => g.status === 'active');

                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-surface-borderLight dark:border-surface-borderDark hover:bg-surface-light/40 dark:hover:bg-[#1b1926]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark truncate">
                            {u.fullName}
                          </p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            u.role === 'super_admin' ? 'bg-amber-500/10 text-amber-500' :
                            u.role === 'gym_owner' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-gray-500/10 text-surface-mutedLight'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark truncate">
                          {u.email}
                        </p>
                        <p className="text-[10px] font-mono text-surface-mutedLight/70 truncate mt-0.5">
                          ID: {u.id}
                        </p>
                      </div>
                    </div>

                    {activeGrants.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex flex-wrap gap-1">
                        {activeGrants.map((ag: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-primary/20 text-primary dark:text-primary-light text-[9px] font-bold"
                          >
                            Facility: {ag.gymName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Authorization Workflow Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {selectedUser ? (
              <form onSubmit={handleConfirmAuthorization} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-6">
                {/* Workflow Step Indicator */}
                <div className="pb-4 border-b border-surface-borderLight dark:border-surface-borderDark">
                  <span className="text-[10px] font-black uppercase text-primary dark:text-primary-light tracking-widest">
                    Role Assignment Workflow
                  </span>
                  <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark mt-0.5">
                    Authorize: {selectedUser.fullName}
                  </h3>
                  <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                    Account: {selectedUser.email} &bull; User ID: <span className="font-mono">{selectedUser.id}</span>
                  </p>
                </div>

                {/* Step 1: Role Type */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark block">
                    1. Assign Role Authority
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setGrantRole('gym_owner')}
                      className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                        grantRole === 'gym_owner'
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-surface-borderLight dark:border-surface-borderDark'
                      }`}
                    >
                      <p className="font-black text-primary dark:text-primary-light">Gym Owner / Director</p>
                      <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark font-normal">
                        Full operational, billing, and member authority over selected facilities.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGrantRole('gym_staff')}
                      className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                        grantRole === 'gym_staff'
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-surface-borderLight dark:border-surface-borderDark'
                      }`}
                    >
                      <p className="font-black text-indigo-400">Gym Manager / Staff</p>
                      <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark font-normal">
                        Roster check-ins, attendance, and member inquiries oversight.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Step 2: Multi-Gym Facility Assignment */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark block">
                    2. Select Facility Scope (Multi-Gym Grant Supported)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {gymsList.map((g) => {
                      const isChecked = selectedGymIds.includes(g.id);
                      const currentGrant = selectedUser.gymAccess ? selectedUser.gymAccess[g.id] : null;

                      return (
                        <div
                          key={g.id}
                          onClick={() => toggleGymSelection(g.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? 'border-primary bg-primary/10'
                              : 'border-surface-borderLight dark:border-surface-borderDark'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'border-primary bg-primary text-white' : 'border-surface-borderLight'
                            }`}>
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                            <div>
                              <p className="font-bold text-textPrimary-light dark:text-textPrimary-dark">{g.name}</p>
                              <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">{g.city} &bull; Code: {g.joinCode}</span>
                            </div>
                          </div>

                          {currentGrant && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              currentGrant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                              currentGrant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {currentGrant.status}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Granular 10 Permissions Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-wider text-textPrimary-light dark:text-textPrimary-dark">
                      3. Granular Permission Clearances ({selectedPermissions.length}/10)
                    </label>
                    <div className="flex space-x-2 text-[10px] font-bold text-primary dark:text-primary-light">
                      <button type="button" onClick={handleSelectAllPermissions} className="hover:underline cursor-pointer">
                        Select All
                      </button>
                      <span>&bull;</span>
                      <button type="button" onClick={handleClearAllPermissions} className="hover:underline cursor-pointer">
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {GRANULAR_PERMISSIONS.map((perm) => {
                      const isGranted = selectedPermissions.includes(perm.id);

                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                            isGranted
                              ? 'border-primary bg-primary/10'
                              : 'border-surface-borderLight dark:border-surface-borderDark'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isGranted ? 'border-primary bg-primary text-white' : 'border-surface-borderLight'
                          }`}>
                            {isGranted && <Check size={11} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="font-bold text-textPrimary-light dark:text-textPrimary-dark">{perm.label}</p>
                            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark leading-tight block mt-0.5">
                              {perm.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-surface-borderLight dark:border-surface-borderDark flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center space-x-2">
                    {Object.keys(selectedUser.gymAccess || {}).map((gid) => {
                      const gObj = selectedUser.gymAccess[gid];
                      return (
                        <div key={gid} className="flex items-center space-x-1.5 p-1 px-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] text-[10px]">
                          <span className="font-bold">{gid}:</span>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(gid, gObj.status)}
                            className="font-bold text-amber-500 hover:underline cursor-pointer"
                          >
                            {gObj.status === 'suspended' ? 'Restore' : 'Suspend'}
                          </button>
                          <span>&bull;</span>
                          <button
                            type="button"
                            onClick={() => handleRevokeGym(gid)}
                            className="font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || selectedGymIds.length === 0}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    <span>{submitting ? 'Committing Clearance...' : 'Confirm Authorization'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-[#252330] rounded-3xl border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight">
                <Users className="mx-auto mb-2 opacity-30" size={40} />
                <p className="font-bold">Select any registered user on the left to configure Gym Owner privileges.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPLETE AUTHORIZATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-surface-borderLight dark:border-surface-borderDark">
            <div>
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Immutable Role Authorization Audit History
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Permanent ledger recording all Super Host privilege grants, revocations, and granular updates.
              </p>
            </div>
            <span className="text-[10px] font-mono text-surface-mutedLight dark:text-surface-mutedDark">
              {authHistory.length} Recorded Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light/50 dark:bg-[#1b1926]/50 text-surface-mutedLight dark:text-surface-mutedDark font-black uppercase text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Super Host Actor</th>
                  <th className="py-2.5 px-3">Authorization Action</th>
                  <th className="py-2.5 px-3">Target Account / Facility</th>
                  <th className="py-2.5 px-3">Security Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {authHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-light/30 dark:hover:bg-[#1b1926]/30">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {item.actorEmail}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.action.includes('GRANT') ? 'bg-emerald-500/10 text-emerald-400' :
                        item.action.includes('REVOKE') ? 'bg-rose-500/10 text-rose-400' :
                        item.action.includes('SUSPEND') ? 'bg-amber-500/10 text-amber-400' :
                        'bg-primary/10 text-primary dark:text-primary-light'
                      }`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {item.targetId}
                    </td>
                    <td className="py-2.5 px-3 text-surface-mutedLight dark:text-surface-mutedDark">
                      {item.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
