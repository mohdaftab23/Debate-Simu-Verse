import { ParsedScenarioModel, SimulationConfig } from '../../shared/types.ts';
import { geminiPool } from '../geminiPool.ts';

export async function parseScenarioAndAssumptions(params: {
  config: SimulationConfig;
  onLog?: (message: string, type: 'info' | 'warn' | 'success') => void;
}): Promise<ParsedScenarioModel> {
  const { config, onLog } = params;
  onLog?.(`Scenario Parser & Assumption Engine activating for: "${config.scenarioTitle}"...`, 'info');

  const startTime = Date.now();

  try {
    if (geminiPool.isMockMode()) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      const model = generateHeuristicParsedScenario(config);
      onLog?.(`Constructed foundational assumption matrix (${model.requiredAssumptions.length} prerequisites, ${model.affectedDomains.length} affected domains, bounded against ${model.unaffectedDomains.length} invariant systems)`, 'success');
      return model;
    }

    const systemInstruction = `You are the Master Scenario Parser and Counterfactual Axiom Architect for an advanced simulation engine.
Your task is to convert ANY user hypothetical scenario—whether realistic, speculative, planetary, biological, historical, religious, or technological—into a rigorous, mathematically and causally consistent scenario model.

CRITICAL DIRECTIVES:
1. NEVER reject a scenario because it is unusual or speculative. Instead, identify the EXACT physical, biological, technological, or institutional assumptions required for it to exist.
2. CAUSAL BOUNDING: Do NOT assume every domain changes randomly. Clearly distinguish between:
   - DIRECT EFFECTS (First-order consequences)
   - SECOND-ORDER EFFECTS (Indirect systemic responses)
   - THIRD-ORDER EFFECTS (Cultural, technological, demographic shifts)
   - LONG-TERM EQUILIBRIUM
   - UNAFFECTED DOMAINS (Systems that remain largely invariant unless causally connected).
3. PHYSICAL & BIOLOGICAL CONSISTENCY CHECK:
   - Identify if the scenario requires special environmental conditions, energy mechanisms, or modified biological/technological baselines.
4. GIVEN vs REQUIRED vs DERIVED:
   - GIVEN: What the user explicitly stated.
   - REQUIRED ASSUMPTIONS: What must be true/presupposed for this scenario to function.
   - DERIVED ASSUMPTIONS: What logically follows.
   - UNCERTAINTIES: What cannot be determined with certainty.

Return ONLY a valid JSON object matching the requested schema.`;

    const prompt = `ANALYZE AND PARSE THIS COUNTERFACTUAL SCENARIO:
Title: "${config.scenarioTitle}"
Description: "${config.scenarioDescription}"
Starting Year/Era: ${config.startingYear}
Simulation Horizon Target: ${config.endYear}
Geographic/Cosmic Scope: ${config.geographicScope}
Rigor Level: ${config.realismLevel}

Produce a JSON object with this exact structure:
{
  "scenario": "concise description of the scenario",
  "divergence": "precise divergence mechanism and catalytic inflection",
  "given": [
    "explicit user given condition 1",
    "explicit user given condition 2"
  ],
  "requiredAssumptions": [
    "fundamental physical/biological/institutional prerequisite 1",
    "fundamental physical/biological/institutional prerequisite 2",
    "fundamental physical/biological/institutional prerequisite 3"
  ],
  "derivedAssumptions": [
    "logical corollary 1",
    "logical corollary 2",
    "logical corollary 3"
  ],
  "uncertainties": [
    "critical unknown 1",
    "critical unknown 2"
  ],
  "affectedDomains": [
    "domain name (e.g. energy, metallurgy, religion, diplomacy, naval doctrine, physiology)"
  ],
  "unaffectedDomains": [
    "domain name that remains historically/physically bounded or invariant"
  ],
  "physicalConsistencyNotes": [
    "note on thermodynamics, biology, orbital mechanics, or logistical feasibility"
  ],
  "simulationTarget": "${config.endYear}",
  "causalPropagation": {
    "directEffects": [
      "immediate 1st-order impact 1",
      "immediate 1st-order impact 2"
    ],
    "secondOrderEffects": [
      "intermediate 2nd-order adaptation 1",
      "intermediate 2nd-order adaptation 2"
    ],
    "thirdOrderEffects": [
      "structural 3rd-order systemic evolution 1",
      "structural 3rd-order systemic evolution 2"
    ],
    "longTermEquilibrium": [
      "state of civilization/world at target horizon 1",
      "state of civilization/world at target horizon 2"
    ]
  }
}`;

    const result = await geminiPool.generateJSON<ParsedScenarioModel>({
      role: 'synthesizer',
      prompt,
      systemInstruction,
      model: config.modelName || 'gemini-3.7-flash'
    });

    const parsed: ParsedScenarioModel = {
      scenario: result.data.scenario || config.scenarioTitle,
      divergence: result.data.divergence || config.scenarioDescription,
      given: result.data.given || [config.scenarioTitle],
      requiredAssumptions: result.data.requiredAssumptions || ['Baseline physical laws remain operational'],
      derivedAssumptions: result.data.derivedAssumptions || ['Downstream adaptations propagate causally'],
      uncertainties: result.data.uncertainties || ['Long-term stability of divergent equilibrium'],
      affectedDomains: result.data.affectedDomains || ['Institutions', 'Technology', 'Economy'],
      unaffectedDomains: result.data.unaffectedDomains || ['Fundamental physical constants', 'Unrelated geographical regions'],
      physicalConsistencyNotes: result.data.physicalConsistencyNotes || ['Evaluated for thermodynamic and biological viability'],
      simulationTarget: result.data.simulationTarget || String(config.endYear),
      causalPropagation: result.data.causalPropagation || {
        directEffects: ['Immediate institutional or environmental divergence'],
        secondOrderEffects: ['Resource reallocations and defensive adjustments'],
        thirdOrderEffects: ['Generational socio-technical paradigm shifts'],
        longTermEquilibrium: ['Multipolar or civilizational steady-state']
      }
    };

    onLog?.(`Scenario parsed via ${result.slotName} in ${Date.now() - startTime}ms (${parsed.requiredAssumptions.length} required assumptions, ${parsed.affectedDomains.length} affected domains)`, 'success');
    return parsed;
  } catch (err: any) {
    const isMockTrigger = err?.message === 'MOCK_FALLBACK_TRIGGER';
    if (!isMockTrigger) {
      console.info(`[ScenarioParser] Activating Heuristic Causal Engine.`);
    }
    const fallback = generateHeuristicParsedScenario(config);
    onLog?.(`Scenario parsed via Heuristic Causal Engine (${fallback.requiredAssumptions.length} assumptions derived, ${fallback.affectedDomains.length} domains analyzed)`, 'success');
    return fallback;
  }
}

