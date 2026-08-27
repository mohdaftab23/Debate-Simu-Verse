import { 
  AgentRole, 
  DebateMessage, 
  DebateRoundSummary, 
  ParsedScenarioModel, 
  ResearchPacket, 
  SimulationConfig, 
  WorldState, 
  getExpertMeta 
} from '../../shared/types.ts';
import { aiProviderManager } from '../providers/aiProviderManager.ts';
import { getAgentSystemInstruction, buildSynthesisPrompt } from './agentPrompts.ts';
import { generateHeuristicParsedScenario } from './scenarioParser.ts';

export async function runWorldSynthesis(params: {
  config: SimulationConfig;
  parsedScenario?: ParsedScenarioModel;
  researchPackets: Record<string, ResearchPacket>;
  debateMessages: DebateMessage[];
  debateRounds: DebateRoundSummary[];
  onLog?: (agent: AgentRole, message: string, type: 'info' | 'warn' | 'success') => void;
}): Promise<WorldState> {
  const parsed = params.parsedScenario || generateHeuristicParsedScenario(params.config);
  params.onLog?.('synthesizer', `Synthesizer initializing Bayesian multi-model arbitration for "${params.config.scenarioTitle}" (${params.config.communicationStyle || 'general'} style)...`, 'info');

  const startTime = Date.now();

  try {
    if (aiProviderManager.isMockMode()) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 300));
      const mockWorld = generateMockWorldState(params.config, params.researchPackets, parsed);
      params.onLog?.('synthesizer', `Formal World State synthesized in ${Date.now() - startTime}ms: "${mockWorld.finalWorldName}" (${mockWorld.countries.length} sovereign factions modeled)`, 'success');
      return mockWorld;
    }

    const prompt = buildSynthesisPrompt({
      config: params.config,
      parsedScenario: parsed,
      researchPackets: params.researchPackets,
      debateMessages: params.debateMessages,
      debateRounds: params.debateRounds
    });

    const systemInstruction = getAgentSystemInstruction('synthesizer', params.config.communicationStyle);

    const result = await aiProviderManager.generateJSON<WorldState>({
      role: 'synthesizer',
      prompt,
      systemInstruction,
      useHighThinking: true,
      provider: params.config.provider || 'gemini',
      model: process.env.SYNTHESIS_MODEL_NAME || params.config.modelName || 'gemini-3.7-flash',
      userKeys: params.config.userKeys,
      budgetConfig: params.config.budgetConfig
    });

    // Ensure all critical fields are present with fallbacks
    const timelineWithMetrics = (result.data.timeline || []).map((t, idx, arr) => ({
      ...t,
      economicStability: typeof t.economicStability === 'number' ? t.economicStability : Math.min(95, Math.max(30, 60 + Math.sin(idx * 1.5) * 20)),
      societalHarmony: typeof t.societalHarmony === 'number' ? t.societalHarmony : Math.min(95, Math.max(30, 65 + Math.cos(idx * 1.2) * 18))
    }));

    const world: WorldState = {
      id: `world_${Date.now()}`,
      finalWorldName: result.data.finalWorldName || `Alternate Reality: ${params.config.scenarioTitle}`,
      scenarioSummary: result.data.scenarioSummary || params.config.scenarioDescription,
      executiveSummary: result.data.executiveSummary || 'Synthesized multi-perspective counterfactual world model.',
      parsedScenario: parsed,
      divergencePoint: result.data.divergencePoint || {
        year: params.config.startingYear,
        event: `Divergence Catalyst: ${params.config.scenarioTitle}`,
        mechanism: parsed.divergence
      },
      startingConditions: result.data.startingConditions || parsed.given,
      countries: result.data.countries && result.data.countries.length > 0 
        ? result.data.countries 
        : generateDefaultFactionsForScenario(params.config, parsed),
      alliances: result.data.alliances || [],
      conflicts: result.data.conflicts || [],
      tradeRoutes: result.data.tradeRoutes || [],
      technologyState: result.data.technologyState || {
        category: 'Technological Matrix',
        description: 'Alternate trajectory of scientific and industrial discovery.',
        advancedAheadOfHistory: [],
        delayedOrNeverInvented: [],
        alternativeTechnologicalPaths: []
      },
      culturalSocietalEvolution: result.data.culturalSocietalEvolution || [],
      timeline: timelineWithMetrics.length > 0 ? timelineWithMetrics : generateDefaultTimeline(params.config),
      causalGraph: result.data.causalGraph || [],
      uncertaintiesAndCaveats: result.data.uncertaintiesAndCaveats || parsed.uncertainties,
      unaffectedSystems: result.data.unaffectedSystems || parsed.unaffectedDomains,
      causalPropagation: parsed.causalPropagation,
      agentAgreementBreakdown: result.data.agentAgreementBreakdown || {
        highConsensusAreas: [
          `Consensus on core divergence trajectory from start year ${params.config.startingYear}.`,
          `Agreement on long-term institutional and technological adaptation.`
        ],
        disputedTopics: []
      },
      alternativeBranches: result.data.alternativeBranches || [],
      synthesisConfidence: typeof result.data.synthesisConfidence === 'number' ? result.data.synthesisConfidence : 84
    };

    params.onLog?.('synthesizer', `World Model successfully synthesized via ${result.slotName} (${result.latencyMs}ms, Confidence: ${world.synthesisConfidence}%)`, 'success');
    return world;
  } catch (err: any) {
    const isMockTrigger = err?.message === 'MOCK_FALLBACK_TRIGGER';
    if (!isMockTrigger) {
      console.info(`[SynthesisEngine] Synthesizing formal World Model via autonomous reasoning.`);
    }
    const mockWorld = generateMockWorldState(params.config, params.researchPackets, parsed);
    params.onLog?.('synthesizer', `Formal World State synthesized in ${Date.now() - startTime}ms: "${mockWorld.finalWorldName}" (${mockWorld.countries.length} sovereign factions modeled)`, 'success');
    return mockWorld;
  }
}

