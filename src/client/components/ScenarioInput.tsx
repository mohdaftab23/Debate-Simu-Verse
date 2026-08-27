import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Settings, 
  Compass, 
  Clock, 
  Globe, 
  ShieldAlert, 
  Sliders, 
  Cpu, 
  BookOpen, 
  Info,
  Check,
  Zap,
  Waves,
  Orbit,
  Atom,
  Feather,
  Users,
  Plus,
  Trash2,
  Edit3,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Volume2,
  Image as ImageIcon
} from 'lucide-react';
import { PRESET_SCENARIOS, PresetScenario } from '../../shared/presets.ts';
import { 
  SimulationConfig, 
  CommunicationStyle, 
  SelectedExpertConfig, 
  EXPERT_ROLE_REGISTRY, 
  getExpertMeta,
  ProviderType
} from '../../shared/types.ts';
import { CoverArtGenerator } from './CoverArtGenerator.tsx';
import { Key } from 'lucide-react';

interface ScenarioInputProps {
  onStartSimulation: (config: SimulationConfig) => void;
  isLoading?: boolean;
  onOpenKeyModal?: () => void;
  userKeys?: Partial<Record<ProviderType, string>>;
  selectedProvider?: ProviderType;
  selectedModel?: string;
}

const INSPIRATION_IDEAS = [
  {
    icon: Waves,
    label: 'Underwater Civilizations',
    title: 'What if humans evolved entirely underwater?',
    description: 'Humans evolved underwater with biological sonar and gill physiology, developing deep-sea metallurgy, hydrothermal energy grids, and high-pressure tele-optics to reach 2026-level technological sophistication.',
    startYear: 1800,
    endYear: 2026,
    scope: 'aquatic_oceanic' as const,
    recommendedRoles: ['biologist', 'engineer', 'climate_scientist', 'historian']
  },
  {
    icon: Orbit,
    label: 'Mars Evolution',
    title: 'What if humans evolved on Mars with two moons?',
    description: 'Humanity originated and evolved in the deep canyon biospheres of Mars under low gravity and dual-moon orbital tides, achieving an industrial and spacefaring civilization by 2026.',
    startYear: 1750,
    endYear: 2026,
    scope: 'planetary_mars' as const,
    recommendedRoles: ['astronomer', 'physicist', 'engineer', 'biologist']
  },
  {
    icon: Feather,
    label: 'No Christianity',
    title: 'What if Christianity never emerged in the Roman Empire?',
    description: 'The Roman Empire retained Hellenistic philosophy, Mithraism, and Stoic civil jurisprudence, navigating philosophical and scientific inquiries through continuous Alexandrian academies.',
    startYear: 33,
    endYear: 1500,
    scope: 'global' as const,
    recommendedRoles: ['historian', 'sociologist', 'anthropologist', 'political_scientist']
  },
  {
    icon: Zap,
    label: 'Ancient Electricity',
    title: 'What if electricity was harnessed in Ancient Rome (100 AD)?',
    description: 'Alexandrian and Roman scholars industrialized Baghdad batteries and electrostatic generators, creating early electrical telegraphs and electric chariot transport during the High Empire.',
    startYear: 100,
    endYear: 1000,
    scope: 'eurasia' as const,
    recommendedRoles: ['physicist', 'computer_scientist', 'economist', 'futurist']
  },
  {
    icon: Atom,
    label: 'No WWI or WWII',
    title: 'If World War I and World War II Never Happened',
    description: 'The July Crisis of 1914 was resolved through diplomatic arbitration, preserving constitutional monarchies, preventing totalitarian dictatorships, and accelerating civil electrification.',
    startYear: 1914,
    endYear: 2026,
    scope: 'global' as const,
    recommendedRoles: ['historian', 'military_strategist', 'political_scientist', 'economist']
  }
];

const AVAILABLE_MODELS = [
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash (Fast & Analytical)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Reasoning & Synthesis)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Low-Latency)' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (High Throughput)' }
];

