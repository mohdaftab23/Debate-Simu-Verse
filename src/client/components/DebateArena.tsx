import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Cpu, 
  BookOpen, 
  Shield, 
  Play, 
  Pause, 
  CheckCircle, 
  HelpCircle,
  Scale,
  RefreshCw,
  Sliders,
  Filter,
  Layers,
  List,
  Eye,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DebateMessage, DebateRoundSummary, getExpertMeta } from '../../shared/types.ts';
import { explainSimplyLocal, toConversationalHinglish } from '../../shared/hinglishHelper.ts';

interface DebateArenaProps {
  messages: DebateMessage[];
  rounds: DebateRoundSummary[];
  currentRound: number;
  totalRounds: number;
  isDebating: boolean;
  onProceedToSynthesis?: () => void;
  defaultCompact?: boolean;
  isHinglish?: boolean;
}

export const DebateArena: React.FC<DebateArenaProps> = ({
  messages,
  rounds,
  currentRound,
  totalRounds,
  isDebating,
  onProceedToSynthesis,
  defaultCompact = true,
  isHinglish = true
}) => {
  // Local UI toggle between 'compact' and 'full' view
  const [viewMode, setViewMode] = useState<'compact' | 'full'>(defaultCompact ? 'compact' : 'full');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});
  
  const feedBottomRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(m => {
    if (selectedAgentFilter !== 'all' && m.agent !== selectedAgentFilter) return false;
    if (selectedRoundFilter !== 'all' && m.round !== selectedRoundFilter) return false;
    return true;
  });

  const uniqueAgents = Array.from(new Set<string>(messages.map(m => String(m.agent || '')).filter(Boolean)));

  useEffect(() => {
    if (autoScroll && feedBottomRef.current && isDebating) {
      feedBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, autoScroll, isDebating]);

  const toggleSimpleExplanation = (id: string) => {
    setExpandedExplanationIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusBadge = (status?: DebateMessage['status']) => {
    switch (status) {
      case 'agreeing':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 text-[10px] uppercase font-mono font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Agreeing / Sahmati
          </span>
        );
      case 'disagreeing':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 text-[10px] uppercase font-mono font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Challenge / Asahmati
          </span>
        );
      case 'revising':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/50 text-amber-300 text-[10px] uppercase font-mono font-semibold flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Stance Changed
          </span>
        );
      case 'neutral':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/50 text-blue-300 text-[10px] uppercase font-mono font-semibold">
            Initial Point
          </span>
        );
    }
  };

  const getTypeBadge = (type: DebateMessage['type']) => {
    switch (type) {
      case 'claim':
        return <span className="px-2 py-0.5 rounded bg-[#1C1811] border border-[#C5A059]/40 text-[#C5A059] text-[9px] uppercase tracking-widest font-mono">Main Thesis</span>;
      case 'critique':
        return <span className="px-2 py-0.5 rounded bg-[#241113] border border-[#E11D48]/40 text-[#FDA4AF] text-[9px] uppercase tracking-widest font-mono">Counter-Argument</span>;
      case 'defense':
        return <span className="px-2 py-0.5 rounded bg-[#0E1F18] border border-[#2D6A4F]/60 text-[#52B788] text-[9px] uppercase tracking-widest font-mono">Defense / Rebuttal</span>;
      case 'final_stance':
        return <span className="px-2 py-0.5 rounded bg-[#1A1810] border border-[#C5A059]/60 text-[#E5C384] text-[9px] uppercase tracking-widest font-mono">Consensus Stance</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2A2D32]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-1.5 block font-medium">
            Multi-Agent Causal Dialectic • Real-Time Debate
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-white flex items-center gap-3">
            <span>Specialist Debate Arena</span>
            {isDebating && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A160E] border border-[#C5A059]/40 text-[#C5A059] text-[10px] uppercase tracking-widest font-mono not-italic animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping" />
                Round {currentRound} of {totalRounds} Live
              </span>
            )}
          </h2>
          <p className="text-xs text-[#8E8B82] mt-1">
            Specialists challenge each other's assumptions in clear, friendly conversational language.
          </p>
        </div>

        {onProceedToSynthesis && !isDebating && (
          <button
            onClick={onProceedToSynthesis}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer shrink-0"
          >
            <span>Proceed to Causal Map & World State</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Control Bar: View Mode Switch (Compact vs Full) + Filters */}
      <div className="bg-[#15171A] border border-[#2A2D32] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Compact vs Full Switch */}
        <div className="flex items-center gap-3">
          <div className="bg-[#0D0E10] border border-[#2A2D32] rounded-lg p-0.5 flex items-center">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-[#C5A059] text-black shadow-sm font-semibold'
                  : 'text-[#8E8B82] hover:text-white'
              }`}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Compact View (Quick)</span>
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'full'
                  ? 'bg-[#C5A059] text-black shadow-sm font-semibold'
                  : 'text-[#8E8B82] hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Debate (All Details)</span>
            </button>
          </div>

          <span className="text-[11px] text-[#8E8B82] hidden md:inline">
            {viewMode === 'compact' ? 'Showing concise summaries & direct challenges' : 'Showing complete reasoning chains & evidence'}
          </span>
        </div>

        {/* Right: Specialist & Round Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="bg-[#0D0E10] border border-[#2A2D32] rounded-lg px-2.5 py-1.5 text-xs text-[#D8D5CD] focus:border-[#C5A059] focus:outline-none cursor-pointer"
            >
              <option value="all">All Specialists ({messages.length})</option>
              {uniqueAgents.map(ag => {
                const meta = getExpertMeta(ag);
                return (
                  <option key={ag} value={ag}>{meta.name} ({meta.title.split(' ')[0]})</option>
                );
              })}
            </select>
          </div>

          <select
            value={selectedRoundFilter}
            onChange={(e) => setSelectedRoundFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-[#0D0E10] border border-[#2A2D32] rounded-lg px-2.5 py-1.5 text-xs text-[#D8D5CD] font-mono focus:border-[#C5A059] focus:outline-none cursor-pointer"
          >
            <option value="all">All Rounds ({totalRounds})</option>
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map(r => (
              <option key={r} value={r}>Round 0{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Debate Messages Feed */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="p-16 text-center bg-[#15171A] rounded-xl border border-[#2A2D32] shadow-xl">
            {isDebating ? (
              <div className="space-y-3">
                <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-serif italic text-[#C5A059]">Autonomous disciplinary agents debating in real time...</p>
              </div>
            ) : (
              <p className="text-xs text-[#8E8B82] font-serif italic">No debate arguments recorded yet.</p>
            )}
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const meta = getExpertMeta(msg.agent);
            const targetMeta = msg.targetAgent ? getExpertMeta(msg.targetAgent) : null;
            const msgId = msg.id || `msg_${index}`;
            const isExplainExpanded = !!expandedExplanationIds[msgId];

            return (
              <div
                key={msgId}
                className={`bg-[#15171A] border border-[#2A2D32] hover:border-[#3E4249] rounded-xl transition-all shadow-md overflow-hidden ${
                  viewMode === 'compact' ? 'p-4 sm:p-5 space-y-3' : 'p-6 sm:p-7 space-y-4'
                }`}
              >
                {/* Agent Identity & Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2D32]/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg border border-[#2A2D32] bg-gradient-to-br ${meta.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {meta.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">{msg.agentName || meta.name}</span>
                        <span className="text-[10px] text-[#C5A059] font-mono font-medium px-2 py-0.5 rounded bg-[#1F2227] border border-[#2A2D32]">
                          {meta.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8E8B82] mt-0.5">{meta.specialty}</p>
                    </div>
                  </div>

                  {/* Badges & Confidence */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0D0E10] border border-[#2A2D32] text-[#8E8B82] font-mono text-[10px]">
                      R0{msg.round}
                    </span>
                    {getTypeBadge(msg.type)}
                    {getStatusBadge(msg.status)}
                    <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                      {msg.confidence}% Conf
                    </span>
                  </div>
                </div>

                {/* Target Challenge Banner (If target assigned) */}
                {targetMeta && (
                  <div className="p-2.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs flex items-center gap-2">
                    <span className="text-[#C5A059] font-mono text-[10px] uppercase tracking-wider font-semibold">
                      Challenging {targetMeta.name}:
                    </span>
                    <span className="text-[#D8D5CD] italic truncate">"{msg.targetClaim || 'Core discipline assumption'}"</span>
                  </div>
                )}

                {/* Mera Point / Core Argument (High Readability 40-80 words) */}
                <div className="p-3.5 rounded-lg bg-[#0D0E10] border border-[#C5A059]/25 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#C5A059] font-bold block">
                    Mera Point / Core Takeaway:
                  </span>
                  <p className="text-xs sm:text-sm text-white font-serif italic leading-relaxed">
                    "{msg.claim}"
                  </p>
                </div>

                {/* Challenge & Response (Shown in both views if available) */}
                {(msg.challenge || msg.response) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {msg.challenge && (
                      <div className="p-3 rounded-lg bg-rose-950/15 border border-rose-500/30 text-xs">
                        <span className="text-[10px] uppercase font-mono text-rose-400 font-bold block mb-1">
                          Challenge to {targetMeta ? targetMeta.name : 'Other Experts'}:
                        </span>
                        <p className="text-[#E6E4DD] text-xs leading-relaxed">{msg.challenge}</p>
                      </div>
                    )}
                    {msg.response && (
                      <div className="p-3 rounded-lg bg-emerald-950/15 border border-emerald-500/30 text-xs">
                        <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block mb-1">
                          Mera Response & Defense:
                        </span>
                        <p className="text-[#E6E4DD] text-xs leading-relaxed">{msg.response}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Non-essential Fields — Hidden via CSS when in Compact View */}
                <div className={viewMode === 'compact' ? 'hidden' : 'space-y-3 pt-2 border-t border-[#2A2D32]/60'}>
                  {/* Position Statement */}
                  {(msg.position || msg.critiqueOrDefense) && (
                    <div className="p-3.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs text-[#D8D5CD] leading-relaxed space-y-1.5">
                      <span className="text-[#8E8B82] font-mono block text-[10px] uppercase tracking-wider font-semibold">
                        Detailed Position Analysis:
                      </span>
                      <p className="text-xs sm:text-sm text-[#E6E4DD] leading-relaxed">
                        {msg.position || msg.critiqueOrDefense}
                      </p>
                    </div>
                  )}

                  {/* Domain Evidence & Stance Shift */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {msg.evidence && (
                      <div className="text-[#8E8B82] flex items-center gap-2 font-mono text-[11px]">
                        <span className="uppercase tracking-wider text-[#5A5D64]">Domain Evidence:</span>
                        <span className="text-[#D8D5CD]">{msg.evidence}</span>
                      </div>
                    )}

                    {msg.stanceShift && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#C5A059]/10 border border-[#C5A059]/40 text-[#C5A059] text-xs font-mono">
                        <RefreshCw className="w-3 h-3 text-[#C5A059]" />
                        <span>Calibrated: {msg.stanceShift.previousConfidence}% → {msg.stanceShift.newConfidence}% ({msg.stanceShift.reason})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Explain Simply / What Does This Mean? Button */}
                <div className="pt-2 flex items-center justify-between border-t border-[#2A2D32]/40">
                  <button
                    onClick={() => toggleSimpleExplanation(msgId)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[#C5A059] hover:text-[#E5C384] transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isExplainExpanded ? 'Hide Simple Explanation' : 'Explain Simply / What does this mean?'}</span>
                    {isExplainExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <span className="text-[10px] text-[#5A5D64] font-mono">
                    Confidence: {msg.confidence}%
                  </span>
                </div>

                {/* Instant Zero-API Simple Explanation Dropdown */}
                {isExplainExpanded && (
                  <div className="p-3.5 rounded-lg bg-[#111316] border border-[#C5A059]/30 text-xs text-[#E6E4DD] space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] uppercase font-mono text-[#C5A059] font-bold block">
                      Aasan Bhasha Mein Samjhein:
                    </span>
                    <p className="text-xs leading-relaxed text-[#D8D5CD]">
                      {explainSimplyLocal(msg.claim || msg.position || '', isHinglish)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={feedBottomRef} />
      </div>
    </div>
  );
};