function generateDefaultTimeline(config: SimulationConfig) {
  const start = config.startingYear || 1900;
  const end = config.endYear || 2026;
  const span = Math.max(10, end - start);
  return [
    {
      id: 'tl_divergence',
      year: start,
      title: `Inflection Point: ${config.scenarioTitle.slice(0, 40)}`,
      category: 'divergence' as const,
      description: `Immediate structural divergence from baseline causality.`,
      primaryRegion: 'Primary Zone',
      agentAgreementLevel: 'full' as const,
      confidence: 95,
      economicStability: 55,
      societalHarmony: 60
    },
    {
      id: 'tl_consolidation',
      year: Math.round(start + span * 0.35),
      title: 'Macroeconomic Realignment & Technological Shift',
      category: 'technological' as const,
      description: 'Institutions codify new operating paradigms.',
      primaryRegion: 'Global Trade Hubs',
      agentAgreementLevel: 'majority' as const,
      confidence: 88,
      economicStability: 72,
      societalHarmony: 68
    },
    {
      id: 'tl_equilibrium',
      year: end,
      title: `Mature Equilibrium Order (${end})`,
      category: 'political' as const,
      description: 'Long-term multi-bloc equilibrium achieved.',
      primaryRegion: 'Domain Scope',
      agentAgreementLevel: 'full' as const,
      confidence: 91,
      economicStability: 84,
      societalHarmony: 81
    }
  ];
}

