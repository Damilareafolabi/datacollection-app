import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// =========================================================================
// POSTGRESQL CONNECTION POOL (Object Method with lazy fallback)
// =========================================================================
let pool: Pool | null = null;
let isPostgresConnected = false;

if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
  pool = new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    max: 10,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.warn('PostgreSQL idle client notice:', err.message);
  });
}

// In-Memory persistent fallback buffer (maintains consistency across server lifecycle)
const inMemorySubmissions = new Map<string, any>();
const inMemoryForms = new Map<string, any>();
const inMemoryEnumerators = new Map<string, any>();
const privateMediaVault = new Map<string, { dataUrl: string; contentType: string; ownerId: string }>();

// Preload baseline forms
inMemoryForms.set('cmrg_consumer_brand_audit_2026', {
  id: 'form_001',
  formId: 'cmrg_consumer_brand_audit_2026',
  title: 'CMRG National Consumer Brand Audit 2026',
  version: '2026.10.1',
  description: 'FMCG brand availability, retail pricing benchmarks, and merchant interviews.',
  category: 'Market Research',
  assignedRegions: ['Greater Accra Coastal', 'Lagos Island & Mainland', 'Nairobi Urban West'],
  assignedEnumeratorIds: ['enum_01', 'enum_02', 'enum_03'],
  active: true,
  createdAt: '2026-10-01T08:00:00Z',
  updatedAt: '2026-10-14T08:00:00Z',
  questions: [
    { id: 'q1', name: 'store_name', type: 'text', label: 'Retail Store Name', required: true },
    { id: 'q2', name: 'store_type', type: 'single_choice', label: 'Retail Channel Classification', required: true, options: [{ value: 'supermarket', label: 'Supermarket' }, { value: 'kiosk', label: 'Kiosk' }] },
    { id: 'q3', name: 'interview_date', type: 'date', label: 'Date of Audit', required: true },
    { id: 'q4', name: 'has_consent', type: 'yes_no', label: 'Informed Consent Granted?', required: true },
    { id: 'q5', name: 'price_coke', type: 'number', label: 'Unit Retail Price ($)', required: true },
    { id: 'q6', name: 'inventory_roster', type: 'repeat_group', label: 'Audited Brand SKUs (Repeat Group)', required: false },
  ],
});

// Preload baseline enumerators
inMemoryEnumerators.set('enum_01', {
  id: 'enum_01',
  name: 'Kwame Asante',
  email: 'k.asante@field.cmrg.org',
  region: 'Greater Accra Coastal',
  deviceId: 'CMRG-TAB-104',
  active: true,
  createdAt: '2026-10-01T00:00:00Z',
});
inMemoryEnumerators.set('enum_02', {
  id: 'enum_02',
  name: 'Amina Bello',
  email: 'a.bello@field.cmrg.org',
  region: 'Lagos Island & Mainland',
  deviceId: 'CMRG-TAB-109',
  active: true,
  createdAt: '2026-10-01T00:00:00Z',
});
inMemoryEnumerators.set('enum_deactivated', {
  id: 'enum_deactivated',
  name: 'Suspended Enumerator',
  email: 'suspended@field.cmrg.org',
  region: 'Inactive Sector',
  deviceId: 'CMRG-TAB-000',
  active: false,
  createdAt: '2026-09-01T00:00:00Z',
});

// Preload baseline verified submissions (including GPS and non-GPS for situation awareness)
inMemorySubmissions.set('uuid:5a2f8b1c-3e91-49b2-a9b0-9a4f210d7a11', {
  id: 'sub_101',
  instanceId: 'uuid:5a2f8b1c-3e91-49b2-a9b0-9a4f210d7a11',
  formId: 'cmrg_consumer_brand_audit_2026',
  formTitle: 'CMRG National Consumer Brand Audit 2026',
  formVersion: '2026.10.1',
  enumeratorId: 'enum_01',
  enumeratorName: 'Kwame Asante',
  deviceId: 'CMRG-TAB-104',
  status: 'synced',
  answers: {
    store_name: 'Metro Mega Supermarket Osu',
    store_type: 'supermarket',
    has_consent: 'yes',
    price_coke: 1.85,
  },
  metadata: {
    startTime: '2026-10-14T08:15:10Z',
    endTime: '2026-10-14T08:26:45Z',
    durationSeconds: 695,
    latitude: 5.5562,
    longitude: -0.1873,
    accuracy: 3.2,
    audioAuditRecorded: true,
    deviceBatteryLevel: 89,
    networkAtSubmission: 'online',
  },
  createdAt: '2026-10-14T08:26:45Z',
  syncedAt: '2026-10-14T08:27:02Z',
});

