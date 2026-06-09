import React, { useState } from 'react';
import { Target } from 'lucide-react';

interface GoalSetterProps {
  weeklyBudgetLimit: number;
  onSaveGoal: (limit: number) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({
  weeklyBudgetLimit,
  onSaveGoal
}) => {
  const [value, setValue] = useState(String(weeklyBudgetLimit));
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid positive number');
      return;
    }
    setError('');
    onSaveGoal(parsed);
    setEditing(false);
  };

  return (
    <div className="bg-[#161e31]/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-[13px]">
          <Target className="w-4 h-4 text-emerald-400" />
          <h4>Weekly Emission Target</h4>
        </div>
        {!editing && (
          <button
            onClick={() => {
              setValue(String(weeklyBudgetLimit));
              setEditing(true);
            }}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider"
          >
            Adjust Goal
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-[13px] text-slate-100 outline-none focus:border-emerald-500"
              placeholder="e.g. 40.0"
              aria-label="New Weekly Carbon Budget Limit"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-[12px] transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError('');
              }}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-[12px] transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && <span className="text-[11px] text-rose-400 font-semibold">{error}</span>}
        </form>
      ) : (
        <div className="mt-4">
          <h2 className="font-display font-extrabold text-3xl">{weeklyBudgetLimit.toFixed(1)} kg</h2>
          <span className="text-[11px] text-slate-400 mt-2 block">Weekly Limit (CO₂e threshold)</span>
        </div>
      )}
    </div>
  );
};