const COMMUNICATION_STYLES: Array<{ id: CommunicationStyle; label: string; desc: string; badge: string }> = [
  { id: 'hinglish', label: '🟢 Easy Hinglish (Default)', desc: 'Simple Hindi + English conversational style, natural & easy to understand', badge: 'Default' },
  { id: 'layman', label: '🔵 Easy English', desc: 'Plain, accessible everyday English with zero academic jargon', badge: 'Simple' },
  { id: 'professional', label: '🟡 Professional', desc: 'Clear professional English with moderate domain precision', badge: 'Standard' },
  { id: 'expert', label: '🔴 Expert Academic', desc: 'Deep theoretical models, technical specifications & formal systems', badge: 'Advanced' }
];

export const ScenarioInput: React.FC<ScenarioInputProps> = ({
  onStartSimulation,
  isLoading = false,
  onOpenKeyModal,
  userKeys,
  selectedProvider = 'gemini',
  selectedModel = 'gemini-3.7-flash'
}) => {
  const hasConfiguredKey = Object.values(userKeys || {}).some(
    k => typeof k === 'string' && k.trim().length > 0
  );
  const [selectedPreset, setSelectedPreset] = useState<PresetScenario | null>(PRESET_SCENARIOS[0]);
  const [scenarioTitle, setScenarioTitle] = useState(PRESET_SCENARIOS[0].title);
  const [scenarioDescription, setScenarioDescription] = useState(PRESET_SCENARIOS[0].description);
  const [startingYear, setStartingYear] = useState<number>(PRESET_SCENARIOS[0].startingYear);
  const [endYear, setEndYear] = useState<number>(PRESET_SCENARIOS[0].endYear);
  const [geographicScope, setGeographicScope] = useState<SimulationConfig['geographicScope']>('global');
  const [debateRounds, setDebateRounds] = useState<number>(3);
  const [realismLevel, setRealismLevel] = useState<SimulationConfig['realismLevel']>('plausible_extrapolation');
  const [creativityLevel, setCreativityLevel] = useState<SimulationConfig['creativityLevel']>('balanced');
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle>('hinglish');
  const [showDebate, setShowDebate] = useState<boolean>(true);
  const [debateDetailLevel, setDebateDetailLevel] = useState<'minimal' | 'standard' | 'full'>('standard');
  const [autoSelectExperts, setAutoSelectExperts] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showCoverArtModal, setShowCoverArtModal] = useState<boolean>(false);
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>(undefined);
  const [coverArtStyle, setCoverArtStyle] = useState<string>('imperial_gold');
  const [coverArtPrompt, setCoverArtPrompt] = useState<string | undefined>(undefined);

  // Dynamic Expert Cohort (2 to 5 slots)
  const [expertCohort, setExpertCohort] = useState<SelectedExpertConfig[]>([
    { slotId: 'slot_1', roleId: 'historian', name: 'Dr. Alistair Vance', title: 'Senior Historical Causality Analyst', specialty: 'Divergence mechanics & institutional continuity', modelName: 'gemini-3.7-flash', enabled: true },
    { slotId: 'slot_2', roleId: 'economist', name: 'Elena Rostova, Ph.D.', title: 'Macroeconomic & Trade Systems Modeler', specialty: 'Resource flows & production capacity', modelName: 'gemini-3.7-flash', enabled: true },
    { slotId: 'slot_3', roleId: 'geopolitician', name: 'Cmdr. Marcus Sterling', title: 'Strategic Security Analyst', specialty: 'Sovereign entities & flashpoint conflicts', modelName: 'gemini-3.7-flash', enabled: true },
    { slotId: 'slot_4', roleId: 'futurist', name: 'Dr. Maya Lin-Chen', title: 'Techno-Societal Evolution Strategist', specialty: 'Scientific paradigms & cultural shifts', modelName: 'gemini-3.7-flash', enabled: true }
  ]);

  // AI Suggestions state
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionResult, setSuggestionResult] = useState<{
    suggestedExperts: Array<{ roleId: string; name: string; title: string; rationale: string; primaryFocus: string }>;
    reasoning: string;
  } | null>(null);

  // Custom role editing modal state
  const [editingCustomIndex, setEditingCustomIndex] = useState<number | null>(null);
  const [customRoleForm, setCustomRoleForm] = useState({
    name: 'Custom Domain Specialist',
    title: 'Interdisciplinary Fellow',
    specialty: 'Domain impact analysis',
    description: 'Specialist analyzing unique boundary constraints.'
  });

  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPreset(preset);
    setScenarioTitle(preset.title);
    setScenarioDescription(preset.description);
    setStartingYear(preset.startingYear);
    setEndYear(preset.endYear);
    setGeographicScope(preset.geographicScope);
    setSuggestionResult(null);
  };

  const handleSelectIdea = (idea: typeof INSPIRATION_IDEAS[0]) => {
    setSelectedPreset(null);
    setScenarioTitle(idea.title);
    setScenarioDescription(idea.description);
    setStartingYear(idea.startYear);
    setEndYear(idea.endYear);
    setGeographicScope(idea.scope);
    setSuggestionResult(null);

    // If idea has recommended roles, configure cohort
    if (idea.recommendedRoles && idea.recommendedRoles.length >= 2) {
      const newCohort: SelectedExpertConfig[] = idea.recommendedRoles.slice(0, 5).map((rId, idx) => {
        const meta = getExpertMeta(rId);
        return {
          slotId: `slot_${idx + 1}`,
          roleId: rId,
          name: meta.name,
          title: meta.title,
          specialty: meta.specialty,
          modelName: 'gemini-3.7-flash',
          enabled: true
        };
      });
      setExpertCohort(newCohort);
    }
  };

  const handleSuggestExperts = async () => {
    if (!scenarioTitle.trim()) return;
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/simulations/suggest-experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: scenarioTitle.trim(),
          scenarioDescription: scenarioDescription.trim(),
          count: expertCohort.length || 4
        })
      });
      const data = await res.json();
      if (data.success && data.suggestedExperts) {
        setSuggestionResult(data);
      }
    } catch (err) {
      console.error('Failed to get expert suggestions', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplySuggestedCohort = () => {
    if (!suggestionResult) return;
    const newCohort: SelectedExpertConfig[] = suggestionResult.suggestedExperts.map((s, idx) => {
      const meta = getExpertMeta(s.roleId);
      return {
        slotId: `slot_${idx + 1}`,
        roleId: s.roleId,
        name: meta.name || s.name,
        title: meta.title || s.title,
        specialty: meta.specialty || s.primaryFocus,
        modelName: expertCohort[idx]?.modelName || 'gemini-3.7-flash',
        enabled: true
      };
    });
    setExpertCohort(newCohort);
    setSuggestionResult(null);
  };

  const handleUpdateExpertRole = (index: number, newRoleId: string) => {
    const updated = [...expertCohort];
    if (newRoleId === 'custom') {
      setEditingCustomIndex(index);
      return;
    }
    const meta = getExpertMeta(newRoleId);
    updated[index] = {
      ...updated[index],
      roleId: newRoleId,
      name: meta.name,
      title: meta.title,
      specialty: meta.specialty,
      customDef: undefined
    };
    setExpertCohort(updated);
  };

  const handleUpdateExpertModel = (index: number, modelName: string) => {
    const updated = [...expertCohort];
    updated[index] = { ...updated[index], modelName };
    setExpertCohort(updated);
  };

  const handleToggleExpertEnabled = (index: number) => {
    const enabledCount = expertCohort.filter(e => e.enabled).length;
    if (expertCohort[index].enabled && enabledCount <= 2) {
      return; // Maintain at least 2 enabled experts
    }
    const updated = [...expertCohort];
    updated[index] = { ...updated[index], enabled: !updated[index].enabled };
    setExpertCohort(updated);
  };

  const handleAddExpertSlot = () => {
    if (expertCohort.length >= 5) return;
    const nextSlotNum = expertCohort.length + 1;
    const availableRole = Object.keys(EXPERT_ROLE_REGISTRY).find(
      r => r !== 'synthesizer' && r !== 'custom' && !expertCohort.some(e => e.roleId === r)
    ) || 'historian';
    const meta = getExpertMeta(availableRole);

    const newSlot: SelectedExpertConfig = {
      slotId: `slot_${nextSlotNum}`,
      roleId: availableRole,
      name: meta.name,
      title: meta.title,
      specialty: meta.specialty,
      modelName: 'gemini-3.7-flash',
      enabled: true
    };
    setExpertCohort([...expertCohort, newSlot]);
  };

  const handleRemoveExpertSlot = (index: number) => {
    if (expertCohort.length <= 2) return;
    const updated = expertCohort.filter((_, i) => i !== index).map((e, idx) => ({
      ...e,
      slotId: `slot_${idx + 1}`
    }));
    setExpertCohort(updated);
  };

  const handleSaveCustomRole = () => {
    if (editingCustomIndex === null) return;
    const updated = [...expertCohort];
    updated[editingCustomIndex] = {
      ...updated[editingCustomIndex],
      roleId: 'custom',
      name: customRoleForm.name || 'Custom Expert',
      title: customRoleForm.title || 'Domain Specialist',
      specialty: customRoleForm.specialty || 'Analytical research',
      customDef: {
        id: `custom_${Date.now()}`,
        name: customRoleForm.name,
        title: customRoleForm.title,
        specialty: customRoleForm.specialty,
        description: customRoleForm.description,
        avatarColor: '#D4AF37',
        focusAreas: [customRoleForm.specialty]
      }
    };
    setExpertCohort(updated);
    setEditingCustomIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioTitle.trim() || !scenarioDescription.trim()) return;

    onStartSimulation({
      scenarioTitle: scenarioTitle.trim(),
      scenarioDescription: scenarioDescription.trim(),
      startingYear: Number(startingYear),
      endYear: Number(endYear),
      geographicScope,
      expertCohort: expertCohort.filter(e => e.enabled),
      agentCount: expertCohort.filter(e => e.enabled).length,
      debateRounds: Number(debateRounds),
      realismLevel,
      creativityLevel,
      communicationStyle,
      showDebate,
      debateDetailLevel,
      autoSelectExperts,
      provider: selectedProvider,
      modelName: selectedModel,
      userKeys: userKeys,
      coverArtUrl,
      coverArtStyle,
      coverArtPrompt
    });
  };

  const enabledExpertsCount = expertCohort.filter(e => e.enabled).length;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-8">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-3 block font-medium">
          Open Counterfactual Simulation Engine
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl serif italic tracking-tight text-white mb-3">
          Simulate Any Hypothetical World
        </h1>
        <p className="text-sm sm:text-base text-[#8E8B82] max-w-2xl mx-auto leading-relaxed">
          Formulate ANY counterfactual scenario. Assemble custom expert cohorts, map LLM models, and observe Bayesian multi-agent debates synthesizing an internally consistent reality.
        </p>
      </div>

      {/* AI Key Configuration Banner */}
      <div className="mb-6">
        {hasConfiguredKey ? (
          <div className="p-3.5 bg-[#0E2017] border border-[#2D6A4F] rounded-xl flex items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2.5 text-[#52B788]">
              <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0" />
              <span>
                <strong className="text-white">AI Key Configured & Active:</strong> Using <span className="capitalize font-bold text-[#52B788]">{selectedProvider}</span> (<span className="font-mono text-white">{selectedModel}</span>). Your simulations will run using your configured API key.
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenKeyModal}
              className="px-3 py-1.5 bg-[#132A1F] hover:bg-[#1C3D2C] text-[#52B788] border border-[#2D6A4F] rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0"
            >
              Configure / Switch Key
            </button>
          </div>
        ) : (
          <div className="p-4 bg-[#17140E] border border-[#C5A059]/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
            <div className="flex items-center gap-3 text-[#E6D5B8]">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <div className="text-white font-bold text-xs">Add Your AI API Key to Unlock Live Simulations</div>
                <div className="text-[#8E8B82] text-[11px]">
                  Provide a Google Gemini, OpenAI, or Anthropic API key to generate live multi-agent historical projections.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenKeyModal}
              className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 fill-black" />
              <span>Add Your Key</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Inspiration Idea Chips */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs uppercase tracking-widest text-[#8E8B82] font-semibold flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
            Inspiration Scenarios (Click to Load)
          </span>
          <span className="text-[11px] text-[#C5A059]/80 italic">Any open-ended scenario is fully supported</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {INSPIRATION_IDEAS.map((idea, idx) => {
            const Icon = idea.icon;
            const isSelected = scenarioTitle === idea.title;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectIdea(idea)}
                className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                  isSelected 
                    ? 'bg-[#C5A059]/10 border-[#C5A059] text-white shadow-lg shadow-[#C5A059]/10' 
                    : 'bg-[#15171A] border-[#2A2D32] text-[#8E8B82] hover:border-[#3E4249] hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C5A059]' : 'text-[#8E8B82]'}`} />
                  <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-[#8E8B82]">
                    {idea.startYear} AD
                  </span>
                </div>
                <div>
                  <div className="text-xs font-medium line-clamp-1 text-white">{idea.label}</div>
                  <div className="text-[10px] text-[#8E8B82] line-clamp-1 mt-0.5">{idea.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#15171A] border border-[#2A2D32] rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section 1: Scenario Definition */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-3">
              <h2 className="text-sm uppercase tracking-widest text-[#E6E4DD] font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                1. Scenario Definition & Temporal Horizon
              </h2>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium">
                Hypothetical Scenario / What-If Question *
              </label>
              <input
                type="text"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                placeholder="e.g. What if humans evolved entirely underwater? or What if electricity was discovered in 100 AD?"
                required
                className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-4 py-3 text-sm text-white placeholder-[#5A5D64] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium">
                Catalytic Divergence & Specific Details *
              </label>
              <textarea
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                rows={3}
                placeholder="Describe the exact point of departure, physical or technological mechanisms, and conditions to simulate..."
                required
                className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-4 py-3 text-sm text-white placeholder-[#5A5D64] focus:outline-none transition-colors resize-y"
              />
            </div>

            {/* Time & Scope Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium flex items-center gap-1.5" title="Simulation start point: Jis saal se timeline alag hona shuru hogi">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  Starting Year / Era
                </label>
                <input
                  type="number"
                  value={startingYear}
                  onChange={(e) => setStartingYear(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
                <span className="text-[10px] text-[#8E8B82] mt-1 block">Point of departure</span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium flex items-center gap-1.5" title="Simulation Horizon: Kitne saal tak alternate world ko simulate karna hai">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  Simulation Horizon (Target)
                </label>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value) || 2026)}
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
                <span className="text-[10px] text-[#8E8B82] mt-1 block">Kitne saal tak simulate karna hai</span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium flex items-center gap-1.5" title="Geographic Scope: World ke kis area par focus karna hai">
                  <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                  Geographic Scope
                </label>
                <select
                  value={geographicScope}
                  onChange={(e) => setGeographicScope(e.target.value as any)}
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="global">Global (World ke saare regions)</option>
                  <option value="planetary_mars">Planetary (Mars / Cosmic biosphere)</option>
                  <option value="aquatic_oceanic">Aquatic (Samundar ke andar civilization)</option>
                  <option value="eurasia">Eurasian Supercontinent</option>
                  <option value="americas">The Americas</option>
                  <option value="regional_focal">Regional Focal Point</option>
                </select>
                <span className="text-[10px] text-[#8E8B82] mt-1 block">World ke kis area par focus karna hai</span>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Expert Cohort Builder & Model Mapping */}
          <div className="space-y-4 pt-4 border-t border-[#2A2D32]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2D32] pb-3">
              <div>
                <h2 className="text-sm uppercase tracking-widest text-[#E6E4DD] font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C5A059]" />
                  2. Expert Cohort Builder & Model Mapping
                </h2>
                <p className="text-xs text-[#8E8B82] mt-0.5">
                  Select {enabledExpertsCount} disciplinary experts (2 to 5) and assign Gemini model slots.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSuggestExperts}
                  disabled={isSuggesting || !scenarioTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/40 hover:bg-[#C5A059]/20 text-[#C5A059] text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-spin' : ''}`} />
                  {isSuggesting ? 'Analyzing...' : 'Suggest Experts (AI)'}
                </button>

                {expertCohort.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddExpertSlot}
                    className="px-3 py-1.5 rounded-lg bg-[#1F2227] border border-[#2A2D32] hover:border-[#C5A059]/60 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                    Add Expert Slot
                  </button>
                )}
              </div>
            </div>

            {/* AI Suggestion Banner / Modal Card */}
            {suggestionResult && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#C5A059]/15 to-[#1A1C20] border border-[#C5A059]/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    AI Recommended Expert Cohort
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplySuggestedCohort}
                      className="px-3 py-1 bg-[#C5A059] text-black text-xs font-semibold rounded-md hover:bg-[#D4AF37] transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply Cohort
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionResult(null)}
                      className="text-xs text-[#8E8B82] hover:text-white px-1.5"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#D8D5CD] italic leading-relaxed">
                  "{suggestionResult.reasoning}"
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                  {suggestionResult.suggestedExperts.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-[#C5A059]/30 text-xs">
                      <div className="font-bold text-white line-clamp-1">{s.name}</div>
                      <div className="text-[10px] text-[#C5A059]">{s.title}</div>
                      <div className="text-[11px] text-[#8E8B82] mt-1 line-clamp-2">{s.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expert Slot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3.5">
              {expertCohort.map((slot, index) => {
                const meta = getExpertMeta(slot.roleId, slot.customDef);
                const isCustom = slot.roleId === 'custom';

                return (
                  <div 
                    key={slot.slotId}
                    className={`p-4 rounded-xl border transition-all ${
                      slot.enabled 
                        ? 'bg-[#0D0E10] border-[#2A2D32] hover:border-[#3E4249]' 
                        : 'bg-[#0D0E10]/40 border-[#1F2227] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={() => handleToggleExpertEnabled(index)}
                          className="rounded border-[#2A2D32] text-[#C5A059] focus:ring-[#C5A059] bg-[#15171A]"
                        />
                        <span className="text-xs font-mono font-bold text-[#C5A059] uppercase">
                          Slot {index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A1C20] text-[#8E8B82] border border-[#2A2D32]">
                          Connected
                        </span>
                        {expertCohort.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExpertSlot(index)}
                            className="text-[#8E8B82] hover:text-rose-400 p-1 transition-colors"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Role Selector Dropdown */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#8E8B82] mb-1 font-medium">
                          Assigned Disciplinary Role
                        </label>
                        <select
                          value={slot.roleId}
                          onChange={(e) => handleUpdateExpertRole(index, e.target.value)}
                          disabled={!slot.enabled}
                          className="w-full bg-[#15171A] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <optgroup label="Core Disciplines">
                            <option value="historian">Historian (Dr. Vance)</option>
                            <option value="economist">Economist (Dr. Rostova)</option>
                            <option value="geopolitician">Geopolitician (Cmdr. Sterling)</option>
                            <option value="futurist">Futurist (Dr. Lin-Chen)</option>
                          </optgroup>
                          <optgroup label="Scientific & Planetary">
                            <option value="physicist">Physicist & Thermodynamicist</option>
                            <option value="astronomer">Planetary Astronomer</option>
                            <option value="biologist">Evolutionary Biologist</option>
                            <option value="climate_scientist">Climate & Atmospheric Modeler</option>
                            <option value="geologist">Geologist & Mineralogist</option>
                            <option value="microbiologist">Microbiologist & Pathologist</option>
                          </optgroup>
                          <optgroup label="Socioeconomic & Political">
                            <option value="sociologist">Sociologist & Cultural Demographer</option>
                            <option value="anthropologist">Anthropologist & Ethnohistorian</option>
                            <option value="political_scientist">Political Scientist & Jurist</option>
                            <option value="demographer">Demographer & Population Analyst</option>
                            <option value="psychologist">Cognitive & Social Psychologist</option>
                          </optgroup>
                          <optgroup label="Engineering & Strategy">
                            <option value="engineer">Industrial & Systems Engineer</option>
                            <option value="computer_scientist">Computational Systems Architect</option>
                            <option value="military_strategist">Military Strategist & Defense Theorist</option>
                            <option value="ecologist">Ecologist & Biosphere Modeler</option>
                            <option value="medical_scientist">Medical Scientist & Epidemiologist</option>
                          </optgroup>
                          <optgroup label="Custom Specialist">
                            <option value="custom">★ Custom User-Defined Expert...</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Model Selector for this slot */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#8E8B82] mb-1 font-medium">
                          Assigned Gemini Model
                        </label>
                        <select
                          value={slot.modelName}
                          onChange={(e) => handleUpdateExpertModel(index, e.target.value)}
                          disabled={!slot.enabled}
                          className="w-full bg-[#15171A] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-2.5 py-1.5 text-xs text-[#D8D5CD] focus:outline-none"
                        >
                          {AVAILABLE_MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Expert Meta Card Display */}
                      <div className="mt-2 p-2 rounded bg-black/30 border border-[#2A2D32]/50 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{meta.name}</span>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCustomIndex(index);
                                setCustomRoleForm({
                                  name: meta.name,
                                  title: meta.title,
                                  specialty: meta.specialty,
                                  description: meta.description
                                });
                              }}
                              className="text-[10px] text-[#C5A059] hover:underline flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-[#C5A059] font-mono">{meta.title}</div>
                        <div className="text-[11px] text-[#8E8B82] mt-0.5 line-clamp-1">Focus: {meta.specialty}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Communication Style & Rigor Controls */}
          <div className="space-y-4 pt-4 border-t border-[#2A2D32]">
            <div className="border-b border-[#2A2D32] pb-3">
              <h2 className="text-sm uppercase tracking-widest text-[#E6E4DD] font-semibold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#C5A059]" />
                3. Communication Style, Rigor & Debate Visibility
              </h2>
            </div>

            {/* Global Communication Style Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-2 font-medium">
                Agent Communication Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {COMMUNICATION_STYLES.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setCommunicationStyle(style.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      communicationStyle === style.id
                        ? 'bg-[#C5A059]/15 border-[#C5A059] text-white shadow-sm'
                        : 'bg-[#0D0E10] border-[#2A2D32] text-[#8E8B82] hover:border-[#3E4249] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{style.label}</div>
                    <div className="text-[10px] text-[#8E8B82] leading-tight">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Creativity, Rigor, Rounds & Debate Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium" title="Creativity: AI kitne unusual but possible ideas explore karega">
                  Creativity / Idea Space
                </label>
                <select
                  value={creativityLevel}
                  onChange={(e) => setCreativityLevel(e.target.value as any)}
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="conservative">1 / 5 - Strict / Realistic (Minimal Divergence)</option>
                  <option value="balanced">3 / 5 - Balanced (Standard)</option>
                  <option value="speculative">5 / 5 - Bold / Speculative (Wild Possibilities)</option>
                </select>
                <span className="text-[10px] text-[#8E8B82] mt-1 block">Kitne unusual ideas explore karne hain</span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium" title="Simulation Rigor: AI kitna strict realism follow karega">
                  Simulation Rigor
                </label>
                <select
                  value={realismLevel}
                  onChange={(e) => setRealismLevel(e.target.value as any)}
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="strict_historical">Strict Physical & Institutional Bounds</option>
                  <option value="plausible_extrapolation">Plausible Extrapolation (Standard)</option>
                  <option value="speculative_fiction">Speculative Exploration</option>
                </select>
                <span className="text-[10px] text-[#8E8B82] mt-1 block">AI kitna strict realism follow karega</span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium" title="Debate Rounds: Experts kitni baar ek doosre ko challenge karenge">
                  Debate Rounds
                </label>
                <select
                  value={debateRounds}
                  onChange={(e) => setDebateRounds(parseInt(e.target.value) || 3)}
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={1}>1 Round (Thesis & Quick Convergence)</option>
                  <option value={2}>2 Rounds (Thesis + Disciplinary Challenge)</option>
                  <option value={3}>3 Rounds (Full Dialectic Defense & Synthesis)</option>
                  <option value={4}>4 Rounds (Deep Interrogation)</option>
                  <option value={5}>5 Rounds (Exhaustive Delphi Consensus)</option>
                </select>
                <span className="text-[10px] text-[#8E8B82] mt-1 block">Kitni baar aapas mein challenge karenge</span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1.5 font-medium">
                  Debate Visibility
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-[#D8D5CD] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDebate}
                      onChange={(e) => setShowDebate(e.target.checked)}
                      className="rounded border-[#2A2D32] text-[#C5A059] focus:ring-[#C5A059] bg-[#15171A]"
                    />
                    <span>Show Live Agent Debate</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Launch Button */}
          <div className="pt-4 border-t border-[#2A2D32] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#8E8B82] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Ready: {enabledExpertsCount} Active Specialists · {debateRounds} Debate Rounds · {communicationStyle.toUpperCase()} Style</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowCoverArtModal(true)}
                className="px-4 py-3.5 bg-[#15171A] hover:bg-[#1D1F23] border border-[#C5A059]/40 hover:border-[#C5A059] text-xs font-mono text-[#C5A059] hover:text-[#E5C384] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                title="Generate & Customize Speculative World Map Cover Art"
              >
                <Compass className="w-4 h-4 text-[#C5A059]" />
                <span>{coverArtUrl ? '🎨 Cover Art Ready' : '🎨 Generate Map Cover Art'}</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || !scenarioTitle.trim() || !scenarioDescription.trim()}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-black font-semibold rounded-xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#C5A059]/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Reality...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
                    <span>Launch Counterfactual Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Cover Art Generator Modal */}
      {showCoverArtModal && (
        <CoverArtGenerator
          isModal={true}
          scenarioTitle={scenarioTitle}
          scenarioDescription={scenarioDescription}
          startingYear={startingYear}
          endYear={endYear}
          geographicScope={geographicScope}
          initialStyle={coverArtStyle}
          onApplyCoverArt={(url, style, prompt) => {
            setCoverArtUrl(url);
            setCoverArtStyle(style);
            if (prompt) setCoverArtPrompt(prompt);
          }}
          onClose={() => setShowCoverArtModal(false)}
        />
      )}

      {/* Custom Expert Edit Modal */}
      {editingCustomIndex !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15171A] border border-[#C5A059]/60 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#2A2D32] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C5A059]" />
                Configure Custom Expert
              </h3>
              <button
                type="button"
                onClick={() => setEditingCustomIndex(null)}
                className="text-[#8E8B82] hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1 font-medium">
                  Expert Persona Name
                </label>
                <input
                  type="text"
                  value={customRoleForm.name}
                  onChange={(e) => setCustomRoleForm({ ...customRoleForm, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1 font-medium">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={customRoleForm.title}
                  onChange={(e) => setCustomRoleForm({ ...customRoleForm, title: e.target.value })}
                  placeholder="e.g. Chief Cyber-Oceanic Hydrologist"
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1 font-medium">
                  Core Specialty / Analytical Lens
                </label>
                <input
                  type="text"
                  value={customRoleForm.specialty}
                  onChange={(e) => setCustomRoleForm({ ...customRoleForm, specialty: e.target.value })}
                  placeholder="e.g. Benthic thermal energy & high-pressure robotics"
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#8E8B82] mb-1 font-medium">
                  Description & Analytical Directives
                </label>
                <textarea
                  value={customRoleForm.description}
                  onChange={(e) => setCustomRoleForm({ ...customRoleForm, description: e.target.value })}
                  rows={2}
                  placeholder="Specific rules, methodologies, or constraints this expert enforces..."
                  className="w-full bg-[#0D0E10] border border-[#2A2D32] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2D32]">
              <button
                type="button"
                onClick={() => setEditingCustomIndex(null)}
                className="px-3 py-1.5 rounded-lg border border-[#2A2D32] text-xs text-[#8E8B82] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomRole}
                className="px-4 py-1.5 rounded-lg bg-[#C5A059] text-black font-semibold text-xs hover:bg-[#D4AF37]"
              >
                Save Expert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
