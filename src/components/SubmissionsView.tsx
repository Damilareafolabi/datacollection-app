import React, { useState } from 'react';
import {
  FolderSync,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Lock,
  Unlock,
  MapPin,
  PenTool,
  Search,
  Database,
  X,
  Volume2,
} from 'lucide-react';
import { Submission } from '../types/survey.ts';
import { decryptSurveyPayload } from '../lib/crypto.ts';
import { generatePostgreSqlDump } from '../lib/sqlEngine.ts';

interface SubmissionsViewProps {
  submissions: Submission[];
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({
  submissions,
  onTriggerSync,
  isSyncing,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [decryptedData, setDecryptedData] = useState<Record<string, any> | null>(null);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptError, setDecryptError] = useState<string>('');
  const [showSqlExportModal, setShowSqlExportModal] = useState<boolean>(false);

  const filtered = submissions.filter((sub) => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sub.formTitle.toLowerCase().includes(q) ||
        sub.enumeratorName.toLowerCase().includes(q) ||
        sub.instanceId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'draft'
  ).length;

  const handleOpenDetails = (sub: Submission) => {
    setSelectedSub(sub);
    setDecryptedData(null);
    setDecryptError('');
  };

  const handleDecrypt = async () => {
    if (!selectedSub?.encryptedEnvelope) return;
    setIsDecrypting(true);
    setDecryptError('');
    try {
      const result = await decryptSurveyPayload(selectedSub.encryptedEnvelope);
      setDecryptedData(result);
    } catch (err: any) {
      setDecryptError(err.message || 'Decryption failed.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const exportCsv = () => {
    if (!submissions.length) return;
    const headers = ['InstanceID', 'FormTitle', 'Enumerator', 'Status', 'DurationSeconds', 'Latitude', 'Longitude', 'CreatedAt'];
    const rows = submissions.map((s) => [
      s.instanceId,
      `"${s.formTitle}"`,
      `"${s.enumeratorName}"`,
      s.status,
      s.metadata.durationSeconds || 0,
      s.metadata.latitude || '',
      s.metadata.longitude || '',
      s.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `cmrg_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `cmrg_submissions_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const sqlDump = generatePostgreSqlDump(submissions);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-950">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            FIELD REPOSITORY & ENCRYPTION VAULT
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Submissions ({submissions.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review offline records, decrypt cryptographic payloads, and push datasets to PostgreSQL & Firebase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onTriggerSync}
            disabled={isSyncing || pendingCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition cursor-pointer"
          >
            <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : `Central Sync (${pendingCount})`}</span>
          </button>

          <button
            onClick={() => setShowSqlExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>SQL Inserts</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {['all', 'submitted', 'synced', 'draft', 'flagged'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition ${
                filterStatus === st
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by form, surveyor, instance ID..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-red-500 outline-none"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
              <tr>
                <th className="py-3 px-4">Instance ID</th>
                <th className="py-3 px-4">Survey Protocol</th>
                <th className="py-3 px-4">Field Officer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Audit Speed</th>
                <th className="py-3 px-4">GPS / Sensors</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filtered.map((sub) => {
                const isSynced = sub.status === 'synced';
                const isFlagged = sub.status === 'flagged';

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {sub.instanceId.substring(0, 14)}...
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{sub.formTitle}</div>
                      <div className="text-[10px] text-slate-500">v{sub.formVersion}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{sub.enumeratorName}</div>
                      <div className="text-[10px] text-slate-500">{sub.deviceId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isSynced
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isFlagged
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isSynced && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {isFlagged && <AlertTriangle className="w-2.5 h-2.5" />}
                        {!isSynced && !isFlagged && <Clock className="w-2.5 h-2.5" />}
                        <span>{sub.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={
                          sub.metadata.durationSeconds < 120
                            ? 'text-red-400 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        {sub.metadata.durationSeconds}s
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {sub.metadata.latitude && (
                          <span
                            className="p-1 rounded bg-slate-800 text-emerald-400 border border-slate-700"
                            title={`GPS: ${sub.metadata.latitude}, ${sub.metadata.longitude}`}
                          >
                            <MapPin className="w-3 h-3" />
                          </span>
                        )}
                        {sub.metadata.audioAuditRecorded && (
                          <span
                            className="p-1 rounded bg-slate-800 text-red-400 border border-slate-700"
                            title="Audio audit sample verified"
                          >
                            <Volume2 className="w-3 h-3" />
                          </span>
                        )}
                        {sub.answers.merchant_signature && (
                          <span
                            className="p-1 rounded bg-slate-800 text-blue-400 border border-slate-700"
                            title="Digital signature attached"
                          >
                            <PenTool className="w-3 h-3" />
                          </span>
                        )}
                        {sub.encryptedEnvelope && (
                          <span
                            className="p-1 rounded bg-slate-800 text-emerald-400 border border-slate-700"
                            title="Encrypted with AES-256-GCM"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(sub)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
                      >
                        <Eye className="w-3 h-3 text-red-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Details Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  SURVEY SUBMISSION DETAIL
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedSub.formTitle}
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Instance ID: {selectedSub.instanceId}
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quality Warning if Flagged */}
            {selectedSub.flagReason && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{selectedSub.flagReason}</span>
              </div>
            )}

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <div className="text-slate-500">Enumerator</div>
                <div className="font-bold text-white mt-0.5">{selectedSub.enumeratorName}</div>
              </div>
              <div>
                <div className="text-slate-500">Duration Audit</div>
                <div className="font-bold text-white mt-0.5">{selectedSub.metadata.durationSeconds}s</div>
              </div>
              <div>
                <div className="text-slate-500">Sync Status</div>
                <div className="font-bold text-emerald-400 mt-0.5 uppercase">{selectedSub.status}</div>
              </div>
              <div>
                <div className="text-slate-500">Recorded At</div>
                <div className="font-bold text-white mt-0.5">
                  {new Date(selectedSub.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Encryption & Cryptographic Payload Section */}
            {selectedSub.encryptedEnvelope && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">End-to-End Cryptographic Envelope</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    AES-GCM-256 + RSA-2048
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-3 rounded-lg overflow-x-auto space-y-1">
                  <div>IV: {selectedSub.encryptedEnvelope.iv}</div>
                  <div>Ciphertext: {selectedSub.encryptedEnvelope.ciphertext.substring(0, 36)}...</div>
                  <div>Key Hash: {selectedSub.encryptedEnvelope.keyFingerprint}</div>
                </div>

                {!decryptedData ? (
                  <button
                    onClick={handleDecrypt}
                    disabled={isDecrypting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{isDecrypting ? 'Decrypting with Private Key...' : 'Decrypt with CMRG Private Key'}</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Decrypted Payload Verified:</span>
                    </div>
                    <pre className="text-[11px] text-slate-200 font-mono overflow-x-auto">
                      {JSON.stringify(decryptedData, null, 2)}
                    </pre>
                  </div>
                )}

                {decryptError && (
                  <div className="text-xs text-red-400">{decryptError}</div>
                )}
              </div>
            )}

            {/* Plain / Decrypted Form Responses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Question Responses
              </h4>

              <div className="space-y-2">
                {Object.entries(selectedSub.answers).map(([key, val]) => {
                  if (key === 'merchant_signature' || key === 'household_signature') {
                    return (
                      <div key={key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-slate-400 uppercase">{key}</div>
                        {val && typeof val === 'string' && val.startsWith('data:image') ? (
                          <img src={val} alt="Digital signature" className="h-16 border border-slate-800 rounded bg-white p-1" />
                        ) : (
                          <span className="text-xs text-slate-300">Signature captured on device</span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400">{key}</span>
                      <span className="font-mono text-white text-right max-w-xs truncate">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL Export Modal */}
      {showSqlExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">PostgreSQL INSERT Dump</h3>
              </div>
              <button
                onClick={() => setShowSqlExportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Run this script directly in PostgreSQL, Neon Console, Supabase SQL Editor, or Cloud SQL:
            </p>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80 select-all">
              {sqlDump}
            </pre>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlDump);
                  alert('SQL Inserts copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([sqlDump], { type: 'text/sql' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `cmrg_postgres_insert_${Date.now()}.sql`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/50"
              >
                Download .sql File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
