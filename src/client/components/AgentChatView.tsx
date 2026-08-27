import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Cpu, 
  HelpCircle, 
  MessageSquare, 
  Compass, 
  User 
} from 'lucide-react';
import { AgentRole, AGENT_REGISTRY, ChatMessage, WorldState } from '../../shared/types.ts';

interface AgentChatViewProps {
  worldState: WorldState;
  simulationId: string;
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({ worldState, simulationId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'world_chronicler',
      senderName: 'Chronos World Archivist',
      text: `Welcome to the Interrogation Chamber for "${worldState.finalWorldName}". You may pose detailed counterfactual questions to our specialized analytical agents or the World Archivist regarding treaties, trade corridors, military equilibrium, or technological progression.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<AgentRole | 'world_chronicler'>('world_chronicler');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Why did European empires not collapse into wars of national liberation?',
    'How did the absence of nuclear weapons change strategic deterrence?',
    'What was the primary economic engine behind the Mitteleuropa union?',
    'How did passenger aviation evolve with luxury stratospheric airships?'
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      senderName: 'Simulation Director',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/simulations/${simulationId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.text,
          targetRole
        })
      });

      const data = await response.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'world_chronicler',
            senderName: 'Chronos World Archivist',
            text: `Agent query could not be completed: ${data.error || 'Server response timed out.'}`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'world_chronicler',
          senderName: 'Chronos World Archivist',
          text: `In this alternate reality, this dynamic developed through continuous institutional negotiation and trade corridor growth.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentAvatar = (sender: string) => {
    if (sender === 'user') {
      return (
        <div className="w-8 h-8 rounded border border-[#2A2A2A] bg-[#222] flex items-center justify-center text-white">
          <User className="w-4 h-4 text-[#C5A059]" />
        </div>
      );
    }
    if (sender === 'world_chronicler' || sender === 'synthesizer') {
      return (
        <div className="w-8 h-8 rounded border border-[#2A2A2A] bg-gradient-to-br from-[#8C1D40] to-[#5C1D24] flex items-center justify-center text-white font-serif text-xs shadow-md">
          <Compass className="w-4 h-4 text-[#C5A059]" />
        </div>
      );
    }

    const meta = AGENT_REGISTRY[sender as AgentRole] || AGENT_REGISTRY.historian;
    return (
      <div className={`w-8 h-8 rounded border border-[#2A2A2A] bg-gradient-to-br ${meta.avatarColor} flex items-center justify-center text-white font-serif text-xs shadow-md`}>
        {sender === 'historian' && <BookOpen className="w-4 h-4 text-[#C5A059]" />}
        {sender === 'economist' && <TrendingUp className="w-4 h-4 text-[#52B788]" />}
        {sender === 'geopolitician' && <Shield className="w-4 h-4 text-[#6BA4B8]" />}
        {sender === 'futurist' && <Cpu className="w-4 h-4 text-[#B89ACD]" />}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-[#2A2A2A]">
        <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-1 block font-medium">
          Direct Interrogation Chamber
        </span>
        <h2 className="text-2xl sm:text-3xl serif italic text-white">
          Direct Agent Q&A Interrogation
        </h2>
      </div>

      {/* Target Agent Selector */}
      <div className="bg-[#121212] border border-[#2A2A2A] rounded p-2.5 mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest font-mono text-[#666] mr-1">Interrogate:</span>
        <button
          type="button"
          onClick={() => setTargetRole('world_chronicler')}
          className={`px-3 py-1 rounded text-xs font-serif italic border cursor-pointer transition-all ${
            targetRole === 'world_chronicler' 
              ? 'bg-[#1C1811] border-[#C5A059]/60 text-[#C5A059]' 
              : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#777]'
          }`}
        >
          World Archivist
        </button>

        {(['historian', 'economist', 'geopolitician', 'futurist'] as const).map(role => {
          const meta = AGENT_REGISTRY[role];
          const isSelected = targetRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setTargetRole(role)}
              className={`px-3 py-1 rounded text-xs font-serif italic border cursor-pointer transition-all ${
                isSelected 
                  ? `${meta.badgeBg} ${meta.badgeBorder}` 
                  : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#777]'
              }`}
            >
              <span className="capitalize">{role}</span> ({meta.name.split(',')[0].split(' ')[1] || meta.name.split(',')[0]})
            </button>
          );
        })}
      </div>

      {/* Chat Thread Messages */}
      <div className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded p-5 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {getAgentAvatar(msg.sender)}

              <div
                className={`max-w-2xl rounded p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#C5A059] text-[#0F0F0F] font-bold rounded-tr-none'
                    : 'bg-[#121212] border border-[#2A2A2A] text-[#D4D4D4] rounded-tl-none space-y-2'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#1C1C1C] font-mono text-[9px] uppercase tracking-widest">
                    <span className="font-bold text-[#C5A059]">{msg.senderName}</span>
                    <span className="text-[#555]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <div className={`whitespace-pre-wrap ${isUser ? 'font-sans' : 'serif italic text-sm'}`}>{msg.text}</div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            {getAgentAvatar(targetRole)}
            <div className="bg-[#121212] border border-[#2A2A2A] rounded p-3.5 rounded-tl-none flex items-center gap-2.5 text-xs text-[#888] font-mono">
              <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-ping" />
              <span>Analyzing counterfactual causality and formulating response...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
        <span className="text-[9px] uppercase tracking-widest font-mono text-[#555] mr-1">Inquiries:</span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded bg-[#121212] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] text-[#888] hover:text-[#C5A059] transition-colors cursor-pointer text-left truncate max-w-xs serif italic"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Inquire with ${targetRole === 'world_chronicler' ? 'the World Archivist' : `Agent ${targetRole.toUpperCase()}`}...`}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-white text-xs placeholder-[#555] focus:outline-none focus:border-[#C5A059] font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-5 py-3 rounded bg-[#C5A059] hover:bg-[#D4B26F] text-[#0F0F0F] font-bold text-xs uppercase tracking-widest shadow-md cursor-pointer disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
