import { Router, Request, Response } from 'express';
import { simulationService } from './simulationService.ts';
import { geminiPool } from './geminiPool.ts';
import { aiProviderManager } from './providers/aiProviderManager.ts';
import { PRESET_SCENARIOS } from '../shared/presets.ts';
import { SimulationConfig, EXPERT_ROLE_REGISTRY, ProviderType } from '../shared/types.ts';
import { suggestExpertsForScenario } from './agents/expertRecommender.ts';

export const apiRouter = Router();

// Providers Registry & Models
apiRouter.get('/providers', (req: Request, res: Response) => {
  const models = aiProviderManager.listAllModels();
  res.json({ success: true, providers: models });
});

// Test/Validate a user-provided API key
apiRouter.post('/providers/test', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, model } = req.body;
    if (!provider) {
      return res.status(400).json({ success: false, error: 'Provider is required' });
    }
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'API key is required for testing' });
    }

    const testResult = await aiProviderManager.validateKey(provider as ProviderType, apiKey, model);
    res.json({ success: true, result: testResult });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      result: {
        valid: false,
        provider: req.body?.provider,
        model: req.body?.model,
        error: err?.message || 'Key validation failed'
      }
    });
  }
});

// Presets
apiRouter.get('/presets', (req: Request, res: Response) => {
  res.json({ success: true, presets: PRESET_SCENARIOS });
});

// Expert Library List
apiRouter.get('/experts/library', (req: Request, res: Response) => {
  res.json({ success: true, experts: EXPERT_ROLE_REGISTRY });
});

// Suggest Experts for a Scenario
apiRouter.post('/simulations/suggest-experts', async (req: Request, res: Response) => {
  try {
    const { scenarioTitle, scenarioDescription, count, modelName, provider, userKeys } = req.body;
    if (!scenarioTitle) {
      return res.status(400).json({ success: false, error: 'Scenario title is required' });
    }
    const result = await suggestExpertsForScenario({
      scenarioTitle,
      scenarioDescription: scenarioDescription || '',
      count: count || 4,
      modelName,
      provider,
      userKeys
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to suggest experts' });
  }
});

// Generate Conceptual World Map Cover Art & Prompt
apiRouter.post('/simulations/generate-cover-art', async (req: Request, res: Response) => {
  try {
    const { scenarioTitle, scenarioDescription, startingYear, endYear, style, provider, modelName, userKeys } = req.body;
    if (!scenarioTitle) {
      return res.status(400).json({ success: false, error: 'Scenario title is required' });
    }

    // Generate rich thematic prompt descriptor
    const systemPrompt = `You are a master historical cartographer and visual art director.
Generate a concise, evocative visual prompt and metadata for an alternate-history conceptual world map cover art.
Return ONLY valid JSON matching this schema:
{
  "recommendedStyle": "imperial_gold" | "obsidian_noir" | "tactical_holo" | "renaissance_chart" | "steampunk_brass" | "cosmic_orbital",
  "latinMotto": "string (e.g. Terra Nova In Perpetuum)",
  "cartographicTheme": "string (1 line summary of visual atmosphere)",
  "prominentGeographicFeatures": ["string", "string"],
  "divergentTradeArtery": "string",
  "artisticPrompt": "string (A detailed 60-word visual prompt suitable for image generation, describing textures, colors, cartographic embellishments, lighting, and mood)"
}`;

    let aiMetadata = {
      recommendedStyle: style || 'imperial_gold',
      latinMotto: 'VERITAS EX NIHILO • AETAS DIVERGENTIA',
      cartographicTheme: `Speculative cartography of ${scenarioTitle}`,
      prominentGeographicFeatures: ['Divergent sovereign borders', 'Re-routed maritime corridors'],
      divergentTradeArtery: 'Grand Trans-Continental Artery',
      artisticPrompt: `A dramatic high-contrast antique conceptual world map cover art for "${scenarioTitle}", featuring illuminated golden cartographic boundaries, intricate astrolabe compass rose, deep textured slate parchment, rich gold leaf highlights, glowing trade routes, and cinematic historical atmosphere.`
    };

    if (!aiProviderManager.isMockMode() || (userKeys && Object.keys(userKeys).length > 0)) {
      try {
        const response = await aiProviderManager.generateJSON<any>({
          role: 'futurist',
          systemInstruction: systemPrompt,
          prompt: `Scenario Title: ${scenarioTitle}\nDescription: ${scenarioDescription || ''}\nTimeframe: ${startingYear || 1880} to ${endYear || 1950}`,
          provider: provider || 'gemini',
          model: modelName,
          userKeys,
          useHighThinking: false
        });
        const parsed = response.data;
        if (parsed && parsed.artisticPrompt) {
          aiMetadata = { ...aiMetadata, ...parsed };
        }
      } catch (genErr: any) {
        if (genErr?.message !== 'MOCK_FALLBACK_TRIGGER') {
          console.info('Using procedural cartographic metadata fallback:', genErr?.message || genErr);
        }
      }
    }

    res.json({
      success: true,
      metadata: aiMetadata
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to generate cover art' });
  }
});

// System Status & Key Pool
apiRouter.get('/system/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: {
      ...geminiPool.getStatus(),
      providerStatus: aiProviderManager.getStatus()
    }
  });
});