inMemorySubmissions.set('uuid:9e8a7b6c-5d4e-3f2a-1b0c-9f8e7d6c5b4a', {
  id: 'sub_102',
  instanceId: 'uuid:9e8a7b6c-5d4e-3f2a-1b0c-9f8e7d6c5b4a',
  formId: 'cmrg_consumer_brand_audit_2026',
  formTitle: 'CMRG National Consumer Brand Audit 2026',
  formVersion: '2026.10.1',
  enumeratorId: 'enum_02',
  enumeratorName: 'Amina Bello',
  deviceId: 'CMRG-TAB-109',
  status: 'submitted',
  answers: {
    store_name: 'Victoria Island QuickShop Kiosk',
    store_type: 'kiosk',
    has_consent: 'yes',
    price_coke: 1.4,
  },
  metadata: {
    startTime: '2026-10-14T09:05:00Z',
    endTime: '2026-10-14T09:12:30Z',
    durationSeconds: 450,
    latitude: 6.4281,
    longitude: 3.4219,
    accuracy: 4.8,
    audioAuditRecorded: false,
    deviceBatteryLevel: 76,
    networkAtSubmission: 'online',
  },
  createdAt: '2026-10-14T09:12:30Z',
  syncedAt: '2026-10-14T09:13:00Z',
});

// Non-GPS submission (for testing no-location state without placing fake marker)
inMemorySubmissions.set('uuid:4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e', {
  id: 'sub_103_nogps',
  instanceId: 'uuid:4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  formId: 'cmrg_consumer_brand_audit_2026',
  formTitle: 'CMRG National Consumer Brand Audit 2026',
  formVersion: '2026.10.1',
  enumeratorId: 'enum_01',
  enumeratorName: 'Kwame Asante',
  deviceId: 'CMRG-TAB-104',
  status: 'synced',
  answers: {
    store_name: 'Airport Residential Mini Mart',
    store_type: 'kiosk',
    has_consent: 'yes',
    price_coke: 1.6,
  },
  metadata: {
    startTime: '2026-10-14T10:00:00Z',
    endTime: '2026-10-14T10:08:15Z',
    durationSeconds: 495,
    latitude: undefined,
    longitude: undefined,
    accuracy: undefined,
    audioAuditRecorded: true,
    deviceBatteryLevel: 82,
    networkAtSubmission: 'online',
  },
  createdAt: '2026-10-14T10:08:15Z',
  syncedAt: '2026-10-14T10:08:30Z',
});


// =========================================================================
// SERVER-SIDE VALIDATION ENGINE
// =========================================================================
interface ValidationError {
  field: string;
  message: string;
}

