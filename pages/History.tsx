
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Language, translations } from '../services/translations';
import { ScannedItem } from '../types';

interface HistoryProps {
  lang: Language;
  isDark: boolean;
  setLang: (lang: Language) => void;
  toggleTheme: () => void;
}

const History: React.FC<HistoryProps> = ({ lang, isDark, setLang, toggleTheme }) => {
  const t = translations[lang];
  const [history, setHistory] = useState<any[]>([]);
  const [inspecting, setInspecting] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('poki_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const exportExcelReport = (session: any) => {
    const headers = ["Unit ID", "Tracking ID", "Recipient Name", "Full Address", "Assortment Time", "Routing Warning"];
    
    const escapeCsv = (str: string) => `"${(str || '').toString().replace(/"/g, '""')}"`;

    const csvRows = session.items.map((item: ScannedItem) => [
      escapeCsv(item.id),
      escapeCsv(item.trackingId),
      escapeCsv(item.recipientName),
      escapeCsv(item.address),
      escapeCsv(new Date(item.timestamp).toLocaleString()),
      escapeCsv(item.pincodeWarning || "VERIFIED")
    ].join(","));

    const csvContent = "\ufeff" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `POKI_ARCHIVE_${session.id.toUpperCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <Layout title={t.manifests} lang={lang} isDark={isDark} setLang={setLang} toggleTheme={toggleTheme}>
      <div className="space-y-6">
        {history.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center flex flex-col items-center shadow-sm transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border transition-colors ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-[#FDFBF7] border-slate-100'}`}>
               <svg className="w-10 h-10 text-slate-400 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className={`font-black uppercase tracking-widest text-sm italic ${isDark ? 'text-slate-100' : 'text-[#002855]'}`}>{t.noManifests}</h3>
          </div>
        ) : (
          history.map((session) => (
            <div key={session.id} className={`stamp-card p-6 rounded-lg shadow-sm flex flex-col space-y-4 transition-all duration-300 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-black uppercase tracking-tighter italic text-lg ${isDark ? 'text-slate-100' : 'text-[#002855]'}`}>BATCH_#{session.id.toUpperCase()}</h4>
                  <p className="text-[9px] text-[#E6192E] font-mono-sorting font-medium uppercase mt-1">
                    {new Date(session.startTime).toLocaleString()}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded border uppercase ${isDark ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-[#002855]'}`}>
                  {session.items.length} {t.units}
                </span>
              </div>

              {inspecting === session.id && (
                <div className={`mt-2 p-3 rounded-xl border-t text-[9px] font-mono-sorting max-h-40 overflow-y-auto ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                  {session.items.map((it: any) => (
                    <div key={it.id} className="mb-2 last:mb-0 border-b pb-1 last:border-0 border-slate-200">
                      <p className="font-bold text-[#E6192E]">{it.id} - {it.recipientName}</p>
                      <p className="truncate opacity-70">{it.address}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button 
                  onClick={() => exportExcelReport(session)}
                  className="flex-1 bg-[#002855] text-white font-black text-[10px] py-4 rounded-xl uppercase tracking-widest transition-all active:scale-[0.95] shadow-lg"
                >
                  Export Excel (CSV)
                </button>
                <button 
                  onClick={() => setInspecting(inspecting === session.id ? null : session.id)}
                  className={`flex-1 border font-black text-[10px] py-4 rounded-xl uppercase tracking-widest transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600' : 'bg-white border-slate-200 text-[#002855] hover:bg-slate-50'}`}
                >
                  {inspecting === session.id ? 'Close' : 'Inspect'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default History;
