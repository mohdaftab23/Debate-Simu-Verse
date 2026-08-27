import { SimulationConfig, SelectedExpertConfig, EXPERT_ROLE_REGISTRY, getExpertMeta } from '../../shared/types.ts';
import { geminiPool } from '../geminiPool.ts';

export interface ExpertSuggestionResult {
  suggestedExperts: Array<{
    roleId: string;
    name: string;
    title: string;
    rationale: string;
    primaryFocus: string;
  }>;
  reasoning: string;
}

export async function suggestExpertsForScenario(params: {
  scenarioTitle: string;
  scenarioDescription: string;
  count?: number;
  modelName?: string;
}): Promise<ExpertSuggestionResult> {
  const count = Math.min(5, Math.max(2, params.count || 4));
  const text = `${params.scenarioTitle} ${params.scenarioDescription}`.toLowerCase();

  try {
    if (geminiPool.isMockMode()) {
      return getHeuristicExpertSuggestions(params.scenarioTitle, params.scenarioDescription, count);
    }

    const availableRolesList = Object.entries(EXPERT_ROLE_REGISTRY)
      .filter(([id]) => id !== 'synthesizer' && id !== 'custom')
      .map(([id, meta]) => `- "${id}": ${meta.name} (${meta.title}) - Focus: ${meta.specialty}`)
      .join('\n');

    const systemInstruction = `You are the Expert Cohort Architect for counterfactual simulations.
Your job is to select the ${count} MOST RELEVANT disciplinary experts from the library below to analyze a user's counterfactual scenario.

AVAILABLE EXPERT ROLES:
${availableRolesList}

REQUIREMENTS:
1. Select exactly ${count} distinct expert roleIds from the list that best address the specific core mechanics (physics, biology, history, politics, economics, technology, philosophy, ecology, engineering) of this scenario.
2. Provide a 1-sentence rationale for why each expert is essential.
3. Output strictly valid JSON matching this schema:
{
  "suggestedExperts": [
    {
      "roleId": "role_id_from_list",
      "name": "Expert Name",
      "title": "Expert Title",
      "rationale": "Why this expert is critical for this scenario",
      "primaryFocus": "Core analytical lens"
    }
  ],
  "reasoning": "Overview of why this cohort creates balanced multi-disciplinary debate"
}`;

    const prompt = `SCENARIO:
Title: "${params.scenarioTitle}"
Description: "${params.scenarioDescription}"

Recommend the best ${count} experts.`;

    const result = await geminiPool.generateJSON<ExpertSuggestionResult>({
      role: 'synthesizer',
      prompt,
      systemInstruction,
      model: params.modelName || 'gemini-3.7-flash'
    });

    if (result.data?.suggestedExperts && result.data.suggestedExperts.length >= 2) {
      return {
        suggestedExperts: result.data.suggestedExperts.slice(0, count).map(exp => {
          const meta = getExpertMeta(exp.roleId);
          return {
            roleId: exp.roleId,
            name: meta.name || exp.name,
            title: meta.title || exp.title,
            rationale: exp.rationale || `Critical analytical specialist for ${meta.specialty}.`,
            primaryFocus: exp.primaryFocus || meta.specialty
          };
        }),
        reasoning: result.data.reasoning || `Selected optimal ${count}-expert cohort for this scenario.`
      };
    }

    return getHeuristicExpertSuggestions(params.scenarioTitle, params.scenarioDescription, count);
  } catch (err) {
    return getHeuristicExpertSuggestions(params.scenarioTitle, params.scenarioDescription, count);
  }
}

export function getHeuristicExpertSuggestions(
  title: string,
  description: string,
  count: number = 4
): ExpertSuggestionResult {
  const text = `${title} ${description}`.toLowerCase();

  let roles: string[] = [];

  if (text.includes('mars') || text.includes('martian') || text.includes('planet') || text.includes('orbit')) {
    roles = ['astronomer', 'physicist', 'engineer', 'biologist', 'geopolitician'];
  } else if (text.includes('underwater') || text.includes('ocean') || text.includes('aquatic') || text.includes('marine') || text.includes('sea')) {
    roles = ['biologist', 'microbiologist', 'engineer', 'climate_scientist', 'historian'];
  } else if (text.includes('religion') || text.includes('christianity') || text.includes('islam') || text.includes('church') || text.includes('pope')) {
    roles = ['historian', 'sociologist', 'anthropologist', 'political_scientist', 'psychologist'];
  } else if (text.includes('agriculture') || text.includes('farming') || text.includes('neolithic') || text.includes('hunter')) {
    roles = ['anthropologist', 'ecologist', 'economist', 'demographer', 'historian'];
  } else if (text.includes('electricity') || text.includes('steam') || text.includes('computer') || text.includes('internet') || text.includes('discovered earlier') || text.includes('invented earlier')) {
    roles = ['physicist', 'computer_scientist', 'economist', 'futurist', 'engineer'];
  } else if (text.includes('rome') || text.includes('ancient') || text.includes('war') || text.includes('empire') || text.includes('conquest')) {
    roles = ['historian', 'military_strategist', 'political_scientist', 'economist', 'geopolitician'];
  } else if (text.includes('climate') || text.includes('ice age') || text.includes('volcano') || text.includes('asteroid') || text.includes('moon')) {
    roles = ['geologist', 'climate_scientist', 'ecologist', 'physicist', 'demographer'];
  } else if (text.includes('virus') || text.includes('plague') || text.includes('disease') || text.includes('pandemic')) {
    roles = ['medical_scientist', 'microbiologist', 'demographer', 'economist', 'sociologist'];
  } else {
    roles = ['historian', 'economist', 'geopolitician', 'futurist', 'sociologist'];
  }

  const selectedRoles = roles.slice(0, count);

  return {
    suggestedExperts: selectedRoles.map(rId => {
      const meta = getExpertMeta(rId);
      return {
        roleId: rId,
        name: meta.name,
        title: meta.title,
        rationale: `Provides essential ${meta.specialty.toLowerCase()} perspective.`,
        primaryFocus: meta.specialty
      };
    }),
    reasoning: `Recommended balanced ${count}-discipline cohort analyzing environmental physics, institutional dynamics, and socioeconomic compounding for "${title.slice(0, 50)}".`
  };
}