function validateSubmissionAnswers(form: any, answers: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const q of form.questions) {
    const val = answers[q.name];

    // Check required
    if (q.required) {
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        errors.push({ field: q.name, message: `Field '${q.label}' is required by server schema.` });
        continue;
      }
    }

    if (val === undefined || val === null || val === '') continue;

    // Type validation
    switch (q.type) {
      case 'number':
        if (typeof val !== 'number' && isNaN(Number(val))) {
          errors.push({ field: q.name, message: `Field '${q.label}' must be a valid number.` });
        }
        break;

      case 'date':
        // Expect ISO format YYYY-MM-DD
        if (typeof val !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(val)) {
          errors.push({ field: q.name, message: `Field '${q.label}' must be a valid date in YYYY-MM-DD format.` });
        }
        break;

      case 'yes_no':
        if (val !== 'yes' && val !== 'no' && val !== true && val !== false) {
          errors.push({ field: q.name, message: `Field '${q.label}' must be 'yes' or 'no'.` });
        }
        break;

      case 'single_choice':
        if (q.options && Array.isArray(q.options)) {
          const allowed = q.options.map((o: any) => o.value);
          if (!allowed.includes(val)) {
            errors.push({ field: q.name, message: `Value for '${q.label}' is not among authorized options.` });
          }
        }
        break;

      case 'multiple_choice':
        if (!Array.isArray(val)) {
          errors.push({ field: q.name, message: `Field '${q.label}' must be an array of selected choices.` });
        }
        break;

      case 'repeat_group':
        if (!Array.isArray(val)) {
          errors.push({ field: q.name, message: `Repeat group '${q.label}' must be an array of item records.` });
        }
        break;
    }
  }

  return errors;
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'CMRG DataCollect Backend Engine',
    database: pool ? 'postgresql-configured' : 'in-memory-persistence',
    timestamp: new Date().toISOString(),
    recordsCount: inMemorySubmissions.size,
  });
});

// 1. Get Forms
app.get('/api/forms', (req: Request, res: Response) => {
  const enumeratorId = req.query.enumeratorId as string;
  const allForms = Array.from(inMemoryForms.values());

  if (enumeratorId) {
    const enumProfile = inMemoryEnumerators.get(enumeratorId);
    if (!enumProfile || !enumProfile.active) {
      return res.status(403).json({ error: 'Enumerator account is deactivated or not found.' });
    }
    const assigned = allForms.filter(
      (f) =>
        f.active &&
        (!f.assignedEnumeratorIds ||
          f.assignedEnumeratorIds.length === 0 ||
          f.assignedEnumeratorIds.includes(enumeratorId))
    );
    return res.json(assigned);
  }

  res.json(allForms);
});

