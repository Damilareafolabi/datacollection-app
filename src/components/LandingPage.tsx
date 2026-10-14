import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  MapPin,
  FileText,
  Users,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Wifi,
  WifiOff,
  ExternalLink,
  Lock,
  Layers,
  HelpCircle,
  Activity,
  Server,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { SimeonFAQChatbot } from './SimeonFAQChatbot.tsx';

interface LandingPageProps {
  onLaunchCollector: () => void;
  onGoToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchCollector,
  onGoToLogin,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://cmrg.field.org';

  useEffect(() => {
    QRCode.toDataURL(currentUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR code generation notice:', err));
  }, [currentUrl]);

  const handleCopyUrl = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Top Warning Banner: Honest Deployment Status */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Pilot Operation Mode:</strong> Live hosting, external PostgreSQL, private media vault, and backup procedures must be verified prior to collecting real respondent data. Synthetic test records only.
        </span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-900/30">
              C
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-white block leading-none">
                CMRG DATA COLLECT
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Field Survey Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#capabilities" className="hover:text-red-400 transition">
              Capabilities
            </a>
            <a href="#questionnaires" className="hover:text-red-400 transition">
              Questionnaires
            </a>
            <a href="#teams" className="hover:text-red-400 transition">
              Team Access
            </a>
            <a href="#situation" className="hover:text-red-400 transition">
              Situation GIS
            </a>
            <a href="#capacity" className="hover:text-red-400 transition">
              Capacity & Storage
            </a>
            <a href="#roadmap" className="hover:text-red-400 transition">
              Roadmap
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition"
              title="Scan Mobile QR Code"
            >
              <QrCode className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            <button
              onClick={onGoToLogin}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white transition"
            >
              Sign In
            </button>

            <button
              onClick={onLaunchCollector}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-wider text-white transition shadow-lg shadow-red-900/40"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Original Standalone Field-Survey PWA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Reliable Offline Fieldwork for Critical Data Collection
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineered for high-integrity market research, health surveys, and socio-economic fieldwork. Install directly from your mobile browser without an app store, capture GPS with surveyor consent, record audio QA audits, and synchronize safely to PostgreSQL.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onLaunchCollector}
              className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition shadow-xl shadow-red-900/40"
            >
              <span>Open Field Collector</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-sm rounded-xl transition"
            >
              <Smartphone className="w-4 h-4 text-red-500" />
              <span>Install PWA via QR</span>
            </button>

