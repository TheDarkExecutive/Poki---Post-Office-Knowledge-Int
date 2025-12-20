
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User } from '../types';
import { Language, translations } from '../services/translations';

interface DashboardProps {
  user: User;
  lang: Language;
  isDark: boolean;
  setLang: (lang: Language) => void;
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, lang, isDark, setLang, toggleTheme }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  
  const [history, setHistory] = useState<any[]>([]);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    // Load actual history only
    const savedHistory = JSON.parse(localStorage.getItem('poki_history') || '[]');
    setHistory(savedHistory);
    
    // Calculate actual units sorted today from history
    const today = new Date().toISOString().split('T')[0];
    const todayItems = savedHistory
      .filter((session: any) => session.startTime.startsWith(today))
      .reduce((acc: number, session: any) => acc + session.items.length, 0);
    
    setSessionCount(todayItems);
  }, []);

  const resetDailyStats = () => {
    if (window.confirm(t.resetStats + "?")) {
      localStorage.removeItem('poki_history');
      localStorage.removeItem('poki_current_session');
      setHistory([]);
      setSessionCount(0);
    }
  };

  return (
    <Layout title={t.depot} lang={lang} isDark={isDark} setLang={setLang} toggleTheme={toggleTheme}>
      <div className="space-y-6">
        {/* Profile Card */}
        <div className={`rounded-3xl p-6 border shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <svg className={`w-24 h-24 ${isDark ? 'text-white' : 'text-[#002855]'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </div>
          <h2 className="text-[10px] font-black text-[#E6192E] uppercase tracking-[0.2em] mb-1">{t.onDuty}</h2>
          <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-[#002855]'}`}>{user.fullName}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span className={`font-mono-sorting text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${isDark ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>{user.badgeId}</span>
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className={`text-[9px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.active}</span>
              </div>
            </div>
            <button 
              onClick={resetDailyStats}
              className={`text-[8px] font-black uppercase hover:text-red-500 tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
            >
              {t.resetStats}
            </button>
          </div>
        </div>

        {/* Start Session Action */}
        <button
          onClick={() => navigate('/scan')}
          className="w-full bg-[#E6192E] hover:bg-[#c41527] text-white p-6 rounded-3xl shadow-[0_15px_30px_rgba(230,25,46,0.15)] flex items-center justify-between transition-all active:scale-[0.97] group border-b-4 border-[#a31120]"
        >
          <div className="text-left">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">{t.initializeScan}</h3>
            <p className="text-[10px] text-red-100 font-bold uppercase tracking-widest mt-1">{t.sortingGate}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01" /></svg>
          </div>
        </button>

        {/* Unified Stats Card */}
        <div className={`stamp-card p-8 rounded-lg shadow-sm text-center transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <span className={`block text-5xl font-black font-mono-sorting ${isDark ? 'text-slate-100' : 'text-[#002855]'}`}>{sessionCount}</span>
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] mt-3 block italic underline decoration-[#E6192E] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.sortedToday}</span>
        </div>

        {/* Actual Recent Manifests */}
        <div className={`rounded-3xl border overflow-hidden shadow-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className={`px-6 py-3 border-b flex justify-between items-center ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/50 border-slate-50'}`}>
            <h4 className={`font-bold text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.recentLogs}</h4>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-[#002855]'}`}>{t.terminal}</span>
          </div>
          <div className="p-4 space-y-4">
            {history.length > 0 ? history.slice(0, 5).map((session) => (
              <div key={session.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-slate-700' : 'border-slate-50'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-[#FDFBF7] border-slate-100 text-[#002855]'}`}>
                    <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-tight ${isDark ? 'text-slate-100' : 'text-[#002855]'}`}>BATCH_{session.id.toUpperCase()}</p>
                    <p className={`text-[9px] font-mono-sorting uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ARCHIVED
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#E6192E]">{session.items.length}</p>
                  <p className={`text-[8px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.units}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center opacity-20 italic">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{t.noManifests}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
