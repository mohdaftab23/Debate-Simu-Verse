import React, { useState, useEffect } from 'react';
import { Header } from './client/components/Header.tsx';
import { StageProgressBar } from './client/components/StageProgressBar.tsx';
import { ScenarioInput } from './client/components/ScenarioInput.tsx';
import { ResearchPanel } from './client/components/ResearchPanel.tsx';
import { DebateArena } from './client/components/DebateArena.tsx';
import { WorldMapView } from './client/components/WorldMapView.tsx';
import { TimelineView } from './client/components/TimelineView.tsx';
import { CausalGraphView } from './client/components/CausalGraphView.tsx';
import { WorldReportView } from './client/components/WorldReportView.tsx';
import { BranchManager } from './client/components/BranchManager.tsx';
import { AgentChatView } from './client/components/AgentChatView.tsx';
import { DebugDrawer } from './client/components/DebugDrawer.tsx';
import { LiveEventLog } from './client/components/LiveEventLog.tsx';
import { HistoryView } from './client/components/HistoryView.tsx';
import { ExportModal } from './client/components/ExportModal.tsx';
import { Simulation, SimulationConfig } from './shared/types.ts';
import { PRESET_SCENARIOS } from './shared/presets.ts';

const STORAGE_KEY = 'chronos_simulations_history';

