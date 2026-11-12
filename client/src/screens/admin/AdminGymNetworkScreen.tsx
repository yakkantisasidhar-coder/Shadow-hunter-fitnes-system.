import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  History, 
  FileText, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  Lock,
  Phone,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AdminGymNetworkScreenProps {
  onNavigate: (screen: string) => void;
}

export const AdminGymNetworkScreen: React.FC<AdminGymNetworkScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [gyms, setGyms] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending_review' | 'unclaimed'>('all');

  // Modals
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState<any | null>(null);
  const [ownershipModal, setOwnershipModal] = useState<any | null>(null);
  const [newOwnerUserId, setNewOwnerUserId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [netRes, claimRes] = await Promise.all([
        api.getAdminGymNetwork(),
        api.getAdminClaims()
      ]);
      setGyms(netRes.gyms || []);
      setClaims(claimRes.claims || []);
    } catch (err) {
      console.error('Failed to load gym network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewClaim = async (status: 'approved' | 'rejected' | 'under_review') => {
    if (!selectedClaim) return;
    try {
      await api.reviewGymClaim(selectedClaim.id, {
        status,
        reviewNotes
      });
      setSelectedClaim(null);
      setReviewNotes('');
      loadData();
    } catch (err) {
      console.error('Error reviewing claim:', err);
    }
  };

  const handleToggleGymStatus = async (gymId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    try {
      await api.setGymStatus(gymId, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to toggle gym status:', err);
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipModal) return;
    try {
      await api.setGymOwnership(ownershipModal.id, {
        newOwnerUserId: newOwnerUserId || undefined,
        revokeOnly: !newOwnerUserId,
        notes: newOwnerUserId ? 'Super Admin assigned new gym owner.' : 'Super Admin revoked ownership.'
      });
      setOwnershipModal(null);
      setNewOwnerUserId('');
      loadData();
    } catch (err) {
      console.error('Error modifying gym ownership:', err);
    }
  };

  const filteredGyms = gyms.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || 
      g.location.toLowerCase().includes(search.toLowerCase()) ||
      g.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || g.claimStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Super Admin Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              SUPER ADMIN &bull; PLATFORM NETWORK
            </span>
            <span className="text-xs text-surface-mutedLight dark:text-surface-mutedDark font-medium">
              Multi-Facility Governance
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
            Commercial Gym Network & Ownership Claims
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
            Full platform roster of commercial fitness facilities, ownership claim verifications, anti-collision guards, and license lifecycle controls.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark hover:border-primary transition-colors flex items-center space-x-1.5 self-start md:self-auto cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Network</span>
        </button>
      </div>

      {/* KPI Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Total Facilities
          </span>
          <span className="text-2xl font-black text-primary dark:text-primary-light mt-1 block">
            {gyms.length} Commercial Clubs
          </span>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            Across {new Set(gyms.map(g => g.city)).size} Municipalities
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Verified Active Owners
          </span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">
            {gyms.filter(g => g.claimStatus === 'verified').length} Verified
          </span>
          <span className="text-[10px] text-emerald-600/80 font-bold mt-0.5 block">
            Active Multi-Gym Clearance
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Pending Claims Under Review
          </span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">
            {claims.filter(c => c.status === 'pending_review' || c.status === 'under_review').length} Applications
          </span>
          <span className="text-[10px] text-amber-600/80 font-bold mt-0.5 block">
            BRN & Lease Verification
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Network Member Load
          </span>
          <span className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1 block">
            {gyms.reduce((sum, g) => sum + (g.totalMembers || 0), 0)} Athletes
          </span>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            Aggregated Live Memberships
          </span>
        </div>
      </div>

      {/* PENDING CLAIMS SECTION (IF ANY) */}
      {claims.filter(c => c.status === 'pending_review' || c.status === 'under_review').length > 0 && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Facility Ownership Claim Applications Requiring Super Admin Verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.filter(c => c.status === 'pending_review' || c.status === 'under_review').map(claim => (
              <div
                key={claim.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                        {claim.gymName}
                      </h4>
                      <p className="text-xs text-primary font-bold">
                        Claimed by: {claim.claimantName} ({claim.claimantEmail})
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-500">
                      {claim.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                    <div><strong>Business Reg #:</strong> {claim.businessRegistrationNumber}</div>
                    <div><strong>Phone:</strong> {claim.claimantPhone}</div>
                    {claim.physicalAddressProof && (
                      <div><strong>Address Proof:</strong> {claim.physicalAddressProof}</div>
                    )}
                    {claim.reviewNotes && (
                      <div className="italic text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1">
                        Notes: {claim.reviewNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedClaim(claim);
                      setReviewNotes(claim.reviewNotes || '');
                    }}
                    className="px-4 py-1.5 rounded-xl gradient-btn-primary text-white text-xs font-bold cursor-pointer"
                  >
                    Review Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-mutedLight dark:text-surface-mutedDark" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search gym, city, or gym ID..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-surface-borderLight dark:border-surface-borderDark bg-white dark:bg-[#252330] text-xs font-medium"
          />
        </div>

        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            All Facilities ({gyms.length})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'verified' ? 'bg-primary text-white shadow-sm' : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Verified ({gyms.filter(g => g.claimStatus === 'verified').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_review')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'pending_review' ? 'bg-primary text-white shadow-sm' : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Pending Claims ({gyms.filter(g => g.claimStatus === 'pending_review').length})
          </button>
        </div>
      </div>

      {/* GYMS NETWORK ROSTER TABLE */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Gym Facility</th>
                <th className="py-3 px-4">Owner Account</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Athletes</th>
                <th className="py-3 px-4 text-center">Claim Status</th>
                <th className="py-3 px-4 text-center">License Status</th>
                <th className="py-3 px-4 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
              {filteredGyms.map(gym => (
                <tr key={gym.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={gym.logoUrl}
                        alt={gym.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-surface-borderLight dark:border-surface-borderDark"
                      />
                      <div>
                        <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                          {gym.name}
                        </span>
                        <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark font-mono block">
                          ID: {gym.id} &bull; Code: {gym.joinCode}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                      {gym.ownerName || 'Unassigned'}
                    </span>
                    <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark block">
                      {gym.ownerEmail || 'No verified owner'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-surface-mutedLight dark:text-surface-mutedDark">
                    <div className="flex items-center space-x-1">
                      <MapPin size={12} className="text-primary flex-shrink-0" />
                      <span>{gym.location}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className="text-primary dark:text-primary-light">{gym.activeMembers}</span> / {gym.totalMembers}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      gym.claimStatus === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : gym.claimStatus === 'pending_review'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {gym.claimStatus || 'verified'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      gym.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {gym.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => setShowHistoryModal(gym)}
                      title="View Ownership Timeline"
                      className="px-2.5 py-1 rounded-xl bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light font-bold text-[11px] border border-surface-borderLight dark:border-surface-borderDark cursor-pointer"
                    >
                      <History size={13} className="inline mr-1" />
                      History
                    </button>

                    <button
                      onClick={() => setOwnershipModal(gym)}
                      title="Manage Owner Clearance"
                      className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      <UserCheck size={13} className="inline mr-1" />
                      Ownership
                    </button>

                    <button
                      onClick={() => handleToggleGymStatus(gym.id, gym.status)}
                      title={gym.status === 'approved' ? 'Suspend Gym' : 'Reactivate Gym'}
                      className={`px-2.5 py-1 rounded-xl font-bold text-[11px] cursor-pointer ${
                        gym.status === 'approved'
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                          : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      {gym.status === 'approved' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REVIEW CLAIM */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-lg w-full p-6 border border-surface-borderLight dark:border-surface-borderDark shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
              Review Ownership Claim & Verification
            </h3>

            <div className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2 text-xs">
              <div><strong>Facility:</strong> {selectedClaim.gymName}</div>
              <div><strong>Claimant Name:</strong> {selectedClaim.claimantName}</div>
              <div><strong>Claimant Email:</strong> {selectedClaim.claimantEmail}</div>
              <div><strong>Contact Phone:</strong> {selectedClaim.claimantPhone}</div>
              <div><strong>Business Registration #:</strong> {selectedClaim.businessRegistrationNumber}</div>
              {selectedClaim.physicalAddressProof && (
                <div><strong>Address Proof:</strong> {selectedClaim.physicalAddressProof}</div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">
                Super Admin Verification Notes & Audit Remarks
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="State verified corporate registration documents, phone verification details, or missing items..."
                className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewClaim('rejected')}
                className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-colors"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleReviewClaim('under_review')}
                className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white text-xs font-bold transition-colors"
              >
                Request More Docs
              </button>
              <button
                type="button"
                onClick={() => handleReviewClaim('approved')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold shadow-md"
              >
                Approve & Grant Ownership
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GYM OWNERSHIP TIMELINE & HISTORY */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-lg w-full p-6 border border-surface-borderLight dark:border-surface-borderDark shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Facility Ownership & Governance Timeline
                </h3>
                <p className="text-xs text-primary font-bold">{showHistoryModal.name}</p>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light">
                &times;
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {(showHistoryModal.ownershipHistory || []).map((h: any, i: number) => (
                <div key={i} className="p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-primary">{h.action}</span>
                    <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">{new Date(h.date).toLocaleDateString()}</span>
                  </div>
                  <div><strong>Owner:</strong> {h.ownerName} (ID: {h.ownerId})</div>
                  <div><strong>Actor:</strong> {h.actor}</div>
                  {h.notes && <div className="italic text-surface-mutedLight dark:text-surface-mutedDark">"{h.notes}"</div>}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHistoryModal(null)}
                className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT OWNERSHIP ASSIGNMENT */}
      {ownershipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 border border-surface-borderLight dark:border-surface-borderDark shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
              Assign or Revoke Ownership for {ownershipModal.name}
            </h3>

            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark block mb-1">
                  Assign New Owner User ID
                </label>
                <input
                  type="text"
                  value={newOwnerUserId}
                  onChange={e => setNewOwnerUserId(e.target.value)}
                  placeholder="e.g. user-owner-1 or user-athlete-1 (leave blank to revoke)"
                  className="w-full px-3 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-xs font-bold"
                />
                <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">
                  Tip: Leaving blank and submitting will revoke ownership and set the facility to Unclaimed.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOwnershipModal(null)}
                  className="px-4 py-2 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
                >
                  Save Ownership Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
