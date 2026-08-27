import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Play, 
  FolderOpen, 
  Clock, 
  Trash2, 
  RotateCcw, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Sliders,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Simulation, SimulationConfig, getExpertMeta } from '../../shared/types.ts';

interface HistoryViewProps {
  history: Simulation[];
  onOpenSimulation: (simulation: Simulation) => void;
  onRerunSimulation: (config: SimulationConfig) => void;
  onDeleteSimulation?: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onOpenSimulation,
  onRerunSimulation,
  onDeleteSimulation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>('all');

  const filteredHistory = history.filter(sim => {
    if (!sim) return false;
    const config = sim.config || {} as any;
    const titleMatch = (config.scenarioTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (config.scenarioDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    const worldMatch = (sim.worldState?.finalWorldName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const expertMatch = (config.expertCohort || []).some((e: any) => (e?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e?.roleId || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSearch = titleMatch || descMatch || worldMatch || expertMatch;

    if (statusFilter === 'completed' && sim.status !== 'completed') return false;
    if (statusFilter === 'draft' && sim.status === 'completed') return false;

    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2A2D32]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-1.5 block font-medium">
            Persistent Simulation Archive
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-white flex items-center gap-3">
            <History className="w-6 h-6 text-[#C5A059]" />
            <span>Simulation History</span>
          </h2>
          <p className="text-xs text-[#8E8B82] mt-1">
            Browse, inspect, and reopen previously synthesized worlds instantly without incurring any model or token requests.
          </p>
        </div>

        <div className="text-xs text-[#8E8B82] font-mono">
          Total Archived: <span className="text-white font-bold">{history.length}</span> simulations
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#15171A] border border-[#2A2D32] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#8E8B82]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by scenario title, world name, expert discipline, or keyword..."
            className="w-full bg-transparent border-none text-xs text-white placeholder-[#5A5D64] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md text-xs transition-all ${
              statusFilter === 'all' ? 'bg-[#2A2D32] text-[#C5A059] font-semibold' : 'text-[#8E8B82] hover:text-white'
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-md text-xs transition-all ${
              statusFilter === 'completed' ? 'bg-[#2A2D32] text-emerald-400 font-semibold' : 'text-[#8E8B82] hover:text-white'
            }`}
          >
            Completed ({history.filter(h => h.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Simulation History List */}
      <div className="space-y-3.5">
        {filteredHistory.length === 0 ? (
          <div className="p-16 text-center bg-[#15171A] rounded-xl border border-[#2A2D32] space-y-3">
            <FolderOpen className="w-8 h-8 text-[#5A5D64] mx-auto" />
            <p className="text-sm text-[#8E8B82] font-serif italic">No matching simulations found in archive.</p>
          </div>
        ) : (
          filteredHistory.map((sim) => {
            const world = sim.worldState;
            const config = sim.config || {} as any;
            const experts = config.expertCohort || [];
            const dateStr = sim.createdAt ? new Date(sim.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recent';

            return (
              <div
                key={sim.id}
                className="bg-[#15171A] border border-[#2A2D32] hover:border-[#3E4249] rounded-xl p-5 transition-all shadow-md space-y-3.5 relative overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2D32]/60 pb-2.5">
                  <div>
                    <span className="text-[10px] text-[#C5A059] uppercase font-mono tracking-wider">
                      {config.startingYear || 0} AD → {config.endYear || 2026} AD · {String(config.geographicScope || 'global').replace('_', ' ').toUpperCase()}
                    </span>
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-[#C5A059] transition-colors mt-0.5">
                      {world?.finalWorldName || config.scenarioTitle || 'Untitled Simulation'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8E8B82] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C5A059]" />
                      {dateStr}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                      sim.status === 'completed' 
                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                    }`}>
                      {sim.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#D8D5CD] line-clamp-2 leading-relaxed">
                  {world?.executiveSummary || config.scenarioDescription || 'No description available.'}
                </p>

                {/* Metadata & Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8B82]">
                    <span className="text-[10px] uppercase font-mono text-[#5A5D64]">Experts ({experts.length || 4}):</span>
                    {experts.slice(0, 4).map((exp, idx) => {
                      const meta = getExpertMeta(exp.roleId, exp.customDef);
                      return (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#0D0E10] border border-[#2A2D32] text-[10px] text-white">
                          {meta.name.split(',')[0]}
                        </span>
                      );
                    })}
                    <span className="text-[10px] text-[#C5A059] font-mono">
                      · {config.communicationStyle || 'general'} style
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenSimulation(sim)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-black" />
                      <span>Open Simulation</span>
                    </button>

                    <button
                      onClick={() => onRerunSimulation(sim.config)}
                      className="px-3 py-1.5 rounded-lg bg-[#1F2227] hover:bg-[#2A2D32] border border-[#2A2D32] text-white text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Clone config to run fresh simulation"
                    >
                      <RotateCcw className="w-3 h-3 text-[#C5A059]" />
                      <span>Re-Run</span>
                    </button>

                    {onDeleteSimulation && (
                      <button
                        onClick={() => onDeleteSimulation(sim.id)}
                        className="p-1.5 rounded-lg text-[#8E8B82] hover:text-rose-400 hover:bg-rose-950/20 transition-all"
                        title="Delete from archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
