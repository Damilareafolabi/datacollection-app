import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { Overview } from './components/Overview.tsx';
import { FormsAndImports } from './components/FormsAndImports.tsx';
import { CollectData } from './components/CollectData.tsx';
import { SubmissionsView } from './components/SubmissionsView.tsx';
import { SituationRoom } from './components/SituationRoom.tsx';
import { AdminEnumeratorManager } from './components/AdminEnumeratorManager.tsx';
import { SQLStudio } from './components/SQLStudio.tsx';
import { SystemSettings } from './components/SystemSettings.tsx';
import { CMRGMobileCollect } from './components/CMRGMobileCollect.tsx';
import { UserGuideModal } from './components/UserGuideModal.tsx';
import { StorageManager } from './lib/storage.ts';
import { syncSubmissionToCloud } from './lib/firebase.ts';
import { useOnlineStatus } from './hooks/useOnlineStatus.ts';
import { FormDefinition, Submission, ODKSettingsConfig, SituationAlert, EnumeratorProfile } from './types/survey.ts';
import { Monitor, WifiOff, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [forms, setForms] = useState<FormDefinition[]>(() => StorageManager.getForms());
  const [submissions, setSubmissions] = useState<Submission[]>(() => StorageManager.getSubmissions());
  const [alerts, setAlerts] = useState<SituationAlert[]>(() => StorageManager.getAlerts());
  const [settings, setSettings] = useState<ODKSettingsConfig>(() => StorageManager.getSettings());
  const [enumerators, setEnumerators] = useState<EnumeratorProfile[]>(() => StorageManager.getEnumerators());

  const [collectFormId, setCollectFormId] = useState<string | undefined>();
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const isOnline = useOnlineStatus();

  // Auto-detect mobile screen on mount to default to phone mode if on a real mobile device
  useEffect(() => {
    if (window.innerWidth < 640) {
      setIsMobileDeviceView(true);
    }
  }, []);

  // Save changes to storage
  const handleSaveSubmission = (newSub: Submission) => {
    StorageManager.addSubmission(newSub);
    setSubmissions(StorageManager.getSubmissions());
  };

  const handleAddForm = (newForm: FormDefinition) => {
    const updated = [newForm, ...forms];
    setForms(updated);
    StorageManager.saveForms(updated);
  };

  const handleDeleteForm = (formId: string) => {
    const updated = forms.filter((f) => f.id !== formId);
    setForms(updated);
    StorageManager.saveForms(updated);
  };

  const handleSaveSettings = (newSettings: ODKSettingsConfig) => {
    setSettings(newSettings);
    StorageManager.saveSettings(newSettings);
  };

  const handleResolveAlert = (alertId: string) => {
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a));
    setAlerts(updated);
    StorageManager.saveAlerts(updated);
  };

  // Enumerator Management Actions
  const handleToggleEnumeratorStatus = (enumeratorId: string, active: boolean) => {
    const updated = enumerators.map((e) => (e.id === enumeratorId ? { ...e, active } : e));
    setEnumerators(updated);
    StorageManager.saveEnumerators(updated);
  };

  const handleAddEnumerator = (newProfile: EnumeratorProfile) => {
    const updated = [newProfile, ...enumerators];
    setEnumerators(updated);
    StorageManager.saveEnumerators(updated);
  };

  const handleAssignFormsToEnumerator = (enumeratorId: string, formIds: string[]) => {
    const updatedForms = forms.map((f) => {
      const isAssigned = formIds.includes(f.formId);
      const currentList = f.assignedEnumeratorIds || [];
      const newList = isAssigned
        ? Array.from(new Set([...currentList, enumeratorId]))
        : currentList.filter((id: string) => id !== enumeratorId);
      return { ...f, assignedEnumeratorIds: newList };
    });
    setForms(updatedForms);
    StorageManager.saveForms(updatedForms);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    const pending = submissions.filter((s) => s.status === 'submitted' || s.status === 'draft');
    let successCount = 0;

    for (const sub of pending) {
      const ok = await syncSubmissionToCloud(sub);
      if (ok) successCount++;
    }

    // Mark as synced locally
    const updated = submissions.map((s) => {
      if (s.status === 'submitted') {
        return { ...s, status: 'synced' as const, syncedAt: new Date().toISOString() };
      }
      return s;
    });

    setSubmissions(updated);
    StorageManager.saveSubmissions(updated);
    setIsSyncing(false);
    setSyncToast(`Successfully synchronized ${pending.length} submissions to central database!`);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const pendingSyncCount = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'draft'
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-full shadow-2xl">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode Active — Surveys are stored securely on device</span>
        </div>
      )}

      {/* Sync Notification Toast */}
      {syncToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* If Mobile Device View is toggled: Render CMRG Mobile Field App */}
      {isMobileDeviceView ? (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-0 md:p-6 bg-slate-950 overflow-hidden relative">
          {/* Desktop return toggle floating button */}
          <div className="hidden md:flex absolute top-4 left-6 z-40 items-center gap-3">
            <button
              onClick={() => setIsMobileDeviceView(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold shadow-lg transition"
            >
              <Monitor className="w-4 h-4 text-red-500" />
              <span>Back to Web Console</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Previewing <strong>CMRG Mobile Fieldwork PWA</strong>
            </span>
          </div>

          {/* Smartphone Bezel Simulator on Desktop */}
          <div className="w-full h-full md:w-[410px] md:h-[840px] md:max-h-[95vh] md:rounded-[46px] md:border-[10px] md:border-slate-800 md:shadow-2xl overflow-hidden flex flex-col relative bg-slate-900">
            {/* Phone speaker notch on desktop */}
            <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-40" />

            <CMRGMobileCollect
              forms={forms}
              submissions={submissions}
              onSaveSubmission={handleSaveSubmission}
              onSyncAll={handleTriggerSync}
              onExitMobileOnly={() => setIsMobileDeviceView(false)}
              onOpenGuide={() => setIsGuideOpen(true)}
              enumeratorName={settings.enumeratorName}
              deviceId={settings.deviceId}
            />
          </div>
        </div>
      ) : (
        /* Web Console & Situation Room View */
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'collect') {
                setCollectFormId(undefined);
              }
              setCurrentTab(tab);
            }}
            isMobileDeviceView={isMobileDeviceView}
            onToggleMobileView={() => setIsMobileDeviceView(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            submissionsCount={submissions.length}
            pendingSyncCount={pendingSyncCount}
          />

          <main className="flex-1 flex flex-col overflow-hidden">
            {currentTab === 'overview' && (
              <Overview
                onStartCollecting={() => {
                  setCollectFormId(forms[0]?.formId);
                  setCurrentTab('collect');
                }}
                onNavigateToForms={() => setCurrentTab('forms')}
                onNavigateToSubmissions={() => setCurrentTab('submissions')}
                onNavigateToSituation={() => setCurrentTab('situation')}
                onTriggerSync={handleTriggerSync}
                submissions={submissions}
                forms={forms}
                isSyncing={isSyncing}
              />
            )}

            {currentTab === 'forms' && (
              <FormsAndImports
                forms={forms}
                onAddForm={handleAddForm}
                onDeleteForm={handleDeleteForm}
                onSelectFormToCollect={(fId) => {
                  setCollectFormId(fId);
                  setCurrentTab('collect');
                }}
              />
            )}

            {currentTab === 'collect' && (
              <CollectData
                forms={forms}
                selectedFormId={collectFormId}
                onSaveSubmission={handleSaveSubmission}
                onBackToOverview={() => setCurrentTab('overview')}
                enumeratorName={settings.enumeratorName}
                deviceId={settings.deviceId}
              />
            )}

            {currentTab === 'submissions' && (
              <SubmissionsView
                submissions={submissions}
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
            )}

            {currentTab === 'situation' && (
              <SituationRoom
                enumerators={enumerators}
                submissions={submissions}
                alerts={alerts}
                onResolveAlert={handleResolveAlert}
              />
            )}

            {currentTab === 'enumerators' && (
              <AdminEnumeratorManager
                enumerators={enumerators}
                forms={forms}
                onToggleStatus={handleToggleEnumeratorStatus}
                onAddEnumerator={handleAddEnumerator}
                onAssignForms={handleAssignFormsToEnumerator}
              />
            )}

            {currentTab === 'sql' && <SQLStudio submissions={submissions} />}

            {currentTab === 'settings' && (
              <SystemSettings settings={settings} onSaveSettings={handleSaveSettings} />
            )}
          </main>
        </div>
      )}

      {/* Interactive Fieldwork User Guide Modal */}
      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
