import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Shield, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Cpu, 
  Lock, 
  Trash2, 
  ChevronRight,
  ExternalLink,
  Info,
  Sliders,
  Check
} from 'lucide-react';
import { ProviderType, UserProviderKeyConfig, BudgetConfig, WorkloadEstimate } from '../../shared/types.ts';

interface AIProviderSetupProps {
  isOpen: boolean;
  onClose: () => void;
  userKeys: Partial<Record<ProviderType, string>>;
  onSaveKeys: (keys: Partial<Record<ProviderType, string>>, budget?: BudgetConfig) => void;
  selectedProvider: ProviderType;
  onSelectProvider: (provider: ProviderType) => void;
  budgetConfig: BudgetConfig;
  workloadEstimate?: WorkloadEstimate;
}

interface ProviderMeta {
  id: ProviderType;
  name: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  portalUrl: string;
  defaultModel: string;
  models: { id: string; name: string; description: string }[];
}

const PROVIDER_DEFINITIONS: Record<'gemini' | 'openai' | 'anthropic', ProviderMeta> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Recommended',
    color: '#C5A059',
    bgColor: '#1A160E',
    borderColor: '#C5A059',
    portalUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-3.7-flash',
    models: [
      { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', description: 'Fast, state-of-the-art hybrid reasoning (Recommended)' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Deep analytical synthesis and complex counterfactual reasoning' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Balanced low-latency execution' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Ultra-fast lightweight execution' }
    ]
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    badge: 'Supported',
    color: '#10A37F',
    bgColor: '#0C1C17',
    borderColor: '#10A37F',
    portalUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Omni flagship model for high intelligence and synthesis' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, affordable, high-efficiency model' },
      { id: 'o3-mini', name: 'o3-mini', description: 'STEM & Causality reasoning specialist' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Deep historical analysis and broad knowledge' }
    ]
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    badge: 'Supported',
    color: '#D97706',
    bgColor: '#1D1408',
    borderColor: '#D97706',
    portalUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-7-sonnet-20250219',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Flagship hybrid reasoning & nuanced synthesis' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'High-capability analytical intelligence & debate depth' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast, cost-effective responsive reasoning' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Deep philosophical & historical evaluation' }
    ]
  }
};

