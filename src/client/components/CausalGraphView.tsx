import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  GitFork, 
  Sparkles, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Cpu, 
  Info, 
  Layers, 
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Play,
  Pause,
  Filter,
  Share2,
  HelpCircle
} from 'lucide-react';
import { CausalNode, WorldState, getExpertMeta, EXPERT_ROLE_REGISTRY } from '../../shared/types.ts';

interface CausalGraphViewProps {
  worldState: WorldState;
}

interface GraphNode extends CausalNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  orderTier: number; // 0: Root divergence, 1: 1st-order direct, 2: 2nd-order cascade, 3: 3rd-order structural, 4: Equilibrium
  orderLabel: string;
  color: string;
  glowColor: string;
}

interface GraphLink {
  source: string;
  target: string;
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
  type: 'causal_dependency' | 'dialectic_consensus' | 'propagation';
}

export const CausalGraphView: React.FC<CausalGraphViewProps> = ({ worldState }) => {
  const causalGraph = worldState.causalGraph || [];
  const propagation = worldState.causalPropagation || worldState.parsedScenario?.causalPropagation;

  const [selectedNodeId, setSelectedNodeId] = useState<string>(causalGraph[0]?.id || 'root_divergence');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<string>('all');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [isPhysicsActive, setIsPhysicsActive] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Build enriched graph nodes including parsed propagation tiers
  const initialNodesAndLinks = useMemo(() => {
    const rawNodes: GraphNode[] = [];
    const rawLinks: GraphLink[] = [];

    const startYear = worldState.divergencePoint?.year || 1914;
    const endYear = (worldState.timeline && worldState.timeline.length > 0)
      ? worldState.timeline[worldState.timeline.length - 1].year
      : startYear + 50;

    // 1. Root Divergence Node (Tier 0)
    rawNodes.push({
      id: 'root_divergence',
      year: startYear,
      label: worldState.divergencePoint?.event || 'Root Divergence Catalyst',
      category: 'Divergence Inflection',
      description: worldState.divergencePoint?.mechanism || worldState.scenarioSummary || 'The primary catalytic pivot point separating counterfactual reality from prime history.',
      dependsOnIds: [],
      confidence: 98,
      supportingAgents: ['historian', 'futurist'],
      dissentingAgents: [],
      x: 450,
      y: 90,
      vx: 0,
      vy: 0,
      radius: 28,
      orderTier: 0,
      orderLabel: 'Root Divergence (Anchor)',
      color: '#C5A059',
      glowColor: 'rgba(197, 160, 89, 0.4)'
    });

    // 2. Add explicit direct, 2nd-order, 3rd-order propagation nodes if present
    if (propagation?.directEffects && propagation.directEffects.length > 0) {
      propagation.directEffects.forEach((eff, i) => {
        const id = `direct_effect_${i + 1}`;
        rawNodes.push({
          id,
          year: Math.round(startYear + (endYear - startYear) * 0.15),
          label: eff.length > 40 ? eff.slice(0, 38) + '...' : eff,
          category: 'Direct 1st-Order',
          description: eff,
          dependsOnIds: ['root_divergence'],
          confidence: 92,
          supportingAgents: ['historian', 'economist'],
          dissentingAgents: [],
          x: 280 + i * 180,
          y: 200 + (i % 2) * 30,
          vx: 0,
          vy: 0,
          radius: 22,
          orderTier: 1,
          orderLabel: '1st-Order Direct Effect',
          color: '#52B788',
          glowColor: 'rgba(82, 183, 136, 0.35)'
        });
        rawLinks.push({
          source: 'root_divergence',
          target: id,
          type: 'propagation'
        });
      });
    }

    if (propagation?.secondOrderEffects && propagation.secondOrderEffects.length > 0) {
      propagation.secondOrderEffects.forEach((eff, i) => {
        const id = `second_order_${i + 1}`;
        const parentDirect = `direct_effect_${(i % (propagation.directEffects?.length || 1)) + 1}`;
        rawNodes.push({
          id,
          year: Math.round(startYear + (endYear - startYear) * 0.45),
          label: eff.length > 40 ? eff.slice(0, 38) + '...' : eff,
          category: 'Cascading 2nd-Order',
          description: eff,
          dependsOnIds: [parentDirect],
          confidence: 84,
          supportingAgents: ['economist', 'geopolitician'],
          dissentingAgents: [],
          x: 220 + i * 160,
          y: 330 + (i % 2) * 30,
          vx: 0,
          vy: 0,
          radius: 20,
          orderTier: 2,
          orderLabel: '2nd-Order Cascading Effect',
          color: '#6BA4B8',
          glowColor: 'rgba(107, 164, 184, 0.35)'
        });
        rawLinks.push({
          source: parentDirect,
          target: id,
          type: 'causal_dependency'
        });
      });
    }

    if (propagation?.thirdOrderEffects && propagation.thirdOrderEffects.length > 0) {
      propagation.thirdOrderEffects.forEach((eff, i) => {
        const id = `third_order_${i + 1}`;
        const parentSecond = `second_order_${(i % (propagation.secondOrderEffects?.length || 1)) + 1}`;
        rawNodes.push({
          id,
          year: Math.round(startYear + (endYear - startYear) * 0.75),
          label: eff.length > 40 ? eff.slice(0, 38) + '...' : eff,
          category: 'Structural 3rd-Order',
          description: eff,
          dependsOnIds: [parentSecond],
          confidence: 76,
          supportingAgents: ['geopolitician', 'futurist'],
          dissentingAgents: [],
          x: 260 + i * 180,
          y: 450 + (i % 2) * 25,
          vx: 0,
          vy: 0,
          radius: 18,
          orderTier: 3,
          orderLabel: '3rd-Order Structural Evolution',
          color: '#B89ACD',
          glowColor: 'rgba(184, 154, 205, 0.35)'
        });
        rawLinks.push({
          source: parentSecond,
          target: id,
          type: 'causal_dependency'
        });
      });
    }

    // 3. Add worldState.causalGraph nodes
    causalGraph.forEach((cNode, idx) => {
      // Check if already represented or unique
      if (!rawNodes.some(n => n.id === cNode.id)) {
        const progress = Math.max(0.1, Math.min(0.9, (cNode.year - startYear) / Math.max(1, endYear - startYear)));
        const tier = progress < 0.25 ? 1 : progress < 0.55 ? 2 : progress < 0.85 ? 3 : 4;
        const color = tier === 1 ? '#52B788' : tier === 2 ? '#6BA4B8' : tier === 3 ? '#B89ACD' : '#E5C384';
        
        rawNodes.push({
          ...cNode,
          x: 180 + (idx % 4) * 190 + (Math.sin(idx) * 40),
          y: 160 + tier * 100 + (Math.cos(idx) * 20),
          vx: 0,
          vy: 0,
          radius: 20,
          orderTier: tier,
          orderLabel: tier === 1 ? '1st-Order Direct' : tier === 2 ? '2nd-Order Cascading' : tier === 3 ? '3rd-Order Structural' : 'Synthesized Equilibrium',
          color,
          glowColor: `${color}55`
        });

        if (cNode.dependsOnIds && cNode.dependsOnIds.length > 0) {
          cNode.dependsOnIds.forEach(depId => {
            rawLinks.push({
              source: depId,
              target: cNode.id,
              type: 'causal_dependency'
            });
          });
        } else if (cNode.id !== 'root_divergence') {
          rawLinks.push({
            source: 'root_divergence',
            target: cNode.id,
            type: 'propagation'
          });
        }
      }
    });

    // 4. Add Final Equilibrium State Node (Tier 4)
    rawNodes.push({
      id: 'equilibrium_state',
      year: endYear,
      label: worldState.finalWorldName || 'Synthesized World Equilibrium',
      category: 'Equilibrium State',
      description: worldState.executiveSummary?.slice(0, 300) || 'The consolidated macro-equilibrium at the simulation horizon.',
      dependsOnIds: rawNodes.filter(n => n.orderTier === 3).map(n => n.id),
      confidence: worldState.synthesisConfidence || 85,
      supportingAgents: ['synthesizer', 'historian', 'economist', 'geopolitician', 'futurist'],
      dissentingAgents: [],
      x: 450,
      y: 570,
      vx: 0,
      vy: 0,
      radius: 26,
      orderTier: 4,
      orderLabel: 'Target Horizon Equilibrium (Synthesis)',
      color: '#E5C384',
      glowColor: 'rgba(229, 195, 132, 0.45)'
    });

    // Connect tier 3 nodes to equilibrium state
    rawNodes.filter(n => n.orderTier === 3).forEach(n3 => {
      rawLinks.push({
        source: n3.id,
        target: 'equilibrium_state',
        type: 'propagation'
      });
    });

    return { rawNodes, rawLinks };
  }, [worldState, causalGraph, propagation]);

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodesAndLinks.rawNodes);
  const [links, setLinks] = useState<GraphLink[]>(initialNodesAndLinks.rawLinks);

  // Sync state when worldState changes
  useEffect(() => {
    setNodes(initialNodesAndLinks.rawNodes);
    setLinks(initialNodesAndLinks.rawLinks);
    if (initialNodesAndLinks.rawNodes.length > 0) {
      setSelectedNodeId(initialNodesAndLinks.rawNodes[0].id);
    }
  }, [initialNodesAndLinks]);

  // Physics Simulation Step
  useEffect(() => {
    if (!isPhysicsActive) return;

    let isRunning = true;

    const simulate = () => {
      if (!isRunning) return;

      setNodes(prevNodes => {
        const nextNodes = prevNodes.map(n => ({ ...n }));
        const nodeMap = new Map<string, GraphNode>();
        nextNodes.forEach(n => nodeMap.set(n.id, n));

        // 1. Repulsion between all nodes
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n1 = nextNodes[i];
            const n2 = nextNodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy || 1;
            const dist = Math.sqrt(distSq);

            if (dist < 220) {
              const force = (220 - dist) / dist * 0.08;
              const fx = dx * force;
              const fy = dy * force;

              if (isDraggingNode !== n1.id && n1.orderTier !== 0 && n1.orderTier !== 4) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (isDraggingNode !== n2.id && n2.orderTier !== 0 && n2.orderTier !== 4) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. Spring attraction along links
        links.forEach(l => {
          const s = nodeMap.get(l.source);
          const t = nodeMap.get(l.target);
          if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 120;
            const force = (dist - desiredDist) * 0.02;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (isDraggingNode !== s.id && s.orderTier !== 0) {
              s.vx += fx;
              s.vy += fy;
            }
            if (isDraggingNode !== t.id && t.orderTier !== 4) {
              t.vx -= fx;
              t.vy -= fy;
            }
          }
        });

        // 3. Vertical tier gravitation (maintains clear chronological flow from top to bottom)
        const tierTargetsY = [80, 200, 320, 440, 560];
        nextNodes.forEach(n => {
          const targetY = tierTargetsY[n.orderTier] || 300;
          const dy = targetY - n.y;
          n.vy += dy * 0.04;

          // Center X gravity
          const dx = 450 - n.x;
          n.vx += dx * 0.005;

          // Damping
          n.vx *= 0.85;
          n.vy *= 0.85;

          // Apply velocity unless dragging
          if (isDraggingNode !== n.id) {
            n.x += n.vx;
            n.y += n.vy;

            // Bounds
            n.x = Math.max(70, Math.min(830, n.x));
            n.y = Math.max(50, Math.min(610, n.y));
          }
        });

        return nextNodes;
      });

      animationFrameRef.current = requestAnimationFrame(simulate);
    };

    animationFrameRef.current = requestAnimationFrame(simulate);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPhysicsActive, links, isDraggingNode]);

  // Selected node details
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (selectedOrderFilter !== 'all') {
        const orderNum = parseInt(selectedOrderFilter, 10);
        if (n.orderTier !== orderNum) return false;
      }
      if (selectedDomainFilter !== 'all') {
        if (!n.category.toLowerCase().includes(selectedDomainFilter.toLowerCase()) &&
            !n.supportingAgents.includes(selectedDomainFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [nodes, selectedOrderFilter, selectedDomainFilter]);

  // Drag node handler
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setIsDraggingNode(nodeId);
    setSelectedNodeId(nodeId);
  };

  const handleMouseMoveSvg = (e: React.MouseEvent) => {
    if (isDraggingNode) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const clientY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

      setNodes(prev => prev.map(n => {
        if (n.id === isDraggingNode) {
          return {
            ...n,
            x: Math.max(50, Math.min(850, clientX)),
            y: Math.max(40, Math.min(620, clientY)),
            vx: 0,
            vy: 0
          };
        }
        return n;
      }));
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUpSvg = () => {
    setIsDraggingNode(null);
    setIsPanning(false);
  };

  const handleStartPan = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
    }
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setNodes(initialNodesAndLinks.rawNodes);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
        <div>
          <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] mb-1.5 block font-medium">
            Interactive Causal Dynamics & Force-Directed Arbitration Graph
          </span>
          <h2 className="text-3xl sm:text-4xl serif italic text-white flex items-center gap-3">
            <span>Causal Consequence Network</span>
            <span className="px-3 py-0.5 rounded-full bg-[#1C1811] border border-[#C5A059]/40 text-[#C5A059] text-[10px] uppercase tracking-widest font-mono font-medium not-italic">
              Multi-Order Topology
            </span>
          </h2>
          <p className="text-[#888] serif italic text-sm mt-1 max-w-3xl">
            Simulating how the initial counterfactual catalyst cascades across 1st-order direct shocks, 2nd-order institutional shifts, and 3rd-order socio-technical equilibrium.
          </p>
        </div>

        {/* Graph Quick Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 bg-[#121212] p-1.5 rounded border border-[#2A2A2A]">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2.2))}
            title="Zoom In"
            className="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-[#C5A059] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.6))}
            title="Zoom Out"
            className="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-[#C5A059] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Reset Network Layout & Zoom"
            className="p-1.5 rounded hover:bg-[#222] text-[#888] hover:text-[#C5A059] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPhysicsActive(!isPhysicsActive)}
            title={isPhysicsActive ? 'Pause Physics Simulation' : 'Resume Floating Force Physics'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
              isPhysicsActive ? 'bg-[#1C1811] text-[#C5A059] border border-[#C5A059]/40' : 'bg-[#181818] text-[#888]'
            }`}
          >
            {isPhysicsActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPhysicsActive ? 'Physics On' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Order Tier Legend Bar */}
      <div className="bg-[#121212] border border-[#2A2A2A] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Order Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest font-mono text-[#777] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#C5A059]" /> Filter Order:
          </span>
          {[
            { label: 'All Orders', value: 'all', color: '#FFF' },
            { label: '0: Root Catalyst', value: '0', color: '#C5A059' },
            { label: '1st: Direct Shock', value: '1', color: '#52B788' },
            { label: '2nd: Cascading', value: '2', color: '#6BA4B8' },
            { label: '3rd: Structural', value: '3', color: '#B89ACD' },
            { label: 'Equilibrium State', value: '4', color: '#E5C384' }
          ].map(tier => {
            const isSelected = selectedOrderFilter === tier.value;
            return (
              <button
                key={tier.value}
                onClick={() => setSelectedOrderFilter(tier.value)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-[#222] text-white border border-[#555] shadow-sm ring-1 ring-[#C5A059]/30' 
                    : 'bg-[#0D0D0D] border border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>

        {/* Domain / Specialist Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[9px] uppercase tracking-widest font-mono text-[#777]">Domain / Agent:</label>
          <select
            value={selectedDomainFilter}
            onChange={(e) => setSelectedDomainFilter(e.target.value)}
            className="px-3 py-1 rounded bg-[#0A0A0A] border border-[#2A2A2A] text-xs text-[#E0E0E0] font-mono focus:border-[#C5A059]"
          >
            <option value="all">All Disciplines & Domains</option>
            <option value="historian">Historical & Institutional</option>
            <option value="economist">Macroeconomic & Trade</option>
            <option value="geopolitician">Geopolitical & Strategic</option>
            <option value="futurist">Techno-Societal Evolution</option>
            <option value="political">Political / Governance</option>
            <option value="technological">Technological Systems</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas on Left, Rich Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Force-Directed Canvas (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
          {/* Canvas Background Grid and Instructions overlay */}
          <div className="absolute top-3 left-4 pointer-events-none z-10 flex items-center gap-2 text-[10px] font-mono text-[#555]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span>DRAG NODES TO INSPECT CAUSAL TENSION • PAN & ZOOM CANVAS</span>
          </div>

          <div className="relative w-full h-[620px] bg-gradient-to-b from-[#0F0F0F] via-[#0B0B0B] to-[#080808] cursor-grab active:cursor-grabbing overflow-hidden select-none">
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox="0 0 900 640"
              onMouseDown={handleStartPan}
              onMouseMove={handleMouseMoveSvg}
              onMouseUp={handleMouseUpSvg}
              onMouseLeave={handleMouseUpSvg}
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Arrow Markers */}
                <marker
                  id="arrow-causal"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#C5A059" opacity="0.7" />
                </marker>
                <marker
                  id="arrow-propagation"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#52B788" opacity="0.6" />
                </marker>
              </defs>

              <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                {/* Horizontal Stratification Guidelines (0 to 4) */}
                {[
                  { y: 80, label: 'ORIGIN DIVERGENCE' },
                  { y: 200, label: '1ST-ORDER DIRECT SHOCKS' },
                  { y: 320, label: '2ND-ORDER CASCADING ADAPTATIONS' },
                  { y: 440, label: '3RD-ORDER STRUCTURAL DRIFT' },
                  { y: 560, label: 'CONSOLIDATED WORLD EQUILIBRIUM' }
                ].map(strat => (
                  <g key={strat.label} opacity={0.25}>
                    <line x1="40" y1={strat.y} x2="860" y2={strat.y} stroke="#333" strokeDasharray="4 6" strokeWidth="1" />
                    <text x="50" y={strat.y - 8} fill="#666" fontSize="8" fontFamily="monospace" letterSpacing="0.15em">
                      {strat.label}
                    </text>
                  </g>
                ))}

                {/* Network Links */}
                {links.map((link, idx) => {
                  const s = nodes.find(n => n.id === link.source);
                  const t = nodes.find(n => n.id === link.target);
                  if (!s || !t) return null;

                  const isConnectedToSelected = s.id === selectedNodeId || t.id === selectedNodeId;
                  const isVisible = filteredNodes.some(n => n.id === s.id) && filteredNodes.some(n => n.id === t.id);

                  if (!isVisible && selectedOrderFilter !== 'all') return null;

                  // Curved quadratic bezier path
                  const midX = (s.x + t.x) / 2 + (s.y - t.y) * 0.08;
                  const midY = (s.y + t.y) / 2 + (t.x - s.x) * 0.08;
                  const pathData = `M ${s.x} ${s.y} Q ${midX} ${midY} ${t.x} ${t.y}`;

                  return (
                    <g key={`link_${idx}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke={isConnectedToSelected ? '#C5A059' : '#2A2A2A'}
                        strokeWidth={isConnectedToSelected ? 2.2 : 1.2}
                        strokeDasharray={link.type === 'causal_dependency' ? 'none' : '4 3'}
                        opacity={isConnectedToSelected ? 0.9 : 0.4}
                        markerEnd={link.type === 'propagation' ? 'url(#arrow-propagation)' : 'url(#arrow-causal)'}
                      />
                    </g>
                  );
                })}

                {/* Network Nodes */}
                {nodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  const isVisible = filteredNodes.some(n => n.id === node.id);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer transition-transform"
                      opacity={isVisible ? 1 : 0.25}
                      onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      {/* Outer pulse ring for selected */}
                      {isSelected && (
                        <circle
                          r={node.radius + 8}
                          fill="none"
                          stroke={node.color}
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          className="animate-spin"
                          style={{ transformOrigin: '0 0' }}
                          opacity="0.8"
                        />
                      )}

                      {/* Ambient Glow */}
                      <circle
                        r={node.radius + 4}
                        fill={node.glowColor}
                        filter="url(#glow)"
                        opacity={isSelected ? 0.8 : 0.4}
                      />

                      {/* Main Node Circle */}
                      <circle
                        r={node.radius}
                        fill="#121212"
                        stroke={isSelected ? '#FFF' : node.color}
                        strokeWidth={isSelected ? 2.5 : 1.8}
                      />

                      {/* Inner Order Tier indicator */}
                      <circle
                        r={node.radius * 0.45}
                        fill={node.color}
                        opacity={0.85}
                      />

                      {/* Year or Order Badge */}
                      <text
                        textAnchor="middle"
                        dy="0.3em"
                        fill="#000"
                        fontSize={node.radius > 22 ? '9' : '8'}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {node.orderTier === 0 ? '0' : node.orderTier === 4 ? 'EQ' : `T${node.orderTier}`}
                      </text>

                      {/* Node Label Below */}
                      <text
                        y={node.radius + 14}
                        textAnchor="middle"
                        fill={isSelected ? '#FFF' : '#AAA'}
                        fontSize="9.5"
                        fontFamily="serif"
                        fontStyle="italic"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        className="pointer-events-none"
                      >
                        {node.label.length > 22 ? node.label.slice(0, 20) + '..' : node.label}
                      </text>

                      {/* Sub-label year */}
                      <text
                        y={node.radius + 24}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="8"
                        fontFamily="monospace"
                        className="pointer-events-none"
                      >
                        {node.year} AD
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Deep Rationale & Arbitration Dossier (5 cols on lg, 4 on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
          {selectedNode ? (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="pb-4 border-b border-[#2A2A2A]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span 
                    className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border"
                    style={{ 
                      backgroundColor: `${selectedNode.color}15`, 
                      borderColor: `${selectedNode.color}60`,
                      color: selectedNode.color 
                    }}
                  >
                    {selectedNode.orderLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#0E1F18] border border-[#2D6A4F]/60 text-[#52B788] text-[10px] font-mono font-bold">
                    {selectedNode.confidence}% Conf
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl serif italic font-bold text-white leading-snug">
                  {selectedNode.label}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-xs font-mono text-[#888]">
                  <span>Timeline Inflection:</span>
                  <span className="text-[#C5A059] font-bold">{selectedNode.year} AD</span>
                  <span className="text-[#444]">•</span>
                  <span className="text-[#B89ACD] uppercase tracking-wider">{selectedNode.category}</span>
                </div>
              </div>

              {/* Causal Analysis & Mechanism */}
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] space-y-1.5">
                <span className="text-[#666] font-mono text-[9px] uppercase tracking-widest block">
                  Causal Exposition & Historical Mechanism:
                </span>
                <p className="text-sm serif italic text-[#D8D8D8] leading-relaxed">
                  "{selectedNode.description}"
                </p>
              </div>

              {/* Upstream & Downstream Connectors */}
              <div className="p-3.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] space-y-2 text-xs">
                <span className="text-[#666] font-mono text-[9px] uppercase tracking-widest block">
                  Causal Dependencies:
                </span>
                {selectedNode.dependsOnIds && selectedNode.dependsOnIds.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedNode.dependsOnIds.map(depId => {
                      const parent = nodes.find(n => n.id === depId);
                      return (
                        <button
                          key={depId}
                          onClick={() => setSelectedNodeId(depId)}
                          className="w-full flex items-center justify-between gap-2 p-2 rounded bg-[#141414] hover:bg-[#1C1811] border border-[#222] hover:border-[#C5A059]/40 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                            <span className="text-xs text-[#E0E0E0] serif italic truncate">
                              {parent ? parent.label : depId}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-[#C5A059] shrink-0">Inspect →</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs serif italic text-[#777] block">
                    Primordial Root Divergence (Initial Boundary Condition)
                  </span>
                )}
              </div>

              {/* Specialist Consensus & Alignment */}
              <div className="space-y-3">
                <div>
                  <span className="text-[#666] font-mono text-[9px] uppercase tracking-widest block mb-2">
                    Endorsing Disciplinary Specialists:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.supportingAgents.map(role => {
                      const meta = getExpertMeta(role);
                      return (
                        <span 
                          key={role}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wider border ${meta.badgeBg} ${meta.badgeBorder}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.accentColor }} />
                          <span>{meta.name.split(',')[0]} ({meta.role})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {selectedNode.dissentingAgents && selectedNode.dissentingAgents.length > 0 && (
                  <div className="p-3 rounded bg-[#241113] border border-[#E11D48]/30 space-y-1">
                    <span className="text-[#FDA4AF] font-mono text-[9px] uppercase tracking-widest block">
                      Dissenting Perspectives:
                    </span>
                    <p className="text-xs text-[#FDA4AF] serif italic">
                      {selectedNode.dissentingAgents.join(', ')} argued for alternative probability distributions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-[#666] serif italic text-sm">
              Click any node in the causal network to inspect the mechanistic rationale, probability metrics, and specialist arbitration.
            </div>
          )}

          {/* Bottom helper summary */}
          <div className="pt-4 border-t border-[#222] text-[10px] text-[#666] font-mono flex items-center justify-between">
            <span>Total Nodes: {nodes.length}</span>
            <span>Active Links: {links.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
