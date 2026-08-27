export type CommunicationStyle = 'hinglish' | 'layman' | 'general' | 'professional' | 'expert';

export type RigorLevel = 'strict_causality' | 'plausible_extrapolation' | 'rigorous' | 'extreme';

export type CreativityScore = 1 | 2 | 3 | 4 | 5;

export type ProviderType = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface ProviderModelDef {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  isDefault?: boolean;
}

export interface UserProviderKeyConfig {
  provider: ProviderType;
  apiKey: string; // Stored in client session / local storage
  selectedModel: string;
  customModelId?: string;
  status: 'connected' | 'untested' | 'invalid' | 'testing';
  lastTestedAt?: string;
  errorMessage?: string;
}

export interface BudgetConfig {
  maxApiCalls: number; // e.g. 10, 15, 25, 50
  maxDebateRounds: number; // 1, 2, 3, 4
  maxOutputLength: 'short' | 'medium' | 'long';
  fallbackProvider?: ProviderType | 'none';
  enableCostProtection: boolean;
}

export interface WorkloadEstimate {
  expertCount: number;
  researchCalls: number;
  debateRounds: number;
  estimatedDebateCalls: string;
  synthesisCalls: number;
  estimatedTotalCalls: string;
  complexity: 'Low' | 'Medium' | 'High';
}

export type StandardExpertRole =
  | 'historian'
  | 'economist'
  | 'geopolitician'
  | 'futurist'
  | 'physicist'
  | 'astronomer'
  | 'biologist'
  | 'microbiologist'
  | 'psychologist'
  | 'sociologist'
  | 'anthropologist'
  | 'climate_scientist'
  | 'engineer'
  | 'computer_scientist'
  | 'political_scientist'
  | 'demographer'
  | 'geologist'
  | 'ecologist'
  | 'medical_scientist'
  | 'military_strategist'
  | 'synthesizer'
  | 'custom';

export type AgentRole = string;

export interface CustomExpertDef {
  name: string;
  title: string;
  description: string;
  focus: string;
  constraints?: string;
  avatarColor?: string;
  accentColor?: string;
}

export interface SelectedExpertConfig {
  slotId: string;
  roleId: string; // matches StandardExpertRole or custom id
  name: string;
  title: string;
  specialty: string;
  provider?: ProviderType;
  modelName: string;
  assignedKeySlot?: string;
  enabled: boolean;
  isCustom?: boolean;
  customDef?: CustomExpertDef;
}

export interface AgentMeta {
  role: string;
  name: string;
  title: string;
  specialty: string;
  avatarColor: string;
  badgeBg: string;
  badgeBorder: string;
  accentColor: string;
  iconName: string;
  description: string;
  focusAreas: string[];
}

