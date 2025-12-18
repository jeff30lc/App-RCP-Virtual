
import React from 'react';

interface IntroProps {
  onStart: () => void;
}

const Intro: React.FC<IntroProps> = ({ onStart }) => {
  return (
    <div className="max-w-md w-full text-center bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-500">
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center heartbeat">
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
        LifeSaver Pro
      </h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        Bem-vindo ao simulador de RCP. Você será avaliado pela sua capacidade de identificar uma parada cardíaca e manter o ritmo correto das compressões (100-120 BPM).
      </p>
      <button
        onClick={onStart}
        className="w-full py-4 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
      >
        INICIAR TREINAMENTO
      </button>
      <p className="mt-4 text-xs text-slate-500">Pressione para começar a avaliação do paciente</p>
    </div>
  );
};

export default Intro;
