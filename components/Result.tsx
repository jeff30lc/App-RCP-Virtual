
import React, { useEffect, useState } from 'react';
import { GameStats } from '../types';

interface ResultProps {
  stats: GameStats;
  onReset: () => void;
}

const Result: React.FC<ResultProps> = ({ stats, onReset }) => {
  const isApproved = stats.accuracy >= 70;
  const [showAngel, setShowAngel] = useState(false);

  useEffect(() => {
    if (!isApproved) {
      const timer = setTimeout(() => setShowAngel(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isApproved]);

  return (
    <div className="relative w-full max-w-2xl flex flex-col items-center">
      {/* Soul/Angel Animation */}
      {showAngel && (
        <div className="absolute pointer-events-none flex flex-col items-center animate-float-up z-50">
           <svg className="w-24 h-24 text-white/80 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m-1 5h2a3 3 0 0 1 3 3v2a1 1 0 0 1-1 1h-1v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-4h-1a1 1 0 0 1-1-1v-2a3 3 0 0 1 3-3m-6 3h2v2H5v-2m14 0h2v2h-2v-2z" />
             <path d="M12 1a4 4 0 0 0-4 4 4 4 0 0 0 .5 1.9L4 11v4h2v-4h1v10h2v-8h1v8h2v-8h1v8h2V11h1v4h2v-4l-4.5-4.1a4 4 0 0 0 .5-1.9 4 4 0 0 0-4-4z" opacity="0.1"/>
             <circle cx="12" cy="4" r="5" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" className="animate-spin" style={{ animationDuration: '8s' }} />
           </svg>
           <span className="text-white/50 text-xs mt-2 uppercase font-bold tracking-widest">Alma em paz...</span>
        </div>
      )}

      <div className={`
        w-full bg-slate-800 p-10 rounded-2xl shadow-2xl border-t-8 text-center animate-in zoom-in duration-500
        ${isApproved ? 'border-green-500' : 'border-red-500'}
      `}>
        <div className="mb-8">
          {isApproved ? (
            <div className="inline-block p-4 bg-green-900/20 rounded-full mb-4">
               <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
          ) : (
            <div className="inline-block p-4 bg-red-900/20 rounded-full mb-4">
               <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
          )}
          <h2 className="text-4xl font-bold mb-2">
            {isApproved ? 'Paciente Estabilizado!' : 'GAME OVER'}
          </h2>
          <p className="text-slate-400">
            {isApproved 
              ? 'Parabéns! Suas compressões foram eficazes para manter a perfusão.' 
              : 'Infelizmente as compressões não foram suficientes para salvar o paciente.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <p className="text-2xl font-bold">{Math.round(stats.accuracy)}%</p>
            <p className="text-slate-500 text-xs uppercase font-bold">Precisão</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <p className="text-2xl font-bold">{stats.totalCompressions}</p>
            <p className="text-slate-500 text-xs uppercase font-bold">Total</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <p className="text-2xl font-bold text-green-400">{stats.correctCompressions}</p>
            <p className="text-slate-500 text-xs uppercase font-bold">No Ritmo</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <p className="text-2xl font-bold text-blue-400">{stats.averageBpm}</p>
            <p className="text-slate-500 text-xs uppercase font-bold">Méd. BPM</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all active:scale-95"
        >
          TENTAR NOVAMENTE
        </button>
      </div>
    </div>
  );
};

export default Result;
