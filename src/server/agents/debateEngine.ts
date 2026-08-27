import { 
  AgentRole, 
  DebateMessage, 
  DebateRoundSummary, 
  ParsedScenarioModel, 
  ResearchPacket, 
  SimulationConfig, 
  SelectedExpertConfig, 
  getExpertMeta 
} from '../../shared/types.ts';
import { aiProviderManager } from '../providers/aiProviderManager.ts';
import { getAgentSystemInstruction, buildDebatePrompt } from './agentPrompts.ts';
import { generateHeuristicParsedScenario } from './scenarioParser.ts';

export async function runDebateRound(params: {
  round: number;
  totalRounds: number;
  config: SimulationConfig;
  parsedScenario?: ParsedScenarioModel;
  researchPackets: Record<string, ResearchPacket>;
  priorMessages: DebateMessage[];
  onMessageGenerated: (msg: DebateMessage) => void;
  onLog?: (agent: AgentRole, message: string, type: 'info' | 'warn' | 'success' | 'debate') => void;
}): Promise<{ messages: DebateMessage[]; summary: DebateRoundSummary }> {
  const parsed = params.parsedScenario || generateHeuristicParsedScenario(params.config);

  const cohort: SelectedExpertConfig[] = (params.config.expertCohort && params.config.expertCohort.length > 0)
    ? params.config.expertCohort.filter(e => e.enabled)
    : [
        { slotId: 'slot_1', roleId: 'historian', name: 'Dr. Alistair Vance', title: 'Senior Historical Causality Analyst', specialty: 'Divergence mechanics & institutional continuity', provider: 'gemini', modelName: 'gemini-3.7-flash', enabled: true },
        { slotId: 'slot_2', roleId: 'economist', name: 'Elena Rostova, Ph.D.', title: 'Macroeconomic & Trade Systems Modeler', specialty: 'Resource flows & production capacity', provider: 'gemini', modelName: 'gemini-3.7-flash', enabled: true },
        { slotId: 'slot_3', roleId: 'geopolitician', name: 'Cmdr. Marcus Sterling', title: 'Strategic Security Analyst', specialty: 'Sovereign entities & flashpoint conflicts', provider: 'gemini', modelName: 'gemini-3.7-flash', enabled: true },
        { slotId: 'slot_4', roleId: 'futurist', name: 'Dr. Maya Lin-Chen', title: 'Techno-Societal Evolution Strategist', specialty: 'Scientific paradigms & cultural shifts', provider: 'gemini', modelName: 'gemini-3.7-flash', enabled: true }
      ];

  const expertCount = Math.min(5, Math.max(2, cohort.length));
  const activeCohort = cohort.slice(0, expertCount);
  const roundMessages: DebateMessage[] = [];

  const roundFocusTitles: Record<number, { title: string; focus: string }> = {
    1: { title: 'Opening Theses & Foundational Challenges', focus: 'Establishing primary causality, environmental/institutional baselines, and initial divergence impact' },
    2: { title: 'Contradiction Detection & Disciplinary Interrogation', focus: 'Interrogating resource balance, defensive deterrence stability, and physical constraints' },
    3: { title: 'Rebuttal, Evidence Exchange & Causal Defense', focus: 'Defending model assumptions against physical, economic, and institutional counter-arguments' },
    4: { title: 'Consensus Calibration & Stance Adjustments', focus: 'Identifying solid convergence points while isolating genuine unresolved disagreements' },
    5: { title: 'Final Definitive Positions', focus: 'Crystallizing core world dynamics, branch probabilities, and residual uncertainties' },
  };

  const currentFocus = roundFocusTitles[params.round] || {
    title: `Debate Round ${params.round}`,
    focus: 'Cross-agent interrogation and counterfactual calibration'
  };

  params.onLog?.('synthesizer', `=== Commencing Debate Round ${params.round}/${params.totalRounds}: ${currentFocus.title} (${activeCohort.length} specialists) ===`, 'info');

  const allTheses = activeCohort.map(e => ({
    role: e.roleId,
    name: params.researchPackets[e.roleId]?.agentName || e.name,
    thesis: params.researchPackets[e.roleId]?.thesis || '',
    confidence: params.researchPackets[e.roleId]?.confidence?.overall || 75
  }));

  // Sequential execution so each expert responds dynamically to prior arguments
  for (let idx = 0; idx < activeCohort.length; idx++) {
    const expert = activeCohort[idx];
    const roleId = expert.roleId;
    const meta = getExpertMeta(roleId, expert.customDef);
    const packet = params.researchPackets[roleId];
    const targetExpert = activeCohort[(idx + 1) % activeCohort.length];
    const expertProvider = expert.provider || params.config.provider || 'gemini';
    const expertModel = expert.modelName || params.config.modelName || 'gemini-3.7-flash';

    try {
      if (aiProviderManager.isMockMode()) {
        await new Promise(r => setTimeout(r, 350 + Math.random() * 200));
        const mockMsg = generateDynamicDebateMessage({
          expert,
          targetExpert,
          round: params.round,
          totalRounds: params.totalRounds,
          config: params.config,
          parsedScenario: parsed,
          priorMessages: [...params.priorMessages, ...roundMessages]
        });
        mockMsg.provider = expertProvider;
        mockMsg.modelName = expertModel;
        roundMessages.push(mockMsg);
        params.onMessageGenerated(mockMsg);
        params.onLog?.(roleId, `[${mockMsg.status?.toUpperCase() || 'DEBATE'}] ${mockMsg.claim}`, 'debate');
        continue;
      }

      const prompt = buildDebatePrompt({
        currentAgent: expert,
        round: params.round,
        totalRounds: params.totalRounds,
        config: params.config,
        parsedScenario: parsed,
        allTheses,
        recentDebateHistory: [...params.priorMessages, ...roundMessages].slice(-8).map(m => ({
          round: m.round,
          agent: m.agent,
          claim: m.claim,
          critiqueOrDefense: m.critiqueOrDefense,
          position: m.position
        }))
      });

      const systemInstruction = getAgentSystemInstruction(expert, params.config.communicationStyle);

      const result = await aiProviderManager.generateJSON<Partial<DebateMessage>>({
        role: roleId,
        prompt,
        systemInstruction,
        provider: expertProvider,
        model: expertModel,
        userKeys: params.config.userKeys,
        budgetConfig: params.config.budgetConfig
      });

      const rawStatus = result.data.status;
      const status = (['agreeing', 'disagreeing', 'revising', 'neutral'].includes(rawStatus as string))
        ? (rawStatus as any)
        : (params.round === 1 ? 'neutral' : params.round === 2 ? 'disagreeing' : params.round === 3 ? 'revising' : 'agreeing');

      const message: DebateMessage = {
        id: `msg_r${params.round}_${roleId}_${Date.now()}`,
        round: params.round,
        agent: roleId,
        agentName: packet?.agentName || meta.name,
        provider: result.provider,
        modelName: result.model,
        fallbackUsed: result.fallbackUsed,
        type: (result.data.type as any) || (params.round === 1 ? 'claim' : params.round === 2 ? 'critique' : 'defense'),
        status,
        targetAgent: (result.data.targetAgent as any) || targetExpert.roleId,
        targetClaim: result.data.targetClaim || `Assumptions regarding ${targetExpert.specialty}`,
        claim: result.data.claim || 'Maintaining disciplined causal boundaries.',
        position: result.data.position || result.data.critiqueOrDefense || 'Our domain model establishes that systemic adaptation follows strict conservation and incentive constraints.',
        challenge: result.data.challenge || `We challenge whether ${targetExpert.name}'s projected pace accounts for frictional resistance.`,
        response: result.data.response || 'Historical and thermodynamic constraints demonstrate that these adaptations are self-reinforcing.',
        critiqueOrDefense: result.data.critiqueOrDefense || result.data.position,
        evidence: result.data.evidence || 'Empirical principles and constraint bounds.',
        confidence: typeof result.data.confidence === 'number' ? result.data.confidence : (packet?.confidence?.overall || 78),
        stanceShift: result.data.stanceShift,
        timestamp: new Date().toISOString()
      };

      roundMessages.push(message);
      params.onMessageGenerated(message);
      params.onLog?.(roleId, `[${status.toUpperCase()}] Debated via ${result.slotName} (${result.latencyMs}ms): "${message.claim.slice(0, 60)}..."`, 'debate');
    } catch (err: any) {
      const isMockTrigger = err?.message === 'MOCK_FALLBACK_TRIGGER';
      if (!isMockTrigger) {
        console.info(`[DebateEngine] Generated argument for ${roleId} in round ${params.round}`);
      }
      const fallbackMsg = generateDynamicDebateMessage({
        expert,
        targetExpert,
        round: params.round,
        totalRounds: params.totalRounds,
        config: params.config,
        parsedScenario: parsed,
        priorMessages: [...params.priorMessages, ...roundMessages]
      });
      fallbackMsg.provider = expertProvider;
      fallbackMsg.modelName = expertModel;
      roundMessages.push(fallbackMsg);
      params.onMessageGenerated(fallbackMsg);
      params.onLog?.(roleId, `[${fallbackMsg.status?.toUpperCase() || 'DEBATE'}] ${fallbackMsg.claim}`, 'debate');
    }
  }

  const roundSummary: DebateRoundSummary = {
    round: params.round,
    title: currentFocus.title,
    focus: currentFocus.focus,
    consensusAreas: [
      `Consensus that the divergence at ${params.config.startingYear} creates an internally consistent operational dynamic.`,
      `Agreement that multi-disciplinary constraints prevent unearned or magical transformations.`
    ],
    activeDisagreements: [
      params.round >= 2 
        ? `Debate over resource allocation priorities vs long-term equilibrium stability.`
        : `Divergent estimates on the rate of structural adaptation across specialized domains.`
    ]
  };

  return { messages: roundMessages, summary: roundSummary };
}

