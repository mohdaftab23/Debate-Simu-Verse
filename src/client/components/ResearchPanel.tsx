import React, { useState } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Cpu, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  Scale,
  Users,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResearchPacket, getExpertMeta } from '../../shared/types.ts';
import { AGENT_HINGLISH_INTROS, explainSimplyLocal } from '../../shared/hinglishHelper.ts';

interface ResearchPanelProps {
  researchPackets: Record<string, ResearchPacket>;
  activeAgentRole?: string;
  onProceedToDebate?: () => void;
  isHinglish?: boolean;
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({
  researchPackets,
  activeAgentRole,
  onProceedToDebate,
  isHinglish = true
}) => {
  const packetRoles = Object.keys(researchPackets);
  const defaultRole = activeAgentRole || packetRoles[0] || 'historian';
  const [selectedRole, setSelectedRole] = useState<string>(defaultRole);
  const [showSimpleThesis, setShowSimpleThesis] = useState<boolean>(false);

  const currentRole = packetRoles.includes(selectedRole) ? selectedRole : (packetRoles[0] || selectedRole);
  const currentPacket = researchPackets[currentRole];
  const meta = getExpertMeta(currentRole);
  const hinglishIntro = AGENT_HINGLISH_INTROS[currentRole];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2A2D32]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-1.5 block font-medium">
            Stage I • Isolated Disciplinary Investigations
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-white">
            Specialized Analytical Dossiers
          </h2>
          <p className="text-xs text-[#8E8B82] mt-1">
            Each specialist independently analyzes the counterfactual divergence before debating.
          </p>
        </div>

        {onProceedToDebate && (
          <button
            onClick={onProceedToDebate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer shrink-0"
          >
            <span>Proceed to Debate Arena</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dynamic Agent Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {packetRoles.map(roleId => {
          const rMeta = getExpertMeta(roleId);
          const packet = researchPackets[roleId];
          const isSelected = currentRole === roleId;

          return (
            <button
              key={roleId}
              onClick={() => setSelectedRole(roleId)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'bg-[#15171A] border-[#C5A059] shadow-lg shadow-[#C5A059]/10 ring-1 ring-[#C5A059]'
                  : 'bg-[#0D0E10] border-[#2A2D32] hover:bg-[#15171A] hover:border-[#3E4249]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg border border-[#2A2D32] bg-gradient-to-br ${rMeta.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {rMeta.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{rMeta.name.split(',')[0]}</p>
                  <p className="text-[9px] uppercase tracking-wider text-[#8E8B82] truncate">{rMeta.title}</p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#2A2D32]/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#8E8B82]">Confidence:</span>
                <span className="text-[#C5A059] font-bold">{packet?.confidence?.overall || 80}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Agent Detailed Dossier Card */}
      {currentPacket ? (
        <div className="bg-[#15171A] border border-[#2A2D32] rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Agent Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2D32]">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl border border-[#2A2D32] bg-gradient-to-br ${meta.avatarColor} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                {meta.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-lg font-bold text-white">{currentPacket.agentName || meta.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1F2227] text-[#C5A059] border border-[#2A2D32]">
                    {meta.title}
                  </span>
                </div>
                <p className="text-xs text-[#8E8B82]">Specialty: {meta.specialty}</p>
              </div>
            </div>

            {/* Confidence Gauges */}
            <div className="flex items-center gap-3 bg-[#0D0E10] p-2.5 rounded-lg border border-[#2A2D32] self-start sm:self-auto font-mono text-xs">
              <div className="text-center px-2">
                <span className="text-[#5A5D64] text-[9px] uppercase tracking-wider block mb-0.5">Overall</span>
                <span className="text-[#C5A059] font-serif text-base font-bold">{currentPacket.confidence.overall}%</span>
              </div>
              <div className="w-px h-6 bg-[#2A2D32]" />
              <div className="text-center px-2">
                <span className="text-[#5A5D64] text-[9px] uppercase tracking-wider block mb-0.5">Causal Strength</span>
                <span className="text-[#E6E4DD] font-serif text-base font-bold">{currentPacket.confidence.causalStrength}%</span>
              </div>
              <div className="w-px h-6 bg-[#2A2D32]" />
              <div className="text-center px-2">
                <span className="text-[#5A5D64] text-[9px] uppercase tracking-wider block mb-0.5">Plausibility</span>
                <span className="text-[#E6E4DD] font-serif text-base font-bold">{currentPacket.confidence.plausibility}%</span>
              </div>
            </div>
          </div>

          {/* Simple Hinglish Agent Introduction Speech Bubble */}
          <div className="p-4 rounded-xl bg-[#1D1B13] border border-[#C5A059]/40 space-y-1.5 shadow-md">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#C5A059]">
              <Sparkles className="w-4 h-4" />
              <span>Specialist Introduction (Mera Role & Focus):</span>
            </div>
            <p className="text-xs sm:text-sm text-white italic leading-relaxed">
              "{hinglishIntro ? hinglishIntro.intro : `Main ${meta.name} hoon aur is alternate scenario ko apne domain ki causal principles se analyze kar raha hoon.`}"
            </p>
          </div>

          {/* Core Thesis Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] font-bold">
                Core Thesis & Causal Trajectory
              </span>
              <button
                onClick={() => setShowSimpleThesis(!showSimpleThesis)}
                className="flex items-center gap-1 text-[11px] font-mono text-[#C5A059] hover:text-[#E5C384] transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showSimpleThesis ? 'Hide Simple Breakdown' : 'Explain Simply'}</span>
                {showSimpleThesis ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-[#0D0E10] border border-[#2A2D32]">
              <p className="text-sm sm:text-base text-[#E6E4DD] font-serif italic leading-relaxed">
                "{currentPacket.thesis}"
              </p>
            </div>

            {/* Simple Hinglish Breakdown */}
            {showSimpleThesis && (
              <div className="p-3.5 rounded-lg bg-[#111316] border border-[#C5A059]/30 text-xs text-[#D8D5CD] space-y-1 animate-fadeIn">
                <span className="text-[10px] font-mono uppercase text-[#C5A059] font-bold block">
                  Aasan Bhasha Mein Samjhein:
                </span>
                <p className="leading-relaxed">
                  {explainSimplyLocal(currentPacket.thesis, isHinglish)}
                </p>
              </div>
            )}
          </div>

          {/* Key Disciplinary Assumptions */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8E8B82] font-bold">
              Disciplinary Invariants & Assumptions
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentPacket.keyAssumptions.map((assump, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0D0E10] border border-[#2A2D32] flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788] shrink-0 mt-0.5" />
                  <span className="text-[#D8D5CD] leading-relaxed">{assump}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-[#15171A] rounded-xl border border-[#2A2D32]">
          <p className="text-xs text-[#8E8B82] font-serif italic">Loading analytical packets...</p>
        </div>
      )}
    </div>
  );
};
