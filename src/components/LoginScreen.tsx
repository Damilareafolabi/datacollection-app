import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Smartphone,
  ChevronLeft,
  KeyRound,
  CheckCircle2,
  Building,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (userRole: 'admin' | 'supervisor' | 'enumerator', userName: string) => void;
  onNavigateHome: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [accessCode, setAccessCode] = useState('enum_01');
  const [pin, setPin] = useState('1234');
  const [role, setRole] = useState<'enumerator' | 'supervisor' | 'admin'>('enumerator');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountRequest, setShowAccountRequest] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (accessCode === 'enum_deactivated') {
        setError('Access Denied: This field officer account has been deactivated by administration.');
        return;
      }

      if (accessCode.trim().length < 3) {
        setError('Please enter a valid administrator-issued Enumerator ID or Access Code.');
        return;
      }

      const displayName =
        accessCode === 'enum_01'
          ? 'Kwame Asante'
          : accessCode === 'enum_02'
          ? 'Amina Bello'
          : accessCode === 'admin'
          ? 'Principal Investigator (Admin)'
          : `Officer ${accessCode}`;

      onLoginSuccess(role, displayName);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">
      {/* Top Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Welcome Portal</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center font-black text-white text-xs">
            C
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">CMRG DATA COLLECT</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Field Surveyor Sign-In
            </h1>
            <p className="text-xs text-slate-400">
              Authorized access with administrator-issued credentials only.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Select */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole('enumerator')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    role === 'enumerator'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Surveyor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supervisor')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    role === 'supervisor'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Supervisor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    role === 'admin'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Access Code / Enumerator ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Enumerator ID / Access Code
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. enum_01"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            {/* Security PIN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Security PIN / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
            >
              {isLoading ? (
                <span>Authenticating Device...</span>
              ) : (
                <>
                  <span>Sign In to Field Collector</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Test Accounts Quick Select Box */}
          <div className="pt-2 border-t border-slate-800 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Verified Test Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setAccessCode('enum_01');
                  setRole('enumerator');
                }}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700"
              >
                <div className="font-bold text-white">Kwame Asante</div>
                <div className="text-[10px] text-emerald-400 font-mono">enum_01 (Active)</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccessCode('enum_02');
                  setRole('enumerator');
                }}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700"
              >
                <div className="font-bold text-white">Amina Bello</div>
                <div className="text-[10px] text-emerald-400 font-mono">enum_02 (Active)</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccessCode('admin');
                  setRole('admin');
                }}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700"
              >
                <div className="font-bold text-white">PI Coordinator</div>
                <div className="text-[10px] text-blue-400 font-mono">admin (Admin)</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccessCode('enum_deactivated');
                  setRole('enumerator');
                }}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700"
              >
                <div className="font-bold text-red-300">Suspended Officer</div>
                <div className="text-[10px] text-red-400 font-mono">enum_deactivated</div>
              </button>
            </div>
          </div>

          {/* Account Request Guidance */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowAccountRequest(!showAccountRequest)}
              className="text-[11px] text-slate-400 hover:text-white underline underline-offset-4"
            >
              Need field credentials? View account request policy
            </button>

            {showAccountRequest && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1 animate-fadeIn">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Self-Registration is Disabled</span>
                </div>
                <p>
                  To preserve study data integrity and protect respondent privacy, enumerator accounts and device tokens are created and managed exclusively by authorized CMRG administrators.
                </p>
                <p className="text-slate-500">
                  Contact your study field manager or PI to provision your device ID and questionnaire assignments.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        CMRG Data Collect &bull; Standalone Field Survey Platform &bull; E2E Envelopes &bull; PostgreSQL
      </footer>
    </div>
  );
};
