
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-full px-8 py-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-white/30" />
          </div>
          <span className="font-serif text-2xl tracking-tighter text-slate-900 font-bold">Zenith</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-slate-600 text-sm font-medium">
          <a href="#filosofi" className="hover:text-slate-900 transition-colors">Filosofi</a>
          <a href="#album" className="hover:text-slate-900 transition-colors">Album</a>
          <a href="#kontak" className="hover:text-slate-900 transition-colors">Kontak</a>
        </div>

        <button className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-all active:scale-95">
          Hubungi
        </button>
      </div>
    </nav>
  );
};
