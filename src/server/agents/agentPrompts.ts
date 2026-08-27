import { 
  AgentRole, 
  ParsedScenarioModel, 
  SimulationConfig, 
  CommunicationStyle, 
  SelectedExpertConfig, 
  getExpertMeta, 
  EXPERT_ROLE_REGISTRY 
} from '../../shared/types.ts';

export function getCommunicationStyleDirective(style?: CommunicationStyle): string {
  switch (style) {
    case 'hinglish':
      return `COMMUNICATION STYLE INSTRUCTION [EASY HINGLISH - DEFAULT]:
- Speak and write in natural, friendly, conversational HINGLISH (Natural mix of simple Hindi words written in English alphabet + clear English).
- Example: Instead of "The absence of a Christian institutional framework would alter political legitimacy", say "Christianity nahi hoti, toh Europe ki politics kaafi alag develop ho sakti thi. Kings ko apni power justify karne ke liye doosre systems par depend karna padta."
- Instead of "Demographic externalities alter macroeconomic equilibrium", say "Population change se economy ka balance change ho sakta hai."
- Keep sentences short, punchy (40 to 80 words per explanation), and engaging.
- Explain technical concepts simply on the fly (e.g. "Geopolitical bloc — matlab countries ka group jo ek doosre ke saath strategically kaam karta hai").
- Keep tone smart, like an intelligent friend explaining a fascinating hypothetical world.`;

    case 'layman':
      return `COMMUNICATION STYLE INSTRUCTION [EASY ENGLISH / LAYMAN]:
- Use clear, everyday, accessible simple English.
- Avoid academic jargon, obscure technical acronyms, or complex economic formulations.
- Express systemic ideas through intuitive real-world analogies (e.g. instead of "macroeconomic demographic externalities", say "how fewer people change jobs, food prices, and government spending").
- Keep sentences punchy, short, and engaging (40 to 80 words).`;

    case 'professional':
      return `COMMUNICATION STYLE INSTRUCTION [PROFESSIONAL]:
- Use clear, authoritative professional domain language.
- Introduce technical concepts with appropriate discipline-specific terms (e.g. "supply elasticity", "geopolitical deterrence", "thermodynamic efficiency").
- Maintain an analytical and objective tone.`;

    case 'expert':
      return `COMMUNICATION STYLE INSTRUCTION [EXPERT]:
- Use deep academic and scientific terminology, formal causal equations where relevant, precise biological/physical mechanisms, and exact institutional terminology.
- Dive deep into technical specifications, thermodynamic limits, demographic transition curves, and structural modeling.`;

    case 'general':
    default:
      return `COMMUNICATION STYLE INSTRUCTION [GENERAL / MEDIUM]:
- Use clear, thoughtful, intelligent language.
- When uncommon scientific, historical, or economic concepts are referenced, explain them briefly and clearly so any intelligent reader can follow the causal reasoning without confusion.`;
  }
}

export function getAgentSystemInstruction(expert: SelectedExpertConfig | string, style?: CommunicationStyle): string {
  const roleId = typeof expert === 'string' ? expert : expert.roleId;
  const customDef = typeof expert === 'string' ? undefined : expert.customDef;
  const meta = getExpertMeta(roleId, customDef);
  const styleDirective = getCommunicationStyleDirective(style);

  return `You are ${meta.name}, ${meta.title}.
Your disciplinary specialty is: ${meta.specialty}.
Your core focus areas are: ${meta.focusAreas.join(', ')}.

ANALYTICAL OBJECTIVE:
1. Examine counterfactual scenarios strictly through your domain's analytical principles and causal constraints.
2. Enforce hard physical, biological, economic, or institutional invariants (Causal Bounding).
3. Distinguish clearly between Direct (1st order), Cascading (2nd order), and Long-term equilibrium outcomes.
4. Output strictly structured, valid JSON matching the requested schema.

${styleDirective}`;
}

