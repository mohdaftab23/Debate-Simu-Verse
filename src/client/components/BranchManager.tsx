import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  Play, 
  ArrowRight, 
  Check, 
  PlusCircle, 
  Percent, 
  ShieldAlert 
} from 'lucide-react';
import { AlternativeBranch, WorldState, SimulationConfig } from '../../shared/types.ts';

interface BranchManagerProps {
  worldState: WorldState;
  onForkBranch: (branchName: string, keyDivergence: string) => void;
  isLoading?: boolean;
}

export const BranchManager: React.FC<BranchManagerProps> = ({
  worldState,
  onForkBranch,
  isLoading = false
}) => {
  const branches = worldState.alternativeBranches || [];
  const [customBranchName, setCustomBranchName] = useState<string>('');
  const [customDivergence, setCustomDivergence] = useState<string>('');

  const handleCustomFork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBranchName.trim() || !customDivergence.trim()) return;
    onForkBranch(customBranchName.trim(), customDivergence.trim());
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-8">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-[#2A2A2A]">
        <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-2 block font-medium">
          Multiverse Bifurcation
        </span>
        <h2 className="text-3xl sm:text-4xl serif italic text-white">
          Alternative Counterfactual Branches
        </h2>
        <p className="text-[#888] serif italic text-sm mt-1">
          Fork diverging critical junctures identified by the four specialists into standalone parallel simulations.
        </p>
      </div>

      {/* Discovered Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {branches.map((branch) => (
          <div 
            key={branch.id}
            className="bg-[#121212] border border-[#2A2A2A] rounded-lg p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-[#C5A059]/60 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-serif font-bold text-[#C5A059]">
                  {branch.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-[#52B788] font-mono text-[10px]">
                  {branch.probabilityScore}% Prob
                </span>
              </div>

              <h4 className="text-base serif italic text-white group-hover:text-[#C5A059] transition-colors leading-snug">
                "{branch.keyDivergence}"
              </h4>

              <p className="text-xs text-[#888] serif italic leading-relaxed mt-2.5">
                {branch.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#1C1C1C] flex items-center justify-between gap-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#555]">
                Advocates: {branch.supportingAgents.join(', ')}
              </span>

              <button
                type="button"
                onClick={() => onForkBranch(branch.name, branch.keyDivergence)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#C5A059] hover:bg-[#D4B26F] text-[#0F0F0F] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-[#0F0F0F]" />
                <span>Fork & Simulate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Branch Creator Form */}
      <form onSubmit={handleCustomFork} className="bg-[#121212] border border-[#2A2A2A] rounded-lg p-6 sm:p-8 shadow-2xl space-y-5">
        <div>
          <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-1 block font-medium">
            Custom Horizon Mutation
          </span>
          <h3 className="text-xl serif italic text-white">
            Create Custom Parallel Divergence Branch
          </h3>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-medium">
            Branch Identifier
          </label>
          <input
            type="text"
            value={customBranchName}
            onChange={(e) => setCustomBranchName(e.target.value)}
            placeholder="e.g. Branch Gamma: German-Ottoman Railway Monopoly"
            required
            className="w-full px-4 py-2.5 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs focus:border-[#C5A059] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-medium">
            Specific Key Divergence Mutation
          </label>
          <textarea
            rows={3}
            value={customDivergence}
            onChange={(e) => setCustomDivergence(e.target.value)}
            placeholder="Describe the secondary condition being altered from the base simulation..."
            required
            className="w-full px-4 py-3 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs serif italic focus:border-[#C5A059] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded bg-[#C5A059] hover:bg-[#D4B26F] text-[#0F0F0F] font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl disabled:opacity-50"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>LAUNCH PARALLEL SUB-SIMULATION</span>
        </button>
      </form>
    </div>
  );
};