            <button
              onClick={onGoToLogin}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm rounded-xl transition"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Staff Login</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold uppercase text-slate-400">Offline Engine</div>
              <div className="text-xl font-black text-white mt-1">IndexedDB</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Full draft storage</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold uppercase text-slate-400">Idempotency</div>
              <div className="text-xl font-black text-white mt-1">UUID Keys</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Zero sync duplicates</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold uppercase text-slate-400">Geospatial GIS</div>
              <div className="text-xl font-black text-white mt-1">Leaflet</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Real GPS mapping</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold uppercase text-slate-400">Shared Backend</div>
              <div className="text-xl font-black text-white mt-1">PostgreSQL</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Relational persistence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Capabilities */}
      <section id="capabilities" className="py-20 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Built for Harsh Field Environments
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Every component is built for unstable networks, dust, long battery shifts, and rigorous data protection standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">100% Offline-First Operations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Forms, drafts, and responses stay in IndexedDB until connectivity returns. The server confirms storage before any local records are modified.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Persistent offline questionnaires</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>UUID instance-level deduplication</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automatic background sync retry</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Private Media & E2E Envelopes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Photos and audio audit recordings are protected in an authenticated private media vault. Media is never placed in public buckets.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Private authorized media endpoints</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AES-256-GCM envelope support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Informed surveyor consent flow</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">PostgreSQL Data Synchronization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synchronized submissions are structured into clean relational tables with JSONB payload indexing, GPS coordinates, and audit timing.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PostgreSQL DDL & DML migrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Direct CSV & SQL dump generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Idempotent database inserts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Questionnaires */}
      <section id="questionnaires" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Authoring & Collection
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Supported Questionnaire Questions & Constraints
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Only real, tested question types are presented. Every submission is validated against server-side constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Text & Notes</span>
              <h4 className="text-sm font-bold text-white mt-1">Text & Long Text</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Names, commercial trade descriptions, and supervisor field remarks. Required constraints enforced.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">Numeric Range</span>
              <h4 className="text-sm font-bold text-white mt-1">Numbers & Currency</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Prices, household member counts, and inventory units with server-side NaN rejection.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Temporal ISO</span>
              <h4 className="text-sm font-bold text-white mt-1">Date & Timestamp</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Strict YYYY-MM-DD calendar dates and ISO-8601 start/end duration timers for speed audits.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Choices & Roster</span>
              <h4 className="text-sm font-bold text-white mt-1">Select & Repeat Groups</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Single choice radio, multiple choice checkboxes, and repeatable rosters (household members).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Team Access & Case Workflows */}
      <section id="teams" className="py-20 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Role-Based Governance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Field Team Authorization & Access Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Public self-registration is permanently disabled. Administrators provision enumerators with specific device IDs and project assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Administrator
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Creates and assigns questionnaires, manages surveyor roster, deactivates lost tablets, and exports clean datasets.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                Permissions: Full Authoring, Export, Revocation
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Supervisor
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Monitors real-time field dispersion on the Leaflet Situation Map, reviews flagged interviews, and checks audio QA audits.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                Permissions: Review, QC Alerts, GIS Tracking
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Field Enumerator
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Completes assigned surveys offline, captures GPS coordinates with respondent consent, and syncs upon reconnection.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                Permissions: Collect, Save Draft, Sync Assigned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Situation GIS */}
      <section id="situation" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Live Fieldwork GIS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Leaflet Situation Awareness & Quality Assurance
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Integrated geospatial mapping displaying authenticated, server-stored submissions with valid GPS coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Strict Privacy Redaction</span>
                </div>
                <p className="text-slate-400">
                  Situation map markers show only questionnaire titles, status, surveyor ID, and accuracy. Respondent names, answers, access codes, and media URLs are permanently stripped from the GIS endpoint.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-500" />
                  <span>Unmapped Record Quarantine</span>
                </div>
                <p className="text-slate-400">
                  Submissions collected without GPS coordinates (e.g. indoors or surveyor opted out) are safely listed in the unmapped queue without placing misleading fake markers on the map.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Permitted Tile Provider Attribution</span>
                </div>
                <p className="text-slate-400">
                  Uses OpenStreetMap tiles with required attribution and configurable tile URL options. Note: Online tiles require internet connection; offline tiles require local vector cache.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Situation QC Metrics
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Server-Verified
                </span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span className="text-slate-400">Quality Speed Threshold:</span>
                  <span className="text-white">&gt; 120 Seconds</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span className="text-slate-400">Audio Audit Sampling:</span>
                  <span className="text-white">Background Active</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950">
                  <span className="text-slate-400">Accessible Table View:</span>
                  <span className="text-emerald-400">WCAG Compliant</span>
                </div>
              </div>
              <button
                onClick={onLaunchCollector}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                View Situation Room in App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Capacity & Storage (Honest, no fake unlimited claims) */}
      <section id="capacity" className="py-20 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Infrastructure & Scaling
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Storage Capacity & Operational Limits
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              We do not promise fake “unlimited” quotas. System capacity is transparently bounded by CMRG’s configured database and server hosting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <Database className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  PostgreSQL Persistence
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Relational capacity depends on the provisioned PostgreSQL instance size and disk volume. Supports millions of rows with PostGIS and JSONB indexing.
              </p>
              <div className="p-2.5 rounded bg-slate-950 text-[11px] text-slate-300 font-mono">
                Pilot Spec: Contact CMRG Admin
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-500">
                <HardDrive className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Private Media Vault
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Images and audio are stored securely in the private media vault. Production capacity requires binding to durable S3/GCS buckets with signed URLs.
              </p>
              <div className="p-2.5 rounded bg-slate-950 text-[11px] text-slate-300 font-mono">
                Pilot Buffer: In-Memory / Configured Limit
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-500">
                <Smartphone className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Device IndexedDB Cache
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local tablet storage is limited by the interviewer’s mobile device browser quota (typically 500MB–2GB per origin depending on device OS).
              </p>
              <div className="p-2.5 rounded bg-slate-950 text-[11px] text-slate-300 font-mono">
                Queue Depth: Automatic Rotation on Confirmed Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Roadmap & Deployment Status */}
      <section id="roadmap" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
              Deployment Audit
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Verified Features vs Production Blockers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              Honest operational status: Know exactly what is verified in the local engine and what requires infrastructure setup before field deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verified Capabilities */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verified Local & App Features
                </h3>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>PWA browser installation and manifest on Chrome & Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>IndexedDB offline questionnaire & interview draft caching</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>InstanceId UUID idempotency (safe retry without duplicates)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Server-side question validation (number, date, choices, rosters)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Enumerator access deactivation enforced on the server</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Leaflet situation map with privacy redaction and unmapped list</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automated test suite (validation, idempotency, permissions)</span>
                </li>
              </ul>
            </div>

            {/* Production Blockers */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deployment Blockers (Before Real Field Data)
                </h3>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 font-medium">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Production HTTPS domain configuration with valid SSL/TLS certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Persistent PostgreSQL hosting connection with automated daily backups</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Private durable object storage (S3/GCS bucket) for interview media</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>End-to-end disaster recovery and database restore verification test</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Institutional IRB and research ethics data protection sign-off</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center font-black text-white text-xs">
              C
            </div>
            <span className="font-bold text-slate-300">CMRG Data Collect</span>
            <span>&bull;</span>
            <span>Standalone Field Survey Platform</span>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div>Engineered for West & Sub-Saharan African fieldwork</div>
            <div className="text-[11px] text-slate-600">
              Field FAQ Assistant by SimeonJrStudios (Offline guidance, not live AI)
            </div>
          </div>
        </div>
      </footer>

      {/* QR Code & PWA Install Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-fadeIn text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <QrCode className="w-4 h-4 text-red-500" />
                <span>PWA Mobile Quick-Install</span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Scan this QR code on an Android or iOS phone to open the application in Chrome or Safari.
            </p>

            {/* Rendered Live QR Code */}
            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="CMRG PWA QR Code" className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-500 font-mono">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Install Steps */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-[11px] text-slate-300 space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>How to Install on Phone:</span>
              </div>
              <div>
                <strong>Android (Chrome):</strong> Tap the ⋮ menu &bull; select <em>"Install app"</em> or <em>"Add to Home screen"</em>.
              </div>
              <div>
                <strong>iOS (Safari):</strong> Tap the Share button &bull; scroll down and select <em>"Add to Home Screen"</em>.
              </div>
            </div>

            {/* URL Copy Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 font-mono outline-none truncate"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Floating SimeonJrStudios Local FAQ Chatbot */}
      <SimeonFAQChatbot />
    </div>
  );
};
