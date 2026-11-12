import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldAlert, ArrowLeft, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { UserProfile } from '../../types';

interface UserAdministrationScreenProps {
  onNavigate: (screen: string) => void;
}

export const UserAdministrationScreen: React.FC<UserAdministrationScreenProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.getAdminUsers({
        search: search || undefined,
        role: roleFilter !== 'All' ? roleFilter : undefined
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleSuspend = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      await api.suspendUser(userId, !currentStatus);
      fetchUsers();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Super Admin Dashboard</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            User Administration & Moderation
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Search all registered platform athletes, gym leaders, and super administrators.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 text-surface-mutedLight dark:text-surface-mutedDark" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
          >
            <option value="All">All Roles</option>
            <option value="individual">Individual</option>
            <option value="gym_member">Gym Member</option>
            <option value="gym_owner">Gym Owner</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role Clearance</th>
                  <th className="py-3 px-4">Facility Scope</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {u.fullName}
                      </div>
                      <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                        {u.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                        u.role === 'super_admin' ? 'bg-rose-500/10 text-rose-500' :
                        u.role === 'gym_owner' ? 'bg-indigo-500/10 text-indigo-500' :
                        u.role === 'gym_member' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-primary/10 text-primary dark:text-primary-light'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-surface-mutedLight dark:text-surface-mutedDark font-medium">
                      {u.gymName || 'Global Platform'}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-primary dark:text-primary-light">
                      {u.subscriptionTier}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                            u.isSuspended
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.isSuspended ? 'Restore Access' : 'Suspend Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
