import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowLeft, Key, Check, Users, Building2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { UserProfile, Gym, UserRole, SubRole } from '../../types';

interface PermissionManagementScreenProps {
  onNavigate: (screen: string) => void;
}

export const PermissionManagementScreen: React.FC<PermissionManagementScreenProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('gym_owner');
  const [selectedGymId, setSelectedGymId] = useState('');
  const [selectedSubRoles, setSelectedSubRoles] = useState<SubRole[]>(['manager']);
  const [successMsg, setSuccessMsg] = useState('');

  const availableSubRoles: { id: SubRole; label: string; desc: string }[] = [
    { id: 'manager', label: 'Gym Manager', desc: 'Can manage member applications and facility information' },
    { id: 'moderator', label: 'Content Moderator', desc: 'Can moderate gym chat announcements and reported items' },
    { id: 'editor', label: 'Workout Program Editor', desc: 'Can author and edit facility workout routines' },
    { id: 'trainer', label: 'Certified Staff Trainer', desc: 'Can manage athlete workout logs and caseloads' }
  ];

  const fetchData = async () => {
    try {
      const [uRes, gRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminGyms()
      ]);
      setUsers(uRes.users || []);
      setGyms(gRes.gyms || []);
      if (uRes.users?.length > 0) {
        setSelectedUserId(uRes.users[0].id);
      }
      if (gRes.gyms?.length > 0) {
        setSelectedGymId(gRes.gyms[0].id);
      }
    } catch (err) {
      console.error('Failed to load permission data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSubRole = (sub: SubRole) => {
    if (selectedSubRoles.includes(sub)) {
      setSelectedSubRoles(selectedSubRoles.filter(s => s !== sub));
    } else {
      setSelectedSubRoles([...selectedSubRoles, sub]);
    }
  };

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      await api.assignUserRole(selectedUserId, {
        role: selectedRole,
        subRoles: selectedSubRoles,
        gymId: selectedRole === 'gym_owner' || selectedRole === 'gym_member' ? selectedGymId : undefined
      });
      setSuccessMsg('Permissions successfully updated and committed to audit log.');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(`Permission grant failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Super Admin Dashboard</span>
        </button>
        <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Granular RBAC & Role Management
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Server-side role assignment scoped to individual commercial gyms or platform-wide Super Admin authorities.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grant Permissions Form */}
      <form onSubmit={handleGrantPermission} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-5">
        <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-2">
          <ShieldCheck size={18} className="text-primary" />
          <span>Assign Role Clearance & Scoped Authorities</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Target User Account</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email}) — Currently: {u.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Primary Role Classification</label>
            <select
              value={selectedRole}
              onChange={(e: any) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
            >
              <option value="individual">Individual Athlete</option>
              <option value="gym_member">Gym Member</option>
              <option value="gym_owner">Gym Owner / Leader</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>
        </div>

        {/* Facility Scope */}
        {(selectedRole === 'gym_owner' || selectedRole === 'gym_member') && (
          <div>
            <label className="block text-xs font-bold mb-1">Assigned Commercial Gym Scope</label>
            <select
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
            >
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.city} &bull; Code: {g.joinCode})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sub-Roles */}
        <div>
          <label className="block text-xs font-bold mb-2">Granular Sub-Role Permissions</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableSubRoles.map((sub) => {
              const isChecked = selectedSubRoles.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => toggleSubRole(sub.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    isChecked
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-surface-borderLight dark:border-surface-borderDark'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isChecked ? 'border-primary bg-primary text-white' : 'border-surface-borderLight dark:border-surface-borderDark'
                    }`}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {sub.label}
                    </h4>
                    <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                      {sub.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95"
        >
          <Key size={16} />
          <span>Commit Role & Permission Modifications</span>
        </button>
      </form>
    </div>
  );
};
