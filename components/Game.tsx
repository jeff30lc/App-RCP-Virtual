
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStats } from '../types';

interface GameProps {
  onFinish: (stats: GameStats) => void;
}

const GAME_DURATION = 60; // seconds
const MIN_BPM = 100;
const MAX_BPM = 120;
const IDEAL_MIN_INTERVAL = 0.5; // 120 BPM
const IDEAL_MAX_INTERVAL = 0.6; // 100 BPM
const MAX_VISIBLE_INTERVAL = 1.0; 

/** 
 * Using a more stable rhythmic loop. 
 * If external assets fail, the app gracefully continues without sound.
 */
const RHYTHM_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/03/10/audio_c330fba101.mp3"; 

const Game: React.FC<GameProps> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [compressions, setCompressions] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [markerPos, setMarkerPos] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  const lastPressTime = useRef<number>(Date.now());
  const bpmHistory = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicStarted = useRef<boolean>(false);

  // Background Music Setup
  useEffect(() => {
    const audio = new Audio();
    
    // Set properties before setting src to ensure event listeners are ready
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = "auto";
    
    const handleCanPlayThrough = () => {
      console.log("Áudio carregado e pronto para reprodução.");
      setAudioError(false);
    };

    const handleError = (e: any) => {
      console.error("Erro ao carregar o áudio do ritmo:", e);
      setAudioError(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);

    audio.src = RHYTHM_MUSIC_URL;
    audio.load(); // Explicitly start loading

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  // Update mute status dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Main Timer logic
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Marker Sweep Animation
  const updateMarker = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastPressTime.current) / 1000;
    const pos = Math.min((elapsed / MAX_VISIBLE_INTERVAL) * 100, 100);
    setMarkerPos(pos);
    animationRef.current = requestAnimationFrame(updateMarker);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateMarker);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [updateMarker]);

  // Handle game end
  useEffect(() => {
    if (timeLeft === 0) {
      if (audioRef.current) audioRef.current.pause();
      const avgBpm = bpmHistory.current.length > 0 
        ? bpmHistory.current.reduce((a, b) => a + b) / bpmHistory.current.length 
        : 0;
      
      onFinish({
        totalCompressions: compressions,
        correctCount, // Note: fixing prop name if needed, but keeping existing structure
        averageBpm: Math.round(avgBpm),
        accuracy: compressions > 0 ? (correctCount / compressions) * 100 : 0
      } as unknown as GameStats);
    }
  }, [timeLeft, compressions, correctCount, onFinish]);

  const handleCompression = useCallback(() => {
    if (timeLeft === 0) return;

    // Trigger music on the very first compression
    if (audioRef.current && !musicStarted.current) {
      audioRef.current.play()
        .then(() => {
          musicStarted.current = true;
          setAudioError(false);
        })
        .catch(err => {
          console.warn("Reprodução automática bloqueada ou falhou:", err);
          // If it fails, we don't set error true here as it might be a user gesture issue
        });
    }

    const now = Date.now();
    const diff = (now - lastPressTime.current) / 1000;
    
    if (diff < 0.2) return; // Debounce fast clicks

    setCompressions(prev => prev + 1);
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 80);

    const bpm = Math.round(60 / diff);
    setCurrentBpm(bpm);
    bpmHistory.current.push(bpm);

    // Validate if the speed is within the 100-120 BPM range
    if (diff >= IDEAL_MIN_INTERVAL && diff <= IDEAL_MAX_INTERVAL) {
      setCorrectCount(prev => prev + 1);
    }

    lastPressTime.current = now;
  }, [timeLeft]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleCompression();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCompression]);

  const getRhythmLabel = () => {
    if (currentBpm === 0) return "Inicie as compressões";
    if (currentBpm < MIN_BPM) return "Mais Rápido!";
    if (currentBpm > MAX_BPM) return "Mais Devagar!";
    return "Excelente Ritmo!";
  };

  const getRhythmColor = () => {
    if (currentBpm === 0) return "text-slate-400";
    if (currentBpm < MIN_BPM) return "text-yellow-400";
    if (currentBpm > MAX_BPM) return "text-orange-500";
    return "text-green-400";
  };

  const progress = (timeLeft / GAME_DURATION) * 100;
  const greenStart = (IDEAL_MIN_INTERVAL / MAX_VISIBLE_INTERVAL) * 100;
  const greenEnd = (IDEAL_MAX_INTERVAL / MAX_VISIBLE_INTERVAL) * 100;

  return (
    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 p-4 relative">
      {/* Audio Status & Mute Control */}
      <div className="absolute -top-12 right-4 flex items-center gap-4 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 shadow-xl">
        {audioError && (
          <span className="text-red-400 text-[10px] font-bold uppercase animate-pulse flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            Som Indisponível
          </span>
        )}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-slate-400 hover:text-white transition-colors"
          title={isMuted ? "Ativar Som" : "Mutar Som"}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
      </div>

      {/* Side Stats */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between border border-slate-700 order-2 md:order-1">
        <div>
          <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">Desempenho</h3>
          <div className="space-y-6">
            <div className="bg-slate-900/40 p-4 rounded-xl">
              <p className="text-4xl font-bold">{compressions}</p>
              <p className="text-slate-500 text-xs uppercase font-bold mt-1">Compressões</p>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border-l-4 border-green-500">
              <p className="text-4xl font-bold text-green-400">{correctCount}</p>
              <p className="text-slate-500 text-xs uppercase font-bold mt-1">Ritmo Correto</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/20 p-4 rounded-xl border border-blue-800/30">
           <p className="text-blue-400 text-xs font-bold mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
             DICA
           </p>
           <p className="text-slate-400 text-[10px] leading-relaxed">
             Acompanhe a batida do áudio para manter a velocidade ideal de salvamento. O ritmo deve ser constante.
           </p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="md:col-span-2 flex flex-col gap-6 order-1 md:order-2">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden flex flex-col items-center">
          {/* Time Limit Indicator */}
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-900">
            <div 
              className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="w-full flex justify-between items-center mb-10">
            <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
              <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Tempo Restante</p>
              <div className="text-4xl font-mono font-bold text-red-500">
                0:{timeLeft.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-black ${getRhythmColor()}`}>{currentBpm} <span className="text-sm font-normal text-slate-500">BPM</span></p>
              <p className={`text-xs font-bold uppercase tracking-wider ${getRhythmColor()}`}>{getRhythmLabel()}</p>
            </div>
          </div>

          {/* Interactive Mannequin Chest */}
          <button
            onMouseDown={handleCompression}
            className={`
              relative w-64 h-64 rounded-full border-[12px] transition-all duration-75 flex items-center justify-center shadow-2xl
              ${isPressing 
                ? 'scale-95 border-red-500 bg-red-900/20 shadow-[0_0_40px_rgba(239,68,68,0.3)]' 
                : 'scale-100 border-slate-700 hover:border-slate-500 bg-slate-900/40'}
            `}
          >
            <div className="text-center group">
               <svg className={`w-32 h-32 mb-2 transition-transform duration-75 ${isPressing ? 'scale-90 text-red-500' : 'text-slate-600 group-hover:text-slate-400 group-hover:scale-105'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
               </svg>
               <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Pressione</span>
            </div>
            
            {/* Visual Pulse Wave */}
            {isPressing && (
              <div className="absolute inset-0 rounded-full animate-ping border-4 border-red-500/30"></div>
            )}
          </button>

          {/* Sweep Rhythm Tracker */}
          <div className="mt-12 w-full max-w-md">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2 px-1">
              <span>Rápido</span>
              <span className="text-green-500 font-black">ÁREA DE SUCESSO</span>
              <span>Lento</span>
            </div>
            <div className="relative h-10 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 p-1 shadow-inner">
              {/* Success Zone Shadowing */}
              <div 
                className="absolute h-full bg-green-500/20 border-x border-green-500/40 z-0"
                style={{ left: `${greenStart}%`, width: `${greenEnd - greenStart}%`, top: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent"></div>
              </div>

              {/* Dynamic Tracking Marker */}
              <div 
                className="absolute top-1 bottom-1 w-1.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] z-10"
                style={{ 
                  left: `${markerPos}%`, 
                  transform: 'translateX(-50%)',
                  transition: 'none'
                }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
              </div>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-4 italic">
              O marcador reinicia a cada compressão. Clique quando ele estiver na zona verde!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
