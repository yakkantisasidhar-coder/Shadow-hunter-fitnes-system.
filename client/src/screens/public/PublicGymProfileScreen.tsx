import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Star, 
  Award, 
  Dumbbell, 
  Users, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Share2
} from 'lucide-react';
import { api } from '../../services/api';

interface PublicGymProfileScreenProps {
  gymId: string;
  onNavigate: (screen: string, param?: string) => void;
}

export const PublicGymProfileScreen: React.FC<PublicGymProfileScreenProps> = ({ gymId, onNavigate }) => {
  const [gym, setGym] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  useEffect(() => {
    const fetchGym = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicGym(gymId);
        setGym(res.gym);
      } catch (err: any) {
        setError(err.message || 'Failed to load public gym facility.');
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [gymId]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary animate-pulse" />
        <p className="text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-widest">
          Loading Public Facility Record...
        </p>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-center space-y-4">
        <Building2 className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-textPrimary-light dark:text-textPrimary-dark">Facility Not Found</h3>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
          {error || 'This gym facility profile is not publicly available or pending verification.'}
        </p>
        <button
          onClick={() => onNavigate('leaderboards')}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold inline-flex items-center space-x-1.5"
        >
          <ArrowLeft size={16} />
          <span>Return to Performance Rankings</span>
        </button>
      </div>
    );
  }

  const handleOpenWebsite = () => {
    if (!gym.websiteUrl) return;
    const confirmed = window.confirm(
      `You are navigating to an external verified facility website:\n\n${gym.websiteUrl}\n\nDo you wish to proceed safely?`
    );
    if (confirmed) {
      window.open(gym.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Return Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('leaderboards')}
          className="flex items-center space-x-2 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Rankings</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center space-x-1">
            <ShieldCheck size={12} />
            <span>Verified Facility Profile</span>
          </span>
        </div>
      </div>

      {/* Hero Banner & Logo Header */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-xl">
        <div className="h-56 md:h-72 w-full relative bg-surface-dark">
          <img
            src={gym.coverImageUrl || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80'}
            alt={gym.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17151f] via-transparent to-black/30" />
        </div>

        <div className="relative p-6 md:p-8 -mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
            <img
              src={gym.logoUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80'}
              alt={gym.name}
              className="w-28 h-28 rounded-3xl object-cover ring-4 ring-white dark:ring-[#252330] shadow-2xl bg-white"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark">
                  {gym.name}
                </h1>
                <CheckCircle className="text-primary fill-primary/20 w-6 h-6" />
              </div>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark flex items-center justify-center md:justify-start space-x-1">
                <MapPin size={14} className="text-primary" />
                <span>{gym.locality}, {gym.city}, {gym.district}, {gym.state}</span>
              </p>
            </div>
          </div>

          {/* Website & Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            {gym.websiteUrl && (
              <button
                onClick={handleOpenWebsite}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-black flex items-center space-x-2 shadow-lg shadow-primary/20 hover:opacity-95 transition-all"
              >
                <Globe size={16} />
                <span>Visit Official Website</span>
                <ExternalLink size={14} className="opacity-80" />
              </button>
            )}

            {gym.whatsappBusinessNumber && (
              <a
                href={`https://wa.me/${gym.whatsappBusinessNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <MessageCircle size={16} />
                <span>WhatsApp Desk</span>
              </a>
            )}

            {gym.googleMapsUrl && (
              <a
                href={gym.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <MapPin size={15} />
                <span>Directions</span>
              </a>
            )}
          </div>
        </div>

        {/* Triple Ranking Pill Ribbon */}
        <div className="px-6 md:px-8 py-4 bg-surface-light/60 dark:bg-[#1b1926]/70 border-t border-surface-borderLight dark:border-surface-borderDark grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">District Rank ({gym.district})</span>
            <span className="text-xl font-black text-primary dark:text-primary-light">#{gym.districtRank || 1}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">State Rank ({gym.state})</span>
            <span className="text-xl font-black text-indigo-500">#{gym.stateRank || 2}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">National Standing</span>
            <span className="text-xl font-black text-amber-500">#{gym.nationalRank || 5}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Verified Rating</span>
            <div className="flex items-center justify-center md:justify-start space-x-1 text-xl font-black text-emerald-500">
              <Star size={16} className="fill-emerald-500 text-emerald-500" />
              <span>{gym.verifiedRating || 4.9}</span>
              <span className="text-xs font-normal text-surface-mutedLight dark:text-surface-mutedDark">({gym.reviewCount || 128})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Overview, Facilities, Equipment, Trainers, Gallery, Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Description, Facilities, Trainers, Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Facility Bio & Schedule */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider">
              Facility Overview
            </h3>
            <p className="text-xs leading-relaxed text-surface-mutedLight dark:text-surface-mutedDark">
              {gym.description}
            </p>

            <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center space-x-2 text-surface-mutedLight dark:text-surface-mutedDark">
                <Clock size={16} className="text-primary" />
                <span><strong>Hours:</strong> {gym.openingHours || 'Open Mon-Sun 5:00 AM - 11:00 PM'}</span>
              </div>
              <div className="flex items-center space-x-2 text-surface-mutedLight dark:text-surface-mutedDark">
                <Users size={16} className="text-indigo-500" />
                <span><strong>Active Community:</strong> {gym.memberCount || 88} Verified Athletes</span>
              </div>
            </div>
          </div>

          {/* Verified Equipment & Training Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Dumbbell className="text-primary w-4 h-4" />
                <h4 className="text-xs font-black uppercase text-textPrimary-light dark:text-textPrimary-dark">
                  Certified Equipment
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                {(gym.equipmentList || gym.facilities || []).map((eq: string, idx: number) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{eq}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Award className="text-amber-500 w-4 h-4" />
                <h4 className="text-xs font-black uppercase text-textPrimary-light dark:text-textPrimary-dark">
                  Specialized Services
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                {(gym.trainingServices || ['1-on-1 Certified Personal Coaching', 'Strength & Hypertrophy Periodization', 'Athletic Conditioning']).map((srv: string, idx: number) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{srv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Available Trainers (Clickable to Public Trainer Profile) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider">
                  Accredited Coaching Staff
                </h3>
                <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                  Select any trainer to inspect their verified certifications and student reviews.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(gym.trainers || []).map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => onNavigate('public-trainer', t.id)}
                  className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary cursor-pointer transition-all flex items-center space-x-4 group"
                >
                  <img
                    src={t.profilePhotoUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=150&q=80'}
                    alt={t.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark truncate group-hover:text-primary transition-colors">
                      {t.name}
                    </h4>
                    <span className="text-[10px] text-primary font-bold block truncate">
                      {t.specialty}
                    </span>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star size={11} className="fill-amber-500 mr-0.5" />
                        {t.averageRating || 4.9}
                      </span>
                      <span>&bull;</span>
                      <span>{t.experienceYears} yrs exp</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-surface-mutedLight dark:text-surface-mutedDark group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Public Photo Gallery */}
          {gym.gallery && gym.gallery.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider">
                Facility Gallery & Athletic Grounds
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gym.gallery.map((img: any) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedGalleryImg(img.imageUrl)}
                    className="h-32 rounded-2xl overflow-hidden cursor-pointer relative group border border-surface-borderLight dark:border-surface-borderDark"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || 'Facility photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/70 text-[9px] text-white truncate text-center">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Public Reviews */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider flex items-center space-x-2">
              <span>Verified Public Reviews</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">
                Student & Athlete Feedback
              </span>
            </h3>

            <div className="space-y-3">
              {(gym.publicReviews || []).map((rev: any) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {rev.userName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold flex items-center space-x-0.5">
                        <CheckCircle size={10} />
                        <span>Verified Athlete</span>
                      </span>
                    </div>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
                    "{rev.comment}"
                  </p>
                  <span className="text-[9px] text-surface-mutedLight dark:text-surface-mutedDark block">
                    {new Date(rev.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Official Contact, Membership Plans, Location Map */}
        <div className="space-y-6">
          {/* Public Membership Plans */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider">
              Membership Tiers & Approved Pricing
            </h3>

            <div className="space-y-3">
              {(gym.plans || []).map((plan: any) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {plan.name}
                      </h4>
                      <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase font-bold">
                        {plan.durationMonths} Month Duration
                      </span>
                    </div>
                    <span className="text-base font-black text-primary dark:text-primary-light">
                      ₹{plan.monthlyFee.toLocaleString()}
                    </span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                    {(plan.features || []).map((f: string, i: number) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Official Contact Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark uppercase tracking-wider">
              Facility Contact Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">Address</span>
                  <span className="text-surface-mutedLight dark:text-surface-mutedDark">
                    {gym.address}, {gym.city}, {gym.state}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">Front Desk</span>
                  <a href={`tel:${gym.phone}`} className="text-primary hover:underline">
                    {gym.phone}
                  </a>
                </div>
              </div>

              {gym.businessEmail && (
                <div className="flex items-start space-x-3">
                  <Mail size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">Email Support</span>
                    <a href={`mailto:${gym.businessEmail}`} className="text-primary hover:underline truncate block">
                      {gym.businessEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