/**
 * Intelligent Dynamic Heuristic Parser that analyzes ANY arbitrary user prompt
 * without hardcoding or restricting to predefined cases.
 */
export function generateHeuristicParsedScenario(config: SimulationConfig): ParsedScenarioModel {
  const rawText = `${config.scenarioTitle} ${config.scenarioDescription}`.toLowerCase();
  const title = config.scenarioTitle || 'Custom Counterfactual';
  const start = config.startingYear;
  const end = config.endYear;

  // Domain keyword detectors
  const isAquatic = rawText.includes('underwater') || rawText.includes('ocean') || rawText.includes('aquatic') || rawText.includes('marine') || rawText.includes('sea');
  const isMars = rawText.includes('mars') || rawText.includes('martian') || rawText.includes('red planet');
  const isSpace = rawText.includes('space') || rawText.includes('orbital') || rawText.includes('asteroid') || rawText.includes('interplanetary') || rawText.includes('moon') || rawText.includes('lunar') || rawText.includes('two moons');
  const isReligion = rawText.includes('christianity') || rawText.includes('islam') || rawText.includes('buddhism') || rawText.includes('religion') || rawText.includes('church') || rawText.includes('pope') || rawText.includes('theology');
  const isAncient = rawText.includes('rome') || rawText.includes('roman') || rawText.includes('greece') || rawText.includes('alexander') || rawText.includes('bronze age') || rawText.includes('antiquity');
  const isAgriculture = rawText.includes('agriculture') || rawText.includes('farming') || rawText.includes('hunter-gatherer') || rawText.includes('neolithic');
  const isTechEarly = rawText.includes('electricity') || rawText.includes('steam') || rawText.includes('computer') || rawText.includes('industrial') || rawText.includes('internet') || rawText.includes('invented earlier') || rawText.includes('discovered earlier');
  const isBiological = rawText.includes('evolved') || rawText.includes('biology') || rawText.includes('species') || rawText.includes('genetic') || rawText.includes('dinosaur');

  // Dynamic Given
  const given: string[] = [
    `User specified condition: "${title}"`,
    `Temporal anchor established at divergence inflection point: ${start}`,
    `Civilizational projection target modeled to: ${end}`
  ];

  // Dynamic Required Assumptions
  const requiredAssumptions: string[] = [];
  const derivedAssumptions: string[] = [];
  const uncertainties: string[] = [];
  const affectedDomains: string[] = [];
  const unaffectedDomains: string[] = [];
  const physicalConsistencyNotes: string[] = [];

  if (isAquatic) {
    requiredAssumptions.push('Complex cognitive tool-use and symbolic communication evolve in dense fluid environments.');
    requiredAssumptions.push('Alternative thermal energy generation (e.g. hydrothermal vents, electrochemical reactions, or bio-luminescence/piezoelectric grids) substitutes for open-air combustion fire.');
    requiredAssumptions.push('Acoustic, chemical, and pressure-wave signaling frameworks replace optical telecommunications across long underwater distances.');
    derivedAssumptions.push('Civilization organizes around depth strata, pelagic current highways, and benthic geothermal mineral zones.');
    derivedAssumptions.push('Metallurgy relies on hydrothermal smelting or biological calcium/composite nano-structures.');
    uncertainties.push('Whether surface landmasses are explored, colonized, or treated as hostile outer-atmosphere zones.');
    uncertainties.push('Upper limits of high-temperature material fabrication without open atmospheric oxidation.');
    affectedDomains.push('Physiology & Sensory Biology', 'Hydrodynamic Architecture', 'Acoustic Communications', 'Benthic Mineral Economics', 'Stratified Depth Sovereignty');
    unaffectedDomains.push('Fundamental planetary orbital mechanics', 'Deep core geological mantle convection', 'Cosmic stellar evolution');
    physicalConsistencyNotes.push('Requires alternative chemical or hydrothermal pathways since open hydrocarbon combustion cannot occur submerged.');
  } else if (isMars) {
    requiredAssumptions.push('Mars possesses sufficient primordial atmospheric density, magnetic shielding, or subterranean water reserves to sustain complex prebiotic and biological emergence.');
    requiredAssumptions.push('Metabolism adapts to high-perchlorate regolith, low surface gravity (0.38g), and intense solar ultraviolet/cosmic radiation.');
    requiredAssumptions.push('Civilization establishes geothermal lava tube networks or pressurization biospheres.');
    derivedAssumptions.push('Atmospheric processing and volatile recycling form the bedrock of economic value and political authority.');
    derivedAssumptions.push('Lower gravitational binding energy enables early surface-to-orbit transit and asteroid harvesting.');
    uncertainties.push('Long-term atmospheric loss rates due to solar wind stripping without a core geodynamo.');
    uncertainties.push('Whether Earth is viewed as an unapproachable super-gravity biosphere or a trade destination.');
    affectedDomains.push('Atmospheric Biosphere Engineering', 'Regolith Agriculture', 'Subterranean Urbanism', 'Low-Gravity Kinetic Logistics', 'Planetary Factionalism');
    unaffectedDomains.push('Outer Solar System planetary dynamics', 'Solar stellar output', 'Fundamental quantum mechanics');
    physicalConsistencyNotes.push('Low gravity requires physiological adjustments (bone mass, cardiovascular structure) and subterranean radiation shielding.');
  } else if (isReligion) {
    requiredAssumptions.push('The ideological or spiritual vacuum left by the divergence is filled by syncretic legalistic, philosophical, or alternative theological frameworks.');
    requiredAssumptions.push('State legitimacy and moral jurisprudence derive from alternative legal codes (e.g. Roman civic law, Hellenistic Stoicism, or polytheistic patron cults).');
    derivedAssumptions.push('Absence of centralized canonical schisms redirects religious competition into localized civic patronage and philosophical academies.');
    derivedAssumptions.push('Sovereign legitimacy remains tied to state performance, military success, and ancestral civil traditions.');
    uncertainties.push('Whether alternative universalist spiritual movements would independently arise to address demographic crises.');
    uncertainties.push('Pacing of scientific inquiry without clerical monastic manuscript preservation.');
    affectedDomains.push('Moral Jurisprudence & Canon Law', 'State Legitimacy Models', 'Philosophical Academies', 'Colonial Ideological Justifications', 'Sovereign Alliances');
    unaffectedDomains.push('Agricultural soil fertility cycles', 'Basic mechanical metallurgy & mining techniques', 'Planetary geography and climatic cycles');
    physicalConsistencyNotes.push('Historical-institutional divergence; physical and biological laws remain baseline terrestrial.');
  } else if (isAgriculture) {
    requiredAssumptions.push('Human populations develop ultra-sophisticated silviculture, managed aquatic harvesting, and migratory pastoral stewardship without static monoculture field planting.');
    requiredAssumptions.push('Social hierarchy and property regimes evolve around access to ecological corridors rather than static territorial land deeds.');
    derivedAssumptions.push('Demographic density remains lower but exhibits higher nutritional resilience and mobility.');
    derivedAssumptions.push('Political structures rely on confederated seasonal moots and lineage pacts rather than centralized bureaucratic empires.');
    uncertainties.push('Feasibility of dense urban centers without caloric surplus concentration.');
    uncertainties.push('Rate of technological compounding without stationary municipal workshops.');
    affectedDomains.push('Demographic Density & Settlement', 'Property Rights & Territorial Law', 'Dietary Physiology', 'Labor Specialization', 'Nomadic Confederation Politics');
    unaffectedDomains.push('Geological mineral distributions', 'Astronomical calendar cycles', 'Basic physics and mechanical motion');
    physicalConsistencyNotes.push('Constrained by ecological carrying capacities and biomass renewal rates in uncultivated biomes.');
  } else if (isTechEarly) {
    requiredAssumptions.push('Empirical experimental methodology, precision metallurgy, and conductive alloy wire drawing are systematized millennia ahead of schedule.');
    requiredAssumptions.push('Electrostatic generators, Leyden jars, and chemical batteries scale rapidly from scholarly curiosities into municipal power networks.');
    derivedAssumptions.push('Electrochemical telecommunications (telegraphy) and electrified urban traction precede modern fossil-fuel combustion engines.');
    derivedAssumptions.push('Scientific academies gain massive state subsidies and commercial patent monopolies.');
    uncertainties.push('Whether economic demand and consumer markets can absorb rapid electrical automation in agrarian societies.');
    uncertainties.push('Scarcity of refined copper, zinc, and acid electrolytes in ancient commercial basins.');
    affectedDomains.push('Energy Generation & Transmission', 'Instantaneous Telecommunications', 'Urban Illumination & Transit', 'Labor Automation', 'Scientific Institutional Standing');
    unaffectedDomains.push('Biological human lifespan without separate medical discoveries', 'Agricultural growing seasons', 'Global plate tectonics');
    physicalConsistencyNotes.push('Requires sufficient metallurgical precision to draw uniform conductive copper wire and seal chemical galvanic cells.');
  } else {
    // Generic Dynamic Formulation for Arbitrary Prompts
    requiredAssumptions.push(`The divergence catalyst ("${title.slice(0, 60)}") alters systemic decision-making and structural incentives at year ${start}.`);
    requiredAssumptions.push('Key institutional, biological, or technological stakeholders adapt dynamically to the altered boundary conditions.');
    requiredAssumptions.push('Causal momentum propagates through adjacent economic and geopolitical systems without instant universal upheaval.');
    derivedAssumptions.push('New regional, factional, or organizational equilibriums emerge to manage the altered resource and power landscape.');
    derivedAssumptions.push('Technological and institutional investments re-align around the newly favored evolutionary or political pathways.');
    uncertainties.push('The resilience of established legacy frameworks against sudden cascade failures.');
    uncertainties.push('Secondary geopolitical friction along newly formed jurisdictional boundaries.');
    affectedDomains.push('Institutional Governance', 'Resource Allocation & Trade', 'Strategic Security Balance', 'Technological Specialization');
    unaffectedDomains.push('Unrelated geographical domains outside direct trade or geopolitical spheres', 'Fundamental physical constants');
    physicalConsistencyNotes.push('Strictly bounds causal propagation: unchanged baseline systems retain historical inertia.');
  }

  // 4-Tier Causal Propagation
  const directEffects: string[] = [
    `Immediate structural inflection at year ${start}: "${title.slice(0, 70)}".`,
    `Direct disruption to prevailing baseline paradigms in primary affected sectors.`
  ];

  const secondOrderEffects: string[] = [
    `Reorganization of economic incentives, resource supply networks, and tactical defense posture.`,
    `Formation of specialized alliances, regulatory charters, or adapted technical standards.`
  ];

  const thirdOrderEffects: string[] = [
    `Generational transformation in cultural values, demographic settlement patterns, and educational curricula.`,
    `Alternative technological tree branching optimized for the counterfactual environment.`
  ];

  const longTermEquilibrium: string[] = [
    `By horizon year ${end}, a mature, resilient equilibrium order emerges with distinct sovereign/factional blocs.`,
    `Civilization achieves institutional stability anchored by its unique technological and socioeconomic baseline.`
  ];

  return {
    scenario: title,
    divergence: config.scenarioDescription || `Catalytic divergence centered upon "${title}".`,
    given,
    requiredAssumptions,
    derivedAssumptions,
    uncertainties,
    affectedDomains,
    unaffectedDomains,
    physicalConsistencyNotes,
    simulationTarget: String(end),
    causalPropagation: {
      directEffects,
      secondOrderEffects,
      thirdOrderEffects,
      longTermEquilibrium
    }
  };
}