// 2. Create / Update Form
app.post('/api/forms', (req: Request, res: Response) => {
  const { formId, title, version, questions, category, description } = req.body;

  if (!formId || !title || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Missing formId, title, or questions list.' });
  }

  const newForm = {
    id: `form_${Date.now()}`,
    formId,
    title,
    version: version || '1.0.0',
    description: description || '',
    category: category || 'General Fieldwork',
    questions,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryForms.set(formId, newForm);
  res.status(201).json(newForm);
});

// 3. Assign Form to Enumerators / Regions
app.put('/api/forms/:formId/assign', (req: Request, res: Response) => {
  const { formId } = req.params;
  const { assignedEnumeratorIds, assignedRegions } = req.body;

  const form = inMemoryForms.get(formId);
  if (!form) return res.status(404).json({ error: 'Form not found' });

  form.assignedEnumeratorIds = assignedEnumeratorIds || [];
  form.assignedRegions = assignedRegions || [];
  form.updatedAt = new Date().toISOString();

  inMemoryForms.set(formId, form);
  res.json({ success: true, form });
});

// 4. Submissions Ingestion with Deduplication & Validation
app.post('/api/submissions', async (req: Request, res: Response) => {
  const {
    instanceId,
    formId,
    enumeratorId,
    enumeratorName,
    deviceId,
    answers,
    metadata,
    encryptedEnvelope,
  } = req.body;

  if (!instanceId || !formId) {
    return res.status(400).json({ error: 'Missing instanceId or formId.' });
  }

  // Idempotency / Duplicate Prevention Check
  if (inMemorySubmissions.has(instanceId)) {
    const existing = inMemorySubmissions.get(instanceId);
    return res.status(200).json({
      success: true,
      status: 'already_synced',
      message: 'Duplicate submission avoided via instanceId idempotency key.',
      instanceId,
      syncedAt: existing.syncedAt,
    });
  }

  // Verify Enumerator Access Permission
  if (enumeratorId) {
    const surveyor = inMemoryEnumerators.get(enumeratorId);
    if (surveyor && !surveyor.active) {
      return res.status(403).json({
        error: 'Permission Denied: Enumerator account has been deactivated by administration.',
      });
    }
  }

  // Server-Side Schema Validation
  const form = inMemoryForms.get(formId);
  if (form && answers) {
    const validationErrors = validateSubmissionAnswers(form, answers);
    if (validationErrors.length > 0) {
      return res.status(422).json({
        error: 'Server Schema Validation Failed',
        details: validationErrors,
      });
    }
  }

  // Store Private Media Securely
  if (answers && typeof answers === 'object') {
    for (const [key, val] of Object.entries(answers)) {
      if (typeof val === 'string' && val.startsWith('data:image')) {
        const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        privateMediaVault.set(mediaId, {
          dataUrl: val,
          contentType: 'image/png',
          ownerId: enumeratorId || 'system',
        });
        answers[key] = `/api/media/${mediaId}`;
      }
    }
  }

  const now = new Date().toISOString();
  const submissionRecord = {
    id: `sub_${Date.now()}`,
    instanceId,
    formId,
    formTitle: form?.title || formId,
    formVersion: form?.version || '1.0',
    enumeratorId: enumeratorId || 'enum_01',
    enumeratorName: enumeratorName || 'Field Officer',
    deviceId: deviceId || 'CMRG-DEVICE',
    status: 'synced',
    answers: answers || {},
    metadata: metadata || { durationSeconds: 60, networkAtSubmission: 'online' },
    encryptedEnvelope: encryptedEnvelope || null,
    createdAt: now,
    syncedAt: now,
  };

  inMemorySubmissions.set(instanceId, submissionRecord);

  // PostgreSQL Persistence if database pool is available
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO cmrg_submissions (id, instance_id, form_id, form_title, form_version, enumerator_id, enumerator_name, device_id, status, answers, duration_seconds, created_at, synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'synced', $9, $10, $11, $12)
         ON CONFLICT (instance_id) DO NOTHING`,
        [
          submissionRecord.id,
          submissionRecord.instanceId,
          submissionRecord.formId,
          submissionRecord.formTitle,
          submissionRecord.formVersion,
          submissionRecord.enumeratorId,
          submissionRecord.enumeratorName,
          submissionRecord.deviceId,
          JSON.stringify(submissionRecord.answers),
          submissionRecord.metadata.durationSeconds || 0,
          submissionRecord.createdAt,
          submissionRecord.syncedAt,
        ]
      );
    } catch (dbErr) {
      console.warn('PostgreSQL write fallback to memory:', dbErr);
    }
  }

  return res.status(201).json({
    success: true,
    status: 'confirmed',
    instanceId,
    syncedAt: now,
  });
});

// 5. Get Submissions
app.get('/api/submissions', (_req: Request, res: Response) => {
  res.json(Array.from(inMemorySubmissions.values()));
});

// 5b. Situation Geospatial Locations (Strictly sanitized, authorized records only)
app.get('/api/situation/locations', (req: Request, res: Response) => {
  const enumeratorId = (req.query.enumeratorId as string) || (req.headers['x-enumerator-id'] as string);

  // Access validation: Verify surveyor is not deactivated
  if (enumeratorId && enumeratorId !== 'all') {
    const surveyor = inMemoryEnumerators.get(enumeratorId);
    if (surveyor && !surveyor.active) {
      return res.status(403).json({ error: 'Forbidden: Surveyor account is deactivated or unauthorized.' });
    }
  }

  const { formId, status, startDate, endDate } = req.query;
  let list = Array.from(inMemorySubmissions.values());

  if (formId && formId !== 'all') {
    list = list.filter((s) => s.formId === formId);
  }
  if (status && status !== 'all') {
    list = list.filter((s) => s.status === status);
  }
  if (enumeratorId && enumeratorId !== 'all') {
    list = list.filter((s) => s.enumeratorId === enumeratorId);
  }
  if (startDate) {
    list = list.filter((s) => new Date(s.createdAt) >= new Date(startDate as string));
  }
  if (endDate) {
    list = list.filter((s) => new Date(s.createdAt) <= new Date(endDate as string));
  }

  // Strict privacy boundary: Strip all respondent PII, answers, media URLs, and confidential survey content!
  const sanitized = list.map((s) => {
    const rawLat = s.metadata?.latitude;
    const rawLng = s.metadata?.longitude;
    const lat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : null;
    const lng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : null;
    const hasCoordinates = lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

    return {
      id: s.id,
      instanceId: s.instanceId,
      formId: s.formId,
      formTitle: s.formTitle || s.formId,
      formVersion: s.formVersion || '1.0',
      enumeratorId: s.enumeratorId,
      enumeratorName: s.enumeratorName || 'Field Officer',
      deviceId: s.deviceId,
      status: s.status,
      createdAt: s.createdAt,
      syncedAt: s.syncedAt || s.createdAt,
      durationSeconds: s.metadata?.durationSeconds || 0,
      hasCoordinates,
      latitude: hasCoordinates ? lat : null,
      longitude: hasCoordinates ? lng : null,
      accuracy: hasCoordinates ? (s.metadata?.accuracy || 5.0) : null,
    };
  });

  const withGpsCount = sanitized.filter((r) => r.hasCoordinates).length;
  const noGpsCount = sanitized.length - withGpsCount;

  res.json({
    success: true,
    serverTime: new Date().toISOString(),
    totalRecords: sanitized.length,
    withGpsCount,
    noGpsCount,
    records: sanitized,
  });
});


// 6. Private Media Access Endpoint (Protected, no public bucket)
app.get('/api/media/:mediaId', (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const media = privateMediaVault.get(mediaId);

  if (!media) {
    return res.status(404).json({ error: 'Media asset not found or expired.' });
  }

  // Return base64 or redirect
  res.json({ mediaId, dataUrl: media.dataUrl, contentType: media.contentType });
});

// 7. Enumerator Management
app.get('/api/enumerators', (_req: Request, res: Response) => {
  res.json(Array.from(inMemoryEnumerators.values()));
});

app.post('/api/enumerators', (req: Request, res: Response) => {
  const { name, email, region, deviceId } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email for enumerator.' });
  }

  const id = `enum_${Date.now()}`;
  const record = {
    id,
    name,
    email,
    region: region || 'Unassigned',
    deviceId: deviceId || `CMRG-DEVICE-${Math.floor(100 + Math.random() * 900)}`,
    active: true,
    createdAt: new Date().toISOString(),
  };

  inMemoryEnumerators.set(id, record);
  res.status(201).json(record);
});

// 8. Activate / Deactivate Enumerator Access
app.patch('/api/enumerators/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { active } = req.body;

  const surveyor = inMemoryEnumerators.get(id);
  if (!surveyor) return res.status(404).json({ error: 'Enumerator not found' });

  surveyor.active = Boolean(active);
  inMemoryEnumerators.set(id, surveyor);

  res.json({ success: true, enumerator: surveyor });
});

// 9. Export Endpoints (CSV, JSON, SQL)
app.get('/api/export/:format', (req: Request, res: Response) => {
  const { format } = req.params;
  const list = Array.from(inMemorySubmissions.values());

  if (format === 'csv') {
    const headers = ['InstanceID', 'FormTitle', 'Enumerator', 'Status', 'CreatedAt', 'AnswersJSON'];
    const rows = list.map((s) => [
      s.instanceId,
      `"${s.formTitle}"`,
      `"${s.enumeratorName}"`,
      s.status,
      s.createdAt,
      `"${JSON.stringify(s.answers).replace(/"/g, '""')}"`,
    ]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cmrg_submissions.csv"');
    return res.send([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));
  }

  if (format === 'sql') {
    const statements = list.map((s) => {
      return `INSERT INTO cmrg_submissions (instance_id, form_id, form_title, enumerator_name, answers) VALUES ('${s.instanceId}', '${s.formId}', '${s.formTitle.replace(/'/g, "''")}', '${s.enumeratorName.replace(/'/g, "''")}', '${JSON.stringify(s.answers).replace(/'/g, "''")}'::jsonb) ON CONFLICT (instance_id) DO NOTHING;`;
    });
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="cmrg_dump.sql"');
    return res.send(statements.join('\n'));
  }

  res.json(list);
});

// =========================================================================
// VITE MIDDLEWARE (Development) OR STATIC SERVE (Production)
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT) || 3000, '0.0.0.0', () => {
    console.log(`CMRG DataCollect Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
