
import React from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { Language, translations } from '../services/translations';

interface ProfileProps { 
  user: User; 
  onLogout: () => void; 
  lang: Language;
  isDark: boolean;
  setLang: (lang: Language) => void;
  toggleTheme: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, lang, isDark, setLang, toggleTheme }) => {
  const t = translations[lang];

  const wipeAllData = () => {
    if (window.confirm("CRITICAL: WIPE ALL LOCAL STORAGE? THIS WILL DELETE ACCOUNTS AND HISTORY.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Layout title={t.staff} lang={lang} isDark={isDark} setLang={setLang} toggleTheme={toggleTheme}>
      <div className="space-y-6">
        {/* Personnel Stamp Card */}
        <div className={`stamp-card flex flex-col items-center p-8 rounded-2xl border shadow-xl relative overflow-hidden transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-10 -mt-10 border ${isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-600/5 border-red-600/10'}`}></div>
          
          <div className="w-24 h-24 bg-[#E6192E] rounded-3xl flex items-center justify-center text-white text-3xl font-black mb-4 border-4 border-white shadow-2xl transform -rotate-3 transition-transform">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          
          <h3 className={`text-2xl font-black uppercase tracking-tighter italic ${isDark ? 'text-slate-100' : 'text-[#002855]'}`}>{user.fullName}</h3>
          <p className={`text-xs font-mono-sorting mt-1 uppercase font-bold tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{user.badgeId}</p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-2">
             <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${isDark ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-700 border-green-100'}`}>{t.active}</span>
          </div>
        </div>

        {/* System Protocols (Preferences) */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 mb-2 italic">{t.protocols}</h4>
          
          <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-100' : 'text-[#002855]'}`}>{t.theme}</p>
              <p className={`text-[9px] font-bold uppercase tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {isDark ? 'Night Sort Mode' : 'Standard Depot Vision'}
              </p>
            </div>
            <button onClick={toggleTheme} className={`w-10 h-6 rounded-full relative transition-colors shadow-inner ${isDark ? 'bg-[#E6192E]' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isDark ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div>
              <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-100' : 'text-[#002855]'}`}>Interface Language</p>
              <p className={`text-[9px] font-bold uppercase tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.langName}</p>
            </div>
            <svg className="w-5 h-5 text-[#E6192E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          
          <button 
            onClick={wipeAllData}
            className={`w-full p-4 rounded-2xl border flex items-center justify-between shadow-sm group transition-colors ${isDark ? 'bg-red-900/10 border-red-900/20 hover:bg-red-900/20' : 'bg-red-50 border-red-100 hover:bg-red-100'}`}
          >
            <div className="text-left">
              <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-red-400' : 'text-red-700'}`}>{t.wipeData}</p>
              <p className={`text-[9px] font-bold uppercase tracking-tighter ${isDark ? 'text-red-900/40' : 'text-red-400'}`}>Full Terminal Wipe</p>
            </div>
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        {/* Exit Bay */}
        <button
          onClick={onLogout}
          className="w-full bg-[#002855] text-white font-black py-5 rounded-2xl border-b-4 border-[#001d3d] shadow-xl transition-all active:scale-[0.98] mt-4 uppercase tracking-[0.2em] text-xs"
        >
          {t.terminateShift}
        </button>

        <p className="text-center text-[9px] text-slate-300 font-black uppercase tracking-[0.4em] pt-8">
          POKI_PRO_TERMINAL_V3.1.0
        </p>
      </div>
    </Layout>
  );
};

export default Profile;
