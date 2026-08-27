import React from 'react';
import { 
  X, 
  Terminal, 
  Key, 
  Activity, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Simulation } from '../../shared/types.ts';

interface DebugDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: any;
  simulation: Simulation | null;
  onToggleMock: () => void;
}

export const DebugDrawer: React.FC<DebugDrawerProps> = ({
  isOpen,
  onClose,
  systemStatus,
  simulation,
  onToggleMock
}) => {
  if (!isOpen) return null;

  const keySlots = systemStatus?.keySlots || [];
  const mockMode = systemStatus?.mockMode ?? true;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0F0F0F]/95 border-l border-[#2A2A2A] backdrop-blur-xl z-50 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2 text-[#C5A059] font-mono text-xs font-bold uppercase tracking-widest">
            <Terminal className="w-3.5 h-3.5" />
            <span>Telemetry & Key Pool</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#888] hover:text-white hover:bg-[#1A1A1A] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mock Engine Toggle */}
        <div className="p-4 rounded bg-[#141414] border border-[#2A2A2A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">Engine Execution:</span>
            <button
              onClick={onToggleMock}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest font-bold cursor-pointer transition-all ${
                mockMode 
                  ? 'bg-[#1C1811] text-[#C5A059] border border-[#C5A059]/40' 
                  : 'bg-[#0E1F18] text-[#52B788] border border-[#2D6A4F]/60'
              }`}
            >
              {mockMode ? 'CALIBRATED MOCK' : 'LIVE GEMINI API'}
            </button>
          </div>
          <p className="text-[10px] text-[#777] serif italic leading-relaxed">
            {mockMode 
              ? 'Executing through deterministic historical calibration models.' 
              : 'Streaming live through multi-key Gemini inference pool.'}
          </p>
        </div>

        {/* Multi-Key Pool Slots */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#888] flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Gemini Key Pool Allocation</span>
          </span>

          <div className="space-y-2">
            {keySlots.length > 0 ? (
              keySlots.map((slot: any, idx: number) => (
                <div key={idx} className="p-3 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs">{slot.name}</span>
                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#52B788]">
                      <CheckCircle className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#666]">
                    <span>Calls: {slot.requestCount}</span>
                    <span>Last: {slot.lastUsed ? new Date(slot.lastUsed).toLocaleTimeString() : 'Never'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-xs text-[#666] font-mono">
                No GEMINI_API_KEY environment variables detected; running in fallback mode.
              </div>
            )}
          </div>
        </div>

        {/* Simulation Performance Metrics */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#888] flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Agent Latencies & Tokens</span>
          </span>

          <div className="p-4 rounded bg-[#141414] border border-[#2A2A2A] space-y-3 text-xs font-mono">
            <div className="flex justify-between text-[#bbb]">
              <span>Total Dispatches:</span>
              <span className="text-[#C5A059] font-bold">{systemStatus?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between text-[#bbb]">
              <span>Est. Processed Tokens:</span>
              <span className="text-[#E0E0E0] font-bold">{(systemStatus?.tokensEstimated || 0).toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-[#2A2A2A] space-y-1 text-[11px]">
              <span className="text-[#666] block uppercase tracking-widest text-[9px]">Specialist Latency:</span>
              {systemStatus?.agentLatencies && Object.entries(systemStatus.agentLatencies).map(([role, lat]) => (
                <div key={role} className="flex justify-between text-[#888] capitalize">
                  <span>{role}:</span>
                  <span className="text-[#bbb]">{lat}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#2A2A2A] text-center text-[9px] font-mono uppercase tracking-widest text-[#555]">
        CHRONOS ALTERNATE REALITY ENGINE // 2026
      </div>
    </div>
  );
};