export const EXPERT_ROLE_REGISTRY: Record<string, AgentMeta> = {
  historian: {
    role: 'historian',
    name: 'Dr. Alistair Vance',
    title: 'Senior Historical Causality Analyst',
    specialty: 'Divergence mechanics, institutional legacy & political continuity',
    avatarColor: 'from-[#8C6D37] to-[#453215]',
    badgeBg: 'bg-[#1C1811]',
    badgeBorder: 'border-[#C5A059]/50 text-[#C5A059]',
    accentColor: '#C5A059',
    iconName: 'BookOpen',
    description: 'Traces root causality from divergence, mapping institutional inertia, societal structures, and historical momentum.',
    focusAreas: ['Historical systems', 'Divergence points', 'Institutions & Governance', 'Treaties & Dynasties', 'Causal inertia']
  },
  economist: {
    role: 'economist',
    name: 'Elena Rostova, Ph.D.',
    title: 'Macroeconomic & Trade Systems Modeler',
    specialty: 'Resource scarcity, production systems, energy regimes & trade networks',
    avatarColor: 'from-[#1E3A2F] to-[#0D1F18]',
    badgeBg: 'bg-[#0E1F18]',
    badgeBorder: 'border-[#2D6A4F]/60 text-[#52B788]',
    accentColor: '#52B788',
    iconName: 'TrendingUp',
    description: 'Models resource allocation, production capacity, trade corridors, labor organization, and currency/exchange systems.',
    focusAreas: ['Production systems', 'Resource flows', 'Trade corridors', 'Incentive structures', 'Currency & Capital']
  },
  geopolitician: {
    role: 'geopolitician',
    name: 'Cmdr. Marcus Sterling',
    title: 'Strategic Security & Power Balance Analyst',
    specialty: 'Sovereign entities, territorial control, alliances & strategic flashpoints',
    avatarColor: 'from-[#1A2E40] to-[#0E1A26]',
    badgeBg: 'bg-[#0F1B26]',
    badgeBorder: 'border-[#2A4D69]/60 text-[#6BA4B8]',
    accentColor: '#6BA4B8',
    iconName: 'Shield',
    description: 'Evaluates balance-of-power dynamics, deterrence viability, factional borders, strategic chokepoints, and conflict escalation.',
    focusAreas: ['Sovereign factions', 'Alliances & Blocs', 'Strategic chokepoints', 'Flashpoints', 'Security architecture']
  },
  futurist: {
    role: 'futurist',
    name: 'Dr. Maya Lin-Chen',
    title: 'Techno-Societal Evolution Strategist',
    specialty: 'Scientific trajectories, demographic transitions, energy systems & cultural paradigms',
    avatarColor: 'from-[#2F1F3D] to-[#1A0F24]',
    badgeBg: 'bg-[#1D1326]',
    badgeBorder: 'border-[#5A3E7A]/60 text-[#B89ACD]',
    accentColor: '#B89ACD',
    iconName: 'Cpu',
    description: 'Analyzes alternative technological discoveries, physical infrastructure, demographics, and long-term civilizational paradigms.',
    focusAreas: ['Alternative tech trees', 'Energy regimes', 'Demographics', 'Civilization pathways', 'Cultural paradigms']
  },
  physicist: {
    role: 'physicist',
    name: 'Dr. Arthur Pendelton',
    title: 'Thermodynamics & Fundamental Physics Theorist',
    specialty: 'Physical invariants, energy density, planetary mechanics & material physics',
    avatarColor: 'from-[#1E3A5F] to-[#0F1D33]',
    badgeBg: 'bg-[#0F1B2D]',
    badgeBorder: 'border-[#3B82F6]/60 text-[#60A5FA]',
    accentColor: '#3B82F6',
    iconName: 'Atom',
    description: 'Enforces strict physical, energetic, and thermodynamic boundaries on technologies, energy regimes, and planetary mechanics.',
    focusAreas: ['Thermodynamics', 'Energy density', 'Planetary mechanics', 'Physical constants', 'Material limits']
  },
  astronomer: {
    role: 'astronomer',
    name: 'Dr. Selene Kepler',
    title: 'Orbital & Planetary Astrophysics Specialist',
    specialty: 'Celestial mechanics, solar dynamics, radiation environments & space logistics',
    avatarColor: 'from-[#2A1845] to-[#140B24]',
    badgeBg: 'bg-[#1A0F2E]',
    badgeBorder: 'border-[#8B5CF6]/60 text-[#A78BFA]',
    accentColor: '#8B5CF6',
    iconName: 'Orbit',
    description: 'Models celestial orbits, radiation environments, tidal locking, off-world habitability, and deep-space observation.',
    focusAreas: ['Orbital mechanics', 'Solar radiation', 'Planetary atmospheres', 'Tidal forces', 'Space logistics']
  },
  biologist: {
    role: 'biologist',
    name: 'Dr. Thalia Darwin-Voss',
    title: 'Evolutionary & Physiological Biologist',
    specialty: 'Morphological adaptation, ecological niches, metabolic pathways & biomechanics',
    avatarColor: 'from-[#194D33] to-[#0B2618]',
    badgeBg: 'bg-[#0E261A]',
    badgeBorder: 'border-[#10B981]/60 text-[#34D399]',
    accentColor: '#10B981',
    iconName: 'Dna',
    description: 'Examines physiological adaptation, respiratory systems, metabolic rates, biomechanics, and evolutionary selective pressures.',
    focusAreas: ['Morphology', 'Metabolism', 'Evolutionary pressure', 'Ecological niches', 'Sensory physiology']
  },
  microbiologist: {
    role: 'microbiologist',
    name: 'Dr. Jonas Vane',
    title: 'Microbial Ecology & Pathogen Specialist',
    specialty: 'Extreme barophilic organisms, cellular bio-catalysis & epidemiological dynamics',
    avatarColor: 'from-[#164E63] to-[#082F49]',
    badgeBg: 'bg-[#082838]',
    badgeBorder: 'border-[#06B6D4]/60 text-[#22D3EE]',
    accentColor: '#06B6D4',
    iconName: 'Bacteria',
    description: 'Evaluates microbial biochemistry, chemosynthesis, extremophile enzymes, cellular respiration, and pathogen vectors.',
    focusAreas: ['Extremophiles', 'Cellular respiration', 'Pathogens & Immunity', 'Biocatalysis', 'Microbiomes']
  },
  psychologist: {
    role: 'psychologist',
    name: 'Dr. Julian Mercer',
    title: 'Cognitive & Behavioral Systems Analyst',
    specialty: 'Sensory perception, stress adaptation, social bonding & cognitive architecture',
    avatarColor: 'from-[#581C87] to-[#2E1065]',
    badgeBg: 'bg-[#220B38]',
    badgeBorder: 'border-[#9333EA]/60 text-[#C084FC]',
    accentColor: '#9333EA',
    iconName: 'Brain',
    description: 'Analyzes sensory psychology, spatial awareness, isolation stress, collective decision-making, and neuro-adaptive traits.',
    focusAreas: ['Cognitive adaptation', 'Sensory processing', 'Group psychology', 'Stress responses', 'Perceptual frameworks']
  },
  sociologist: {
    role: 'sociologist',
    name: 'Dr. Nadine Habermas',
    title: 'Social Stratification & Cultural Systems Theorist',
    specialty: 'Kinship structures, class hierarchies, moral codes & civilizational rituals',
    avatarColor: 'from-[#7C2D12] to-[#3B1407]',
    badgeBg: 'bg-[#2B1109]',
    badgeBorder: 'border-[#EA580C]/60 text-[#FB923C]',
    accentColor: '#EA580C',
    iconName: 'Users',
    description: 'Models the evolution of family structures, class relations, legal customs, religious movements, and societal cohesion.',
    focusAreas: ['Social structures', 'Class dynamics', 'Cultural rituals', 'Institutional trust', 'Norm formation']
  },
  anthropologist: {
    role: 'anthropologist',
    name: 'Dr. Kwame Leakey',
    title: 'Paleoanthropological & Material Culture Analyst',
    specialty: 'Tool traditions, language evolution, symbolic artifacts & habitat adaptation',
    avatarColor: 'from-[#713F12] to-[#361E08]',
    badgeBg: 'bg-[#261506]',
    badgeBorder: 'border-[#D97706]/60 text-[#FBBF24]',
    accentColor: '#D97706',
    iconName: 'Flame',
    description: 'Traces the synthesis of material culture, myth-making, tool traditions, linguistic diversification, and tribal lineages.',
    focusAreas: ['Material culture', 'Linguistic roots', 'Symbolic systems', 'Tool traditions', 'Tribal structures']
  },
  climate_scientist: {
    role: 'climate_scientist',
    name: 'Dr. Freja Lindholm',
    title: 'Atmospheric & Cryospheric Modeler',
    specialty: 'Hydrological cycles, ocean currents, atmospheric thermodynamics & biomes',
    avatarColor: 'from-[#065F46] to-[#022C22]',
    badgeBg: 'bg-[#03211A]',
    badgeBorder: 'border-[#059669]/60 text-[#34D399]',
    accentColor: '#059669',
    iconName: 'CloudRain',
    description: 'Simulates global climate belts, oceanic conveyor currents, precipitation regimes, greenhouse dynamics, and biome distribution.',
    focusAreas: ['Ocean currents', 'Atmospheric dynamics', 'Thermal circulation', 'Biome shifts', 'Carbon cycles']
  },
  engineer: {
    role: 'engineer',
    name: 'Chief Eng. Viktor Novak',
    title: 'Structural Systems & Infrastructure Architect',
    specialty: 'Pressure hull mechanics, thermal insulation, geothermal taps & power distribution',
    avatarColor: 'from-[#374151] to-[#1F2937]',
    badgeBg: 'bg-[#181D24]',
    badgeBorder: 'border-[#6B7280]/60 text-[#9CA3AF]',
    accentColor: '#9CA3AF',
    iconName: 'Wrench',
    description: 'Evaluates structural engineering, pressure-resistant habitats, material tensile strengths, power grids, and transit pipelines.',
    focusAreas: ['Structural mechanics', 'Pressure containment', 'Energy grids', 'Transit infrastructure', 'Material strength']
  },
  computer_scientist: {
    role: 'computer_scientist',
    name: 'Dr. Ada Turing-Bell',
    title: 'Computation & Information Systems Theorist',
    specialty: 'Alternative computation, optical logic, cybernetics & automated logistics',
    avatarColor: 'from-[#0C4A6E] to-[#07263A]',
    badgeBg: 'bg-[#061E2D]',
    badgeBorder: 'border-[#0284C7]/60 text-[#38BDF8]',
    accentColor: '#0284C7',
    iconName: 'Binary',
    description: 'Designs alternative computation models (fluidic, mechanical, optical, biological), cybernetic control loops, and data protocols.',
    focusAreas: ['Alternative computing', 'Cybernetics', 'Data logistics', 'Automation loops', 'Network topologies']
  },
  political_scientist: {
    role: 'political_scientist',
    name: 'Dr. Soren Madison',
    title: 'Constitutional & Governance Architect',
    specialty: 'Sovereignty models, voting mechanisms, legal jurisprudence & state stability',
    avatarColor: 'from-[#831843] to-[#470B24]',
    badgeBg: 'bg-[#33091B]',
    badgeBorder: 'border-[#DB2777]/60 text-[#F472B6]',
    accentColor: '#DB2777',
    iconName: 'Landmark',
    description: 'Analyzes political constitutions, civic rights, state legitimacy, judicial systems, and revolutionary pressures.',
    focusAreas: ['Constitutional models', 'Civic rights', 'Legitimacy', 'Electoral systems', 'State capacity']
  },
  demographer: {
    role: 'demographer',
    name: 'Dr. Miriam Graunt',
    title: 'Population Dynamics & Migration Analyst',
    specialty: 'Fertility rates, mortality vectors, urban clustering & diaspora flows',
    avatarColor: 'from-[#854D0E] to-[#422607]',
    badgeBg: 'bg-[#2A1804]',
    badgeBorder: 'border-[#CA8A04]/60 text-[#FACC15]',
    accentColor: '#CA8A04',
    iconName: 'UserCheck',
    description: 'Models population pyramids, life expectancies, urbanization trends, forced migrations, and labor replacement dynamics.',
    focusAreas: ['Fertility & Mortality', 'Migration corridors', 'Urban density', 'Age structures', 'Carrying capacity']
  },
  geologist: {
    role: 'geologist',
    name: 'Dr. Rebecca Hutton',
    title: 'Planetary Mineralogy & Lithosphere Specialist',
    specialty: 'Tectonic regimes, hydrothermal vents, mineral deposits & vulcanism',
    avatarColor: 'from-[#78350F] to-[#3D1A07]',
    badgeBg: 'bg-[#2B1305]',
    badgeBorder: 'border-[#B45309]/60 text-[#F59E0B]',
    accentColor: '#B45309',
    iconName: 'Mountain',
    description: 'Investigates tectonic activity, seabed hydrothermal vents, mineral vein accessibility, volcanic activity, and lithospheric chemistry.',
    focusAreas: ['Mineral veins', 'Hydrothermal vents', 'Plate tectonics', 'Vulcanism', 'Geochemistry']
  },
  ecologist: {
    role: 'ecologist',
    name: 'Dr. Arlo Leopold',
    title: 'Trophic Webs & Biosphere Systems Analyst',
    specialty: 'Food chains, biomass production, biome resilience & symbiotic networks',
    avatarColor: 'from-[#14532D] to-[#052E16]',
    badgeBg: 'bg-[#082110]',
    badgeBorder: 'border-[#16A34A]/60 text-[#4ADE80]',
    accentColor: '#16A34A',
    iconName: 'Trees',
    description: 'Maps food chains, energy transfer across trophic levels, keystone species dynamics, biodiversity, and ecosystem stability.',
    focusAreas: ['Trophic webs', 'Keystone species', 'Biomass production', 'Symbiosis', 'Ecosystem resilience']
  },
  medical_scientist: {
    role: 'medical_scientist',
    name: 'Dr. Ephraim Pasteur',
    title: 'Epidemiology & Physiological Medicine Specialist',
    specialty: 'Endemic pathogens, barotrauma, radiation sickness & therapeutics',
    avatarColor: 'from-[#9F1239] to-[#4C0519]',
    badgeBg: 'bg-[#310611]',
    badgeBorder: 'border-[#E11D48]/60 text-[#FB7185]',
    accentColor: '#E11D48',
    iconName: 'HeartPulse',
    description: 'Analyzes physiological health, pressure and radiation pathologies, endemic diseases, pharmacopeia, and public health.',
    focusAreas: ['Epidemiology', 'Environmental illness', 'Pharmacology', 'Physiological stress', 'Public health']
  },
  military_strategist: {
    role: 'military_strategist',
    name: 'Gen. Sun Clausewitz (Ret.)',
    title: 'Operational Doctrine & Force Projection Modeler',
    specialty: 'Naval/Sub-surface doctrine, kinetic deterrence, orbital defense & asymmetric warfare',
    avatarColor: 'from-[#4C1D95] to-[#2E1065]',
    badgeBg: 'bg-[#1E0B42]',
    badgeBorder: 'border-[#7C3AED]/60 text-[#A78BFA]',
    accentColor: '#7C3AED',
    iconName: 'Crosshair',
    description: 'Evaluates kinetic weaponry, tactical doctrines, defensive fortifications, asymmetric conflict, and strategic deterrence.',
    focusAreas: ['Tactical doctrine', 'Deterrence', 'Defensive fortifications', 'Force projection', 'Asymmetric war']
  },
  synthesizer: {
    role: 'synthesizer',
    name: 'Chronos Synthesis Engine',
    title: 'Multi-Perspective World Synthesizer',
    specialty: 'Contradiction resolution, Bayesian plausibility & formal world modeling',
    avatarColor: 'from-[#614A29] to-[#2B1F11]',
    badgeBg: 'bg-[#1F170E]',
    badgeBorder: 'border-[#C5A059]/60 text-[#E5C384]',
    accentColor: '#C5A059',
    iconName: 'Compass',
    description: 'Reconciles conflicting agent hypotheses into a unified, high-fidelity alternative reality model.',
    focusAreas: ['Contradiction triage', 'Plausibility synthesis', 'Scenario convergence', 'Comprehensive dossier']
  }
};

