import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  X,
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  Clock,
  Mail,
  ChevronRight,
  AlertTriangle,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { TeamMember, TeamInvite, TeamRole, AuditLogItem } from '../../types';

// ===== Constants =====

const ALL_ROLES: { value: TeamRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'support_team', label: 'Support Team' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'gym_manager', label: 'Gym Manager' },
  { value: 'custom_role', label: 'Custom Role' },
];

const ALL_PERMISSIONS = [
  'manage_users',
  'manage_gyms',
  'manage_subscriptions',
  'manage_content',
  'view_analytics',
  'manage_billing',
  'manage_roles',
  'moderate_community',
  'access_audit_logs',
  'manage_trainers',
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-500/15 text-red-500',
  admin: 'bg-purple-500/15 text-purple-500',
  finance_manager: 'bg-emerald-500/15 text-emerald-500',
  support_team: 'bg-blue-500/15 text-blue-500',
  moderator: 'bg-amber-500/15 text-amber-500',
  gym_manager: 'bg-indigo-500/15 text-indigo-500',
  custom_role: 'bg-gray-500/15 text-gray-400',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-500',
  invited: 'bg-blue-500/15 text-blue-400',
  suspended: 'bg-amber-500/15 text-amber-500',
  revoked: 'bg-red-500/15 text-red-500',
};

const INVITE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-500',
  accepted: 'bg-emerald-500/15 text-emerald-500',
  expired: 'bg-gray-500/15 text-gray-400',
  revoked: 'bg-red-500/15 text-red-500',
};

// ===== Props =====

interface AdminMyTeamScreenProps {
  onNavigate: (screen: string) => void;
}

// ===== Component =====

