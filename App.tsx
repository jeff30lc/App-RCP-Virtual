
import React, { useState, useCallback, useEffect } from 'react';
import { GameStage, GameStats } from './types';
import Intro from './components/Intro';
import Evaluation from './components/Evaluation';
import Game from './components/Game';
import Result from './components/Result';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>('INTRO');
  const [stats, setStats] = useState<GameStats | null>(null);

  const startEvaluation = () => setStage('EVALUATION');
  
  const startGame = () => {
    setStage('GAME');
    setStats(null);
  };

  const finishGame = (finalStats: GameStats) => {
    setStats(finalStats);
    setStage('RESULT');
  };

  const reset = () => {
    setStage('INTRO');
    setStats(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {stage === 'INTRO' && <Intro onStart={startEvaluation} />}
      {stage === 'EVALUATION' && <Evaluation onComplete={startGame} onFail={reset} />}
      {stage === 'GAME' && <Game onFinish={finishGame} />}
      {stage === 'RESULT' && stats && <Result stats={stats} onReset={reset} />}
    </div>
  );
};

export default App;