export const AIProviderSetup: React.FC<AIProviderSetupProps> = ({
  isOpen,
  onClose,
  userKeys,
  onSaveKeys,
  selectedProvider,
  onSelectProvider,
  budgetConfig: initialBudget,
  workloadEstimate
}) => {
  const [keys, setKeys] = useState<Partial<Record<ProviderType, string>>>({ ...userKeys });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, { loading: boolean; valid?: boolean; error?: string; latency?: number }>>({});
  const [selectedModels, setSelectedModels] = useState<Record<ProviderType, string>>({
    gemini: 'gemini-3.7-flash',
    openai: 'gpt-4o',
    anthropic: 'claude-3-7-sonnet-20250219'
  });
  const [budget, setBudget] = useState<BudgetConfig>({ ...initialBudget });
  const [activeTab, setActiveTab] = useState<ProviderType>(selectedProvider || 'gemini');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setKeys({ ...userKeys });
  }, [userKeys]);

  if (!isOpen) return null;

  const handleKeyChange = (provider: ProviderType, value: string) => {
    setKeys(prev => ({ ...prev, [provider]: value }));
    // Reset test status
    setTestingStatus(prev => ({
      ...prev,
      [provider]: { loading: false }
    }));
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleTestKey = async (provider: ProviderType) => {
    const key = keys[provider]?.trim();
    if (!key) {
      setTestingStatus(prev => ({
        ...prev,
        [provider]: { loading: false, valid: false, error: 'Please enter an API key first' }
      }));
      return;
    }

    setTestingStatus(prev => ({
      ...prev,
      [provider]: { loading: true }
    }));

    try {
      const res = await fetch('/api/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: key,
          model: selectedModels[provider]
        })
      });
      const data = await res.json();
      if (data.success && data.result?.valid) {
        setTestingStatus(prev => ({
          ...prev,
          [provider]: {
            loading: false,
            valid: true,
            latency: data.result.latencyMs
          }
        }));
      } else {
        setTestingStatus(prev => ({
          ...prev,
          [provider]: {
            loading: false,
            valid: false,
            error: data.result?.error || 'Validation failed'
          }
        }));
      }
    } catch (err: any) {
      setTestingStatus(prev => ({
        ...prev,
        [provider]: {
          loading: false,
          valid: false,
          error: err?.message || 'Network error while testing connection'
        }
      }));
    }
  };

  const handleSave = () => {
    onSaveKeys(keys, budget);
    onSelectProvider(activeTab);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all locally stored API keys?')) {
      setKeys({});
      onSaveKeys({});
      setTestingStatus({});
    }
  };

  const configuredCount = Object.values(keys).filter((k): k is string => typeof k === 'string' && k.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121418] border border-[#2A2D32] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#22252A] flex items-center justify-between bg-[#15181E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">AI Provider Setup (BYOK)</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 font-semibold">
                  Bring Your Own Keys
                </span>
              </div>
              <p className="text-xs text-[#8E8B82]">
                Connect your own AI models to power simulations. The app works with just ONE configured key.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888] hover:text-white p-2 rounded-lg hover:bg-[#1E2229] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Security Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-[#171A21] border border-[#262A33] rounded-xl text-xs text-[#A0A4AB]">
            <Lock className="w-4 h-4 text-[#52B788] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-medium">Local-Only Security Architecture: </span>
              Your API keys are stored solely in your browser's local memory/storage. They are passed directly per-call over secure HTTPS to execute simulation stages and are never stored in databases, logs, or shared telemetry.
            </div>
          </div>

          {/* Provider Selection Tabs */}
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(PROVIDER_DEFINITIONS) as ProviderType[]).map(pId => {
              const meta = PROVIDER_DEFINITIONS[pId];
              const isSelected = activeTab === pId;
              const hasKey = !!(keys[pId] && keys[pId]!.trim().length > 0);
              const test = testingStatus[pId];

              return (
                <button
                  key={pId}
                  onClick={() => {
                    setActiveTab(pId);
                    onSelectProvider(pId);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#1A1D24] border-[#C5A059] shadow-lg ring-1 ring-[#C5A059]/30'
                      : 'bg-[#15181E] border-[#22252A] hover:border-[#353A45]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{meta.name}</span>
                    {hasKey ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#52B788] bg-[#0E2017] px-2 py-0.5 rounded-full border border-[#2D6A4F]">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#777] bg-[#1C1F26] px-2 py-0.5 rounded-full">
                        Not Set
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8E8B82] line-clamp-1 mb-2">
                    {meta.models[0].name}
                  </p>
                  {test?.valid && (
                    <div className="text-[10px] text-[#52B788] flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
                      Verified ({test.latency}ms)
                    </div>
                  )}
                  {test?.valid === false && (
                    <div className="text-[10px] text-[#F87171] flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
                      Test Failed
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Provider Config Section */}
          {(() => {
            const meta = PROVIDER_DEFINITIONS[activeTab];
            const currentKey = keys[activeTab] || '';
            const test = testingStatus[activeTab];

            return (
              <div className="bg-[#15181E] border border-[#262A33] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{meta.name} Configuration</span>
                    <a
                      href={meta.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Get API Key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {meta.id === 'gemini' && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#C5A059]/10 text-[#C5A059] rounded border border-[#C5A059]/30 font-semibold">
                      Primary Simulation Engine
                    </span>
                  )}
                </div>

                {/* API Key Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C5C0B6]">API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys[activeTab] ? 'text' : 'password'}
                      value={currentKey}
                      onChange={e => handleKeyChange(activeTab, e.target.value)}
                      placeholder={`Enter your ${meta.name} API Key...`}
                      className="w-full bg-[#0E1014] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#555] font-mono pr-20 outline-none transition-colors"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleShowKey(activeTab)}
                        className="p-1 text-[#777] hover:text-white transition-colors cursor-pointer"
                        title={showKeys[activeTab] ? 'Hide Key' : 'Show Key'}
                      >
                        {showKeys[activeTab] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C5C0B6]">Target Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {meta.models.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModels(prev => ({ ...prev, [activeTab]: m.id }))}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          selectedModels[activeTab] === m.id
                            ? 'bg-[#1D212A] border-[#C5A059] text-white'
                            : 'bg-[#0E1014] border-[#22252A] text-[#888] hover:border-[#333]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{m.name}</span>
                          {selectedModels[activeTab] === m.id && (
                            <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#777] line-clamp-1 mt-0.5">{m.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Connection Button & Status */}
                <div className="pt-2 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleTestKey(activeTab)}
                      disabled={test?.loading || !currentKey}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1C2028] hover:bg-[#252A36] disabled:opacity-50 text-white rounded-lg text-xs font-semibold border border-[#303542] transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${test?.loading ? 'animate-spin text-[#C5A059]' : ''}`} />
                      <span>{test?.loading ? 'Testing Connection...' : 'Test Connection'}</span>
                    </button>

                    {test?.valid && (
                      <div className="flex items-center gap-1.5 text-xs text-[#52B788] font-mono bg-[#0E2017] px-3 py-1.5 rounded-lg border border-[#2D6A4F]/50">
                        <CheckCircle className="w-4 h-4" />
                        <span>Connection Verified ({test.latency}ms)</span>
                      </div>
                    )}

                    {test?.valid === false && (
                      <div className="flex items-center gap-1.5 text-xs text-[#F87171] font-mono bg-[#241113] px-3 py-1.5 rounded-lg border border-[#E11D48]/40 max-w-md truncate">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">{test.error || 'Connection Failed'}</span>
                      </div>
                    )}
                  </div>

                  {/* Output confirmation banner when key is configured */}
                  {(test?.valid || (currentKey && currentKey.length > 8)) && (
                    <div className="p-3.5 rounded-xl bg-[#0E2017]/90 border border-[#2D6A4F] text-xs text-white space-y-1.5 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-[#52B788] font-bold">
                        <CheckCircle className="w-4 h-4 text-[#52B788]" />
                        <span>Key is Configured! Connected to {meta.name}</span>
                      </div>
                      <p className="text-[#C5D1C9] text-[11px] leading-relaxed">
                        Ready to simulate counterfactual history using model <strong className="text-white font-mono">{selectedModels[activeTab]}</strong>. Click "Save & Start Using Key" below to run your scenarios.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Cost Control & Budgeting Guardrails */}
          <div className="bg-[#15181E] border border-[#262A33] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cost Control & Budgeting Guardrails</h3>
              </div>
              <span className="text-[10px] text-[#777] font-mono">
                Prevents accidental over-expenditure
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Calls Guardrail */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#C5C0B6] font-medium flex items-center justify-between">
                  <span>Max API Calls Per Simulation</span>
                  <span className="font-mono text-[#C5A059] font-bold">{budget.maxApiCalls} calls</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={30}
                  step={1}
                  value={budget.maxApiCalls}
                  onChange={e => setBudget(prev => ({ ...prev, maxApiCalls: parseInt(e.target.value) || 10 }))}
                  className="w-full accent-[#C5A059] cursor-pointer"
                />
                <p className="text-[10px] text-[#777]">
                  Limits the total number of LLM invocations before engaging the deterministic reasoning engine.
                </p>
              </div>

              {/* Automatic Fallback Provider */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#C5C0B6] font-medium">Automatic Fallback Provider</label>
                <select
                  value={budget.fallbackProvider}
                  onChange={e => setBudget(prev => ({ ...prev, fallbackProvider: e.target.value as any }))}
                  className="w-full bg-[#0E1014] border border-[#2A2D32] focus:border-[#C5A059] rounded-lg px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer"
                >
                  <option value="none">No Fallback (Engage Autonomous Engine)</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
                <p className="text-[10px] text-[#777]">
                  If your primary model encounters rate limits or errors, automatically failover to this provider.
                </p>
              </div>
            </div>

            {/* Estimated Workload Box */}
            {workloadEstimate && (
              <div className="p-3 bg-[#0E1014] rounded-lg border border-[#22252A] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#6BA4B8]" />
                  <span className="text-[#A0A4AB]">Estimated Simulation Workload:</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span>~<strong className="text-white">{workloadEstimate.estimatedCalls}</strong> API Calls</span>
                  <span>~<strong className="text-white">{workloadEstimate.estimatedTokens.toLocaleString()}</strong> Tokens</span>
                  <span>Complexity: <strong className="text-[#C5A059] uppercase">{workloadEstimate.complexityLevel}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#22252A] bg-[#15181E] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-[#F87171] hover:text-[#EF4444] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Stored Keys</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-[#1E2229] text-[#8E8B82] hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                savedSuccess
                  ? 'bg-[#52B788] text-black'
                  : 'bg-[#C5A059] hover:bg-[#D4AF37] text-black shadow-md'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Keys Saved!</span>
                </>
              ) : (
                <span>Save Provider Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
