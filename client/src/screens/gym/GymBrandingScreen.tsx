import React, { useEffect, useState } from 'react';
import {
  Palette,
  Image,
  Globe,
  Tag,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Eye,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Crown,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GymBranding, GymGalleryItem } from '../../types';

interface GymBrandingScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymBrandingScreen: React.FC<GymBrandingScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const gymId = user?.gymId || 'gym-apex-1';

  // Branding state
  const [branding, setBranding] = useState<GymBranding | null>(null);
  const [brandingForm, setBrandingForm] = useState({
    primaryColor: '#7651D5',
    secondaryColor: '#A58AF5',
    logoUrl: '',
    coverImageUrl: '',
    tagline: '',
    customDomain: '',
    whiteLabelEnabled: false,
  });
  const [brandingLoading, setBrandingLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [brandingSaved, setBrandingSaved] = useState(false);

  // Gallery state
  const [gallery, setGallery] = useState<GymGalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  // Add image modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [addingImage, setAddingImage] = useState(false);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reordering
  const [reordering, setReordering] = useState(false);

  // Fetch branding data
  const fetchBranding = async () => {
    try {
      setBrandingLoading(true);
      const res = await api.getGymBranding(gymId);
      setBranding(res.branding);
      setBrandingForm({
        primaryColor: res.branding.primaryColor || '#7651D5',
        secondaryColor: res.branding.secondaryColor || '#A58AF5',
        logoUrl: res.branding.logoUrl || '',
        coverImageUrl: res.branding.coverImageUrl || '',
        tagline: res.branding.tagline || '',
        customDomain: res.branding.customDomain || '',
        whiteLabelEnabled: res.branding.whiteLabelEnabled || false,
      });
    } catch (err) {
      console.error('Failed to load branding:', err);
    } finally {
      setBrandingLoading(false);
    }
  };

  // Fetch gallery data
  const fetchGallery = async () => {
    try {
      setGalleryLoading(true);
      const res = await api.getGymGallery(gymId);
      const sorted = [...res.gallery].sort((a, b) => a.displayOrder - b.displayOrder);
      setGallery(sorted);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
    fetchGallery();
  }, [gymId]);

  // Save branding
  const handleSaveBranding = async () => {
    try {
      setSavingBranding(true);
      await api.updateGymBranding(gymId, {
        primaryColor: brandingForm.primaryColor,
        secondaryColor: brandingForm.secondaryColor,
        logoUrl: brandingForm.logoUrl,
        coverImageUrl: brandingForm.coverImageUrl,
        tagline: brandingForm.tagline,
        whiteLabelEnabled: brandingForm.whiteLabelEnabled,
      });
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 3000);
      await fetchBranding();
    } catch (err) {
      console.error('Failed to save branding:', err);
    } finally {
      setSavingBranding(false);
    }
  };

  // Add gallery image
  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;
    try {
      setAddingImage(true);
      await api.addGymGalleryImage(gymId, {
        imageUrl: newImageUrl.trim(),
        caption: newImageCaption.trim() || undefined,
      });
      setNewImageUrl('');
      setNewImageCaption('');
      setShowAddModal(false);
      await fetchGallery();
    } catch (err) {
      console.error('Failed to add gallery image:', err);
    } finally {
      setAddingImage(false);
    }
  };

  // Delete gallery image
  const handleDeleteImage = async (imageId: string) => {
    try {
      setDeletingId(imageId);
      await api.deleteGymGalleryImage(gymId, imageId);
      setDeleteConfirmId(null);
      await fetchGallery();
    } catch (err) {
      console.error('Failed to delete image:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Move gallery image up/down
  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === gallery.length - 1)
    ) return;

    const newGallery = [...gallery];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newGallery[index], newGallery[swapIndex]] = [newGallery[swapIndex], newGallery[index]];

    setGallery(newGallery);
    setReordering(true);

    try {
      const orderedIds = newGallery.map((item) => item.id);
      await api.reorderGymGallery(gymId, orderedIds);
    } catch (err) {
      console.error('Failed to reorder gallery:', err);
      await fetchGallery();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#1e1b2e] to-primary p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2">
            <Palette size={12} className="text-primary-light" />
            <span>Gym Branding &amp; Gallery</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">
            Customize Your Gym's Identity
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Manage your gym's colors, logo, cover image, tagline, and photo gallery
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-secondary/15 blur-2xl" />
      </div>

      {/* ==================== BRANDING SETTINGS ==================== */}
      <div className="bg-[#252330] rounded-3xl p-6 shadow-lg border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Palette size={18} className="text-primary-light" />
              Branding Settings
            </h3>
            <p className="text-xs text-white/50 mt-1">Configure your gym's visual identity</p>
          </div>
          {brandingSaved && (
            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
              ✓ Saved successfully
            </span>
          )}
        </div>

        {brandingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary-light" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Color Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandingForm.primaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandingForm.primaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                    className="flex-1 bg-[#17151F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="#7651D5"
                  />
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white/10 shadow-inner"
                    style={{ backgroundColor: brandingForm.primaryColor }}
                    title="Primary color preview"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandingForm.secondaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandingForm.secondaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })}
                    className="flex-1 bg-[#17151F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="#A58AF5"
                  />
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white/10 shadow-inner"
                    style={{ backgroundColor: brandingForm.secondaryColor }}
                    title="Secondary color preview"
                  />
                </div>
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">Logo URL</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={brandingForm.logoUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    className="w-full bg-[#17151F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                {brandingForm.logoUrl && (
                  <div className="w-12 h-12 rounded-xl border-2 border-white/10 overflow-hidden bg-[#17151F] flex-shrink-0">
                    <img
                      src={brandingForm.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">Cover Image URL</label>
              <input
                type="text"
                value={brandingForm.coverImageUrl}
                onChange={(e) => setBrandingForm({ ...brandingForm, coverImageUrl: e.target.value })}
                className="w-full bg-[#17151F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="https://example.com/cover.jpg"
              />
              {brandingForm.coverImageUrl && (
                <div className="mt-3 h-32 rounded-2xl border-2 border-white/10 overflow-hidden bg-[#17151F]">
                  <img
                    src={brandingForm.coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">
                <Tag size={12} className="inline mr-1" />
                Tagline
              </label>
              <input
                type="text"
                value={brandingForm.tagline}
                onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                className="w-full bg-[#17151F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Your gym's tagline or motto..."
              />
            </div>

            {/* Custom Domain */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">
                <Globe size={12} className="inline mr-1" />
                Custom Domain
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={brandingForm.customDomain}
                  readOnly
                  className="w-full bg-[#17151F]/50 border border-white/5 rounded-2xl px-4 py-2.5 text-sm text-white/40 cursor-not-allowed"
                  placeholder="yourgym.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <Crown size={12} className="text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">Premium Feature</span>
                </div>
              </div>
              <p className="text-[10px] text-white/30 mt-1.5 ml-1">
                Custom domains are available on the White Label Pro plan. Contact support to upgrade.
              </p>
            </div>

            {/* White-Label Toggle */}
            <div className="flex items-center justify-between bg-[#17151F] rounded-2xl px-4 py-3.5 border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">White-Label Mode</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Remove Shadow Hunter branding from your gym's public pages
                </p>
              </div>
              <button
                onClick={() =>
                  setBrandingForm({ ...brandingForm, whiteLabelEnabled: !brandingForm.whiteLabelEnabled })
                }
                className="flex-shrink-0"
              >
                {brandingForm.whiteLabelEnabled ? (
                  <ToggleRight size={36} className="text-primary-light" />
                ) : (
                  <ToggleLeft size={36} className="text-white/30" />
                )}
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveBranding}
                disabled={savingBranding}
                className="gradient-btn-primary px-6 py-2.5 rounded-2xl text-white font-bold text-xs inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
              >
                {savingBranding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {savingBranding ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== GYM GALLERY ==================== */}
      <div className="bg-[#252330] rounded-3xl p-6 shadow-lg border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Image size={18} className="text-primary-light" />
              Gym Gallery
            </h3>
            <p className="text-xs text-white/50 mt-1">Showcase your facility with stunning photos</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-btn-primary px-4 py-2 rounded-2xl text-white font-bold text-xs inline-flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
          >
            <Plus size={14} />
            Add Image
          </button>
        </div>

        {galleryLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary-light" />
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-12">
            <Image size={40} className="mx-auto text-white/15 mb-3" />
            <p className="text-sm text-white/40 font-bold">No gallery images yet</p>
            <p className="text-xs text-white/25 mt-1">Add photos of your gym to attract new members</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((item, index) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#17151F]"
              >
                {/* Image */}
                <div className="aspect-video overflow-hidden bg-[#17151F]">
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).alt = 'Image failed to load';
                    }}
                  />
                </div>

                {/* Caption & Controls */}
                <div className="p-3">
                  <p className="text-xs text-white/70 font-medium truncate">
                    {item.caption || 'No caption'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {/* Reorder buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveImage(index, 'up')}
                        disabled={index === 0 || reordering}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveImage(index, 'down')}
                        disabled={index === gallery.length - 1 || reordering}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Delete button */}
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-amber-400 font-bold">Delete?</span>
                        <button
                          onClick={() => handleDeleteImage(item.id)}
                          disabled={deletingId === item.id}
                          className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded-lg bg-white/5 text-white/50 text-[10px] font-bold hover:bg-white/10 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== ADD IMAGE MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#252330] rounded-3xl shadow-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-base font-black text-white">Add Gallery Image</h4>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewImageUrl('');
                  setNewImageCaption('');
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-2">Image URL *</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-[#17151F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="https://example.com/gym-photo.jpg"
                  autoFocus
                />
              </div>

              {newImageUrl && (
                <div className="h-32 rounded-2xl border border-white/10 overflow-hidden bg-[#17151F]">
                  <img
                    src={newImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white/70 mb-2">Caption</label>
                <input
                  type="text"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  className="w-full bg-[#17151F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Describe this photo..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewImageUrl('');
                    setNewImageCaption('');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 text-white/60 font-bold text-xs hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim() || addingImage}
                  className="gradient-btn-primary px-5 py-2.5 rounded-2xl text-white font-bold text-xs inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
                >
                  {addingImage ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  {addingImage ? 'Adding...' : 'Add Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
