import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Cpu, 
  Sparkles, 
  Clock, 
  Compass 
} from 'lucide-react';
import { EventLogItem, AgentRole, AGENT_REGISTRY } from '../../shared/types.ts';

interface LiveEventLogProps {
  logs: EventLogItem[];
}

export const LiveEventLog: React.FC<LiveEventLogProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'agent' && l.agent) return true;
    if (filter === 'system' && !l.agent) return true;
    return true;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  const getAgentBadge = (agent?: AgentRole) => {
    if (!agent) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#666] font-mono text-[9px] uppercase">
          SYS
        </span>
      );
    }
    if (agent === 'synthesizer') {
      return (
        <span className="px-1.5 py-0.5 rounded bg-[#1D1326] border border-[#5A3E7A]/60 text-[#B89ACD] font-mono text-[9px] uppercase">
          SYNTH
        </span>
      );
    }
    const meta = AGENT_REGISTRY[agent];
    return (
      <span className={`px-1.5 py-0.5 rounded ${meta.badgeBg} ${meta.badgeBorder} border font-mono text-[9px] uppercase font-semibold`}>
        {agent.substring(0, 4)}
      </span>
    );
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#121212] border-b border-[#2A2A2A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
            Laboratory Telemetry Stream
          </span>
          <span className="text-[9px] font-mono text-[#666]">
            ({logs.length} events)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-[#888] hover:text-white cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log Feed Body */}
      {isExpanded && (
        <div ref={scrollRef} className="p-3 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] bg-[#0A0A0A]">
          {filteredLogs.length === 0 ? (
            <p className="text-[#555] serif italic">No telemetry recorded yet...</p>
          ) : (
            filteredLogs.map((log) => {
              const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <div key={log.id} className="flex items-start gap-2 text-[#aaa] leading-tight">
                  <span className="text-[#555] shrink-0 text-[10px]">{time}</span>
                  {getAgentBadge(log.agent)}
                  <span className={`break-words ${
                    log.type === 'success' ? 'text-[#52B788]' :
                    log.type === 'warn' ? 'text-[#FDA4AF]' :
                    log.agent === 'synthesizer' ? 'text-[#C5A059]' : 'text-[#bbb]'
                  }`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
