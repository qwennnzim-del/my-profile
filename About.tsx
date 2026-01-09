
import React, { useState } from 'react';
import { ArrowRight, RefreshCcw, Smile, User } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: { text: string; type: 'fun' | 'serious' }[];
}

interface AboutProps {
  onFinishQuiz: (message: string) => void;
}

const questions: Question[] = [
  {
    id: 1,
    text: "Kalau tiba-tiba jadi zombie, hal pertama yang lo lakuin?",
    options: [
      { text: "Cari otak segar 🧠", type: 'serious' },
      { text: "Update story IG: 'Feeling dead' 💀", type: 'fun' },
      { text: "Tidur lagi, capek jadi zombie", type: 'fun' },
      { text: "Makan mantan", type: 'fun' },
    ]
  },
  {
    id: 2,
    text: "Bubur ayam itu enaknya...",
    options: [
      { text: "Diaduk dong! Biar nyatu rasanya", type: 'fun' },
      { text: "Gak diaduk, visual number one", type: 'serious' },
      { text: "Disedot pake sedotan boba", type: 'fun' },
      { text: "Gak pake ayam, sukanya bubur hati", type: 'fun' },
    ]
  },
  {
    id: 3,
    text: "Lagi jalan sama crush, eh sendal jepit putus. Solusinya?",
    options: [
      { text: "Pura-pura pingsan", type: 'fun' },
      { text: "Jalan nyeker pede aja", type: 'fun' },
      { text: "Minta gendong (modus)", type: 'fun' },
      { text: "Beli baru di warung terdekat", type: 'serious' },
    ]
  },
  {
    id: 4,
    text: "Kalau lo punya uang 1 Miliar sekarang, mau beli apa?",
    options: [
      { text: "Investasi saham", type: 'serious' },
      { text: "Beli seblak se-truk", type: 'fun' },
      { text: "Bayar utang temen (bohong deng)", type: 'fun' },
      { text: "Keliling dunia cari jodoh", type: 'fun' },
    ]
  },
  {
    id: 5,
    text: "Mantan nge-chat 'Hai' jam 12 malem, respon lo?",
    options: [
      { text: "Langsung block, bye!", type: 'serious' },
      { text: "Maaf, nomor yang anda tuju sedang bahagia", type: 'fun' },
      { text: "Bales: 'Pinjam dulu seratus'", type: 'fun' },
      { text: "Auto baper (yah lemah)", type: 'fun' },
    ]
  },
  {
    id: 6,
    text: "Lo tim mana kalau lagi mandi?",
    options: [
      { text: "Konser tunggal teriak-teriak", type: 'fun' },
      { text: "Bengong mikirin masa depan", type: 'serious' },
      { text: "Debat imajiner sama musuh", type: 'fun' },
      { text: "Mandi bebek (asal basah)", type: 'fun' },
    ]
  },
  {
    id: 7,
    text: "Hal paling absurd yang pernah lo bawa pas sekolah/kerja?",
    options: [
      { text: "Bantal guling", type: 'fun' },
      { text: "Laptop (normal lah)", type: 'serious' },
      { text: "Remote TV (kebawa)", type: 'fun' },
      { text: "Kenangan masa lalu", type: 'fun' },
    ]
  },
  {
    id: 8,
    text: "Kucing lo bisa ngomong, kalimat pertama dia apa?",
    options: [
      { text: "Mana makanan gue, babu?", type: 'fun' },
      { text: "Lo jelek banget bangun tidur", type: 'fun' },
      { text: "I love you (mustahil)", type: 'serious' },
      { text: "Bukain pintu! (terus gak masuk)", type: 'fun' },
    ]
  },
  {
    id: 9,
    text: "Kalau bisa punya kekuatan super, mau apa?",
    options: [
      { text: "Terbang bebas", type: 'serious' },
      { text: "Makan banyak gak gendut", type: 'fun' },
      { text: "Menghilang pas ditanya 'kapan nikah'", type: 'fun' },
      { text: "Baca pikiran gebetan", type: 'fun' },
    ]
  },
  {
    id: 10,
    text: "Terakhir, siapa yang paling keren sedunia?",
    options: [
      { text: "Gue lah, siapa lagi?", type: 'fun' },
      { text: "Hezzell dong", type: 'serious' },
      { text: "Ibu Peri", type: 'fun' },
      { text: "Admin slot (eh jangan)", type: 'fun' },
    ]
  }
];