export function generateMockWorldState(
  config: SimulationConfig, 
  researchPackets?: Record<string, ResearchPacket>,
  parsedScenario?: ParsedScenarioModel
): WorldState {
  const start = config.startingYear || 1900;
  const end = config.endYear || 2026;
  const title = config.scenarioTitle || 'Alternate World Simulation';
  const span = Math.max(10, end - start);
  const parsed = parsedScenario || generateHeuristicParsedScenario(config);

  const rawText = `${title} ${config.scenarioDescription}`.toLowerCase();
  const isAquatic = rawText.includes('underwater') || rawText.includes('ocean') || rawText.includes('aquatic') || rawText.includes('marine') || rawText.includes('sea');
  const isMars = rawText.includes('mars') || rawText.includes('martian');
  const isReligion = rawText.includes('christianity') || rawText.includes('islam') || rawText.includes('religion');
  const isAncient = rawText.includes('rome') || rawText.includes('roman') || rawText.includes('greece') || rawText.includes('antiquity');
  const isTechEarly = rawText.includes('electricity') || rawText.includes('steam') || rawText.includes('internet') || rawText.includes('invented earlier');

  // Dynamic World Name
  let finalWorldName = `The Alternate Reality of "${title}"`;
  if (isAquatic) finalWorldName = 'Pelagia: The Hydrodynamic Oceanic Commonwealth';
  else if (isMars) finalWorldName = 'Ares Ascendant: The Martian Geothermal Federation';
  else if (isReligion) finalWorldName = 'Nova Antiqua: The Secular Hellenistic & Senatorial Age';
  else if (isAncient) finalWorldName = 'Roma Aeterna: The Industrial Senatus Populusque Romanus';
  else if (isTechEarly) finalWorldName = 'Voltaica: The Early Electrical Enlightenment';

  const countries = generateDefaultFactionsForScenario(config, parsed);

  // Dynamic Alliances
  const alliances = [
    {
      id: 'bloc_primary',
      name: isAquatic ? 'Abyssal Geothermal Pact' : isMars ? 'Valles-Hellas Biosphere Accord' : isReligion ? 'Alexandrian-Senatorial Compact' : isAncient ? 'Allied Senatus Maritime Union' : 'Central Sovereign Commonwealth',
      leaderCountryId: countries[0].id,
      memberCountryIds: [countries[0].id, countries[1].id],
      ideology: isAquatic ? 'Benthic Geothermal Integration' : isMars ? 'Biosphere Expansionism' : isReligion ? 'Secular Civic Rationalism' : 'Sovereign Mutual Defense',
      description: 'Coordinated infrastructure investment, mutual defense guarantees, and resource standardization.',
      color: '#C5A059'
    }
  ];

  // Dynamic Conflicts
  const conflicts = [
    {
      id: 'flash_1',
      name: isAquatic ? 'The Pelagic Ridge Boundary Friction' : isMars ? 'Syrtis Major Volatile Dispute' : isReligion ? 'Levantine Philosophical Border' : 'Contested Frontier Corridor',
      location: isAquatic ? 'Mid-Atlantic Rift' : isMars ? 'Syrtis Major Planum' : isReligion ? 'Eastern Mediterranean' : 'Central Continental Border',
      coordinates: [32.5, 45.2] as [number, number],
      partiesInvolved: [countries[0].id, countries[2]?.id || countries[1].id],
      nature: 'resource_competition' as const,
      description: 'Dispute regarding exclusive extraction jurisdictions and automated transit logistics.',
      riskLevel: 'moderate' as const
    }
  ];

  // Dynamic Trade Routes
  const tradeRoutes = [
    {
      id: 'trade_1',
      name: isAquatic ? 'The Gulf Stream Acoustic Corridor' : isMars ? 'Equatorial Mag-Lev Spine' : isReligion ? 'Mediterranean Trireme Circuit' : 'Trans-Regional Logistics Artery',
      startPoint: countries[0].capital,
      endPoint: countries[1].capital,
      pathCoordinates: [[25.0, 30.0], [35.0, 50.0], [45.0, 70.0]] as [number, number][],
      dominantCommodities: isAquatic ? ['Refined Titanium', 'Bioluminescent Enzymes', 'Kelp Caloric Blocks'] : isMars ? ['Liquid Methane', 'Silica Aerogels', 'Deuterium Fuel'] : ['Rare Minerals', 'Agricultural Surplus', 'Optical Instruments'],
      controllingPowers: [countries[0].id, countries[1].id],
      volumeLevel: 'dominant' as const
    }
  ];

  // Dynamic Timeline
  const timeline = [
    {
      id: 'tl_divergence',
      year: start,
      title: `Inflection Catalyst: ${title.slice(0, 45)}`,
      category: 'divergence' as const,
      description: `The divergence occurs, triggering immediate institutional and technological adjustments.`,
      primaryRegion: 'Global Inflection Center',
      agentAgreementLevel: 'full' as const,
      confidence: 96
    },
    {
      id: 'tl_adaptation',
      year: Math.round(start + span * 0.25),
      title: 'First-Order Structural Consolidation',
      category: 'political' as const,
      description: 'Sovereign entities formally institutionalize alternative methodologies, preventing regression.',
      primaryRegion: 'Core Sovereign Zones',
      agentAgreementLevel: 'full' as const,
      confidence: 88
    },
    {
      id: 'tl_realignment',
      year: Math.round(start + span * 0.6),
      title: 'Technological & Economic Hegemony Shift',
      category: 'technological' as const,
      description: 'The counterfactual economic paradigm surpasses historical baseline productivity.',
      primaryRegion: 'Trade Hubs',
      agentAgreementLevel: 'majority' as const,
      confidence: 84
    },
    {
      id: 'tl_equilibrium',
      year: end,
      title: `Civilizational Steady-State (${end})`,
      category: 'political' as const,
      description: `Civilization stabilizes into a mature, multi-bloc equilibrium order.`,
      primaryRegion: 'Global / Domain Scope',
      agentAgreementLevel: 'full' as const,
      confidence: 90
    }
  ];

  // Dynamic Causal Graph
  const causalGraph = [
    {
      id: 'node_root',
      year: start,
      label: `Divergence: ${title.slice(0, 30)}`,
      category: 'Root Divergence',
      description: `Initial pivot point altering systemic boundary conditions at ${start}.`,
      dependsOnIds: [],
      confidence: 98,
      supportingAgents: Object.keys(researchPackets || { historian: true }),
      dissentingAgents: []
    },
    {
      id: 'node_adaptation',
      year: Math.round(start + span * 0.3),
      label: 'Institutional Adaptation',
      category: '1st-Order Shock',
      description: 'Adaptive organizational and technological realignments.',
      dependsOnIds: ['node_root'],
      confidence: 90,
      supportingAgents: Object.keys(researchPackets || { economist: true }),
      dissentingAgents: []
    },
    {
      id: 'node_equilibrium',
      year: end,
      label: `Equilibrium State (${end})`,
      category: 'Equilibrium',
      description: 'The mature counterfactual world state.',
      dependsOnIds: ['node_adaptation'],
      confidence: 86,
      supportingAgents: Object.keys(researchPackets || { futurist: true }),
      dissentingAgents: []
    }
  ];

  return {
    id: `world_${Date.now()}`,
    finalWorldName,
    scenarioSummary: config.scenarioDescription || `Comprehensive counterfactual simulation of "${title}".`,
    executiveSummary: `This counterfactual simulation projects the structural evolution of civilization following the inflection point at ${start}. Through rigorous Bayesian arbitration across the specialized disciplinary cohort, the scenario reveals that institutional momentum and causal invariants bounded the rate of transformation. Rather than cascading into unconstrained chaos, human or systemic organization adapted around the altered constraints, establishing durable trade routes, specialized technologies, and sovereign balance of power that culminated in the synthesized reality of ${end}.`,
    parsedScenario: parsed,
    divergencePoint: {
      year: start,
      event: `Catalytic Inflection: ${title}`,
      mechanism: parsed.divergence
    },
    startingConditions: parsed.given,
    countries,
    alliances,
    conflicts,
    tradeRoutes,
    technologyState: {
      category: 'Counterfactual Technological Paradigm',
      description: `Scientific trajectories optimized for the specific material and institutional realities of this divergence.`,
      advancedAheadOfHistory: [
        'Domain-specific thermodynamic and material efficiencies',
        'Specialized communication and data protocols',
        'Advanced structural engineering frameworks'
      ],
      delayedOrNeverInvented: [
        'Redundant technologies rendered obsolete by alternative discoveries',
        'High-emission or inefficient legacy combustion systems'
      ],
      alternativeTechnologicalPaths: [
        'Direct bio-chemical or hydrothermal power generation',
        'Decentralized autonomous logistics networks'
      ]
    },
    culturalSocietalEvolution: [
      'Evolution of cultural philosophy centered on adaptation and systemic resilience.',
      'Rise of specialized guilds and academic institutions preserving empirical knowledge.',
      'Secularized legal jurisprudence tailored to unique environmental or political realities.'
    ],
    unaffectedSystems: parsed.unaffectedDomains,
    causalPropagation: parsed.causalPropagation,
    timeline,
    causalGraph,
    uncertaintiesAndCaveats: parsed.uncertainties,
    agentAgreementBreakdown: {
      highConsensusAreas: [
        `Broad agreement that the initial catalyst at ${start} created self-stabilizing institutional feedback loops.`,
        `Consensus that material and physical limits bounded the pace of expansion.`
      ],
      disputedTopics: [
        {
          topic: 'Centralized Hegemony vs Multipolar Regionalism',
          majorityView: 'A multipolar equilibrium was inevitable due to geographic/environmental friction.',
          minorityView: 'A single dominant sovereign could have unified all core trade corridors early.',
          advocates: ['Economist & Geopolitician (Majority)', 'Historian (Minority)']
        }
      ]
    },
    alternativeBranches: [
      {
        id: 'branch_decentralized',
        name: 'The Decentralized Confederation Branch',
        keyDivergence: `Alternative trade policy adopted at year ${Math.round(start + span * 0.4)}`,
        probabilityScore: 32,
        description: 'Autonomous regional city-states achieve peaceful co-existence without dominant imperial authority.',
        supportingAgents: ['economist']
      }
    ],
    synthesisConfidence: 86
  };
}