export const AdminMyTeamScreen: React.FC<AdminMyTeamScreenProps> = ({ onNavigate }) => {
  // ----- State -----
  const [activeTab, setActiveTab] = useState<'members' | 'audit'>('members');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('support_team');
  const [invitePermissions, setInvitePermissions] = useState<string[]>([]);
  const [inviteAllowedGyms, setInviteAllowedGyms] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  // Edit Permissions Modal
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editAllowedGyms, setEditAllowedGyms] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ----- Data fetching -----

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminTeam();
      setTeamMembers(res.teamMembers || []);
      setInvites(res.invites || []);
    } catch (err) {
      console.error('Failed to load admin team:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const res = await api.getTeamAuditLogs();
      setAuditLogs(res.auditLogs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit' && auditLogs.length === 0) {
      loadAuditLogs();
    }
  }, [activeTab]);

  // ----- Actions -----

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      setInviteSubmitting(true);
      const gymsArr = inviteAllowedGyms.trim()
        ? inviteAllowedGyms.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;
      await api.inviteTeamMember({
        email: inviteEmail.trim(),
        role: inviteRole,
        permissions: invitePermissions.length > 0 ? invitePermissions : undefined,
        allowedGyms: gymsArr,
      });
      setShowInviteModal(false);
      resetInviteForm();
      loadTeam();
    } catch (err) {
      console.error('Failed to invite team member:', err);
    } finally {
      setInviteSubmitting(false);
    }
  };

  const resetInviteForm = () => {
    setInviteEmail('');
    setInviteRole('support_team');
    setInvitePermissions([]);
    setInviteAllowedGyms('');
  };

  const handleEditPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    try {
      setEditSubmitting(true);
      const gymsArr = editAllowedGyms.trim()
        ? editAllowedGyms.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      await api.updateTeamMemberPermissions(editMember.id, {
        permissions: editPermissions,
        allowedGyms: gymsArr,
      });
      setEditMember(null);
      loadTeam();
    } catch (err) {
      console.error('Failed to update permissions:', err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const newStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      await api.setTeamMemberStatus(member.id, newStatus);
      loadTeam();
    } catch (err) {
      console.error('Failed to toggle member status:', err);
    }
  };

  const handleRemove = async (member: TeamMember) => {
    if (!window.confirm(`Remove ${member.fullName || member.email} from the team? This action cannot be undone.`)) return;
    try {
      await api.removeTeamMember(member.id);
      loadTeam();
    } catch (err) {
      console.error('Failed to remove team member:', err);
    }
  };

  const openEditModal = (member: TeamMember) => {
    setEditMember(member);
    setEditPermissions([...member.permissions]);
    setEditAllowedGyms(
      Array.isArray(member.allowedGyms) ? member.allowedGyms.join(', ') : member.allowedGyms === 'all' ? 'all' : ''
    );
  };

  const togglePermission = (perm: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(perm) ? list.filter(p => p !== perm) : [...list, perm]);
  };

  // ----- Filtered members -----

  const filteredMembers = teamMembers.filter(m => {
    const q = search.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  const pendingInvites = invites.filter(inv => inv.status === 'pending');

  // ----- Helpers -----

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const roleLabel = (role: TeamRole) =>
    ALL_ROLES.find(r => r.value === role)?.label || role.replace(/_/g, ' ');

  // ===== Render =====

  return (
    <div className="space-y-6">
      {/* ===== Header Banner ===== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17151F] via-[#241f35] to-primary p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2 border border-primary/40">
              <ShieldCheck size={13} className="text-primary-light" />
              <span>SUPER ADMIN &bull; TEAM MANAGEMENT</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              My Team &amp; Staff Management
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Invite team members, assign roles and granular permissions, manage staff lifecycle, and review audit trails across the platform.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white text-primary font-bold text-xs hover:bg-white/90 transition-colors shadow-lg cursor-pointer flex items-center space-x-1.5"
            >
              <UserPlus size={14} />
              <span>Invite Team Member</span>
            </button>
            <button
              onClick={loadTeam}
              className="px-4 py-2.5 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== KPI Metrics ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Total Members
          </span>
          <span className="text-2xl font-black text-primary dark:text-primary-light mt-1 block">
            {teamMembers.length}
          </span>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            Staff accounts
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Active
          </span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">
            {teamMembers.filter(m => m.status === 'active').length}
          </span>
          <span className="text-[10px] text-emerald-600/80 font-bold mt-0.5 block">
            Currently enabled
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Suspended
          </span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">
            {teamMembers.filter(m => m.status === 'suspended').length}
          </span>
          <span className="text-[10px] text-amber-600/80 font-bold mt-0.5 block">
            Temporarily paused
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Pending Invitations
          </span>
          <span className="text-2xl font-black text-blue-500 mt-1 block">
            {pendingInvites.length}
          </span>
          <span className="text-[10px] text-blue-600/80 font-bold mt-0.5 block">
            Awaiting acceptance
          </span>
        </div>
      </div>

      {/* ===== Tab Bar ===== */}
      <div className="flex space-x-1 p-1 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'members'
              ? 'bg-primary text-white shadow-md'
              : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <Users size={14} />
            <span>Team Members</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-primary text-white shadow-md'
              : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <FileText size={14} />
            <span>Audit Log</span>
          </span>
        </button>
      </div>

      {/* ===== TAB: TEAM MEMBERS ===== */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-mutedLight dark:text-surface-mutedDark" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs text-textPrimary-light dark:text-textPrimary-dark placeholder:text-surface-mutedLight dark:placeholder:text-surface-mutedDark focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">Loading team members…</p>
            </div>
          ) : (
            <>
              {/* Members Table */}
              <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-surface-borderLight dark:border-surface-borderDark">
                        <th className="text-left px-5 py-3.5 text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider">
                          Member
                        </th>
                        <th className="text-left px-5 py-3.5 text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider">
                          Role
                        </th>
                        <th className="text-left px-5 py-3.5 text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-5 py-3.5 text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider">
                          Allowed Gyms
                        </th>
                        <th className="text-left px-5 py-3.5 text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider">
                          Added
                        </th>
                        <th className="text-right px-5 py-3.5 text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-surface-mutedLight dark:text-surface-mutedDark">
                            <Users size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-bold">No team members found</p>
                            <p className="text-xs mt-1">Invite your first team member to get started.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map(member => (
                          <tr
                            key={member.id}
                            className="border-b border-surface-borderLight dark:border-surface-borderDark last:border-b-0 hover:bg-surface-light dark:hover:bg-[#1b1926] transition-colors"
                          >
                            {/* Name & Email */}
                            <td className="px-5 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-black text-sm">
                                  {member.fullName?.charAt(0)?.toUpperCase() || member.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-textPrimary-light dark:text-textPrimary-dark">
                                    {member.fullName || 'Unnamed'}
                                  </p>
                                  <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="px-5 py-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${ROLE_COLORS[member.role] || ROLE_COLORS.custom_role}`}>
                                {roleLabel(member.role)}
                                {member.customRoleName ? ` (${member.customRoleName})` : ''}
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="px-5 py-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${STATUS_COLORS[member.status] || 'bg-gray-500/15 text-gray-400'}`}>
                                {member.status}
                              </span>
                            </td>

                            {/* Allowed Gyms */}
                            <td className="px-5 py-4 max-w-[160px]">
                              {member.allowedGyms === 'all' ? (
                                <span className="text-emerald-500 font-bold text-[10px] uppercase">All Gyms</span>
                              ) : Array.isArray(member.allowedGyms) && member.allowedGyms.length > 0 ? (
                                <span className="text-textPrimary-light dark:text-textPrimary-dark truncate block" title={member.allowedGyms.join(', ')}>
                                  {member.allowedGyms.length} gym{member.allowedGyms.length !== 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="text-surface-mutedLight dark:text-surface-mutedDark">None</span>
                              )}
                            </td>

                            {/* Added Date */}
                            <td className="px-5 py-4 text-surface-mutedLight dark:text-surface-mutedDark whitespace-nowrap">
                              {formatDate(member.invitedAt)}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => openEditModal(member)}
                                  title="Edit Permissions"
                                  className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(member)}
                                  title={member.status === 'active' ? 'Suspend Member' : 'Restore Member'}
                                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                    member.status === 'active'
                                      ? 'hover:bg-amber-500/10 text-amber-500'
                                      : 'hover:bg-emerald-500/10 text-emerald-500'
                                  }`}
                                >
                                  {member.status === 'active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                                </button>
                                <button
                                  onClick={() => handleRemove(member)}
                                  title="Remove Member"
                                  className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Invitations Section */}
              {pendingInvites.length > 0 && (
                <div className="rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400 font-bold text-sm">
                    <Mail size={18} />
                    <span>Pending Invitations ({pendingInvites.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingInvites.map(invite => (
                      <div
                        key={invite.id}
                        className="p-5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                                {invite.email}
                              </h4>
                              <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                                Invited by: {invite.createdBy}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${INVITE_STATUS_COLORS[invite.status] || 'bg-gray-500/15 text-gray-400'}`}>
                              {invite.status}
                            </span>
                          </div>

                          <div className="mt-3 space-y-1 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                            <div className="flex items-center space-x-1.5">
                              <ShieldCheck size={12} />
                              <span>Role: <strong className="text-textPrimary-light dark:text-textPrimary-dark">{roleLabel(invite.role)}</strong></span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <Clock size={12} />
                              <span>Sent: {formatDate(invite.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <AlertTriangle size={12} />
                              <span>Expires: {formatDate(invite.expiresAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== TAB: AUDIT LOG ===== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
              Team Audit Trail
            </h3>
            <button
              onClick={loadAuditLogs}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark hover:border-primary transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              <RefreshCw size={14} className={auditLoading ? 'animate-spin' : ''} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {auditLoading ? (
            <div className="text-center py-16">
              <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">Loading audit logs…</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm px-5 py-16 text-center">
              <FileText size={32} className="mx-auto mb-2 opacity-30 text-surface-mutedLight dark:text-surface-mutedDark" />
              <p className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">No audit entries</p>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">Team audit events will appear here once actions are performed.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
              <div className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 hover:bg-surface-light dark:hover:bg-[#1b1926] transition-colors"
                  >
                    {/* Timeline Dot */}
                    <div className="flex items-center space-x-3 md:w-48 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                      <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>

                    {/* Actor */}
                    <div className="md:w-40 shrink-0">
                      <p className="text-xs font-bold text-primary dark:text-primary-light truncate">
                        {log.actorEmail}
                      </p>
                      <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase font-bold">
                        {log.actorRole}
                      </p>
                    </div>

                    {/* Action & Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary dark:text-primary-light whitespace-nowrap">
                          {log.action}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark whitespace-nowrap">
                          {log.targetType}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 truncate">
                          {log.details}
                        </p>
                      )}
                    </div>

                    {/* IP */}
                    {log.ipAddress && (
                      <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark font-mono shrink-0">
                        {log.ipAddress}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== MODAL: Invite Team Member ===== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Invite Team Member
                </h3>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                  Send an invitation email with assigned role and permissions.
                </p>
              </div>
              <button
                onClick={() => { setShowInviteModal(false); resetInviteForm(); }}
                className="p-2 rounded-xl hover:bg-surface-light dark:hover:bg-[#1b1926] transition-colors cursor-pointer"
              >
                <X size={18} className="text-surface-mutedLight dark:text-surface-mutedDark" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs text-textPrimary-light dark:text-textPrimary-dark placeholder:text-surface-mutedLight focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider block mb-1.5">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs text-textPrimary-light dark:text-textPrimary-dark focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  {ALL_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider block mb-1.5">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map(perm => (
                    <label
                      key={perm}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs text-textPrimary-light dark:text-textPrimary-dark cursor-pointer hover:border-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={invitePermissions.includes(perm)}
                        onChange={() => togglePermission(perm, invitePermissions, setInvitePermissions)}
                        className="rounded accent-primary"
                      />
                      <span className="capitalize">{perm.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allowed Gyms */}
              <div>
                <label className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider block mb-1.5">
                  Allowed Gym IDs <span className="normal-case font-normal">(comma-separated, leave empty for none)</span>
                </label>
                <input
                  type="text"
                  value={inviteAllowedGyms}
                  onChange={(e) => setInviteAllowedGyms(e.target.value)}
                  placeholder="gym_id_1, gym_id_2"
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs text-textPrimary-light dark:text-textPrimary-dark placeholder:text-surface-mutedLight focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowInviteModal(false); resetInviteForm(); }}
                  className="px-4 py-2.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark hover:border-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting || !inviteEmail.trim()}
                  className="px-5 py-2.5 rounded-2xl gradient-btn-primary text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  {inviteSubmitting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  <span>{inviteSubmitting ? 'Sending…' : 'Send Invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: Edit Permissions ===== */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Edit Permissions
                </h3>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                  Update permissions and gym access for <strong className="text-primary">{editMember.fullName || editMember.email}</strong>.
                </p>
              </div>
              <button
                onClick={() => setEditMember(null)}
                className="p-2 rounded-xl hover:bg-surface-light dark:hover:bg-[#1b1926] transition-colors cursor-pointer"
              >
                <X size={18} className="text-surface-mutedLight dark:text-surface-mutedDark" />
              </button>
            </div>

            <form onSubmit={handleEditPermissions} className="space-y-4">
              {/* Current Role (read-only) */}
              <div>
                <label className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider block mb-1.5">
                  Current Role
                </label>
                <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${ROLE_COLORS[editMember.role] || ROLE_COLORS.custom_role}`}>
                  {roleLabel(editMember.role)}
                </span>
              </div>

              {/* Permissions */}
              <div>
                <label className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider block mb-1.5">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map(perm => (
                    <label
                      key={perm}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs text-textPrimary-light dark:text-textPrimary-dark cursor-pointer hover:border-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={editPermissions.includes(perm)}
                        onChange={() => togglePermission(perm, editPermissions, setEditPermissions)}
                        className="rounded accent-primary"
                      />
                      <span className="capitalize">{perm.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allowed Gyms */}
              <div>
                <label className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark tracking-wider block mb-1.5">
                  Allowed Gym IDs <span className="normal-case font-normal">(comma-separated, or "all")</span>
                </label>
                <input
                  type="text"
                  value={editAllowedGyms}
                  onChange={(e) => setEditAllowedGyms(e.target.value)}
                  placeholder="gym_id_1, gym_id_2 or all"
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs text-textPrimary-light dark:text-textPrimary-dark placeholder:text-surface-mutedLight focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMember(null)}
                  className="px-4 py-2.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark hover:border-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2.5 rounded-2xl gradient-btn-primary text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  {editSubmitting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  <span>{editSubmitting ? 'Saving…' : 'Save Permissions'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
