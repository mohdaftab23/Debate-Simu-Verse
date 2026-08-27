import React, { useState } from 'react';
import { 
  Clock, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Filter, 
  Globe, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Cpu, 
  Flame,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TimelineEvent, WorldState } from '../../shared/types.ts';
import { explainSimplyLocal } from '../../shared/hinglishHelper.ts';

interface TimelineViewProps {
  worldState: WorldState;
  onSelectMapRegion?: (region: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ worldState, onSelectMapRegion }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});

  const timeline = worldState.timeline || [];

  const filteredEvents = timeline.filter(evt => {
    if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;
    return true;
  });

  const toggleSimpleExplanation = (id: string) => {
    setExpandedExplanationIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCategoryBadge = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'divergence':
        return <span className="px-2.5 py-0.5 rounded bg-[#241113] border border-[#E11D48]/40 text-[#FDA4AF] text-[9px] uppercase tracking-widest font-mono font-medium">Divergence Catalyst</span>;
      case 'political':
        return <span className="px-2.5 py-0.5 rounded bg-[#1C1811] border border-[#C5A059]/40 text-[#C5A059] text-[9px] uppercase tracking-widest font-mono font-medium">Treaty & Statecraft</span>;
      case 'economic':
        return <span className="px-2.5 py-0.5 rounded bg-[#0E1F18] border border-[#2D6A4F]/60 text-[#52B788] text-[9px] uppercase tracking-widest font-mono font-medium">Trade & Industrial</span>;
      case 'military':
        return <span className="px-2.5 py-0.5 rounded bg-[#0F1B26] border border-[#2A4D69]/60 text-[#6BA4B8] text-[9px] uppercase tracking-widest font-mono font-medium">Equilibrium & Doctrine</span>;
      case 'technological':
        return <span className="px-2.5 py-0.5 rounded bg-[#1D1326] border border-[#5A3E7A]/60 text-[#B89ACD] text-[9px] uppercase tracking-widest font-mono font-medium">Technological Tier</span>;
      case 'cultural':
        return <span className="px-2.5 py-0.5 rounded bg-[#1C1A16] border border-[#888]/40 text-[#bbb] text-[9px] uppercase tracking-widest font-mono font-medium">Societal Paradigm</span>;
      default:
        return null;
    }
  };

  const getAgreementBadge = (level: TimelineEvent['agentAgreementLevel']) => {
    switch (level) {
      case 'full':
        return (
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono text-[#52B788]">
            <CheckCircle className="w-3 h-3" /> Consensus
          </span>
        );
      case 'majority':
        return (
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono text-[#C5A059]">
            <CheckCircle className="w-3 h-3" /> Majority (3/4)
          </span>
        );
      case 'contested':
        return (
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono text-[#FDA4AF]">
            <AlertCircle className="w-3 h-3" /> Contested
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4 border-b border-[#2A2D32]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-2 block font-medium">
            Chronological Archive • Causal Timeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-white">
            Historical Progression of Divergence
          </h2>
          <p className="text-[#8E8B82] text-xs mt-1">
            Tracing primary disruptions, state adaptations, and long-term societal cascades across the simulated timeline.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#121417] p-1.5 rounded-lg border border-[#2A2D32]">
          {['all', 'divergence', 'political', 'economic', 'technological'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-mono transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-[#C5A059] text-black font-bold shadow-sm' 
                  : 'text-[#8E8B82] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative pl-6 sm:pl-8 border-l border-[#2A2D32] space-y-6 my-8">
        {filteredEvents.map((evt, idx) => {
          const isDivergence = evt.category === 'divergence';
          const eventId = evt.id || `evt_${idx}`;
          const isExpanded = !!expandedExplanationIds[eventId];

          return (
            <div key={eventId} className="relative group">
              {/* Timeline Node Icon Circle */}
              <div 
                className={`absolute -left-[31px] sm:-left-[39px] top-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 ${
                  isDivergence 
                    ? 'bg-[#E11D48] border-white text-white shadow-lg' 
                    : 'bg-[#0D0E10] border-[#C5A059] text-[#C5A059] shadow-md'
                }`}
              >
                {isDivergence ? <Flame className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              </div>

              {/* Event Card */}
              <div className="bg-[#15171A] border border-[#2A2D32] rounded-xl p-5 shadow-xl transition-all hover:border-[#3E4249] space-y-3">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-sm font-bold font-mono text-[#C5A059] px-2.5 py-1 rounded bg-[#0D0E10] border border-[#2A2D32]">
                      {evt.year} AD
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#C5A059] transition-colors">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {getCategoryBadge(evt.category)}
                    <span className="px-2.5 py-0.5 rounded bg-[#0D0E10] border border-[#2A2D32] text-[#8E8B82] font-mono text-xs">
                      {evt.confidence}% Conf
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#D8D5CD] font-serif italic leading-relaxed">
                  {evt.description}
                </p>

                {/* Footer metadata & Explain Simply Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#2A2D32]/60 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[#8E8B82] font-mono text-[10px]">
                      <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span className="uppercase tracking-wider">Region: <strong className="text-white">{evt.primaryRegion}</strong></span>
                    </div>

                    <button
                      onClick={() => toggleSimpleExplanation(eventId)}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#C5A059] hover:text-[#E5C384] transition-colors cursor-pointer"
                    >
                      <Lightbulb className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide' : 'Explain Simply'}</span>
                      {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                    </button>
                  </div>

                  <div>
                    {getAgreementBadge(evt.agentAgreementLevel)}
                  </div>
                </div>

                {/* Simple Explanation Content */}
                {isExpanded && (
                  <div className="p-3.5 rounded-lg bg-[#0D0E10] border border-[#C5A059]/30 text-xs text-[#D8D5CD] space-y-1 animate-fadeIn">
                    <span className="text-[10px] font-mono uppercase text-[#C5A059] font-bold block">
                      Aasan Bhasha Mein Samjhein:
                    </span>
                    <p className="leading-relaxed">
                      {explainSimplyLocal(`${evt.title}. ${evt.description}`, true)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