export const AGENT_REGISTRY = EXPERT_ROLE_REGISTRY;

export function getExpertMeta(roleOrId: string, customDef?: CustomExpertDef): AgentMeta {
  if (EXPERT_ROLE_REGISTRY[roleOrId]) {
    return EXPERT_ROLE_REGISTRY[roleOrId];
  }
  if (customDef) {
    return {
      role: roleOrId,
      name: customDef.name,
      title: customDef.title || 'Specialized Domain Analyst',
      specialty: customDef.focus || customDef.description,
      avatarColor: customDef.avatarColor || 'from-[#4A3B2C] to-[#241C15]',
      badgeBg: 'bg-[#181410]',
      badgeBorder: 'border-[#C5A059]/50 text-[#C5A059]',
      accentColor: customDef.accentColor || '#C5A059',
      iconName: 'Sparkles',
      description: customDef.description || 'Custom configured disciplinary specialist.',
      focusAreas: customDef.focus.split(',').map(s => s.trim()).filter(Boolean)
    };
  }
  return {
    role: roleOrId,
    name: `Specialist (${roleOrId})`,
    title: 'Domain Analyst',
    specialty: 'Hypothetical systems & causality modeling',
    avatarColor: 'from-[#333] to-[#111]',
    badgeBg: 'bg-[#1A1A1A]',
    badgeBorder: 'border-[#555] text-[#AAA]',
    accentColor: '#AAA',
    iconName: 'Sparkles',
    description: 'Specialist analyst analyzing counterfactual dynamics.',
    focusAreas: ['Causality', 'Systems analysis', 'Domain modeling']
  };
}

