
import React, { useState } from 'react';

interface EvaluationProps {
  onComplete: () => void;
  onFail: () => void;
}

const Evaluation: React.FC<EvaluationProps> = ({ onComplete, onFail }) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Segurança do Local",
      description: "O ambiente está seguro para o atendimento?",
      options: [
        { label: "Sim, prosseguir", correct: true },
        { label: "Não, ignorar", correct: false }
      ]
    },
    {
      title: "Avaliação de Responsividade",
      description: "Chame o paciente pelos ombros. Ele responde?",
      options: [
        { label: "Sim, ele acordou", correct: false },
        { label: "Não, sem resposta", correct: true }
      ]
    },
    {
      title: "Avaliação de Respiração e Pulso",
      description: "Cheque o pulso carotídeo e a expansão torácica por 10 segundos.",
      options: [
        { label: "Pulso presente e respira", correct: false },
        { label: "Sem pulso e sem respiração", correct: true }
      ]
    }
  ];

  const handleChoice = (isCorrect: boolean) => {
    if (!isCorrect) {
      alert("Avaliação incorreta! Você não iniciaria RCP nesse caso.");
      onFail();
      return;
    }
    
    if (step === steps.length - 1) {
      onComplete();
    } else {
      setStep(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-xl w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-400">Avaliação Inicial</h2>
        <span className="text-slate-500 text-sm">Passo {step + 1} de {steps.length}</span>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">{steps[step].title}</h3>
        <p className="text-slate-400">{steps[step].description}</p>
      </div>

      <div className="space-y-4">
        {steps[step].options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(opt.correct)}
            className="w-full p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-left transition-colors font-medium"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Evaluation;
