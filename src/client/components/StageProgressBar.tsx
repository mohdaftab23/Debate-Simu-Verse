import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Scale, 
  Globe, 
  Clock, 
  GitFork,
  FileText,
  MessageSquare,
  History,
  GitMerge
} from 'lucide-react';
import { Simulation } from '../../shared/types.ts';

interface StageProgressBarProps {
  simulation: Simulation | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  simulation,
  activeTab,
  onSelectTab
}) => {
  const currentStageIndex = simulation?.currentStageIndex || 0;
  const isCompleted = simulation?.status === 'completed';
  const expertCount = (simulation?.config?.expertCohort || []).filter(e => e?.enabled).length || 4;
  const debateRounds = simulation?.config?.debateRounds || 3;

  const stages = [
    { id: 'input', label: '1. Setup & Cohort', icon: Sparkles, stageIndex: 0 },
    { id: 'research', label: `2. Research (${expertCount} Experts)`, icon: BookOpen, stageIndex: 1 },
    { id: 'debate', label: `3. Debate Arena (${debateRounds}R)`, icon: Scale, stageIndex: 2 },
    { id: 'causal', label: '4. Causal Network', icon: GitFork, stageIndex: 4 },
    { id: 'map', label: '5. Geopolitical Map', icon: Globe, stageIndex: 4 },
    { id: 'timeline', label: '6. Timeline', icon: Clock, stageIndex: 4 },
    { id: 'report', label: '7. Intelligence Dossier', icon: FileText, stageIndex: 5 },
    { id: 'chat', label: '8. Agent Interrogation', icon: MessageSquare, stageIndex: 5 },
    { id: 'history', label: 'History Archive', icon: History, stageIndex: 0 }
  ];

  return (
    <div className="bg-[#0A0A0A] border-b border-[#2A2D32] px-4 sm:px-8 py-0 overflow-x-auto shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 min-w-max">
        {stages.map((st) => {
          const Icon = st.icon;
          const isCurrentActiveTab = activeTab === st.id;
          const isUnlocked = isCompleted || currentStageIndex >= st.stageIndex || st.id === 'input' || st.id === 'history';

          return (
            <button
              key={st.id}
              onClick={() => isUnlocked && onSelectTab(st.id)}
              disabled={!isUnlocked}
              className={`flex items-center gap-2 px-3.5 py-3 text-[10px] uppercase tracking-widest font-mono font-medium transition-all cursor-pointer border-b-2 ${
                isCurrentActiveTab
                  ? 'text-white border-[#C5A059] bg-[#141414]/70 font-semibold'
                  : isUnlocked
                  ? 'text-[#8E8B82] hover:text-white hover:bg-[#121212] border-transparent'
                  : 'text-[#444] border-transparent cursor-not-allowed opacity-40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isCurrentActiveTab ? 'text-[#C5A059]' : 'text-current'}`} />
              <span>{st.label}</span>
              {currentStageIndex > st.stageIndex && st.id !== 'input' && st.id !== 'history' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