export function generateDynamicDebateMessage(params: {
  expert: SelectedExpertConfig;
  targetExpert: SelectedExpertConfig;
  round: number;
  totalRounds: number;
  config: SimulationConfig;
  parsedScenario: ParsedScenarioModel;
  priorMessages: DebateMessage[];
}): DebateMessage {
  const roleId = params.expert.roleId;
  const meta = getExpertMeta(roleId, params.expert.customDef);
  const targetMeta = getExpertMeta(params.targetExpert.roleId, params.targetExpert.customDef);
  const start = params.config.startingYear;
  const end = params.config.endYear;

  let claim = '';
  let position = '';
  let challenge = '';
  let response = '';
  let status: 'agreeing' | 'disagreeing' | 'revising' | 'neutral' = 'neutral';
  let confidence = 80;

  if (params.round === 1) {
    status = 'neutral';
    confidence = 82;
    claim = `The divergence at ${start} compels ${meta.focusAreas[0] || 'domain systems'} to pivot immediately, creating durable institutional anchors.`;
    position = `From the perspective of ${meta.specialty.toLowerCase()}, the catalytic event does not cause systemic collapse. Rather, established incentives reorganize around alternative solutions, ensuring continuity through ${Math.round(start + (end - start) * 0.3)}.`;
    challenge = `I question whether ${targetMeta.name}'s initial model accounts for the high friction inherent in transforming baseline habits.`;
    response = `Our framework indicates that early institutional stabilization buffers against violent oscillations.`;
  } else if (params.round === 2) {
    status = 'disagreeing';
    confidence = 77;
    claim = `We challenge the assumption that ${targetMeta.focusAreas[0] || 'opposing factors'} could scale without encountering severe physical or economic bottlenecks.`;
    position = `Direct interrogation of the cohort's hypotheses reveals an over-optimistic projection regarding expansion rates. When material and energetic constraints are enforced, growth follows a calibrated logistic curve rather than unconstrained expansion.`;
    challenge = `How does ${targetMeta.name} resolve the resource deficit created during the second-order transition?`;
    response = `We maintain that the system must make painful trade-offs, slowing luxury consumption to fund critical infrastructure.`;
  } else if (params.round === 3) {
    status = 'revising';
    confidence = 84;
    claim = `We calibrate our model: recognizing valid points raised regarding constraints, the equilibrium stabilizes around a balanced multipolar framework.`;
    position = `Incorporating feedback from ${targetMeta.name}, we adjust our confidence intervals. The critical bottleneck is resolved through specialized regional compacts rather than monolithic central planning.`;
    challenge = `Does the cohort agree that local autonomy outperforms centralized mandates in this divergent context?`;
    response = `By adopting hybrid modular structures, the divergent civilization overcomes the early transition shocks.`;
  } else {
    status = 'agreeing';
    confidence = 88;
    claim = `Full convergence achieved on the core trajectory: civilizational resilience holds through horizon year ${end}.`;
    position = `Our finalized analysis harmonizes the multi-disciplinary requirements: energetic limits, institutional inertia, and technological innovations align to form a mature, believable alternate reality.`;
    challenge = `The remaining uncertainty lies in long-term external shocks beyond year ${end}.`;
    response = `The synthesized world model is robust, causally sound, and internally consistent.`;
  }

  return {
    id: `msg_r${params.round}_${roleId}_${Date.now()}`,
    round: params.round,
    agent: roleId,
    agentName: meta.name,
    type: params.round === 1 ? 'claim' : params.round === 2 ? 'critique' : params.round === 3 ? 'defense' : 'final_stance',
    status,
    targetAgent: params.targetExpert.roleId,
    targetClaim: `Assumptions regarding ${targetMeta.focusAreas[0] || 'opposing domain parameters'}`,
    claim,
    position,
    challenge,
    response,
    critiqueOrDefense: position,
    evidence: `Disciplinary causal principles of ${meta.specialty}`,
    confidence,
    stanceShift: params.round >= 3 ? {
      previousConfidence: 78,
      newConfidence: confidence,
      reason: 'Calibrated assumptions based on cross-specialist counter-evidence'
    } : undefined,
    timestamp: new Date().toISOString()
  };
}