export const About: React.FC<AboutProps> = ({ onFinishQuiz }) => {
  const [step, setStep] = useState<'name' | 'quiz' | 'result'>('name');
  const [userName, setUserName] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [funScore, setFunScore] = useState(0);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setStep('quiz');
    }
  };

  const handleAnswer = (type: 'fun' | 'serious') => {
    let newScore = funScore;
    if (type === 'fun') {
      newScore = funScore + 1;
      setFunScore(newScore);
    }

    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
      setCurrentQ(nextQ);
    } else {
      setStep('result');
      // Trigger Notification with logic based on final score
      // Note: We need to recalculate result logic here or pass the calculated result
      let resultTitle = "";
      if (newScore > 7) resultTitle = "HUMOR PECAH 🤣";
      else if (newScore > 4) resultTitle = "SERU TAPI JAIM 😎";
      else resultTitle = "SERIUS AMAT 😐";

      onFinishQuiz(`${userName} baru aja kelar quiz! Hasilnya: ${resultTitle}`);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setFunScore(0);
    setStep('name');
    setUserName('');
  };

  const getResult = () => {
    if (funScore > 7) return { title: `HUMOR ${userName.toUpperCase()} PECAH! 🤣`, desc: `Fix, ${userName} itu orangnya asik parah, random, dan gak jaim. Temen nongkrong idaman banget nih!` };
    if (funScore > 4) return { title: `${userName.toUpperCase()} SERU TAPI JAIM 😎`, desc: `${userName} bisa diajak gila-gilaan, tapi kadang masih mikir image. Santuy dikit napa!` };
    return { title: `${userName.toUpperCase()} SERIUS AMAT SIH 😐`, desc: `Hidup ${userName} terlalu tertata rapi. Coba sesekali makan seblak pake tangan kosong biar ada tantangan.` };
  };

  return (
    <div className="w-full flex justify-center py-24 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[80vh] items-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-slate-400 uppercase tracking-widest text-sm font-bold bg-slate-100 px-4 py-2 rounded-full">Quiz Gabut</span>
          <h2 className="text-4xl md:text-5xl font-serif mt-6 text-slate-900 leading-tight">
            {step === 'result' ? "Hasil Kelakuan Lo" : "Seberapa Asik Lo?"}
          </h2>
        </div>

        {/* Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-8 md:p-12 relative overflow-hidden transition-all duration-500">
          
          {step === 'name' && (
             <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                   <User size={32} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Kenalan Dulu Dong</h3>
                <p className="text-slate-500 mb-8">Biar nanti hasilnya enak dibaca, masukin nama panggilan lo.</p>
                <form onSubmit={handleStart} className="w-full max-w-sm flex flex-col gap-4">
                   <input 
                     type="text" 
                     value={userName}
                     onChange={(e) => setUserName(e.target.value)}
                     placeholder="Nama Lo..." 
                     className="w-full px-6 py-4 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900/10 text-center font-bold text-lg text-slate-800"
                     required
                   />
                   <button type="submit" className="bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
                      Mulai Quiz
                   </button>
                </form>
             </div>
          )}

          {/* Progress Bar (Only visible during quiz) */}
          {step === 'quiz' && (
            <div className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400 transition-all duration-500" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
          )}

          {step === 'result' && (
            <div className="text-center flex flex-col items-center gap-6 animate-in zoom-in duration-500">
               <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center text-6xl shadow-inner">
                 <Smile className="w-12 h-12 text-yellow-600" />
               </div>
               <div>
                 <h3 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">{getResult().title}</h3>
                 <p className="text-slate-600 text-lg leading-relaxed">{getResult().desc}</p>
               </div>
               <button 
                 onClick={resetQuiz}
                 className="mt-4 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
               >
                 <RefreshCcw size={20} /> Coba Lagi
               </button>
            </div>
          )}

          {step === 'quiz' && (
            <div key={currentQ} className="animate-in fade-in slide-in-from-right-8 duration-300">
               <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                  <span className="text-5xl font-serif text-slate-200 font-bold">0{currentQ + 1}</span>
                  <div className="text-right">
                     <span className="block text-slate-900 font-bold text-sm">{userName}</span>
                     <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Pertanyaan {currentQ + 1}/{questions.length}</span>
                  </div>
               </div>
               
               <h3 className="text-2xl md:text-3xl font-medium text-slate-800 mb-8 leading-snug">
                 {questions[currentQ].text}
               </h3>

               <div className="grid grid-cols-1 gap-4">
                 {questions[currentQ].options.map((option, idx) => (
                   <button 
                     key={idx}
                     onClick={() => handleAnswer(option.type)}
                     className="group text-left p-5 rounded-2xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all flex justify-between items-center bg-white/50"
                   >
                     <span className="text-slate-700 font-medium group-hover:text-slate-900">{option.text}</span>
                     <ArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-900" size={18} />
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-slate-400 mt-8 text-sm">
          {step === 'result' ? "Cek notif di pojok kanan atas, udah masuk belum?" : "Jawab jujur, jangan bohong sama diri sendiri."}
        </p>
      </div>
    </div>
  );
};