export interface ParsedScenarioModel {
  scenario: string;
  divergence: string;
  given: string[];
  requiredAssumptions: string[];
  derivedAssumptions: string[];
  uncertainties: string[];
  affectedDomains: string[];
  unaffectedDomains: string[];
  physicalConsistencyNotes: string[];
  simulationTarget: string;
  causalPropagation: {
    directEffects: string[];
    secondOrderEffects: string[];
    thirdOrderEffects: string[];
    longTermEquilibrium: string[];
  };
}

export interface SimulationConfig {
  scenarioTitle: string;
  scenarioDescription: string;
  startingYear: number;
  endYear: number;
  geographicScope: 'global' | 'eurasia' | 'americas' | 'transatlantic' | 'asia_pacific' | 'planetary_mars' | 'aquatic_oceanic' | 'orbital_space' | 'custom_regional';
  agentCount: number;
  expertCohort?: SelectedExpertConfig[];
  debateRounds: number;
  creativityLevel: 'rigorous' | 'balanced' | 'speculative' | 'conservative' | 'realistic' | 'exploratory';
  creativityScore?: CreativityScore; // 1 to 5
  realismLevel: 'strict_causality' | 'plausible_extrapolation' | 'high_divergence' | 'rigorous' | 'extreme';
  communicationStyle?: CommunicationStyle; // 'layman' | 'general' | 'professional' | 'expert'
  showDebate?: boolean;
  debateDetail?: 'minimal' | 'standard' | 'full';
  modelName: string;
  provider?: ProviderType;
  userKeys?: Partial<Record<ProviderType, string>>;
  budgetConfig?: BudgetConfig;
  coverArtUrl?: string;
  coverArtStyle?: string;
  coverArtPrompt?: string;
}