export function buildResearchPrompt(
  expert: SelectedExpertConfig | string, 
  config: SimulationConfig, 
  parsedScenario?: ParsedScenarioModel
): string {
  const roleId = typeof expert === 'string' ? expert : expert.roleId;
  const customDef = typeof expert === 'string' ? undefined : expert.customDef;
  const meta = getExpertMeta(roleId, customDef);
  const styleDirective = getCommunicationStyleDirective(config.communicationStyle);

  const assumptionsContext = parsedScenario ? `
PARSED SCENARIO MODEL & ASSUMPTIONS:
- Explicit Given Conditions: ${parsedScenario.given.join('; ')}
- Required Prerequisites: ${parsedScenario.requiredAssumptions.join('; ')}
- Derived Assumptions: ${parsedScenario.derivedAssumptions.join('; ')}
- Key Uncertainties: ${parsedScenario.uncertainties.join('; ')}
- Affected Domains: ${parsedScenario.affectedDomains.join(', ')}
- Unaffected Invariant Domains (Causal Bounding): ${parsedScenario.unaffectedDomains.join(', ')}
- Physical/Biological Consistency: ${parsedScenario.physicalConsistencyNotes.join('; ')}
` : '';

  return `Perform an independent, rigorous analytical assessment of the following counterfactual scenario as ${meta.name} (${meta.title}):

SCENARIO TITLE: "${config.scenarioTitle}"
DESCRIPTION: "${config.scenarioDescription}"
STARTING INFLECTION YEAR/ERA: ${config.startingYear}
SIMULATION TARGET HORIZON: ${config.endYear}
GEOGRAPHIC/DOMAIN SCOPE: ${config.geographicScope}
REALISM RIGOR: ${config.realismLevel}
CREATIVITY LEVEL: ${config.creativityScore || config.creativityLevel || '3 / 5 (Balanced)'}
${assumptionsContext}

${styleDirective}

DISCIPLINARY INSTRUCTIONS FOR YOUR SPECIALTY (${meta.specialty}):
- Focus heavily on how your discipline's core mechanisms (e.g. ${meta.focusAreas.join(', ')}) shift or resist change.
- Provide a coherent 4-stage causal timeline from ${config.startingYear} to ${config.endYear}.
- Generate custom, scenario-specific sovereign factions or civilizational entities tailored directly to this scenario.
- Output ONLY valid JSON matching this schema:

{
  "agent": "${meta.role}",
  "agentName": "${meta.name}",
  "thesis": "A clear, compelling 2-3 sentence core thesis on how this divergent reality evolves from your perspective.",
  "divergenceMechanism": "Specific causal catalyst at the starting inflection that shifts trajectory.",
  "keyAssumptions": ["3-5 foundational analytical assumptions for your discipline"],
  "causalChain": [
    { "year": ${config.startingYear}, "event": "Divergence initiation", "cause": "Catalytic mechanism", "impact": "Immediate 1st-order impact" },
    { "year": ${Math.round(config.startingYear + (config.endYear - config.startingYear) * 0.25)}, "event": "2nd-order systemic adaptation", "cause": "Prior systemic feedback", "impact": "Regional realignment" },
    { "year": ${Math.round(config.startingYear + (config.endYear - config.startingYear) * 0.65)}, "event": "3rd-order socio-technical evolution", "cause": "Compounding institutional dynamics", "impact": "Macro shift" },
    { "year": ${config.endYear}, "event": "Target horizon equilibrium", "cause": "Maturation of divergent systems", "impact": "Modern status quo" }
  ],
  "majorEvents": [
    { "year": ${Math.round(config.startingYear + (config.endYear - config.startingYear) * 0.15)}, "title": "Critical Turning Point 1", "description": "Concise detail", "significance": "Why it matters" },
    { "year": ${Math.round(config.startingYear + (config.endYear - config.startingYear) * 0.5)}, "title": "Critical Turning Point 2", "description": "Concise detail", "significance": "Why it matters" }
  ],
  "countriesAffected": [
    { "id": "FAC1", "name": "Primary Sovereign Faction / State", "statusChange": "Key structural trajectory", "influenceScore": 88 },
    { "id": "FAC2", "name": "Secondary Sovereign Faction / State", "statusChange": "Key structural trajectory", "influenceScore": 80 },
    { "id": "FAC3", "name": "Tertiary Sovereign Faction / State", "statusChange": "Key structural trajectory", "influenceScore": 75 }
  ],
  "economicEffects": ["3 specific economic or resource shifts"],
  "technologyEffects": ["3 specific technological or scientific shifts"],
  "socialEffects": ["3 specific cultural, demographic, or philosophical shifts"],
  "geopoliticalEffects": ["3 specific balance-of-power or territorial shifts"],
  "confidence": {
    "overall": 78,
    "causalStrength": 82,
    "plausibility": 80,
    "notes": "Evaluation of model confidence, physical limits, and vulnerabilities"
  },
  "uncertainties": ["2-3 largest blindspots or high-variance tipping points"],
  "alternativePossibilities": ["2 alternative plausible branch pathways"],
  "questionsForOtherAgents": ["2 pointed challenges for fellow analysts"]
}`;
}

