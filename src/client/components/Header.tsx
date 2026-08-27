import React from 'react';
import { 
  Compass, 
  Play, 
  RotateCcw, 
  Download, 
  Terminal, 
  Sparkles, 
  Activity,
  History,
  Layers,
  Zap,
  Globe,
  Sliders,
  Users,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { Simulation, getExpertMeta } from '../../shared/types.ts';

interface HeaderProps {
  simulation: Simulation | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewModal: () => void;
  onRunDefaultDemo: () => void;
  onToggleDebug: () => void;
  onToggleMock: () => void;
  mockMode: boolean;
  systemStatus: any;
  onExport: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  simulation,
  activeTab,
  onSelectTab,
  onOpenNewModal,
  onRunDefaultDemo,
  onToggleDebug,
  onToggleMock,
  mockMode,
  systemStatus,
  onExport,
  onOpenHistory
}) => {
  const status = simulation?.status || 'idle';
  const worldName = simulation?.worldState?.finalWorldName;
  const config = simulation?.config;

  const getStatusBadge = () => {
    switch (status) {
      case 'parsing':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A160E] border border-[#C5A059]/40 text-[#C5A059] rounded-full text-[10px] tracking-wider font-mono uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
            <span>Parsing Axioms</span>
          </div>
        );
      case 'researching':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A160E] border border-[#C5A059]/40 text-[#C5A059] rounded-full text-[10px] tracking-wider font-mono uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
            <span>Research Phase</span>
          </div>
        );
      case 'debating':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161A1D] border border-[#6BA4B8]/40 text-[#6BA4B8] rounded-full text-[10px] tracking-wider font-mono uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6BA4B8] animate-ping" />
            <span>Debate Arena (R0{simulation?.currentRound || 1})</span>
          </div>
        );
      case 'synthesizing':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1D1326] border border-[#B89ACD]/40 text-[#B89ACD] rounded-full text-[10px] tracking-wider font-mono uppercase animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89ACD] animate-ping" />
            <span>Synthesizing Model</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0E1F18] border border-[#2D6A4F]/60 text-[#52B788] rounded-full text-[10px] tracking-wider font-mono uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
            <span>Simulation Calibrated</span>
          </div>
        );
      case 'paused':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#241113] border border-[#E11D48]/40 text-[#FDA4AF] rounded-full text-[10px] tracking-wider font-mono uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
            <span>Paused</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#151515] border border-[#2A2A2A] text-[#888] rounded-full text-[10px] tracking-wider font-mono uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#555]" />
            <span>Standby Mode</span>
          </div>
        );
    }
  };

  const expertNames = (config?.expertCohort && config.expertCohort.length > 0)
    ? config.expertCohort.filter(e => e.enabled).map(e => {
        const meta = getExpertMeta(e.roleId, e.customDef);
        return meta.name.split(',')[0].replace('Dr. ', '');
      }).join(' · ')
    : 'Historian · Economist · Geopolitician · Futurist';

  return (
    <header className="border-b border-[#2A2D32] bg-[#0F0F0F]/95 backdrop-blur-md shrink-0 sticky top-0 z-40">
      {/* Top Header Bar */}
      <div className="h-16 px-4 sm:px-8 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#2A2D32] bg-[#141414] rounded-xl flex items-center justify-center text-[#C5A059] shadow-inner">
            <Compass className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-xl tracking-tight text-[#C5A059] font-bold">
                Chronos
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#777] border-l border-[#2A2D32] pl-2">
                Reasoning Engine
              </span>
            </div>
            <p className="text-[10px] text-[#8E8B82] truncate max-w-xs sm:max-w-md">
              {worldName ? (
                <span className="text-[#E0E0E0] font-medium">{worldName}</span>
              ) : (
                'Open-Ended Counterfactual Simulation Engine'
              )}
            </p>
          </div>
        </div>

        {/* Center Status Indicators */}
        <div className="hidden lg:flex items-center gap-3">
          {getStatusBadge()}
          
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#888] font-mono bg-[#141414] px-2.5 py-1 rounded-lg border border-[#2A2D32]">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span className="text-[#E0E0E0] font-semibold">{systemStatus?.defaultModel || 'gemini-3.7-flash'}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* History */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2D32] bg-[#141414] hover:bg-[#1E1E1E] text-[#D8D5CD] text-xs font-medium transition-all cursor-pointer"
            title="Open Simulation History Archive"
          >
            <History className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Export Report / JSON */}
          {simulation && (
            <button
              onClick={onExport}
              title="Export Simulation Package (Zero AI Tokens)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2A2D32] text-xs font-medium transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* New Simulation Button */}
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs uppercase tracking-wider font-bold shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-black" />
            <span>New Simulation</span>
          </button>

          {/* Telemetry Trigger */}
          <button
            onClick={onToggleDebug}
            title="Open Telemetry & Key Pool Status"
            className="p-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-[#8E8B82] hover:text-[#C5A059] border border-[#2A2D32] transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Persistent Simulation Context Ribbon (Across all active views) */}
      {config && (
        <div className="bg-[#121417] border-t border-[#1F2227] px-4 sm:px-8 py-1.5 text-[10px] font-mono text-[#8E8B82] flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[#C5A059] font-bold uppercase">SCENARIO:</span>
            <span className="text-white truncate font-sans max-w-xs sm:max-w-md">"{config.scenarioTitle}"</span>
            <span className="text-[#5A5D64]">({config.startingYear} → {config.endYear} AD)</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1">
              <span className="text-[#C5A059] uppercase font-bold">COHORT:</span>
              <span className="text-[#D8D5CD]">{expertNames}</span>
            </div>

            <div className="flex items-center gap-1 hidden md:flex">
              <span className="text-[#C5A059] uppercase font-bold">STYLE:</span>
              <span className="text-[#D8D5CD] capitalize">{config.communicationStyle || 'General'}</span>
            </div>

            <div className="flex items-center gap-1 hidden lg:flex">
              <span className="text-[#C5A059] uppercase font-bold">RIGOR:</span>
              <span className="text-[#D8D5CD] capitalize">{config.realismLevel.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
