export type QuestionType =
  | 'text'
  | 'integer'
  | 'decimal'
  | 'select_one'
  | 'select_multiple'
  | 'geopoint'
  | 'image'
  | 'audio'
  | 'signature'
  | 'barcode'
  | 'date'
  | 'time'
  | 'note';

export interface ChoiceOption {
  value: string;
  label: string;
  score?: number;
}

export interface QuestionDefinition {
  id: string;
  name: string;
  type: QuestionType;
  label: string;
  hint?: string;
  required?: boolean;
  options?: ChoiceOption[];
  constraint?: string;
  constraintMessage?: string;
  relevant?: string; // skip logic expression e.g. "age >= 18" or "drinks_soda === 'yes'"
  appearance?: string; // e.g. "compact", "horizontal", "multiline"
  defaultValue?: any;
}

export interface FormDefinition {
  id: string;
  formId: string;
  title: string;
  version: string;
  description: string;
  category: string;
  questions: QuestionDefinition[];
  isEncrypted: boolean;
  publicKey?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  submissionsCount?: number;
  assignedEnumeratorIds?: string[];
  assignedRegions?: string[];
}

export interface EncryptedEnvelope {
  algorithm: 'AES-GCM-256';
  iv: string;
  ciphertext: string;
  encryptedKey: string;
  keyFingerprint: string;
  timestamp: string;
}

export interface SubmissionMetadata {
  startTime: string;
  endTime: string;
  durationSeconds: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  accuracy?: number;
  audioAuditRecorded?: boolean;
  audioAuditDurationSeconds?: number;
  deviceBatteryLevel?: number;
  appVersion: string;
  deviceId: string;
  networkAtSubmission: 'online' | 'offline';
}

export interface Submission {
  id: string;
  instanceId: string;
  formId: string;
  formTitle: string;
  formVersion: string;
  enumeratorId: string;
  enumeratorName: string;
  deviceId: string;
  status: 'draft' | 'submitted' | 'synced' | 'flagged';
  answers: Record<string, any>;
  encryptedEnvelope?: EncryptedEnvelope;
  metadata: SubmissionMetadata;
  createdAt: string;
  syncedAt?: string;
  flagReason?: string;
}

export interface EnumeratorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  deviceId: string;
  active: boolean;
  totalSubmissions: number;
  lastActiveAt: string;
  currentLat?: number;
  currentLng?: number;
  batteryLevel?: number;
}

export interface SituationAlert {
  id: string;
  type: 'speed_audit' | 'geofence' | 'duplicate_gps' | 'audio_missing' | 'battery_low';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enumeratorName: string;
  formTitle: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  lat?: number;
  lng?: number;
}

export interface ODKSettingsConfig {
  serverUrl: string;
  username: string;
  serverType: 'CMRG Cloud' | 'PostgreSQL Standalone' | 'Central Hub';
  autoSync: boolean;
  autoSyncIntervalMinutes: number;
  deviceId: string;
  enumeratorName: string;
  enumeratorRegion: string;
  requireEncryption: boolean;
  offlineStorageQuotaMB: number;
  audioAuditingEnabled: boolean;
}