export interface ResearchPacket {
  agent: AgentRole;
  agentName: string;
  provider?: ProviderType;
  modelName?: string;
  fallbackUsed?: boolean;
  thesis: string;
  divergenceMechanism: string;
  keyAssumptions: string[];
  causalChain: Array<{
    year: number;
    event: string;
    cause: string;
    impact: string;
  }>;
  majorEvents: Array<{
    year: number;
    title: string;
    description: string;
    significance: string;
  }>;
  countriesAffected: Array<{
    id: string;
    name: string;
    statusChange: string;
    influenceScore: number;
  }>;
  economicEffects: string[];
  technologyEffects: string[];
  socialEffects: string[];
  geopoliticalEffects: string[];
  confidence: {
    overall: number; // 0-100
    causalStrength: number;
    plausibility: number;
    notes: string;
  };
  uncertainties: string[];
  alternativePossibilities: string[];
  questionsForOtherAgents: string[];
}

export type DebateMessageType = 
  | 'claim' 
  | 'critique' 
  | 'defense' 
  | 'concession' 
  | 'synthesis_proposal' 
  | 'final_stance';

export type DebateStatus = 'agreeing' | 'disagreeing' | 'revising' | 'neutral';

export interface DebateMessage {
  id: string;
  round: number;
  agent: AgentRole;
  agentName: string;
  provider?: ProviderType;
  modelName?: string;
  fallbackUsed?: boolean;
  type: DebateMessageType;
  targetAgent?: AgentRole;
  targetClaim?: string;
  claim: string;
  position?: string; // Concise 1-2 paragraph position
  challenge?: string; // Clear disagreement / targeted challenge
  response?: string; // Clear response / rebuttal
  status?: DebateStatus; // Agreeing / Disagreeing / Revising / Neutral
  critiqueOrDefense?: string;
  evidence: string;
  confidence: number; // 0-100
  stanceShift?: {
    previousConfidence: number;
    newConfidence: number;
    reason: string;
  };
  timestamp: string;
}