export function App() {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [activeTab, setActiveTab] = useState<string>('input');
  const [isDebugOpen, setIsDebugOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<Simulation[]>([]);

  // Load simulations from server & localStorage
  useEffect(() => {
    fetchSystemStatus();
    loadHistoryAndInitialSim();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.success) {
        setSystemStatus(data.status);
      }
    } catch (err) {
      console.warn('Could not fetch system status:', err);
    }
  };

  const loadHistoryAndInitialSim = async () => {
    try {
      const res = await fetch('/api/simulations');
      const data = await res.json();
      let serverSims: Simulation[] = [];
      if (data.success && data.simulations) {
        serverSims = data.simulations;
      }

      // Merge with localStorage
      const localJson = localStorage.getItem(STORAGE_KEY);
      let localSims: Simulation[] = [];
      if (localJson) {
        try {
          localSims = JSON.parse(localJson);
        } catch (e) {
          console.warn('Failed to parse local history', e);
        }
      }

      const mergedMap = new Map<string, Simulation>();
      serverSims.forEach(s => mergedMap.set(s.id, s));
      localSims.forEach(s => {
        if (!mergedMap.has(s.id)) {
          mergedMap.set(s.id, s);
        }
      });

      const combined = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistoryList(combined);

      if (combined.length > 0 && !simulation) {
        // Set the most recent simulation
        setSimulation(combined[0]);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  };

  // Persist simulation updates into history list & localStorage
  const saveToHistory = (sim: Simulation) => {
    setHistoryList(prev => {
      const existsIndex = prev.findIndex(item => item.id === sim.id);
      let updated: Simulation[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = sim;
      } else {
        updated = [sim, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
      return updated;
    });
  };

  // SSE Stream Listener
  useEffect(() => {
    if (!simulation?.id) return;
    const simId = simulation.id;

    const eventSource = new EventSource(`/api/simulations/${simId}/stream`);

    eventSource.addEventListener('stage_change', (e) => {
      const data = JSON.parse(e.data);
      if (data.stageIndex === 1) setActiveTab('research');
      if (data.stageIndex === 2) setActiveTab('debate');
      if (data.stageIndex === 4 || data.stageIndex === 5) setActiveTab('causal');
    });

    eventSource.addEventListener('log', (e) => {
      const logItem = JSON.parse(e.data);
      setSimulation(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          eventLogs: [...prev.eventLogs, logItem]
        };
        saveToHistory(updated);
        return updated;
      });
    });

    eventSource.addEventListener('research_packet', (e) => {
      const { role, packet } = JSON.parse(e.data);
      setSimulation(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          researchPackets: {
            ...prev.researchPackets,
            [role]: packet
          }
        };
        saveToHistory(updated);
        return updated;
      });
    });

    eventSource.addEventListener('debate_message', (e) => {
      const msg = JSON.parse(e.data);
      setSimulation(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          debateMessages: [...prev.debateMessages, msg]
        };
        saveToHistory(updated);
        return updated;
      });
    });

    eventSource.addEventListener('debate_round_complete', (e) => {
      const summary = JSON.parse(e.data);
      setSimulation(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          debateRounds: [...prev.debateRounds, summary]
        };
        saveToHistory(updated);
        return updated;
      });
    });

    eventSource.addEventListener('world_state_ready', (e) => {
      const world = JSON.parse(e.data);
      setSimulation(prev => {
        if (!prev) return prev;
        const updated: Simulation = {
          ...prev,
          worldState: world,
          status: 'completed'
        };
        saveToHistory(updated);
        return updated;
      });
      setActiveTab('causal');
    });

    eventSource.addEventListener('state_update', (e) => {
      const updatedSim = JSON.parse(e.data);
      setSimulation(updatedSim);
      saveToHistory(updatedSim);
    });

    eventSource.addEventListener('completed', (e) => {
      const completedSim = JSON.parse(e.data);
      setSimulation(completedSim);
      saveToHistory(completedSim);
      setIsStarting(false);
      fetchSystemStatus();
    });

    eventSource.addEventListener('status_change', (e) => {
      const { status } = JSON.parse(e.data);
      setSimulation(prev => {
        if (!prev) return prev;
        const updated = { ...prev, status };
        saveToHistory(updated);
        return updated;
      });
      setIsStarting(false);
    });

    return () => {
      eventSource.close();
    };
  }, [simulation?.id]);

  const handleStartSimulation = async (config: SimulationConfig) => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/simulations/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      if (data.success && data.simulation) {
        setSimulation(data.simulation);
        saveToHistory(data.simulation);
        setActiveTab('research');
      }
    } catch (err: any) {
      alert(`Simulation initialization failed: ${err?.message || err}`);
    } finally {
      setIsStarting(false);
      fetchSystemStatus();
    }
  };

  const handleRunDefaultDemo = () => {
    const defaultPreset = PRESET_SCENARIOS[0];
    handleStartSimulation({
      scenarioTitle: defaultPreset.title,
      scenarioDescription: defaultPreset.description,
      startingYear: defaultPreset.startingYear,
      endYear: defaultPreset.endYear,
      geographicScope: defaultPreset.geographicScope,
      expertCohort: [
        { slotId: 'slot_1', roleId: 'historian', name: 'Dr. Alistair Vance', title: 'Senior Historical Causality Analyst', specialty: 'Divergence mechanics', modelName: 'gemini-3.7-flash', enabled: true },
        { slotId: 'slot_2', roleId: 'economist', name: 'Elena Rostova, Ph.D.', title: 'Macroeconomic Systems Modeler', specialty: 'Production & trade', modelName: 'gemini-3.7-flash', enabled: true },
        { slotId: 'slot_3', roleId: 'geopolitician', name: 'Cmdr. Marcus Sterling', title: 'Strategic Security Analyst', specialty: 'Sovereign entities', modelName: 'gemini-3.7-flash', enabled: true },
        { slotId: 'slot_4', roleId: 'futurist', name: 'Dr. Maya Lin-Chen', title: 'Techno-Societal Strategist', specialty: 'Scientific paradigms', modelName: 'gemini-3.7-flash', enabled: true }
      ],
      agentCount: 4,
      debateRounds: 3,
      creativityLevel: 'balanced',
      realismLevel: 'plausible_extrapolation',
      communicationStyle: 'general',
      modelName: 'gemini-3.7-flash'
    });
  };

  const handleToggleMock = async () => {
    try {
      const res = await fetch('/api/system/toggle-mock', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchSystemStatus();
      }
    } catch (err) {
      console.warn('Toggle mock error:', err);
    }
  };

  // Reopen simulation with ZERO AI calls
  const handleOpenHistoricalSimulation = (historicalSim: Simulation) => {
    setSimulation(historicalSim);
    if (historicalSim?.worldState) {
      setActiveTab('causal');
    } else if (historicalSim?.debateMessages && historicalSim.debateMessages.length > 0) {
      setActiveTab('debate');
    } else {
      setActiveTab('research');
    }
  };

  // Re-run simulation with cloned config
  const handleRerunSimulation = (config: SimulationConfig) => {
    handleStartSimulation(config);
  };

  const handleDeleteSimulation = (id: string) => {
    setHistoryList(prev => {
      const updated = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update localStorage', e);
      }
      return updated;
    });
  };

  const handleForkBranch = (branchName: string, keyDivergence: string) => {
    if (!simulation) return;
    const newConfig: SimulationConfig = {
      ...simulation.config,
      scenarioTitle: `${simulation.config.scenarioTitle} [Branch: ${branchName}]`,
      scenarioDescription: `${simulation.config.scenarioDescription}\n\nFORKED DIVERGENCE: ${keyDivergence}`
    };
    handleStartSimulation(newConfig);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] flex flex-col selection:bg-[#C5A059] selection:text-[#0F0F0F]">
      {/* Top Header */}
      <Header
        simulation={simulation}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewModal={() => setActiveTab('input')}
        onRunDefaultDemo={handleRunDefaultDemo}
        onToggleDebug={() => setIsDebugOpen(true)}
        onToggleMock={handleToggleMock}
        mockMode={systemStatus?.mockMode ?? true}
        systemStatus={systemStatus}
        onExport={() => setIsExportOpen(true)}
        onOpenHistory={() => setActiveTab('history')}
      />

      {/* Stage Progress Bar */}
      <StageProgressBar
        simulation={simulation}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 bg-lab-grid">
        {activeTab === 'input' && (
          <ScenarioInput
            onStartSimulation={handleStartSimulation}
            isLoading={isStarting}
          />
        )}

        {activeTab === 'research' && (
          <ResearchPanel
            researchPackets={simulation?.researchPackets || {}}
            onProceedToDebate={() => setActiveTab('debate')}
          />
        )}

        {activeTab === 'debate' && (
          <DebateArena
            messages={simulation?.debateMessages || []}
            rounds={simulation?.debateRounds || []}
            currentRound={simulation?.currentRound || 1}
            totalRounds={simulation?.config?.debateRounds || 3}
            isDebating={simulation?.status === 'debating'}
            onProceedToSynthesis={() => setActiveTab('causal')}
            defaultCompact={true}
          />
        )}

        {activeTab === 'causal' && simulation?.worldState && (
          <CausalGraphView worldState={simulation.worldState} />
        )}

        {activeTab === 'map' && simulation?.worldState && (
          <WorldMapView worldState={simulation.worldState} />
        )}

        {activeTab === 'timeline' && simulation?.worldState && (
          <TimelineView worldState={simulation.worldState} />
        )}

        {activeTab === 'report' && simulation?.worldState && (
          <WorldReportView
            worldState={simulation.worldState}
            config={simulation.config}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={historyList}
            onOpenSimulation={handleOpenHistoricalSimulation}
            onRerunSimulation={handleRerunSimulation}
            onDeleteSimulation={handleDeleteSimulation}
          />
        )}

        {activeTab === 'chat' && simulation?.worldState && simulation?.id && (
          <AgentChatView
            worldState={simulation.worldState}
            simulationId={simulation.id}
          />
        )}
      </main>

      {/* Persistent Bottom Floating Stream Console */}
      {simulation && simulation.eventLogs && simulation.eventLogs.length > 0 && (
        <div className="fixed bottom-3 right-4 z-30 w-80 sm:w-96 shadow-2xl">
          <LiveEventLog logs={simulation.eventLogs} />
        </div>
      )}

      {/* Debug & Telemetry Drawer */}
      <DebugDrawer
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        systemStatus={systemStatus}
        simulation={simulation}
        onToggleMock={handleToggleMock}
      />

      {/* Zero-AI Export Modal */}
      {simulation && (
        <ExportModal
          simulation={simulation}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
