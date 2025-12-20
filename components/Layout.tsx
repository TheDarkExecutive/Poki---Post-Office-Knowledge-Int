
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Language, translations } from '../services/translations';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  lang: Language;
  isDark: boolean;
  setLang: (lang: Language) => void;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, lang, isDark, setLang, toggleTheme }) => {
  const location = useLocation();
  const t = translations[lang];

  const navItems = [
    { path: '/dashboard', label: t.depot, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { path: '/scan', label: t.scan, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" /></svg>
    )},
    { path: '/history', label: t.manifests, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    )},
    { path: '/profile', label: t.staff, icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
  ];

  const langs: Language[] = ['en', 'hi', 'te', 'ta', 'ml', 'kn'];

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto relative overflow-hidden transition-colors duration-300 border-x ${isDark ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-[#FDFBF7] text-[#002855] border-slate-200 shadow-2xl'}`}>
      <div className="airmail-border"></div>
      
      {/* Postal Header */}
      <header className={`px-6 py-4 shadow-sm sticky top-0 z-50 flex justify-between items-center ${isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-100'}`}>
        <div className="flex items-center space-x-2">
          <div className="bg-[#E6192E] p-1.5 rounded-lg rotate-3 shadow-md">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
          </div>
          <h1 className="text-xl font-black tracking-tighter">POKI<span className="text-[#E6192E]">SORT</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Picker */}
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as Language)}
            className={`text-[9px] font-black uppercase px-2 py-1 rounded border outline-none cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
          >
            {langs.map(l => <option key={l} value={l}>{translations[l].langName}</option>)}
          </select>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={`p-1.5 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            {isDark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {children}
      </main>

      {/* Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-6 py-3 max-w-md mx-auto z-40 flex justify-between items-center rounded-t-3xl transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
              location.pathname === item.path ? 'text-[#E6192E] scale-110' : (isDark ? 'text-slate-600' : 'text-slate-300 hover:text-[#002855]')
            }`}
          >
            <div className={`${location.pathname === item.path ? (isDark ? 'bg-red-900/20' : 'bg-red-50') + ' p-1.5 rounded-xl shadow-sm' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="fixed bottom-0 left-0 right-0 h-1 airmail-border max-w-md mx-auto pointer-events-none"></div>
    </div>
  );
};

export default Layout;
