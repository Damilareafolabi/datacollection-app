/**
 * CMRG Data Collect - Unified Authorized API Client
 * Interfaces with CMRG backend services for forms, submissions,
 * enumerator authorization, and geospatial situation awareness.
 */

import { FormDefinition, Submission, EnumeratorProfile } from '../types/survey.ts';

export interface SituationLocationRecord {
  id: string;
  instanceId: string;
  formId: string;
  formTitle: string;
  formVersion: string;
  enumeratorId: string;
  enumeratorName: string;
  deviceId: string;
  status: 'synced' | 'submitted' | 'flagged' | 'draft';
  createdAt: string;
  syncedAt?: string;
  durationSeconds?: number;
  hasCoordinates: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export interface SituationLocationsResponse {
  success: boolean;
  serverTime: string;
  totalRecords: number;
  withGpsCount: number;
  noGpsCount: number;
  records: SituationLocationRecord[];
}

export interface SituationFilters {
  formId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  enumeratorId?: string;
}

export class CMRGApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves sanitized, authorized situation geospatial records from the server.
   * Strips all respondent answers, personal identities, and media URLs for privacy.
   */
  async getSituationLocations(
    filters?: SituationFilters,
    authHeader?: string
  ): Promise<SituationLocationsResponse> {
    const params = new URLSearchParams();
    if (filters?.formId && filters.formId !== 'all') params.set('formId', filters.formId);
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.enumeratorId && filters.enumeratorId !== 'all') params.set('enumeratorId', filters.enumeratorId);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${this.baseUrl}/api/situation/locations${query}`, { headers });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('Access denied: Unauthorized situation access or deactivated surveyor account.');
      }
      throw new Error(`Failed to fetch situation locations (HTTP ${res.status})`);
    }

    return await res.json();
  }

  /**
   * Fetch all form definitions from the server.
   */
  async getForms(enumeratorId?: string): Promise<FormDefinition[]> {
    const query = enumeratorId ? `?enumeratorId=${encodeURIComponent(enumeratorId)}` : '';
    const res = await fetch(`${this.baseUrl}/api/forms${query}`);
    if (!res.ok) throw new Error(`Failed to fetch forms (HTTP ${res.status})`);
    return await res.json();
  }

  /**
   * Fetch all submissions from the server.
   */
  async getSubmissions(): Promise<Submission[]> {
    const res = await fetch(`${this.baseUrl}/api/submissions`);
    if (!res.ok) throw new Error(`Failed to fetch submissions (HTTP ${res.status})`);
    return await res.json();
  }

  /**
   * Fetch enumerators list.
   */
  async getEnumerators(): Promise<EnumeratorProfile[]> {
    const res = await fetch(`${this.baseUrl}/api/enumerators`);
    if (!res.ok) throw new Error(`Failed to fetch enumerators (HTTP ${res.status})`);
    return await res.json();
  }

  /**
   * Submit a field interview response to the server.
   */
  async submitSurvey(payload: Partial<Submission>): Promise<{ success: boolean; instanceId: string; status: string }> {
    const res = await fetch(`${this.baseUrl}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server submission error (HTTP ${res.status})`);
    }

    return await res.json();
  }
}

export const cmrgApi = new CMRGApiClient();
