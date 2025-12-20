
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginProps { onLogin: (user: User) => void; }

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [error, setError] = useState('');

  // Simulated DB
  const getAccounts = (): User[] => {
    const data = localStorage.getItem('poki_accounts');
    return data ? JSON.parse(data) : [];
  };

  const saveAccount = (user: User) => {
    const accounts = getAccounts();
    localStorage.setItem('poki_accounts', JSON.stringify([...accounts, user]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const accounts = getAccounts();

    if (isRegistering) {
      // Sign Up Flow
      const exists = accounts.find(a => a.email === email || a.badgeId === badgeId);
      if (exists) {
        setError('Account with this Email or Badge already exists');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        fullName: fullName || 'Staff Member',
        badgeId: badgeId || 'PX-' + Math.floor(100 + Math.random() * 900),
      };
      saveAccount(newUser);
      onLogin(newUser);
    } else {
      // Sign In Flow
      const user = accounts.find(a => a.email === email && a.badgeId === badgeId);
      if (user) {
        onLogin(user);
      } else {
        // If it's a new demo session and user provided name, use it.
        if (accounts.length === 0) {
            const demoUser = { 
              id: 'demo', 
              email, 
              fullName: fullName || 'Staff Member', 
              badgeId: badgeId || 'PX-DEMO'
            };
            saveAccount(demoUser);
            onLogin(demoUser);
        } else {
            setError('Invalid credentials. Check Email and Badge ID.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 airmail-border"></div>
      
      <div className="w-full max-w-sm space-y-8 bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#E6192E] rounded-2xl flex items-center justify-center shadow-xl border-4 border-white mb-4 transform -rotate-6 transition-transform hover:rotate-0">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-[#002855] tracking-tighter uppercase italic">POKI<span className="text-[#E6192E] decoration-slate-200">SORT</span></h2>
          <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            {isRegistering ? 'Enroll New Personnel' : 'Sorting Station Access'}
          </p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 text-[10px] font-bold p-3 rounded-xl border border-red-100 text-center uppercase tracking-widest animate-pulse">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Always show Name if possible for identity clarity */}
          <div className="animate-fade-in">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-[#FDFBF7] px-4 py-4 rounded-xl border border-slate-100 text-[#002855] placeholder-slate-300 focus:ring-2 focus:ring-[#E6192E] focus:border-transparent outline-none transition-all font-bold text-sm"
              placeholder="YOUR FULL NAME"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Staff Email</label>
            <input
              type="email"
              required
              className="w-full bg-[#FDFBF7] px-4 py-4 rounded-xl border border-slate-100 text-[#002855] placeholder-slate-300 focus:ring-2 focus:ring-[#E6192E] focus:border-transparent outline-none transition-all font-bold text-sm"
              placeholder="SORTER@DEPOT.GOV"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Staff Badge ID</label>
            <input
              type="text"
              required
              className="w-full bg-[#FDFBF7] px-4 py-4 rounded-xl border border-slate-100 text-[#002855] placeholder-slate-300 focus:ring-2 focus:ring-[#E6192E] focus:border-transparent outline-none transition-all font-mono-sorting text-sm"
              placeholder="PX-123"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#002855] hover:bg-[#001d3d] text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] mt-6"
          >
            {isRegistering ? 'Register & Enter' : 'Authorize Entry'}
          </button>
        </form>

        <div className="text-center space-y-4 pt-4 border-t border-slate-50">
          <button 
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-[10px] font-black text-[#E6192E] uppercase tracking-widest hover:underline"
          >
            {isRegistering ? 'Already Enrolled? Log In' : 'New Personnel? Register Here'}
          </button>
          
          <p className="text-[8px] text-slate-300 uppercase font-black tracking-[0.2em]">
            Central Depot Control v2.1
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 airmail-border"></div>
    </div>
  );
};

export default Login;
