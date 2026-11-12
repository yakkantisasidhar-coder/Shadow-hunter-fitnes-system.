import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Calendar,
  Sparkles,
  Palette,
  Bell,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Smartphone,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Check,
  X,
  ChevronRight,
  Eye,
  Sliders,
  DollarSign,
  Download,
  Flame,
  Award,
  Zap,
  Tag
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  GymWhatsAppIntegration, 
  WhatsAppCampaign, 
  WhatsAppTemplate, 
  WhatsAppMessageLog, 
  WhatsAppAutomationSettings, 
  GymDesignTemplate,
  GymMemberRecord 
} from '../../types';

interface GymWhatsAppCommunicationScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymWhatsAppCommunicationScreen: React.FC<GymWhatsAppCommunicationScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const gymId = user?.gymId || 'gym-apex-1';

  // Navigation Sub-tabs
  type TabType = 
    | 'overview' 
    | 'campaigns' 
    | 'composer' 
    | 'festivals' 
    | 'designer' 
    | 'announcements' 
    | 'automations' 
    | 'history' 
    | 'templates' 
    | 'connection' 
    | 'settings';

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Core Data States
  const [integration, setIntegration] = useState<GymWhatsAppIntegration | null>(null);
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [messageLogs, setMessageLogs] = useState<WhatsAppMessageLog[]>([]);
  const [automations, setAutomations] = useState<WhatsAppAutomationSettings | null>(null);
  const [posters, setPosters] = useState<GymDesignTemplate[]>([]);
  const [members, setMembers] = useState<GymMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer State
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState<WhatsAppCampaign['type']>('general');
  const [compBody, setCompBody] = useState('Hi {{member_name}}! 👋 Hope your workouts are progressing powerfully at {{gym_name}}!');
  const [compAudience, setCompAudience] = useState<'all_consented' | 'active' | 'expiring' | 'pt' | 'group' | 'trial'>('all_consented');
  const [compPosterUrl, setCompPosterUrl] = useState('');
  const [compScheduledAt, setCompScheduledAt] = useState('');
  const [compUrgent, setCompUrgent] = useState(false);
  const [compSending, setCompSending] = useState(false);
  const [compPreview, setCompPreview] = useState<any>(null);

  // Poster Designer State
  const [selectedPoster, setSelectedPoster] = useState<GymDesignTemplate | null>(null);
  const [designerHeadline, setDesignerHeadline] = useState('');
  const [designerSubheadline, setDesignerSubheadline] = useState('');
  const [designerBadge, setDesignerBadge] = useState('');
  const [designerBgUrl, setDesignerBgUrl] = useState('');
  const [designerTextColor, setDesignerTextColor] = useState('#FFFFFF');
  const [designerAccentColor, setDesignerAccentColor] = useState('#7651D5');
  const [designerShowLogo, setDesignerShowLogo] = useState(true);
  const [designerShowContact, setDesignerShowContact] = useState(true);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Connection Credentials State
  const [connPhoneId, setConnPhoneId] = useState('');
  const [connWabaId, setConnWabaId] = useState('');
  const [connToken, setConnToken] = useState('');
  const [connPhone, setConnPhone] = useState('+91 98765 43210');
  const [connName, setConnName] = useState('Apex Performance Athletic Club');
  const [connConnecting, setConnConnecting] = useState(false);

  // History Filters
  const [histCategory, setHistCategory] = useState<string>('all');
  const [histStatus, setHistStatus] = useState<string>('all');
  const [histSearch, setHistSearch] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ==========================================
  // FETCH ALL DATA
  // ==========================================
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [intRes, campRes, tplRes, logRes, autoRes, postRes, memRes] = await Promise.all([
        api.getGymWhatsAppStatus(gymId),
        api.getGymWhatsAppCampaigns(gymId),
        api.getGymWhatsAppTemplates(gymId),
        api.getGymWhatsAppHistory(gymId),
        api.getGymWhatsAppAutomations(gymId),
        api.getGymWhatsAppPosters(gymId),
        api.getGymMembers(gymId)
      ]);

      setIntegration(intRes.integration || null);
      setCampaigns(campRes.campaigns || []);
      setTemplates(tplRes.templates || []);
      setMessageLogs(logRes.logs || []);
      setAutomations(autoRes.settings || null);
      setPosters(postRes.posters || []);
      setMembers(memRes.members || []);

      if (intRes.integration) {
        setConnPhoneId(intRes.integration.phoneNumberId || '');
        setConnWabaId(intRes.integration.wabaId || '');
        setConnPhone(intRes.integration.displayPhoneNumber || '');
        setConnName(intRes.integration.verifiedName || '');
      }

      if (postRes.posters?.length > 0 && !selectedPoster) {
        loadPosterIntoDesigner(postRes.posters[0]);
      }
    } catch (err) {
      console.error('Failed to load WhatsApp suite data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [gymId]);

  // Sync Live Preview when composer body or audience changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (compBody) {
        try {
          const res = await api.previewGymWhatsAppCampaign(gymId, {
            messageBody: compBody,
            targetAudience: compAudience
          });
          setCompPreview(res);
        } catch (e) {
          console.error(e);
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [compBody, compAudience, gymId]);

  // Load a poster into interactive designer form
  const loadPosterIntoDesigner = (p: GymDesignTemplate) => {
    setSelectedPoster(p);
    setDesignerHeadline(p.headline);
    setDesignerSubheadline(p.subheadline);
    setDesignerBadge(p.badgeText || '');
    setDesignerBgUrl(p.backgroundUrl);
    setDesignerTextColor(p.textColor || '#FFFFFF');
    setDesignerAccentColor(p.accentColor || '#7651D5');
    setDesignerShowLogo(p.showLogo);
    setDesignerShowContact(p.showContactInfo);
  };

  // Render HTML5 Poster Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill background
    ctx.fillStyle = '#17151F';
    ctx.fillRect(0, 0, width, height);

    // Draw background image
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = designerBgUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80';
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, width, height);

      // Dark gradient overlay for readable contrast
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(23, 21, 31, 0.45)');
      grad.addColorStop(0.5, 'rgba(23, 21, 31, 0.65)');
      grad.addColorStop(1, 'rgba(23, 21, 31, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Top Gym Brand Badge
      if (designerShowLogo) {
        ctx.fillStyle = designerAccentColor || '#7651D5';
        ctx.beginPath();
        ctx.roundRect(40, 40, 240, 48, 12);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SHADOW HUNTER GYM', 160, 70);
      }

      // Middle Badge / Tag
      if (designerBadge) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeStyle = designerAccentColor || '#7651D5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(40, 200, 280, 40, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = designerAccentColor || '#7651D5';
        ctx.font = 'bold 14px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(designerBadge.toUpperCase(), 180, 226);
      }

      // Headline Text
      ctx.fillStyle = designerTextColor || '#FFFFFF';
      ctx.font = '900 44px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(designerHeadline || 'POWER & PROGRESSION', 40, 310);

      // Subheadline Text
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(designerSubheadline || 'Consistency Defeats Complacency', 40, 360);

      // Footer Contact Info
      if (designerShowContact) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(0, height - 80, width, 80);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('📍 Apex Athletic Facility • WhatsApp Verified Desk: +91 98765 43210', 40, height - 35);
      }
    };
  }, [designerHeadline, designerSubheadline, designerBadge, designerBgUrl, designerTextColor, designerAccentColor, designerShowLogo, designerShowContact]);

  // Handle Save Custom Poster
  const handleSavePoster = async () => {
    try {
      const res = await api.saveGymWhatsAppPoster(gymId, {
        title: designerHeadline.slice(0, 30) || 'Custom Club Poster',
        category: 'announcement',
        subCategory: 'custom',
        backgroundUrl: designerBgUrl,
        headline: designerHeadline,
        subheadline: designerSubheadline,
        badgeText: designerBadge,
        textColor: designerTextColor,
        accentColor: designerAccentColor,
        showLogo: designerShowLogo,
        showContactInfo: designerShowContact
      });
      alert('Poster successfully saved to gym library!');
      fetchAllData();
    } catch (e: any) {
      alert(`Failed to save poster: ${e.message}`);
    }
  };

  // Handle AI Poster Generation
  const handleGenerateAiPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput) return;
    try {
      setAiGenerating(true);
      const res = await api.generateAiGymPoster(gymId, { prompt: aiPromptInput });
      if (res.poster) {
        loadPosterIntoDesigner(res.poster);
        setPosters(prev => [res.poster, ...prev]);
      }
      setAiPromptInput('');
    } catch (err: any) {
      alert(`AI Generation failed: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Handle Campaign Dispatch
  const handleDispatchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compBody) return;
    try {
      setCompSending(true);
      await api.dispatchGymWhatsAppCampaign(gymId, {
        name: compName,
        type: compType,
        messageBody: compBody,
        posterImageUrl: compPosterUrl || undefined,
        targetAudience: compAudience,
        scheduledAt: compScheduledAt || undefined,
        urgent: compUrgent
      });
      alert('Campaign dispatched successfully!');
      setCompName('');
      setActiveTab('campaigns');
      fetchAllData();
    } catch (err: any) {
      alert(`Dispatch Error: ${err.message}`);
    } finally {
      setCompSending(false);
    }
  };

  // Handle WhatsApp Connection
  const handleConnectWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connPhoneId || !connWabaId || !connToken) {
      alert('Please provide Phone Number ID, WABA ID, and Meta System User Token.');
      return;
    }
    try {
      setConnConnecting(true);
      await api.connectGymWhatsApp(gymId, {
        phoneNumberId: connPhoneId,
        wabaId: connWabaId,
        accessToken: connToken,
        displayPhoneNumber: connPhone,
        verifiedName: connName
      });
      alert('Meta WhatsApp Business Cloud API successfully connected!');
      fetchAllData();
    } catch (err: any) {
      alert(`Connection failed: ${err.message}`);
    } finally {
      setConnConnecting(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Are you sure you want to disconnect your WhatsApp Business account?')) return;
    try {
      await api.disconnectGymWhatsApp(gymId);
      fetchAllData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Automation Trigger Toggle
  const handleToggleTrigger = async (key: string, enabled: boolean) => {
    if (!automations) return;
    const updatedTriggers = {
      ...automations.triggers,
      [key]: {
        ...automations.triggers[key],
        enabled
      }
    };
    try {
      await api.updateGymWhatsAppAutomations(gymId, { triggers: updatedTriggers });
      setAutomations({ ...automations, triggers: updatedTriggers });
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17151F] via-[#231e33] to-primary p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
              <Smartphone size={13} />
              <span>META CLOUD API &bull; OFFICIAL BUSINESS SYSTEM</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              WhatsApp Communication & Follow-ups
            </h2>
            <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
              Personalized 1-on-1 member engagement, festival celebrations, automated renewal reminders, and branded AI poster designer with consent governance.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center space-x-2.5">
              <span className={`w-3 h-3 rounded-full ${integration?.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <span className="text-[10px] uppercase font-bold text-white/60 block">Business Number</span>
                <span className="text-xs font-black text-white">{integration?.displayPhoneNumber || 'Not Connected'}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('composer')}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white flex items-center space-x-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <Send size={15} />
              <span>New Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Pill Bar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-surface-borderLight dark:border-surface-borderDark text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Sliders },
          { id: 'composer', label: 'Message Composer', icon: Send },
          { id: 'campaigns', label: 'Campaigns', icon: MessageSquare },
          { id: 'festivals', label: 'Festival Greetings', icon: Sparkles },
          { id: 'designer', label: 'Poster Designer', icon: Palette },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'automations', label: 'Auto Follow-ups (15 Triggers)', icon: Clock },
          { id: 'history', label: 'Message History & Logs', icon: History },
          { id: 'templates', label: 'Meta Templates', icon: FileText },
          { id: 'connection', label: 'WhatsApp Connection', icon: Smartphone }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/30 font-black' 
                  : 'bg-white dark:bg-[#252330] text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark border border-surface-borderLight dark:border-surface-borderDark'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
              <span className="text-[10px] font-bold uppercase text-surface-mutedLight dark:text-surface-mutedDark block">
                Messages Dispatched (Month)
              </span>
              <span className="text-2xl font-black text-primary dark:text-primary-light mt-1 block">
                {integration?.monthlyMessagesSent || 420} / {integration?.monthlyMessageAllowance || 5000}
              </span>
              <div className="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.min(100, (((integration?.monthlyMessagesSent || 420) / (integration?.monthlyMessageAllowance || 5000)) * 100))}%` }} 
                />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
              <span className="text-[10px] font-bold uppercase text-surface-mutedLight dark:text-surface-mutedDark block">
                Delivery Success Rate
              </span>
              <span className="text-2xl font-black text-emerald-500 mt-1 block">
                98.8%
              </span>
              <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">
                Verified Meta Cloud API Webhooks
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
              <span className="text-[10px] font-bold uppercase text-surface-mutedLight dark:text-surface-mutedDark block">
                Consented Member Roster
              </span>
              <span className="text-2xl font-black text-indigo-500 mt-1 block">
                {members.filter(m => m.whatsappConsent && !m.whatsappOptOut).length || 85} Athletes
              </span>
              <span className="text-[11px] text-emerald-500 font-bold mt-1 block">
                Policy Compliant Opt-ins
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
              <span className="text-[10px] font-bold uppercase text-surface-mutedLight dark:text-surface-mutedDark block">
                Active Auto Follow-ups
              </span>
              <span className="text-2xl font-black text-purple-400 mt-1 block">
                {automations ? Object.values(automations.triggers).filter(t => t.enabled).length : 12} / 15 Triggers
              </span>
              <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">
                Quiet hours: {automations?.quietHours.start} - {automations?.quietHours.end}
              </span>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveTab('festivals')}
              className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Festival Greeting Campaigns
                </h4>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
                  Schedule customized greetings for Diwali, Sankranti, Ugadi, Eid, and New Year with attached festive posters.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-500 mt-4 flex items-center space-x-1">
                <span>View Festival Calendar</span>
                <ChevronRight size={14} />
              </span>
            </div>

            <div 
              onClick={() => setActiveTab('designer')}
              className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary cursor-pointer transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary dark:text-primary-light flex items-center justify-center mb-3">
                  <Palette size={20} />
                </div>
                <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Branded Poster Designer
                </h4>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
                  Generate high-impact posters with gym colors, custom fonts, and AI-assisted creative layouts.
                </p>
              </div>
              <span className="text-xs font-bold text-primary dark:text-primary-light mt-4 flex items-center space-x-1">
                <span>Open Canvas Studio</span>
                <ChevronRight size={14} />
              </span>
            </div>

            <div 
              onClick={() => setActiveTab('automations')}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 hover:border-emerald-500 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-3">
                  <Clock size={20} />
                </div>
                <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Automatic Follow-up Engine
                </h4>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
                  Automate renewal warnings (7 days prior), welcome onboarding, PT session reminders, and birthday greetings.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-500 mt-4 flex items-center space-x-1">
                <span>Configure 15 Triggers</span>
                <ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* Recent Campaigns Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Recent WhatsApp Campaigns
                </h3>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                  Broadcasts dispatched through verified Meta Cloud API
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('campaigns')}
                className="text-xs font-bold text-primary dark:text-primary-light hover:underline"
              >
                View All &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                    <th className="py-2.5">Campaign Name</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Audience</th>
                    <th className="py-2.5">Submitted</th>
                    <th className="py-2.5">Delivered / Read</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                  {campaigns.slice(0, 4).map(c => (
                    <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 font-bold text-textPrimary-light dark:text-textPrimary-dark">{c.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 text-surface-mutedLight dark:text-surface-mutedDark capitalize">{c.targetAudience.replace('_', ' ')}</td>
                      <td className="py-3 font-bold">{c.stats.submitted}</td>
                      <td className="py-3">
                        <span className="text-emerald-500 font-bold">{c.stats.delivered}</span> / <span className="text-indigo-400 font-bold">{c.stats.read}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          c.status === 'scheduled' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MESSAGE COMPOSER TAB (REALISTIC WHATSAPP PREVIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Message Composition */}
          <form onSubmit={handleDispatchCampaign} className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Personalized Message Composer
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Dispatch personalized 1-on-1 WhatsApp communications with attached gym posters.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Campaign Identifier</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. November Squat PR & Membership Renewal Notice"
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Communication Category</label>
                <select
                  value={compType}
                  onChange={(e: any) => setCompType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                >
                  <option value="general">General Member Message</option>
                  <option value="renewal_reminder">Membership Renewal Notice</option>
                  <option value="festival">Festival Celebration Greeting</option>
                  <option value="announcement">Facility Announcement</option>
                  <option value="fitness_tip">Workout / Nutrition Coaching Tip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Target Audience</label>
                <select
                  value={compAudience}
                  onChange={(e: any) => setCompAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                >
                  <option value="all_consented">All Consented Members ({members.filter(m => m.whatsappConsent && !m.whatsappOptOut).length})</option>
                  <option value="active">Active Members Only</option>
                  <option value="expiring">Members Expiring Soon (&lt;14 Days)</option>
                  <option value="pt">Personal Training Athletes</option>
                  <option value="trial">Trial Members</option>
                </select>
              </div>
            </div>

            {/* Variable Pills Insertion */}
            <div>
              <label className="block text-xs font-bold mb-1.5 flex justify-between">
                <span>Personalization Variables (Click to Insert)</span>
                <span className="text-[10px] text-primary font-bold">Never displays generic bulk text</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '{{member_name}}',
                  '{{gym_name}}',
                  '{{membership_plan}}',
                  '{{membership_expiry_date}}',
                  '{{pending_amount}}',
                  '{{trainer_name}}',
                  '{{pt_sessions_remaining}}',
                  '{{gym_contact}}'
                ].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCompBody(prev => `${prev} ${v}`)}
                    className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Textarea */}
            <div>
              <label className="block text-xs font-bold mb-1">Message Body</label>
              <textarea
                rows={5}
                value={compBody}
                onChange={(e) => setCompBody(e.target.value)}
                className="w-full p-3 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs leading-relaxed"
                required
              />
            </div>

            {/* Poster Attachment Selector */}
            <div>
              <label className="block text-xs font-bold mb-1">Attached Poster or Banner</label>
              <select
                value={compPosterUrl}
                onChange={(e) => setCompPosterUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
              >
                <option value="">No Image Attachment (Text Only)</option>
                {posters.map(p => (
                  <option key={p.id} value={p.backgroundUrl}>
                    [{p.category.toUpperCase()}] {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule & Urgent Settings */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold mb-1">Schedule Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={compScheduledAt}
                  onChange={(e) => setCompScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={compUrgent}
                    onChange={(e) => setCompUrgent(e.target.checked)}
                    className="accent-rose-500 w-4 h-4"
                  />
                  <span className="text-rose-500">Flag as High-Priority / Urgent Facility Alert</span>
                </label>
              </div>
            </div>

            {/* Submit Dispatch */}
            <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center">
              <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark font-medium">
                Targeting: <strong className="text-textPrimary-light dark:text-textPrimary-dark">{compPreview?.eligibleConsentedCount || 0}</strong> consented athletes (Skipping {compPreview?.skippedUnconsentedCount || 0} unconsented)
              </span>

              <button
                type="submit"
                disabled={compSending || !compName || !compBody}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Send size={15} />
                <span>{compSending ? 'Processing Dispatch...' : compScheduledAt ? 'Schedule Campaign' : 'Dispatch via WhatsApp'}</span>
              </button>
            </div>
          </form>

          {/* Right: Realistic WhatsApp Mobile Simulation Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-widest mb-3 flex items-center space-x-1.5">
              <Smartphone size={14} />
              <span>Recipient Live Smartphone Preview</span>
            </span>

            {/* WhatsApp Chat Frame */}
            <div className="w-full max-w-sm rounded-[36px] bg-[#0c1317] border-8 border-[#222e35] shadow-2xl overflow-hidden flex flex-col h-[520px]">
              {/* WhatsApp App Header */}
              <div className="bg-[#202c33] px-4 py-3 flex items-center space-x-3 text-white border-b border-[#2a3942]">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-black text-xs">
                  SH
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold truncate">Apex Performance Club</span>
                    <ShieldCheck size={12} className="text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-white/60 block">Official Business Account</span>
                </div>
              </div>

              {/* Chat Message Bubble Body */}
              <div 
                className="flex-1 p-3 overflow-y-auto space-y-3"
                style={{
                  backgroundImage: 'radial-gradient(#1f2c34 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              >
                <div className="bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tl-none p-3 shadow-md max-w-[90%] space-y-2">
                  {/* Poster Attachment if selected */}
                  {compPosterUrl && (
                    <img
                      src={compPosterUrl}
                      alt="Attached Poster"
                      className="rounded-xl w-full h-36 object-cover border border-white/10"
                    />
                  )}

                  {/* Personalized Body */}
                  <p className="text-[11px] leading-relaxed whitespace-pre-wrap">
                    {compPreview?.samplePreview || compBody}
                  </p>

                  <div className="flex justify-end items-center space-x-1 text-[9px] text-white/60 pt-1">
                    <span>10:45 AM</span>
                    <span className="text-cyan-400 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Footer */}
              <div className="bg-[#202c33] px-3 py-2 flex items-center space-x-2 text-white/40 text-xs">
                <span className="flex-1 px-3 py-1.5 rounded-full bg-[#2a3942] text-[10px] text-white/50">
                  Member replies open direct chat...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CAMPAIGNS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Campaign Management & Delivery Tracking
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Full delivery lifecycle: Scheduled, Running, Completed, Delivered, Read, and Skipped.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('composer')}
              className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
            >
              + Create Campaign
            </button>
          </div>

          <div className="space-y-3">
            {campaigns.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                      {c.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                      {c.type}
                    </span>
                    {c.urgent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-500 uppercase">
                        Urgent Alert
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark line-clamp-1 max-w-xl">
                    {c.messageBody}
                  </p>
                  <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark block">
                    Created: {new Date(c.createdAt).toLocaleString()} &bull; Target: {c.targetAudience.replace('_', ' ')}
                  </span>
                </div>

                {/* Delivery Stats Grid */}
                <div className="flex items-center space-x-6 text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">Submitted</span>
                    <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark">{c.stats.submitted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-500 block">Delivered</span>
                    <span className="font-bold text-emerald-500">{c.stats.delivered}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block">Read</span>
                    <span className="font-bold text-indigo-400">{c.stats.read}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-500 block">Skipped</span>
                    <span className="font-bold text-amber-500" title="Excluded due to missing consent or opt-out">{c.stats.skippedNoConsent}</span>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                      c.status === 'completed' ? 'bg-emerald-500/15 text-emerald-500' :
                      c.status === 'scheduled' ? 'bg-amber-500/15 text-amber-500' : 'bg-gray-500/15 text-gray-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FESTIVAL GREETINGS & OCCASIONS */}
      {/* ========================================================================= */}
      {activeTab === 'festivals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Indian & Global Festival Calendar Campaigns
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Ready-to-dispatch festive greetings with authentic culture-specific greeting posters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  name: 'Diwali Festive Greetings', 
                  date: 'Nov 12, 2026', 
                  desc: 'Festival of Lights & Physical Power. High-engagement greeting with golden aesthetic.',
                  bg: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=400&q=80',
                  badge: 'DIWALI SPECIAL' 
                },
                { 
                  name: 'Makar Sankranti & Pongal', 
                  date: 'Jan 14, 2027', 
                  desc: 'Harvest of Strength and vitality. Clean fitness motivation theme.',
                  bg: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
                  badge: 'HARVEST GAINS' 
                },
                { 
                  name: 'Ugadi & Gudi Padwa', 
                  date: 'Mar 22, 2027', 
                  desc: 'Auspicious New Year beginnings and fresh PR targets for members.',
                  bg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
                  badge: 'NEW BEGINNINGS' 
                },
                { 
                  name: 'Eid Mubarak Greetings', 
                  date: 'Apr 08, 2027', 
                  desc: 'Peace, blessing, and disciplined consistency message for athletes.',
                  bg: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=400&q=80',
                  badge: 'EID SPECIAL' 
                },
                { 
                  name: 'Christmas & Year-End Energy', 
                  date: 'Dec 25, 2026', 
                  desc: 'Holiday strength motivation and festive workout scheduling alert.',
                  bg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
                  badge: 'HOLIDAY POWER' 
                },
                { 
                  name: 'New Year Athletic Protocol', 
                  date: 'Jan 01, 2027', 
                  desc: 'Transformative goal setting and renewed dedication protocol.',
                  bg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
                  badge: 'UNSTOPPABLE 2027' 
                }
              ].map((fest, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-surface-borderLight dark:border-surface-borderDark overflow-hidden bg-surface-light dark:bg-[#1b1926] shadow-sm flex flex-col justify-between"
                >
                  <div className="relative h-32">
                    <img src={fest.bg} alt={fest.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold">
                      {fest.badge}
                    </span>
                    <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold">
                      {fest.date}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                        {fest.name}
                      </h4>
                      <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                        {fest.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCompName(fest.name);
                        setCompType('festival');
                        setCompBody(`Warmest festive greetings on ${fest.name} to {{member_name}} and your family! 🪔✨ May your training and health reach extraordinary peaks this season. Team {{gym_name}}`);
                        setCompPosterUrl(fest.bg);
                        setActiveTab('composer');
                      }}
                      className="w-full mt-3 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <span>Prepare Festive Campaign</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. POSTER & MESSAGE DESIGNER */}
      {/* ========================================================================= */}
      {activeTab === 'designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* AI Generator Box */}
            <form onSubmit={handleGenerateAiPoster} className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-primary" />
                <h4 className="text-xs font-black uppercase text-primary dark:text-primary-light">
                  AI Fitness Poster Generator
                </h4>
              </div>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                Describe your desired poster (e.g. &ldquo;Premium Diwali poster with golden lighting and barbell theme&rdquo; or &ldquo;New Year transformation banner with purple neon vibes&rdquo;).
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  placeholder="Enter creative prompt..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
                />
                <button
                  type="submit"
                  disabled={aiGenerating || !aiPromptInput}
                  className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>{aiGenerating ? 'Synthesizing...' : 'Generate'}</span>
                </button>
              </div>
            </form>

            {/* Manual Customization Editor */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
              <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
                Poster Customization Studio
              </h3>

              <div>
                <label className="block text-xs font-bold mb-1">Main Headline</label>
                <input
                  type="text"
                  value={designerHeadline}
                  onChange={(e) => setDesignerHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Subheadline / Motivational Copy</label>
                <input
                  type="text"
                  value={designerSubheadline}
                  onChange={(e) => setDesignerSubheadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Top Badge Pill</label>
                <input
                  type="text"
                  value={designerBadge}
                  onChange={(e) => setDesignerBadge(e.target.value)}
                  placeholder="e.g. OFFICIAL CLUB ADVISORY"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={designerTextColor}
                      onChange={(e) => setDesignerTextColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono">{designerTextColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Accent Brand Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={designerAccentColor}
                      onChange={(e) => setDesignerAccentColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono">{designerAccentColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={designerShowLogo}
                    onChange={(e) => setDesignerShowLogo(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Show Club Branding Logo</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={designerShowContact}
                    onChange={(e) => setDesignerShowContact(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Show Verified Desk Footer</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleSavePoster}
                  className="px-5 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold cursor-pointer"
                >
                  Save to Gym Poster Library
                </button>
              </div>
            </div>
          </div>

          {/* Right: Interactive Canvas Output */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-widest mb-3">
              Live WhatsApp-Ready Canvas (600 × 600)
            </span>
            <div className="p-3 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-xl">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full max-w-[420px] rounded-2xl shadow-inner border border-white/10"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ANNOUNCEMENTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'announcements' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Official Facility Announcements
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Dispatch urgent maintenance, opening-hours updates, or tournament notices.
              </p>
            </div>
            <button
              onClick={() => {
                setCompType('announcement');
                setCompName('Facility Advisory Announcement');
                setCompBody('Attention Athletes: Please be advised that {{gym_name}} will observe adjusted training hours on upcoming public holiday.');
                setActiveTab('composer');
              }}
              className="px-4 py-2 rounded-xl gradient-btn-primary text-white text-xs font-bold"
            >
              + Create Announcement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Squat Rack & Platform Calibration Maintenance',
                type: 'Facility Maintenance',
                text: 'Platforms 3 & 4 will undergo scheduled barbell calibration between 2 PM - 4 PM. All other free-weight areas remain open.',
                badge: 'MAINTENANCE'
              },
              {
                title: 'New High-Protein Smoothie Bar Open',
                type: 'Amenity Update',
                text: 'Recover immediately post-workout with our new whey & plant protein smoothies now available at the front lounge.',
                badge: 'NEW AMENITY'
              }
            ].map((ann, i) => (
              <div key={i} className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                  {ann.badge}
                </span>
                <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">{ann.title}</h4>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">{ann.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. AUTOMATIC FOLLOW-UPS TAB (15 TRIGGERS) */}
      {/* ========================================================================= */}
      {activeTab === 'automations' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-surface-borderLight dark:border-surface-borderDark pb-4">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Event-Based Automatic Follow-up Engine
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                15 automated triggers integrated with member lifecycles, attendance, PT sessions, and billing renewals.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="font-bold text-surface-mutedLight dark:text-surface-mutedDark">Quiet Hours:</span>
              <span className="px-3 py-1 rounded-xl bg-surface-light dark:bg-[#1b1926] font-mono font-bold">
                {automations?.quietHours.start} - {automations?.quietHours.end} (Asia/Kolkata)
              </span>
            </div>
          </div>

          {/* Trigger Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {automations && Object.entries(automations.triggers).map(([key, trig]) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                      {trig.category}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trig.enabled}
                        onChange={(e) => handleToggleTrigger(key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark mt-2">
                    {trig.name}
                  </h4>
                  <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                    {trig.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center text-[10px]">
                  <span className="text-surface-mutedLight dark:text-surface-mutedDark">
                    Timing: {trig.timingHoursBeforeOrAfter === 0 ? 'Instant' : `${trig.timingHoursBeforeOrAfter}h offset`}
                  </span>
                  {trig.requireApproval && (
                    <span className="text-amber-500 font-bold">Needs Review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MESSAGE HISTORY & DELIVERY REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Immutable WhatsApp Message Logs
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Delivery timestamps, provider message IDs, and member consent audit trail.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={histSearch}
                onChange={(e) => setHistSearch(e.target.value)}
                placeholder="Search athlete or number..."
                className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-2.5">Athlete</th>
                  <th className="py-2.5">Masked Number</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Snippet</th>
                  <th className="py-2.5">Submitted</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {messageLogs.map(l => (
                  <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 font-bold text-textPrimary-light dark:text-textPrimary-dark">{l.memberName}</td>
                    <td className="py-3 font-mono text-[11px]">{l.recipientNumberMasked}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-light uppercase">
                        {l.category}
                      </span>
                    </td>
                    <td className="py-3 text-surface-mutedLight dark:text-surface-mutedDark max-w-xs truncate">{l.messageContentSnippet}</td>
                    <td className="py-3 text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                      {new Date(l.submittedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        l.status === 'read' ? 'bg-cyan-500/15 text-cyan-400' :
                        l.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. META TEMPLATES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Approved Meta Business Templates
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Official templates registered with Meta for marketing and utility messages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tpl => (
              <div key={tpl.id} className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">{tpl.name}</h4>
                    <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">Language: {tpl.language.toUpperCase()} &bull; Category: {tpl.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                    {tpl.metaStatus}
                  </span>
                </div>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed p-3 rounded-xl bg-white dark:bg-[#252330]">
                  {tpl.bodyText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. WHATSAPP CONNECTION & SETUP */}
      {/* ========================================================================= */}
      {activeTab === 'connection' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleConnectWhatsApp} className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Connect Meta WhatsApp Business Cloud API
              </h3>
              <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
                Configure your verified WhatsApp Business Account (WABA) credentials.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">WhatsApp Phone Number ID</label>
              <input
                type="text"
                value={connPhoneId}
                onChange={(e) => setConnPhoneId(e.target.value)}
                placeholder="e.g. 108492048593021"
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">WhatsApp Business Account ID (WABA)</label>
              <input
                type="text"
                value={connWabaId}
                onChange={(e) => setConnWabaId(e.target.value)}
                placeholder="e.g. 294029485029485"
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Meta System User Permanent Access Token</label>
              <input
                type="password"
                value={connToken}
                onChange={(e) => setConnToken(e.target.value)}
                placeholder="EAAGxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Display Business Phone</label>
                <input
                  type="text"
                  value={connPhone}
                  onChange={(e) => setConnPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Verified Display Name</label>
                <input
                  type="text"
                  value={connName}
                  onChange={(e) => setConnName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex space-x-3">
              <button
                type="submit"
                disabled={connConnecting}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {connConnecting ? 'Validating Token...' : 'Save & Verify Connection'}
              </button>

              {integration?.status === 'connected' && (
                <button
                  type="button"
                  onClick={handleDisconnectWhatsApp}
                  className="px-4 py-2.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-bold text-xs cursor-pointer"
                >
                  Disconnect WABA
                </button>
              )}
            </div>
          </form>

          {/* Setup Guide Box */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <h4 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Meta Cloud API Setup Guide
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-surface-mutedLight dark:text-surface-mutedDark leading-relaxed">
              <li>Log in to the <strong>Meta for Developers</strong> portal.</li>
              <li>Create a Business App with the <strong>WhatsApp</strong> product enabled.</li>
              <li>Retrieve your <strong>Phone Number ID</strong> and <strong>WABA ID</strong>.</li>
              <li>Generate a Permanent System User Token with <code>whatsapp_business_messaging</code> scope.</li>
              <li>Configure your Webhook URL to: <code>http://your-server-ip:5000/api/whatsapp/webhook</code></li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
