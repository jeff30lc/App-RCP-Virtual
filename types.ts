
export type GameStage = 'INTRO' | 'EVALUATION' | 'GAME' | 'RESULT';

export interface EvalStep {
  id: string;
  question: string;
  expected: boolean;
}

export interface GameStats {
  totalCompressions: number;
  correctCompressions: number;
  averageBpm: number;
  accuracy: number;
}
