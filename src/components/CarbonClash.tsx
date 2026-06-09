import React from 'react';
import {
  Gamepad2,
  Tv,
  ShoppingBag,
  UtensilsCrossed,
  Leaf,
  Sparkles,
  Car,
  Shirt,
  Droplet,
  Mail,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

import { type GameItem } from '../utils';

interface CarbonClashProps {
  gameScore: number;
  gameStreak: number;
  gameActive: boolean;
  cardA: GameItem | null;
  cardB: GameItem | null;
  guessMade: boolean;
  guessResult: { correct: boolean; explanation: string } | null;
  onStartGame: () => void;
  onGuess: (guess: 'higher' | 'lower') => void;
}

const renderGameIcon = (iconName: string) => {
  switch (iconName) {
    case 'Tv': return <Tv className="w-12 h-12 text-cyan-400" />;
    case 'ShoppingBag': return <ShoppingBag className="w-12 h-12 text-purple-400" />;
    case 'Utensils': return <UtensilsCrossed className="w-12 h-12 text-rose-400" />;
    case 'Leaf': return <Leaf className="w-12 h-12 text-emerald-400" />;
    case 'Plane': return <Sparkles className="w-12 h-12 text-indigo-400" />;
    case 'Car': return <Car className="w-12 h-12 text-amber-500" />;
    case 'Shirt': return <Shirt className="w-12 h-12 text-teal-400" />;
    case 'Droplet': return <Droplet className="w-12 h-12 text-blue-400" />;
    case 'Mail': return <Mail className="w-12 h-12 text-gray-400" />;
    default: return <Sparkles className="w-12 h-12 text-yellow-400" />;
  }
};

export const CarbonClash: React.FC<CarbonClashProps> = ({
  gameScore,
  gameStreak,
  gameActive,
  cardA,
  cardB,
  guessMade,
  guessResult,
  onStartGame,
  onGuess
}) => {
  if (!gameActive || !cardA || !cardB) {
    return (
      <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-8 max-w-lg text-center flex flex-col items-center gap-5 shadow-xl">
        <Gamepad2 className="w-16 h-16 text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-bounce" />
        <h2 className="font-display font-bold text-xl">Carbon Clash: Higher or Lower?</h2>
        <p className="text-slate-400 text-[13.5px] leading-relaxed">
          Test your carbon knowledge! We will show two daily activities or items. Guess which one emits the higher amount of CO₂ equivalents.
        </p>
        <div className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2 text-[12.5px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Earn +10 Eco-points per correct answer.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Correct answers increase streak multipliers.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Unlock badges in the Achievements tab.</span>
          </div>
        </div>
        <button
          onClick={onStartGame}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all hover:scale-103 shadow-lg shadow-emerald-500/10 mt-2"
        >
          Start Playing
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-6 relative">
      {/* HUD */}
      <div className="flex gap-8 bg-[#0d1222] border border-slate-800 px-6 py-2 rounded-full text-[13px] font-bold text-slate-300">
        <span>Score: <span className="text-cyan-400">{gameScore}</span></span>
        <span>Streak: <span className="text-amber-500">🔥 {gameStreak}</span></span>
      </div>

      {/* Cards */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
        {/* Card A (Left - Revealed) */}
        <div className="w-full md:w-[45%] bg-[#0d1222] border border-slate-800 rounded-2xl overflow-hidden min-h-[300px] flex flex-col">
          <div className="h-32 bg-slate-900/60 border-b border-slate-800 flex items-center justify-center">
            {renderGameIcon(cardA.iconName)}
          </div>
          <div className="p-5 flex-grow flex flex-col justify-between items-center text-center">
            <div>
              <h3 className="font-display font-bold text-[16px] text-slate-200">{cardA.title}</h3>
              <span className="text-[12px] text-slate-400 mt-1 block">{cardA.desc}</span>
            </div>
            <div className="mt-4 bg-slate-900/80 border border-slate-850 px-5 py-2.5 rounded-xl">
              <span className="font-display font-extrabold text-2xl text-slate-100">{cardA.co2.toFixed(2)} kg</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">CO₂e</span>
            </div>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-[12px]">
          VS
        </div>

        {/* Card B (Right - Hidden emissions) */}
        <div className="w-full md:w-[45%] bg-[#0d1222] border border-slate-800 rounded-2xl overflow-hidden min-h-[300px] flex flex-col">
          <div className="h-32 bg-slate-900/60 border-b border-slate-800 flex items-center justify-center">
            {renderGameIcon(cardB.iconName)}
          </div>
          <div className="p-5 flex-grow flex flex-col justify-between items-center text-center">
            <div>
              <h3 className="font-display font-bold text-[16px] text-slate-200">{cardB.title}</h3>
              <span className="text-[12px] text-slate-400 mt-1 block">{cardB.desc}</span>
            </div>

            {/* Decision buttons */}
            {!guessMade ? (
              <div className="flex flex-col gap-2.5 w-full mt-4">
                <button
                  onClick={() => onGuess('higher')}
                  className="border border-amber-500 hover:bg-amber-500/10 text-amber-500 font-bold py-2 px-4 rounded-xl text-[12.5px] transition-all flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" /> Higher Footprint
                </button>
                <button
                  onClick={() => onGuess('lower')}
                  className="border border-cyan-500 hover:bg-cyan-500/10 text-cyan-500 font-bold py-2 px-4 rounded-xl text-[12.5px] transition-all flex items-center justify-center gap-1.5"
                >
                  <TrendingDown className="w-4 h-4" /> Lower Footprint
                </button>
              </div>
            ) : (
              <div className="mt-4 bg-slate-900/80 border border-slate-850 px-5 py-2.5 rounded-xl">
                <span className="font-display font-extrabold text-2xl text-rose-400">{cardB.co2.toFixed(2)} kg</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">CO₂e</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Dialog Card overlay */}
      {guessMade && guessResult && (
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 bg-[#0d1222]/95 backdrop-blur-md border rounded-2xl p-6 text-center max-w-md shadow-2xl flex flex-col items-center gap-3 z-30 animate-[slideDown_0.3s_cubic-bezier(0.19,1,0.22,1)] ${guessResult.correct ? 'border-emerald-500' : 'border-rose-500'}`}>
          <h3 className="font-display font-bold text-xl">{guessResult.correct ? 'Correct! 🎉' : 'Incorrect 😅'}</h3>
          <p className="text-[12.5px] text-slate-300 leading-relaxed whitespace-pre-line mt-1">{guessResult.explanation}</p>
          <button
            onClick={onStartGame}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold px-6 py-2 rounded-xl text-[12px] transition-all hover:scale-103 shadow-lg shadow-emerald-500/10 mt-3"
          >
            Next Round
          </button>
        </div>
      )}
    </div>
  );
};
