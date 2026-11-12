import React, { useEffect, useState } from 'react';
import { Camera, Plus, ArrowLeft, ArrowRight, Lock, Eye, Check } from 'lucide-react';
import { api } from '../../services/api';
import { ProgressPhoto } from '../../types';

interface ProgressPhotosScreenProps {
  onNavigate: (screen: string) => void;
}

export const ProgressPhotosScreen: React.FC<ProgressPhotosScreenProps> = ({ onNavigate }) => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<'all' | 'front' | 'side' | 'back'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [imageUrl, setImageUrl] = useState('');
  const [tag, setTag] = useState<'front' | 'side' | 'back'>('front');
  const [weightKg, setWeightKg] = useState<number>(84);
  const [notes, setNotes] = useState('');

  const fetchPhotos = async () => {
    try {
      const res = await api.getProgressPhotos();
      setPhotos(res.photos || []);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    try {
      await api.logProgressPhoto({
        imageUrl,
        tag,
        weightKg,
        notes
      });
      setShowAddModal(false);
      setImageUrl('');
      setNotes('');
      fetchPhotos();
    } catch (err) {
      console.error('Failed to add photo:', err);
    }
  };

  const filteredPhotos = selectedTag === 'all' 
    ? photos 
    : photos.filter(p => p.tag === selectedTag);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('progress')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Progress Dashboard</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Visual Transformation Gallery
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Private, secure side-by-side photo comparison documenting physical recomposition.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5"
        >
          <Camera size={16} />
          <span>Upload Progress Photo</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Feature Card */}
      {photos.length >= 2 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Baseline vs. Latest Transformation Comparison
            </h3>
            <span className="text-[11px] font-bold text-primary dark:text-primary-light">
              Front Profile View
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black/5 dark:bg-black/30 border border-surface-borderLight dark:border-surface-borderDark">
              <img
                src={photos[0].imageUrl}
                alt="Baseline"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Baseline Photo</span>
                <span className="text-xs font-black">{photos[0].date} &bull; {photos[0].weightKg} kg</span>
                <p className="text-[10px] opacity-80 mt-0.5">{photos[0].notes}</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black/5 dark:bg-black/30 border border-surface-borderLight dark:border-surface-borderDark">
              <img
                src={photos[photos.length - 1].imageUrl}
                alt="Latest"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-400">Latest Follow-up</span>
                <span className="text-xs font-black">{photos[photos.length - 1].date} &bull; {photos[photos.length - 1].weightKg} kg</span>
                <p className="text-[10px] opacity-80 mt-0.5">{photos[photos.length - 1].notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Photo Stream */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {(['all', 'front', 'side', 'back'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedTag === t
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
            <Lock size={13} />
            <span>Encrypted & 100% Private</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-2xl overflow-hidden bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col"
            >
              <div className="relative aspect-[3/4] bg-black/10">
                <img
                  src={photo.imageUrl}
                  alt={photo.notes || 'Progress Photo'}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-sm">
                  {photo.tag}
                </span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-primary dark:text-primary-light font-bold block">{photo.date}</span>
                <span className="text-xs font-extrabold text-textPrimary-light dark:text-textPrimary-dark">{photo.weightKg} kg</span>
                {photo.notes && (
                  <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark truncate mt-0.5">
                    {photo.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">
              Upload Progress Photo
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Add your secure progress photo link or file URL. Stored with client-side privacy controls.
            </p>

            <form onSubmit={handleAddPhoto} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Perspective Tag</label>
                  <select
                    value={tag}
                    onChange={(e: any) => setTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                  >
                    <option value="front">Front View</option>
                    <option value="side">Side View</option>
                    <option value="back">Back View</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Session Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Week 4 check-in, morning fasted"
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
                  Save Photo Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