export interface DebateRoundSummary {
  round: number;
  title: string;
  focus: string;
  consensusAreas: string[];
  activeDisagreements: string[];
}

export interface CountryState {
  id: string;
  name: string;
  government: string;
  ideology: string;
  capital: string;
  populationEstimate: string;
  economicStrength: number; // 0-100
  militaryStrength: number; // 0-100
  technologyLevel: number; // 0-100
  stabilityScore: number; // 0-100
  alliances: string[];
  rivals: string[];
  blocId?: string;
  statusNotes: string;
  simulatedBorderChanges?: string;
  confidence: number;
}

export interface GeopoliticalBloc {
  id: string;
  name: string;
  leaderCountryId: string;
  memberCountryIds: string[];
  ideology: string;
  description: string;
  color: string;
}

export interface ConflictFlashpoint {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [lat, lng]
  partiesInvolved: string[];
  nature: 'cold_war' | 'border_dispute' | 'proxy_war' | 'resource_competition' | 'ideological_friction' | 'active_skirmish';
  description: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface TradeCorridor {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  pathCoordinates: [number, number][];
  dominantCommodities: string[];
  controllingPowers: string[];
  volumeLevel: 'low' | 'moderate' | 'high' | 'dominant';
}

export interface TechnologyState {
  category: string;
  description: string;
  advancedAheadOfHistory: string[];
  delayedOrNeverInvented: string[];
  alternativeTechnologicalPaths: string[];
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  category: 'political' | 'economic' | 'military' | 'technological' | 'cultural' | 'divergence';
  description: string;
  primaryRegion: string;
  causeRef?: string;
  agentAgreementLevel: 'full' | 'majority' | 'contested';
  confidence: number;
  economicStability?: number; // 0-100 metric index
  societalHarmony?: number; // 0-100 metric index
}

export interface CausalNode {
  id: string;
  year: number;
  label: string;
  category: string;
  description: string;
  dependsOnIds: string[];
  confidence: number;
  supportingAgents: AgentRole[];
  dissentingAgents: AgentRole[];
}

export interface AlternativeBranch {
  id: string;
  name: string;
  keyDivergence: string;
  probabilityScore: number;
  description: string;
  supportingAgents: AgentRole[];
}

export interface WorldState {
  id: string;
  finalWorldName: string;
  scenarioSummary: string;
  executiveSummary: string;
  parsedScenario?: ParsedScenarioModel;
  divergencePoint: {
    year: number;
    event: string;
    mechanism: string;
  };
  startingConditions: string[];
  countries: CountryState[];
  alliances: GeopoliticalBloc[];
  conflicts: ConflictFlashpoint[];
  tradeRoutes: TradeCorridor[];
  technologyState: TechnologyState;
  culturalSocietalEvolution: string[];
  timeline: TimelineEvent[];
  causalGraph: CausalNode[];
  uncertaintiesAndCaveats: string[];
  unaffectedSystems?: string[];
  causalPropagation?: ParsedScenarioModel['causalPropagation'];
  agentAgreementBreakdown: {
    highConsensusAreas: string[];
    disputedTopics: Array<{
      topic: string;
      majorityView: string;
      minorityView: string;
      advocates: string[];
    }>;
  };
  alternativeBranches: AlternativeBranch[];
  synthesisConfidence: number;
  coverArtUrl?: string;
  coverArtStyle?: string;
  coverArtPrompt?: string;
}

export interface EventLogItem {
  id: string;
  timestamp: string;
  agent?: AgentRole;
  message: string;
  type: 'info' | 'warn' | 'success' | 'debate' | 'system';
}

export interface SimulationDebugStats {
  totalRequests: number;
  tokensEstimated: number;
  agentLatencies: Record<string, number>;
  activeKeySlot: string;
  mockMode: boolean;
  activeModel: string;
}

export interface Simulation {
  id: string;
  createdAt: string;
  updatedAt: string;
  config: SimulationConfig;
  parsedScenario?: ParsedScenarioModel;
  status: 'idle' | 'parsing' | 'researching' | 'debating' | 'synthesizing' | 'completed' | 'failed' | 'paused';
  currentStageIndex: number; // 0: Init/Setup, 1: Assumptions & Parse, 2: Research, 3: Debate, 4: Consensus, 5: Synthesis, 6: Ready
  currentRound: number;
  researchPackets: Partial<Record<AgentRole, ResearchPacket>>;
  debateMessages: DebateMessage[];
  debateRounds: DebateRoundSummary[];
  worldState: WorldState | null;
  eventLogs: EventLogItem[];
  debugStats: SimulationDebugStats;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | AgentRole | 'world_chronicler';
  senderName: string;
  text: string;
  timestamp: string;
  targetPerspective?: AgentRole;
}

