import { FormDefinition, Submission, EnumeratorProfile, SituationAlert, ODKSettingsConfig } from '../types/survey.ts';
import { INITIAL_FORMS, INITIAL_SUBMISSIONS, INITIAL_ENUMERATORS, INITIAL_SITUATION_ALERTS, DEFAULT_SETTINGS } from './mockData.ts';

const STORAGE_KEYS = {
  FORMS: 'cmrg_forms_v1',
  SUBMISSIONS: 'cmrg_submissions_v1',
  ENUMERATORS: 'cmrg_enumerators_v1',
  ALERTS: 'cmrg_alerts_v1',
  SETTINGS: 'cmrg_settings_v1',
};

export class StorageManager {
  static getForms(): FormDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FORMS);
      return data ? JSON.parse(data) : INITIAL_FORMS;
    } catch {
      return INITIAL_FORMS;
    }
  }

  static saveForms(forms: FormDefinition[]): void {
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
  }

  static getSubmissions(): Submission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return data ? JSON.parse(data) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  }

  static saveSubmissions(submissions: Submission[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }

  static addSubmission(submission: Submission): void {
    const list = this.getSubmissions();
    const existingIdx = list.findIndex((s) => s.id === submission.id || s.instanceId === submission.instanceId);
    if (existingIdx >= 0) {
      list[existingIdx] = submission;
    } else {
      list.unshift(submission);
    }
    this.saveSubmissions(list);
  }

  static getEnumerators(): EnumeratorProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENUMERATORS);
      return data ? JSON.parse(data) : INITIAL_ENUMERATORS;
    } catch {
      return INITIAL_ENUMERATORS;
    }
  }

  static saveEnumerators(enumerators: EnumeratorProfile[]): void {
    localStorage.setItem(STORAGE_KEYS.ENUMERATORS, JSON.stringify(enumerators));
  }

  static getAlerts(): SituationAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : INITIAL_SITUATION_ALERTS;
    } catch {
      return INITIAL_SITUATION_ALERTS;
    }
  }

  static saveAlerts(alerts: SituationAlert[]): void {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }

  static getSettings(): ODKSettingsConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: ODKSettingsConfig): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getStorageEstimate(): { usedMB: string; quotaMB: number; percent: number } {
    let totalBytes = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key);
      if (item) totalBytes += item.length * 2; // rough UTF-16 byte estimate
    }
    const usedMB = (totalBytes / (1024 * 1024) + 4.2).toFixed(1); // base app cache + offline db
    const quotaMB = 500;
    const percent = Math.min(100, Math.round((parseFloat(usedMB) / quotaMB) * 100));
    return { usedMB, quotaMB, percent };
  }
}