export function buildDebatePrompt(params: {
  currentAgent: SelectedExpertConfig | string;
  round: number;
  totalRounds: number;
  config: SimulationConfig;
  parsedScenario?: ParsedScenarioModel;
  allTheses: Array<{ role: string; name: string; thesis: string; confidence: number }>;
  recentDebateHistory: Array<{ round: number; agent: string; claim: string; critiqueOrDefense?: string; position?: string }>;
}): string {
  const roleId = typeof params.currentAgent === 'string' ? params.currentAgent : params.currentAgent.roleId;
  const customDef = typeof params.currentAgent === 'string' ? undefined : params.currentAgent.customDef;
  const meta = getExpertMeta(roleId, customDef);
  const styleDirective = getCommunicationStyleDirective(params.config.communicationStyle);

  const roundType = 
    params.round === 1 ? 'THESIS_PRESENTATION_AND_OPENING_CHALLENGES' :
    params.round === 2 ? 'INTER_AGENT_CRITIQUE_AND_CONTRADICTION_DETECTION' :
    params.round === 3 ? 'DEFENSE_REBUTTAL_AND_CAUSAL_CALIBRATION' :
    params.round === 4 ? 'CONSENSUS_NEGOTIATION_AND_BRANCH_IDENTIFICATION' :
    'FINAL_POSITION_STATEMENT';

  return `You are acting as ${meta.name} (${meta.title}) in Round ${params.round} of ${params.totalRounds} of the Agent Debate Arena.

SCENARIO: "${params.config.scenarioTitle}" (${params.config.startingYear} - ${params.config.endYear})
DESCRIPTION: "${params.config.scenarioDescription}"
ROUND OBJECTIVE: ${roundType}
${styleDirective}

EXPERT COHORT THESES:
${params.allTheses.map(t => `- [${t.role.toUpperCase()}] ${t.name}: "${t.thesis}" (Confidence: ${t.confidence}%)`).join('\n')}

RECENT DEBATE TRANSCRIPT:
${params.recentDebateHistory.map(h => `R${h.round} [${h.agent.toUpperCase()}]: ${h.claim} ${h.critiqueOrDefense ? `| Context: ${h.critiqueOrDefense}` : ''}`).join('\n')}

FORMAT REQUIREMENTS:
1. Position: 1-2 concise, clear paragraphs stating your current stance on this scenario.
2. Challenge: One clear, specific disagreement or question targeting another expert's premise.
3. Response: One clear response/rebuttal to points raised against your domain.
4. Confidence: Numeric score (0-100).
5. Status: One of "agreeing" | "disagreeing" | "revising" | "neutral".

Output strictly valid JSON matching this schema:
{
  "agent": "${meta.role}",
  "agentName": "${meta.name}",
  "round": ${params.round},
  "type": "${params.round === 1 ? 'claim' : params.round === 2 ? 'critique' : params.round === 3 ? 'defense' : params.round === 4 ? 'synthesis_proposal' : 'final_stance'}",
  "status": "disagreeing",
  "targetAgent": "another_expert_role",
  "targetClaim": "Summary of specific opposing premise",
  "claim": "Your punchy core takeaway (1 sentence)",
  "position": "1-2 concise paragraphs summarizing your position clearly.",
  "challenge": "One clear disagreement with another expert's assumptions.",
  "response": "One clear response or defense regarding your discipline's causal principles.",
  "evidence": "Causal principle, physical constraint, or historical analogy cited",
  "confidence": 78,
  "stanceShift": {
    "previousConfidence": 82,
    "newConfidence": 78,
    "reason": "Why you calibrated your stance"
  }
}`;
}

