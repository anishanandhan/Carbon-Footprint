import React from 'react';
import { Award } from 'lucide-react';

import { BADGES } from '../utils';

interface AchievementsProps {
  unlockedBadges: string[];
}

export const Achievements: React.FC<AchievementsProps> = ({ unlockedBadges }) => {
  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-2">
        <h2 className="font-display font-bold text-xl">Achievements Locker</h2>
        <p className="text-slate-400 text-[13px] mt-1">Earn Eco-Points by logging trips and building streaking habits to claim locked badges.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {BADGES.map(b => {
          const unlocked = unlockedBadges.includes(b.id);
          return (
            <div
              key={b.id}
              className={`border rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-lg transition-all ${unlocked ? 'bg-[#161e31]/80 border-emerald-500/20 hover:scale-103 hover:border-emerald-500' : 'bg-[#161e31]/30 border-slate-800 opacity-40'}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${unlocked ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'bg-slate-800 text-slate-400'}`}>
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-[14px]">{b.title}</h4>
                <p className="text-[11px] text-slate-400 leading-normal mt-1">{b.desc}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-2 block border-t border-slate-800/80 pt-2 w-full">
                {unlocked ? 'Unlocked ✓' : 'Locked'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