apiRouter.post('/system/toggle-mock', (req: Request, res: Response) => {
  const current = geminiPool.isMockMode();
  geminiPool.setMockMode(!current);
  res.json({ success: true, mockMode: !current, message: `Mock Mode ${!current ? 'Enabled' : 'Disabled'}` });
});

apiRouter.post('/system/set-slot-model', (req: Request, res: Response) => {
  const { slotId, model } = req.body;
  if (slotId && model) {
    geminiPool.setSlotModel(slotId, model);
  }
  res.json({ success: true, status: geminiPool.getStatus() });
});

// List simulations (History)
apiRouter.get('/simulations', (req: Request, res: Response) => {
  const list = simulationService.listSimulations();
  res.json({ success: true, simulations: list });
});

// Start new simulation
apiRouter.post('/simulations/start', async (req: Request, res: Response) => {
  try {
    const config: SimulationConfig = req.body.config;
    if (!config || !config.scenarioTitle) {
      return res.status(400).json({ success: false, error: 'Scenario title is required.' });
    }

    const simulation = await simulationService.startSimulation(config);
    res.json({ success: true, simulation });
  } catch (err: any) {
    console.error('Error starting simulation:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to start simulation' });
  }
});

// Get simulation by ID
apiRouter.get('/simulations/:id', (req: Request, res: Response) => {
  const sim = simulationService.getSimulation(req.params.id);
  if (!sim) {
    return res.status(404).json({ success: false, error: 'Simulation not found' });
  }
  res.json({ success: true, simulation: sim });
});

// Server-Sent Events (SSE) Stream
apiRouter.get('/simulations/:id/stream', (req: Request, res: Response) => {
  const sim = simulationService.getSimulation(req.params.id);
  if (!sim) {
    return res.status(404).json({ success: false, error: 'Simulation not found' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  res.flushHeaders();

  // Send initial state snapshot
  res.write(`event: initial_state\ndata: ${JSON.stringify(sim)}\n\n`);

  const emitter = simulationService.getEventEmitter(sim.id);

  const onLog = (logItem: any) => {
    res.write(`event: log\ndata: ${JSON.stringify(logItem)}\n\n`);
  };

  const onStageChange = (data: any) => {
    res.write(`event: stage_change\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onResearchPacket = (data: any) => {
    res.write(`event: research_packet\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onDebateMessage = (data: any) => {
    res.write(`event: debate_message\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onDebateRoundComplete = (data: any) => {
    res.write(`event: debate_round_complete\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onWorldStateReady = (data: any) => {
    res.write(`event: world_state_ready\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onStateUpdate = (data: any) => {
    res.write(`event: state_update\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onCompleted = (data: any) => {
    res.write(`event: completed\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onStatusChange = (data: any) => {
    res.write(`event: status_change\ndata: ${JSON.stringify(data)}\n\n`);
  };

  emitter.on('log', onLog);
  emitter.on('stage_change', onStageChange);
  emitter.on('research_packet', onResearchPacket);
  emitter.on('debate_message', onDebateMessage);
  emitter.on('debate_round_complete', onDebateRoundComplete);
  emitter.on('world_state_ready', onWorldStateReady);
  emitter.on('state_update', onStateUpdate);
  emitter.on('completed', onCompleted);
  emitter.on('status_change', onStatusChange);

  // Keep-alive heartbeat every 15s
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    emitter.off('log', onLog);
    emitter.off('stage_change', onStageChange);
    emitter.off('research_packet', onResearchPacket);
    emitter.off('debate_message', onDebateMessage);
    emitter.off('debate_round_complete', onDebateRoundComplete);
    emitter.off('world_state_ready', onWorldStateReady);
    emitter.off('state_update', onStateUpdate);
    emitter.off('completed', onCompleted);
    emitter.off('status_change', onStatusChange);
  });
});

// Stop simulation
apiRouter.post('/simulations/:id/stop', (req: Request, res: Response) => {
  simulationService.stopSimulation(req.params.id);
  res.json({ success: true, message: 'Simulation stopped' });
});

// Branch simulation
apiRouter.post('/simulations/:id/branch', async (req: Request, res: Response) => {
  try {
    const { branchName, keyDivergence } = req.body;
    if (!branchName) {
      return res.status(400).json({ success: false, error: 'Branch name is required' });
    }
    const branched = await simulationService.branchSimulation(req.params.id, branchName, keyDivergence || '');
    res.json({ success: true, simulation: branched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to branch simulation' });
  }
});

// Chat with agents or world archivist
apiRouter.post('/simulations/:id/chat', async (req: Request, res: Response) => {
  try {
    const { question, targetRole } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }
    const chatMsg = await simulationService.askAgentOrChronicler({
      simulationId: req.params.id,
      question,
      targetRole
    });
    res.json({ success: true, message: chatMsg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Chat query failed' });
  }
});
