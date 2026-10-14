import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Users,
  Activity,
  Volume2,
  Clock,
  ShieldAlert,
  Battery,
  Search,
  Check,
} from 'lucide-react';
import { Submission, EnumeratorProfile, SituationAlert } from '../types/survey.ts';
import { SituationMap } from './SituationMap.tsx';

interface SituationRoomProps {
  enumerators: EnumeratorProfile[];
  submissions: Submission[];
  alerts: SituationAlert[];
  onResolveAlert: (alertId: string) => void;
}

export const SituationRoom: React.FC<SituationRoomProps> = ({
  enumerators,
  submissions,
  alerts,
  onResolveAlert,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [activeEnumerator, setActiveEnumerator] = useState<EnumeratorProfile | null>(
    enumerators[0] || null
  );

  const totalInterviews = submissions.length;
  const flaggedCount = submissions.filter((s) => s.status === 'flagged').length;
  const avgDuration =
    totalInterviews > 0
      ? Math.round(
          submissions.reduce((acc, curr) => acc + (curr.metadata.durationSeconds || 0), 0) /
            totalInterviews
        )
      : 0;

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-950">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-red-500 uppercase">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span>LIVE FIELD SITUATION ROOM</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Real-Time Fieldwork & Quality Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized monitoring of field enumerators, GPS cluster dispersion, audio audits, and speed anomaly alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Filter Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-red-500 font-semibold"
          >
            <option value="all">All Field Sectors</option>
            <option value="accra">Greater Accra Coastal</option>
            <option value="lagos">Lagos Mainland & Island</option>
            <option value="nairobi">Nairobi Urban West</option>
            <option value="joburg">Johannesburg South</option>
          </select>
        </div>
      </div>

      {/* Real-time KPI Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Active Surveyors</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {enumerators.filter((e) => e.active).length} / {enumerators.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">100% field devices reporting</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Average Interview Duration</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgDuration} seconds</div>
          <div className="text-[11px] text-slate-400 mt-1">Quality threshold: &gt;120s</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Speed / Geofence Flags</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{flaggedCount} Interviews</div>
          <div className="text-[11px] text-red-300 mt-1">{unresolvedAlerts.length} unresolved QC alerts</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Audio Audits Completed</span>
            <Volume2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {submissions.filter((s) => s.metadata.audioAuditRecorded).length} samples
          </div>
          <div className="text-[11px] text-purple-300 mt-1">Background QA active</div>
        </div>
      </div>

      {/* Real-time Leaflet GIS Situation Map */}
      <div className="w-full">
        <SituationMap
          initialFormId="all"
          activeEnumeratorId={activeEnumerator?.id || 'all'}
        />
      </div>

      {/* QC Anomaly Stream & Active Surveyor Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Surveyor Telemetry Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Active Field Surveyor Roster</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {enumerators.filter((e) => e.active).length} Active
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-80 pr-1">
            {enumerators.map((e) => {
              const isSelected = activeEnumerator?.id === e.id;
              return (
                <div
                  key={e.id}
                  onClick={() => setActiveEnumerator(e)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-red-950/30 border-red-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-2">
                      <span>{e.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {e.deviceId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{e.region}</div>
                  </div>
                  <div className="text-right space-y-0.5 font-mono text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-400 justify-end">
                      <Battery className="w-3.5 h-3.5" />
                      <span>{e.batteryLevel || 80}%</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      {e.totalSubmissions} interviews
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality Alerts & Fraud Detection Feed (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Quality Control Anomaly Stream</h3>
            </div>
            <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
              {unresolvedAlerts.length} Unresolved
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-96 pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs space-y-2 transition ${
                  alert.resolved
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : alert.severity === 'high'
                    ? 'bg-red-950/20 border-red-500/40 text-red-200'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                    />
                    <span>{alert.enumeratorName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-300">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Type: {alert.type}
                  </span>
                  {!alert.resolved ? (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