export function buildSynthesisPrompt(params: {
  config: SimulationConfig;
  parsedScenario?: ParsedScenarioModel;
  researchPackets: Record<string, any>;
  debateMessages: any[];
  debateRounds: any[];
}): string {
  const styleDirective = getCommunicationStyleDirective(params.config.communicationStyle);
  const assumptionsContext = params.parsedScenario ? `
PARSED SCENARIO MODEL:
- Given: ${params.parsedScenario.given.join('; ')}
- Required Assumptions: ${params.parsedScenario.requiredAssumptions.join('; ')}
- Derived Assumptions: ${params.parsedScenario.derivedAssumptions.join('; ')}
- Affected Domains: ${params.parsedScenario.affectedDomains.join(', ')}
- Unaffected Invariant Domains: ${params.parsedScenario.unaffectedDomains.join(', ')}
` : '';

  return `You are the Chronos Multi-Perspective Synthesis Engine.
Synthesize the final, cohesive WorldState JSON based on the independent research dossiers and multi-round debate of the configured expert cohort.

SCENARIO: "${params.config.scenarioTitle}"
DESCRIPTION: "${params.config.scenarioDescription}"
TIMELINE: ${params.config.startingYear} to ${params.config.endYear}
${styleDirective}
${assumptionsContext}

EXPERT DOSSIERS & THESES:
${Object.entries(params.researchPackets).map(([role, p]) => `[${role.toUpperCase()}]: Thesis: ${p?.thesis || 'N/A'}, Confidence: ${p?.confidence?.overall || 70}%`).join('\n')}

DEBATE EVOLUTION & KEY ARGUMENTS:
${params.debateMessages.slice(-12).map(m => `R${m.round} [${m.agent} -> ${m.targetAgent || 'All'}]: ${m.claim} (Status: ${m.status || 'neutral'}, Conf: ${m.confidence}%)`).join('\n')}

REQUIREMENTS:
1. Synthesize an internally consistent alternate world tailored completely to this scenario.
2. Formulate clear, scenario-specific sovereign factions/entities, alliances, strategic flashpoints, trade corridors, and timeline.
3. Classify causal effects into Direct (1st order), Cascading (2nd order), Structural (3rd order), and Long-term equilibrium.
4. Output strictly valid JSON matching this schema:

{
  "finalWorldName": "Evocative Title of this Synthesized Alternate World",
  "scenarioSummary": "2-3 sentence overview of this alternate world state.",
  "executiveSummary": "Comprehensive 3-4 paragraph analytical summary detailing the divergence mechanics, institutional adaptations, and modern state of civilization at ${params.config.endYear}.",
  "divergencePoint": {
    "year": ${params.config.startingYear},
    "event": "Precise catalyst of divergence",
    "mechanism": "Why this catalyst shifted the trajectory"
  },
  "startingConditions": ["3-4 critical baseline conditions at start year ${params.config.startingYear}"],
  "countries": [
    {
      "id": "FAC1",
      "name": "Faction / State Name",
      "government": "Government / Organizational Model",
      "ideology": "Dominant Ideology / Operating Paradigm",
      "capital": "Seat of Power / Primary Hub",
      "populationEstimate": "Population or Entity Count",
      "economicStrength": 85,
      "militaryStrength": 80,
      "technologyLevel": 88,
      "stabilityScore": 78,
      "alliances": ["Alliance / Treaty Name"],
      "rivals": ["Rival Faction Name"],
      "blocId": "bloc_1",
      "statusNotes": "Analytical summary of status and influence.",
      "simulatedBorderChanges": "Territorial or jurisdictional domain.",
      "confidence": 82
    }
  ],
  "alliances": [
    {
      "id": "bloc_1",
      "name": "Dominant Alliance / Compact / League",
      "leaderCountryId": "FAC1",
      "memberCountryIds": ["FAC1", "FAC2"],
      "ideology": "Guiding Charter / Ideology",
      "description": "Strategic, logistical, and defense coordination scope.",
      "color": "#C5A059"
    }
  ],
  "conflicts": [
    {
      "id": "flash_1",
      "name": "Strategic Friction / Flashpoint Name",
      "location": "Geographic / Territorial Location",
      "coordinates": [25.0, 45.0],
      "partiesInvolved": ["FAC1", "FAC2"],
      "nature": "cold_war",
      "description": "Nature of dispute over resources, territory, or doctrine.",
      "riskLevel": "moderate"
    }
  ],
  "tradeRoutes": [
    {
      "id": "trade_1",
      "name": "Primary Logistics / Trade Corridor Name",
      "startPoint": "Origin Hub",
      "endPoint": "Destination Hub",
      "pathCoordinates": [[20.0, 10.0], [35.0, 50.0], [50.0, 80.0]],
      "dominantCommodities": ["Commodity 1", "Commodity 2"],
      "controllingPowers": ["FAC1", "FAC2"],
      "volumeLevel": "dominant"
    }
  ],
  "technologyState": {
    "category": "Alternative Technological Matrix",
    "description": "Overview of scientific and technological paradigms.",
    "advancedAheadOfHistory": ["Tech advance 1", "Tech advance 2"],
    "delayedOrNeverInvented": ["Delayed tech 1", "Delayed tech 2"],
    "alternativeTechnologicalPaths": ["Alternative path 1", "Alternative path 2"]
  },
  "culturalSocietalEvolution": [
    "Cultural evolution point 1",
    "Cultural evolution point 2"
  ],
  "unaffectedSystems": [
    "Invariant system 1 preserved by causal bounding",
    "Invariant system 2"
  ],
  "causalPropagation": {
    "directEffects": ["1st-order direct shock 1", "1st-order direct shock 2"],
    "secondOrderEffects": ["2nd-order cascading response 1", "2nd-order cascading response 2"],
    "thirdOrderEffects": ["3rd-order structural adaptation 1", "3rd-order structural adaptation 2"],
    "longTermEquilibrium": ["Equilibrium state 1", "Equilibrium state 2"]
  },
  "timeline": [
    {
      "id": "tl_1",
      "year": ${params.config.startingYear},
      "title": "Divergence Inflection",
      "category": "divergence",
      "description": "Detailed event description.",
      "primaryRegion": "Primary Domain",
      "agentAgreementLevel": "full",
      "confidence": 95
    },
    {
      "id": "tl_2",
      "year": ${Math.round(params.config.startingYear + (params.config.endYear - params.config.startingYear) * 0.35)},
      "title": "First-Order Systemic Reorganization",
      "category": "political",
      "description": "Detailed event description.",
      "primaryRegion": "Primary Domain",
      "agentAgreementLevel": "majority",
      "confidence": 85
    },
    {
      "id": "tl_3",
      "year": ${params.config.endYear},
      "title": "Modern Counterfactual Status Quo",
      "category": "political",
      "description": "Detailed event description.",
      "primaryRegion": "Primary Domain",
      "agentAgreementLevel": "full",
      "confidence": 88
    }
  ],
  "causalGraph": [
    {
      "id": "node_1",
      "year": ${params.config.startingYear},
      "label": "Divergence Inflection",
      "category": "Divergence",
      "description": "Initial catalyst.",
      "dependsOnIds": [],
      "confidence": 95,
      "supportingAgents": ["historian", "futurist"],
      "dissentingAgents": []
    },
    {
      "id": "node_2",
      "year": ${params.config.endYear},
      "label": "Mature Divergent Equilibrium",
      "category": "Synthesis State",
      "description": "Compounded modern reality.",
      "dependsOnIds": ["node_1"],
      "confidence": 85,
      "supportingAgents": ["historian", "futurist"],
      "dissentingAgents": []
    }
  ],
  "uncertaintiesAndCaveats": [
    "Uncertainty 1 regarding systemic fragility",
    "Uncertainty 2 regarding alternative tipping points"
  ],
  "agentAgreementBreakdown": {
    "highConsensusAreas": [
      "Consensus area 1 across specialists",
      "Consensus area 2"
    ],
    "disputedTopics": [
      {
        "topic": "Core Disputed Question",
        "majorityView": "Majority perspective and causal reasoning",
        "minorityView": "Minority critique and alternative hypothesis",
        "advocates": ["Specialist A (Majority)", "Specialist B (Minority)"]
      }
    ]
  },
  "alternativeBranches": [
    {
      "id": "branch_alpha",
      "name": "Alternative Branch Alpha",
      "keyDivergence": "Secondary decision or tipping point",
      "probabilityScore": 35,
      "description": "How the alternative world develops under this variation.",
      "supportingAgents": ["historian"]
    }
  ],
  "synthesisConfidence": 85
}`;
}
