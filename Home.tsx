
import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [profileData, setProfileData] = useState({
    displayName: "HEZZELL",
    avatarUrl: ""
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'profile'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfileData({
          displayName: data.displayName || "HEZZELL",
          avatarUrl: data.avatarUrl || ""
        });
      }
    });
    return () => unsub;
  }, []);

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
      <section className="relative pt-48 pb-24 px-6 w-full max-w-7xl flex flex-col items-center text-center">
        
        {/* Profile Circle Container */}
        <div className="relative mb-16 cursor-default group">
          <div className="w-56 h-56 md:w-72 md:h-72 rounded-full border border-white/80 bg-white/40 backdrop-blur-3xl flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all overflow-hidden relative">
             
             {profileData.avatarUrl ? (
               <img 
                src={profileData.avatarUrl} 
                alt="Profile" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               />
             ) : (
               <>
                 <h1 className="font-serif text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase">
                   {profileData.displayName.split(" ")[0]}
                 </h1>
                 <div className="h-px w-12 bg-slate-900/20 mt-4"></div>
               </>
             )}

          </div>
        </div>

        <h2 className="text-4xl md:text-6xl font-serif max-w-3xl mb-8 leading-tight text-slate-800">
          Vibes Estetik <br/> <span className="italic font-light">Tanpa Tapi.</span>
        </h2>
        
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-light">
          Tempat gue numpahin semua ide visual yang random tapi tetep <i>pleasing</i> di mata. Keep it clean, keep it classy, bestie.
        </p>

        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('instagram')}
            className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95"
          >
            Intip Feed Gue <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};
