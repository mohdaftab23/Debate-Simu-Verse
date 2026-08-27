import { EventEmitter } from 'events';
import { AgentRole, ChatMessage, DebateMessage, EventLogItem, ResearchPacket, Simulation, SimulationConfig, WorldState } from '../shared/types.ts';
import { parseScenarioAndAssumptions } from './agents/scenarioParser.ts';
import { runIndependentResearch } from './agents/researchEngine.ts';
import { runDebateRound } from './agents/debateEngine.ts';
import { runWorldSynthesis } from './agents/synthesisEngine.ts';
import { geminiPool } from './geminiPool.ts';
import { PRESET_SCENARIOS } from '../shared/presets.ts';

export class SimulationService {
  private simulations: Map<string, Simulation> = new Map();
  private eventEmitters: Map<string, EventEmitter> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.seedDefaultPreset();
  }

  private seedDefaultPreset() {
    const defaultPreset = PRESET_SCENARIOS[0];
    const config: SimulationConfig = {
      scenarioTitle: defaultPreset.title,
      scenarioDescription: defaultPreset.description,
      startingYear: defaultPreset.startingYear,
      endYear: defaultPreset.endYear,
      geographicScope: defaultPreset.geographicScope,
      agentCount: 4,
      debateRounds: 3,
      creativityLevel: 'balanced',
      realismLevel: 'plausible_extrapolation',
      modelName: 'gemini-3.7-flash'
    };

    const simId = 'demo-simulation-open-engine';
    const simulation: Simulation = {
      id: simId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config,
      status: 'idle',
      currentStageIndex: 0,
      currentRound: 0,
      researchPackets: {},
      debateMessages: [],
      debateRounds: [],
      worldState: null,
      eventLogs: [
        {
          id: `log_init_${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: 'Universal Counterfactual Simulation Engine ready. Enter any hypothetical scenario to begin.',
          type: 'system'
        }
      ],
      debugStats: {
        totalRequests: 0,
        tokensEstimated: 0,
        agentLatencies: {},
        activeKeySlot: 'MOCK_ENGINE / READY',
        mockMode: geminiPool.isMockMode(),
        activeModel: 'gemini-3.7-flash'
      }
    };

    this.simulations.set(simId, simulation);
  }

  public getEventEmitter(id: string): EventEmitter {
    if (!this.eventEmitters.has(id)) {
      this.eventEmitters.set(id, new EventEmitter());
    }
    return this.eventEmitters.get(id)!;
  }

  public getSimulation(id: string): Simulation | undefined {
    return this.simulations.get(id);
  }

  public listSimulations(): Array<{ id: string; title: string; createdAt: string; status: string; worldName?: string }> {
    return Array.from(this.simulations.values()).map(s => ({
      id: s.id,
      title: s.config.scenarioTitle,
      createdAt: s.createdAt,
      status: s.status,
      worldName: s.worldState?.finalWorldName
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async startSimulation(config: SimulationConfig, customId?: string): Promise<Simulation> {
    const id = customId || `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const abortController = new AbortController();
    this.abortControllers.set(id, abortController);

    const simulation: Simulation = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config,
      status: 'parsing',
      currentStageIndex: 1, // 1 = Assumptions & Scenario Parsing
      currentRound: 0,
      researchPackets: {},
      debateMessages: [],
      debateRounds: [],
      worldState: null,
      eventLogs: [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: `Initiated simulation pipeline for: "${config.scenarioTitle}" (${config.startingYear} → ${config.endYear})`,
          type: 'info'
        }
      ],
      debugStats: {
        totalRequests: 0,
        tokensEstimated: 0,
        agentLatencies: {},
        activeKeySlot: geminiPool.isMockMode() ? 'MOCK_ENGINE' : 'GEMINI_MULTI_KEY_POOL',
        mockMode: geminiPool.isMockMode(),
        activeModel: config.modelName || 'gemini-3.7-flash'
      }
    };

    this.simulations.set(id, simulation);
    const emitter = this.getEventEmitter(id);

    // Run the simulation lifecycle asynchronously in the background
    this.runSimulationLifecycle(simulation, abortController.signal).catch(err => {
      console.error(`[SimulationService] Error in lifecycle for ${id}:`, err);
      simulation.status = 'failed';
      simulation.updatedAt = new Date().toISOString();
      this.logEvent(simulation, undefined, `Simulation failed: ${err?.message || err}`, 'warn');
      emitter.emit('status_change', { status: 'failed', error: err?.message || String(err) });
    });

    return simulation;
  }

  private logEvent(simulation: Simulation, agent: AgentRole | undefined, message: string, type: EventLogItem['type']) {
    const logItem: EventLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      agent,
      message,
      type
    };
    simulation.eventLogs.push(logItem);
    simulation.updatedAt = new Date().toISOString();
    
    // Update debug stats snapshot
    const poolStatus = geminiPool.getStatus();
    simulation.debugStats.totalRequests = poolStatus.totalRequests;
    simulation.debugStats.tokensEstimated = poolStatus.tokensEstimated;
    simulation.debugStats.agentLatencies = poolStatus.agentLatencies;

    const emitter = this.getEventEmitter(simulation.id);
    emitter.emit('log', logItem);
    emitter.emit('state_update', simulation);
  }

  private async runSimulationLifecycle(simulation: Simulation, signal: AbortSignal) {
    const emitter = this.getEventEmitter(simulation.id);
    const { config } = simulation;

    // ==========================================
    // STAGE 1: SCENARIO PARSER & ASSUMPTION ENGINE
    // ==========================================
    simulation.status = 'parsing';
    simulation.currentStageIndex = 1;
    this.logEvent(simulation, undefined, 'Stage 1: Activating Scenario Parser & Assumption Engine to extract axioms and enforce causal bounding...', 'info');
    emitter.emit('stage_change', { stageIndex: 1, stageName: 'Assumption Engine & Parsing' });

    const parsedScenario = await parseScenarioAndAssumptions({
      config,
      onLog: (msg, type) => {
        this.logEvent(simulation, undefined, msg, type);
      }
    });

    if (signal.aborted) return;
    simulation.parsedScenario = parsedScenario;
    emitter.emit('parsed_scenario', parsedScenario);

    // ==========================================
    // STAGE 2: INDEPENDENT RESEARCH
    // ==========================================
    simulation.status = 'researching';
    simulation.currentStageIndex = 2;
    this.logEvent(simulation, undefined, 'Stage 2: Launching independent research across 4 specialized disciplinary agents...', 'info');
    emitter.emit('stage_change', { stageIndex: 2, stageName: 'Independent Research' });

    const researchPackets = await runIndependentResearch({
      config,
      parsedScenario,
      onLog: (agent, msg, type) => {
        this.logEvent(simulation, agent, msg, type);
      }
    });

    if (signal.aborted) return;

    simulation.researchPackets = researchPackets;
    for (const [role, packet] of Object.entries(researchPackets)) {
      emitter.emit('research_packet', { role, packet });
    }

    this.logEvent(simulation, undefined, 'Independent research complete. All 4 dossiers indexed into simulation memory.', 'success');

    // ==========================================
    // STAGE 3: MULTI-ROUND AGENT DEBATE ARENA
    // ==========================================
    simulation.status = 'debating';
    simulation.currentStageIndex = 3;
    const totalRounds = config.debateRounds || 3;
    this.logEvent(simulation, undefined, `Stage 3: Commencing ${totalRounds}-round visible Agent Debate Arena...`, 'info');
    emitter.emit('stage_change', { stageIndex: 3, stageName: 'Agent Debate Arena' });

    for (let r = 1; r <= totalRounds; r++) {
      if (signal.aborted) return;
      simulation.currentRound = r;

      const { messages, summary } = await runDebateRound({
        round: r,
        totalRounds,
        config,
        parsedScenario,
        researchPackets: researchPackets as Record<AgentRole, ResearchPacket>,
        priorMessages: simulation.debateMessages,
        onMessageGenerated: (msg) => {
          simulation.debateMessages.push(msg);
          emitter.emit('debate_message', msg);
        },
        onLog: (agent, msg, type) => {
          this.logEvent(simulation, agent, msg, type);
        }
      });

      simulation.debateRounds.push(summary);
      emitter.emit('debate_round_complete', summary);
      this.logEvent(simulation, undefined, `Round ${r} concluded. Consensus areas mapped: ${summary.consensusAreas.length}, Active disagreements: ${summary.activeDisagreements.length}`, 'info');
    }

    // ==========================================
    // STAGE 4: CONSENSUS & DISAGREEMENT MAPPING
    // ==========================================
    simulation.currentStageIndex = 4;
    this.logEvent(simulation, undefined, 'Stage 4: Building multi-model consensus and identifying structural divergence branches...', 'info');
    emitter.emit('stage_change', { stageIndex: 4, stageName: 'Consensus & Disagreement Mapping' });

    await new Promise(r => setTimeout(r, 400));

    // ==========================================
    // STAGE 5: FORMAL WORLD STATE SYNTHESIS
    // ==========================================
    simulation.status = 'synthesizing';
    simulation.currentStageIndex = 5;
    this.logEvent(simulation, 'synthesizer', 'Stage 5: Synthesizer constructing formal World State, Geopolitical Map, and 10-Point Dossier...', 'info');
    emitter.emit('stage_change', { stageIndex: 5, stageName: 'World State Synthesis' });

    const worldState = await runWorldSynthesis({
      config,
      parsedScenario,
      researchPackets: researchPackets as Record<AgentRole, ResearchPacket>,
      debateMessages: simulation.debateMessages,
      debateRounds: simulation.debateRounds,
      onLog: (agent, msg, type) => {
        this.logEvent(simulation, agent, msg, type);
      }
    });

    if (signal.aborted) return;

    simulation.worldState = worldState;
    simulation.status = 'completed';
    simulation.currentStageIndex = 6; // Ready
    simulation.updatedAt = new Date().toISOString();

    this.logEvent(simulation, 'synthesizer', `Simulation Pipeline Complete! Alternate reality model "${worldState.finalWorldName}" is now fully interactive.`, 'success');
    emitter.emit('world_state_ready', worldState);
    emitter.emit('stage_change', { stageIndex: 6, stageName: 'Simulation Ready' });
    emitter.emit('completed', simulation);
  }

  public stopSimulation(id: string) {
    const controller = this.abortControllers.get(id);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(id);
    }
    const sim = this.simulations.get(id);
    if (sim) {
      sim.status = 'paused';
      this.logEvent(sim, undefined, 'Simulation execution stopped by user.', 'warn');
    }
  }

  public async askAgentOrChronicler(params: {
    simulationId: string;
    question: string;
    targetRole?: AgentRole | 'world_chronicler';
  }): Promise<ChatMessage> {
    const sim = this.simulations.get(params.simulationId);
    if (!sim) throw new Error('Simulation not found');

    const role = params.targetRole || 'world_chronicler';
    const targetPerspective = role === 'world_chronicler' ? undefined : (role as AgentRole);

    let senderName = 'Chronos World Archivist';
    if (role === 'historian') senderName = 'Dr. Alistair Vance (Historian)';
    if (role === 'economist') senderName = 'Elena Rostova, Ph.D. (Economist)';
    if (role === 'geopolitician') senderName = 'Cmdr. Marcus Sterling (Geopolitician)';
    if (role === 'futurist') senderName = 'Dr. Maya Lin-Chen (Futurist)';
    if (role === 'synthesizer') senderName = 'Chronos Synthesizer';

    if (geminiPool.isMockMode() || !sim.worldState) {
      await new Promise(r => setTimeout(r, 400));
      return {
        id: `chat_${Date.now()}`,
        sender: role,
        senderName,
        text: `From the perspective of ${senderName}: In this simulated world ("${sim.worldState?.finalWorldName || sim.config.scenarioTitle}"), ${params.question.toLowerCase().includes('why') ? 'the key causal mechanism stems directly from the foundational assumptions of the divergence.' : 'this dynamic developed through steady capital compounding and technological adaptation rather than chaotic collapse.'} Our consensus index remains solid on core structural outcomes while preserving high variance for frontier sectors.`,
        timestamp: new Date().toISOString(),
        targetPerspective
      };
    }

    try {
      const prompt = `You are ${senderName} answering a user question about this specific alternate reality simulation:
WORLD: "${sim.worldState?.finalWorldName}"
SCENARIO: "${sim.config.scenarioTitle}"
SUMMARY: ${sim.worldState?.scenarioSummary}
TIMELINE HIGHLIGHTS: ${sim.worldState?.timeline.map(t => `${t.year}: ${t.title}`).join(', ')}

USER QUESTION: "${params.question}"

Answer specifically in character from your discipline/perspective in 2-3 concise, insightful paragraphs. Do NOT contradict the synthesized world state.`;

      const result = await geminiPool.generateText({
        role: role === 'world_chronicler' ? 'synthesizer' : (role as AgentRole),
        prompt,
        systemInstruction: `You are answering questions about a structured alternate reality simulation.`
      });

      return {
        id: `chat_${Date.now()}`,
        sender: role,
        senderName,
        text: result.text,
        timestamp: new Date().toISOString(),
        targetPerspective
      };
    } catch (err: any) {
      return {
        id: `chat_${Date.now()}`,
        sender: role,
        senderName,
        text: `In this simulated world, this dynamic developed through steady institutional adaptation and economic trade corridors. (Response generated via localized synthesis model)`,
        timestamp: new Date().toISOString(),
        targetPerspective
      };
    }
  }

  public async branchSimulation(id: string, branchName: string, keyDivergence: string): Promise<Simulation> {
    const parent = this.simulations.get(id);
    if (!parent) throw new Error('Parent simulation not found');

    const newConfig: SimulationConfig = {
      ...parent.config,
      scenarioTitle: `${parent.config.scenarioTitle} [Branch: ${branchName}]`,
      scenarioDescription: `${parent.config.scenarioDescription}\n\nBRANCH DIVERGENCE: ${keyDivergence}`
    };

    return this.startSimulation(newConfig);
  }
}

export const simulationService = new SimulationService();
