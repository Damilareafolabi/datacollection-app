import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Submission } from '../types/survey.ts';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString(),
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Sync a submission to central cloud firestore database
 */
export async function syncSubmissionToCloud(sub: Submission): Promise<boolean> {
  const path = `submissions/${sub.id}`;
  try {
    const docRef = doc(db, 'submissions', sub.id);
    await setDoc(
      docRef,
      {
        instanceId: sub.instanceId,
        formId: sub.formId,
        formTitle: sub.formTitle,
        formVersion: sub.formVersion,
        enumeratorName: sub.enumeratorName,
        deviceId: sub.deviceId,
        status: 'synced',
        answers: sub.answers,
        latitude: sub.metadata.latitude || null,
        longitude: sub.metadata.longitude || null,
        durationSeconds: sub.metadata.durationSeconds || 0,
        audioAuditActive: sub.metadata.audioAuditRecorded || false,
        submittedAt: sub.createdAt,
        syncedAt: new Date().toISOString(),
        isEncrypted: !!sub.encryptedEnvelope,
        encryptedEnvelope: sub.encryptedEnvelope || null,
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}