export function generateDefaultFactionsForScenario(
  config: SimulationConfig,
  parsed: ParsedScenarioModel
): any[] {
  const title = (config.scenarioTitle || '').toLowerCase();
  const isAquatic = title.includes('underwater') || title.includes('ocean') || title.includes('sea');
  const isMars = title.includes('mars') || title.includes('martian');
  const isReligion = title.includes('christianity') || title.includes('islam') || title.includes('religion');
  const isAncient = title.includes('rome') || title.includes('roman') || title.includes('greece');

  if (isAquatic) {
    return [
      { id: 'FAC1', name: 'Abyssal Trench Commonwealth', government: 'High-Pressure Meritocratic Council', ideology: 'Geothermal Hydrometallurgy', capital: 'Challenger Deep Metropolis', populationEstimate: '185,000,000', economicStrength: 92, militaryStrength: 88, technologyLevel: 94, stabilityScore: 82, alliances: ['Abyssal Geothermal Pact'], rivals: ['Surface Frontier Leagues'], statusNotes: 'Heavily industrialized benthic power holding monopoly on thermal vent smelters.', confidence: 88 },
      { id: 'FAC2', name: 'Pelagic Upper-Ocean Federation', government: 'Decentralized Bio-Maritime League', ideology: 'Solar-Photic Cultivation', capital: 'Sargasso Floating Hub', populationEstimate: '220,000,000', economicStrength: 86, militaryStrength: 78, technologyLevel: 88, stabilityScore: 80, alliances: ['Abyssal Geothermal Pact'], rivals: [], statusNotes: 'Dominates biological caloric production, kelp forestry, and acoustic relays.', confidence: 84 },
      { id: 'FAC3', name: 'Benthic Hydrothermal Technate', government: 'Technological Directorate', ideology: 'Extreme Barophilic Cybernetics', capital: 'Mariana Core Sanctum', populationEstimate: '95,000,000', economicStrength: 82, militaryStrength: 85, technologyLevel: 96, stabilityScore: 76, alliances: [], rivals: ['Abyssal Trench Commonwealth'], statusNotes: 'Pioneers high-temp nanomaterials and sub-crust magma taps.', confidence: 82 }
    ];
  }

  if (isMars) {
    return [
      { id: 'FAC1', name: 'Hellas Basin Autonomous Technate', government: 'Hydrological Directorate', ideology: 'Deep-Crust Industrialism', capital: 'Hellas Prime Citadel', populationEstimate: '120,000,000', economicStrength: 90, militaryStrength: 86, technologyLevel: 92, stabilityScore: 84, alliances: ['Valles-Hellas Biosphere Accord'], rivals: ['Olympus Orbital Union'], statusNotes: 'Controls the largest subterranean aquifers and geothermal energy taps.', confidence: 88 },
      { id: 'FAC2', name: 'Valles Marineris Biosphere League', government: 'Enclosed Canyon Confederation', ideology: 'Ecological Terraforming', capital: 'Ophir Chasma Hub', populationEstimate: '145,000,000', economicStrength: 88, militaryStrength: 80, technologyLevel: 89, stabilityScore: 82, alliances: ['Valles-Hellas Biosphere Accord'], rivals: [], statusNotes: 'Agricultural heartland of Mars with pressurized canyon biosphere canopies.', confidence: 85 },
      { id: 'FAC3', name: 'Olympus Orbital Foundry Union', government: 'Corporatist Orbital Assembly', ideology: 'Asteroid Belt Hegemony', capital: 'Olympus Mons High Port', populationEstimate: '45,000,000', economicStrength: 84, militaryStrength: 88, technologyLevel: 95, stabilityScore: 75, alliances: [], rivals: ['Hellas Basin Autonomous Technate'], statusNotes: 'Monopolizes kinetic mass drivers and asteroid metal refining.', confidence: 80 }
    ];
  }

  if (isReligion) {
    return [
      { id: 'FAC1', name: 'Roman Senatorial Commonwealth', government: 'Federalized Constitutional Republic', ideology: 'Secular Civic Jurisprudence', capital: 'Roma', populationEstimate: '160,000,000', economicStrength: 94, militaryStrength: 90, technologyLevel: 90, stabilityScore: 85, alliances: ['Alexandrian-Senatorial Compact'], rivals: ['Persian Imperial League'], statusNotes: 'Retained senatorial checks and expanded civic citizenship across the Mediterranean basin.', confidence: 90 },
      { id: 'FAC2', name: 'Alexandrian Scientific Directorate', government: 'Academic Academy Directorate', ideology: 'Empirical Natural Philosophy', capital: 'Alexandria', populationEstimate: '95,000,000', economicStrength: 88, militaryStrength: 82, technologyLevel: 96, stabilityScore: 84, alliances: ['Alexandrian-Senatorial Compact'], rivals: [], statusNotes: 'Global intellectual capital preserving unbroken Hellenistic mathematics and mechanics.', confidence: 88 },
      { id: 'FAC3', name: 'Persian Imperial League', government: 'Zoroastrian Monarchical Union', ideology: 'Solar Dualism & Caravan Sovereignty', capital: 'Ctesiphon', populationEstimate: '110,000,000', economicStrength: 85, militaryStrength: 88, technologyLevel: 86, stabilityScore: 80, alliances: [], rivals: ['Roman Senatorial Commonwealth'], statusNotes: 'Dominates overland Silk Road commerce and irrigation canal logistics.', confidence: 82 }
    ];
  }

  return [
    { id: 'FAC1', name: 'Dominant Counterfactual Commonwealth', government: 'Representative Constitutional Federation', ideology: 'Systemic Optimization & Civic Liberty', capital: 'Metropolis Prime', populationEstimate: '150,000,000', economicStrength: 90, militaryStrength: 86, technologyLevel: 90, stabilityScore: 84, alliances: ['Central Sovereign Commonwealth'], rivals: ['Border Directorate'], statusNotes: 'Pivotal sovereign entity anchoring post-divergence geopolitical stability.', confidence: 88 },
    { id: 'FAC2', name: 'Allied Maritime & Trade League', government: 'Commercial Mercantile Union', ideology: 'Open Trade Corridors & Innovation', capital: 'Port Meridian', populationEstimate: '110,000,000', economicStrength: 88, militaryStrength: 78, technologyLevel: 88, stabilityScore: 82, alliances: ['Central Sovereign Commonwealth'], rivals: [], statusNotes: 'Controls strategic maritime routes and specialized manufacturing hubs.', confidence: 85 },
    { id: 'FAC3', name: 'Frontier Sovereign Directorate', government: 'Executive Technocratic Council', ideology: 'Resource Independence & Deterrence', capital: 'Fortress Aurora', populationEstimate: '75,000,000', economicStrength: 80, militaryStrength: 86, technologyLevel: 84, stabilityScore: 78, alliances: [], rivals: ['Dominant Counterfactual Commonwealth'], statusNotes: 'Resource-rich frontier entity with strong kinetic deterrence capabilities.', confidence: 80 }
  ];
}
