
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, ScannedItem } from '../types';
import { extractMailDetails } from '../services/geminiService';
import { Language, translations } from '../services/translations';

interface ScanProps { 
  user: User;
  lang: Language;
  isDark: boolean;
  setLang: (lang: Language) => void;
  toggleTheme: () => void;
}

const Scan: React.FC<ScanProps> = ({ user, lang, isDark, setLang, toggleTheme }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<any>(null);
  
  const [isScanning, setIsScanning] = useState(true);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [statusMsg, setStatusMsg] = useState('OPTICS ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showResult, setShowResult] = useState<ScannedItem | null>(null);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('poki_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (e) {
      console.error("Session recovery failed", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('poki_current_session', JSON.stringify(items));
  }, [items]);

  const stopHardware = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
  }, []);

  const startHardware = useCallback(async () => {
    try {
      stopHardware(); 
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        } as any,
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatusMsg('SEEKING POSTAL DATA');
    } catch (err) {
      setStatusMsg("ERROR: NO OPTICS");
      setIsScanning(false);
    }
  }, [stopHardware]);

  useEffect(() => {
    if (isScanning) startHardware();
    return () => stopHardware();
  }, [isScanning, startHardware, stopHardware]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !isScanning) return;
    
    setIsProcessing(true);
    setStatusMsg("DECODING ADDRESS...");
    setActiveWarning(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      if (video.readyState < 2) throw new Error("Video not ready");
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { alpha: false });
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const result = await extractMailDetails(dataUrl.split(',')[1]);

        if (result && result.isValid) {
          const newItem: ScannedItem = {
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            trackingId: result.trackingId || 'N/A',
            recipientName: result.recipientName || 'UNKNOWN',
            address: `${result.address || 'NO ADDRESS'} (PIN: ${result.pincode || '000000'})`,
            timestamp: new Date().toISOString(),
            session_id: 'current',
            status: 'captured',
            pincodeWarning: result.pincodeWarning
          };
          
          setItems(prev => [newItem, ...prev]);
          setShowResult(newItem);
          
          if (newItem.pincodeWarning) {
            setActiveWarning(newItem.pincodeWarning);
            setStatusMsg("ALERT: ROUTING ERROR");
            if ('vibrate' in navigator) navigator.vibrate([150, 50, 150]);
          } else {
            setStatusMsg("DATA VERIFIED");
            if ('vibrate' in navigator) navigator.vibrate([60]);
          }

          setTimeout(() => setShowResult(null), 3000);
        } else if (result?.error === "CONGESTION") {
          setStatusMsg("RE-ESTABLISHING UPLINK...");
        } else {
          setStatusMsg("INVALID OR BLURRED DATA");
        }
      }
    } catch (e) {
      console.error("Scanning process error", e);
      setStatusMsg("SENSORY ERROR");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isScanning]);

  useEffect(() => {
    if (isScanning) {
      scanTimerRef.current = setInterval(captureAndAnalyze, 9000); 
    }
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, [isScanning, captureAndAnalyze]);

  const finalizeSession = () => {
    if (items.length === 0) {
      alert("No data to finalize. Please scan at least one item.");
      return;
    }

    const confirmMsg = `FINALIZE POSTAL MANIFEST?\n\n- Units Scanned: ${items.length}\n- Action: Assort & Download Excel\n\nProceed with finalization?`;
    
    if (window.confirm(confirmMsg)) {
      setIsFinalizing(true);
      
      try {
        const assortedItems = [...items].sort((a, b) => {
          if (a.pincodeWarning && !b.pincodeWarning) return -1;
          if (!a.pincodeWarning && b.pincodeWarning) return 1;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        const sessionID = "B" + Date.now().toString().slice(-6).toUpperCase();
        const manifestData = {
          id: sessionID,
          startTime: items[items.length - 1].timestamp,
          endTime: new Date().toISOString(),
          items: assortedItems,
          user: user.fullName
        };

        const headers = ["Unit UID", "Tracking ID", "Recipient Name", "Full Address", "Scan Timestamp", "Sort Status"];
        const escape = (str: string) => `"${(str || '').toString().replace(/"/g, '""')}"`;

        const csvRows = assortedItems.map(item => [
          escape(item.id),
          escape(item.trackingId),
          escape(item.recipientName),
          escape(item.address),
          escape(new Date(item.timestamp).toLocaleString()),
          escape(item.pincodeWarning || "VERIFIED")
        ].join(","));

        const csvContent = "\ufeff" + [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `POKI_MANIFEST_${sessionID}.csv`);
        document.body.appendChild(link);
        link.click();
        
        const history = JSON.parse(localStorage.getItem('poki_history') || '[]');
        localStorage.setItem('poki_history', JSON.stringify([manifestData, ...history]));
        
        localStorage.removeItem('poki_current_session');
        stopHardware();

        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsFinalizing(false);
          setItems([]);
          navigate('/history');
        }, 1500);

      } catch (err) {
        console.error("Finalization failed", err);
        alert("CRITICAL ERROR: Failed to generate manifest.");
        setIsFinalizing(false);
      }
    }
  };

  return (
    <Layout title={t.scan} lang={lang} isDark={isDark} setLang={setLang} toggleTheme={toggleTheme}>
      <div className="flex flex-col h-full space-y-4">
        
        <div className={`relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 ${isDark ? 'bg-black border-slate-800' : 'bg-black border-[#002855]'}`}>
          
          {isFinalizing && (
            <div className="absolute inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center text-white p-10 text-center animate-pulse">
              <div className="w-16 h-16 border-4 border-[#E6192E] border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">ASSORTING LOGS</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">
                Packaging Excel Data Stream...
              </p>
            </div>
          )}

          {activeWarning && (
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white px-4 py-4 z-50 flex items-center justify-center space-x-3 shadow-2xl animate-pulse">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-center">{activeWarning}</span>
            </div>
          )}

          {isScanning ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500">
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">OPTICS STANDBY</p>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className={`w-4/5 h-2/3 border-2 border-dashed transition-all duration-700 rounded-2xl ${isProcessing ? 'border-red-500 scale-105 bg-red-500/10' : 'border-white/30'}`}>
              {isScanning && <div className="w-full h-1 bg-red-600 absolute top-0 animate-scan-gate shadow-[0_0_15px_red]"></div>}
            </div>

            <div className="mt-8 bg-black/80 border border-white/20 px-6 py-2 rounded-full backdrop-blur-md flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${isScanning ? (activeWarning ? 'bg-red-500' : 'bg-green-500 animate-pulse') : 'bg-slate-600'}`}></div>
              <p className="text-white text-[9px] font-black uppercase tracking-widest italic">{statusMsg}</p>
            </div>
          </div>

          {showResult && (
            <div className={`absolute bottom-6 left-6 right-6 p-4 rounded-2xl shadow-2xl border-l-[8px] animate-data-pop z-40 ${showResult.pincodeWarning ? 'bg-red-50 border-red-600' : 'bg-white border-[#E6192E]'}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest italic mb-1 ${showResult.pincodeWarning ? 'text-red-600' : 'text-[#002855]'}`}>
                {showResult.pincodeWarning ? 'LOGGED WITH WARNING' : 'VERIFIED ACQUISITION'}
              </p>
              <p className="text-xs font-black text-[#002855] font-mono-sorting truncate">{showResult.recipientName}</p>
              <p className="text-[10px] text-slate-400 truncate">{showResult.address}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setIsScanning(!isScanning)} 
            disabled={isFinalizing}
            className={`py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl border-b-4 transition-all ${isScanning ? (isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-[#002855]') : 'bg-red-600 border-red-800 text-white'} ${isFinalizing ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
          >
            {isScanning ? 'PAUSE' : 'RESUME'}
          </button>
          <button 
            onClick={finalizeSession} 
            disabled={isFinalizing || items.length === 0}
            className={`bg-[#002855] border-b-4 border-[#001d3d] text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${isFinalizing || items.length === 0 ? 'opacity-30 grayscale cursor-not-allowed' : 'active:scale-95 hover:bg-[#001d3d]'}`}
          >
            FINALIZE
          </button>
        </div>

        <div className={`rounded-3xl p-6 shadow-sm border flex-1 flex flex-col min-h-[160px] relative overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-3">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">SESSION LOG</h4>
            <span className="bg-[#002855] text-white text-[9px] font-black px-2 py-0.5 rounded-full italic">{items.length} UNITS</span>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-[200px] flex-1 px-1">
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-30 italic">
                <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Postal Entry</p>
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className={`p-3 rounded-xl border flex items-center space-x-3 animate-slide-in ${item.pincodeWarning ? 'bg-red-50/50 border-red-200' : (isDark ? 'bg-slate-900 border-slate-700' : 'bg-[#FDFBF7] border-slate-100')}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black font-mono-sorting ${item.pincodeWarning ? 'bg-red-600 text-white' : (isDark ? 'bg-slate-800 text-slate-100' : 'bg-white border text-[#002855]')}`}>
                  {item.id.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black uppercase truncate ${item.pincodeWarning ? 'text-red-700' : (isDark ? 'text-slate-100' : 'text-[#002855]')}`}>{item.recipientName}</p>
                  <p className="text-[8px] font-bold uppercase truncate italic text-slate-400">{item.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan-gate { 0% { top: 0%; opacity: 0; } 50% { opacity: 0.8; } 100% { top: 100%; opacity: 0; } }
        .animate-scan-gate { animation: scan-gate 2.5s infinite linear; }
        @keyframes slide-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
        @keyframes data-pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-data-pop { animation: data-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </Layout>
  );
};

export default Scan;
