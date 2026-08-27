import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Layers, 
  Shield, 
  Flame, 
  TrendingUp, 
  Cpu, 
  MapPin, 
  Ship, 
  Info, 
  Search, 
  X, 
  Check, 
  Play, 
  Pause, 
  RotateCcw,
  Users,
  Swords,
  Handshake,
  Navigation,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Zap,
  Activity,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { 
  CountryState, 
  GeopoliticalBloc, 
  ConflictFlashpoint, 
  TradeCorridor, 
  WorldState, 
  TimelineEvent,
  getExpertMeta 
} from '../../shared/types.ts';
import { 
  REAL_WORLD_COUNTRIES, 
  GLOBAL_TRADE_ROUTES, 
  DEFAULT_CONFLICT_FLASHPOINTS, 
  WorldCountryGeo,
  MapMode,
  projectLatLng 
} from '../../shared/geoData.ts';
import { explainSimplyLocal } from '../../shared/hinglishHelper.ts';
import { CoverArtGenerator } from './CoverArtGenerator.tsx';

interface WorldMapViewProps {
  worldState: WorldState;
  onSelectTimelineEvent?: (eventId: string) => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({ 
  worldState,
  onSelectTimelineEvent 
}) => {
  const [mapMode, setMapMode] = useState<MapMode>('political');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('USA');
  const [selectedSimBorderId, setSelectedSimBorderId] = useState<string | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<ConflictFlashpoint | null>(null);
  const [selectedTradeRoute, setSelectedTradeRoute] = useState<TradeCorridor | null>(null);
  const [showCoverArtModal, setShowCoverArtModal] = useState<boolean>(false);

  // Time Slider & Story Mode
  const startYear = worldState.divergencePoint?.year || 1800;
  const targetEndYear = (worldState.timeline && worldState.timeline.length > 0)
    ? Math.max(...worldState.timeline.map(t => t.year))
    : startYear + 100;

  const [currentYear, setCurrentYear] = useState<number>(targetEndYear);
  const [isPlayingStory, setIsPlayingStory] = useState<boolean>(false);
  const [storySpeedMs, setStorySpeedMs] = useState<number>(3000);
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);

  // Timeline events sorted
  const sortedTimeline = (worldState.timeline || []).slice().sort((a, b) => a.year - b.year);
  
  // Find current timeline event active at this year slider
  const activeTimelineEvent = sortedTimeline
    .filter(ev => ev.year <= currentYear)
    .slice(-1)[0] || sortedTimeline[0] || null;

  // Story Mode auto-playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlayingStory) {
      interval = setInterval(() => {
        setCurrentYear(prevYear => {
          // Find next event year or step forward
          const futureEvents = sortedTimeline.filter(e => e.year > prevYear);
          if (futureEvents.length > 0) {
            const nextEv = futureEvents[0];
            if (nextEv.primaryRegion) setHighlightedRegion(nextEv.primaryRegion);
            return nextEv.year;
          } else {
            setIsPlayingStory(false);
            return targetEndYear;
          }
        });
      }, storySpeedMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingStory, storySpeedMs, sortedTimeline, targetEndYear]);

  // Combine simulated country states with real-world geo registry
  const simulatedCountries = worldState.countries || [];
  const alliances = worldState.alliances || [];
  const conflicts = worldState.conflicts || [];
  const tradeRoutes = worldState.tradeRoutes || [];

  // Match selected country
  const activeCountrySimState = simulatedCountries.find(c => c?.id === selectedCountryId || (c?.name && c.name.toLowerCase().includes(selectedCountryId.toLowerCase())));
  const activeCountryGeo = REAL_WORLD_COUNTRIES.find(c => c?.id === selectedCountryId || (c?.name && c.name.toLowerCase().includes(selectedCountryId.toLowerCase()))) || REAL_WORLD_COUNTRIES[0];

  // Map country to alliance bloc color
  const getCountryColor = (cGeo: WorldCountryGeo) => {
    const simC = simulatedCountries.find(sc => sc?.id === cGeo.id || (sc?.name && sc.name.toLowerCase().includes(cGeo.shortName.toLowerCase())));
    
    if (mapMode === 'political') {
      if (!simC) return '#25282F';
      if (simC.blocId) {
        const bloc = alliances.find(b => b.id === simC.blocId);
        if (bloc?.color) return bloc.color;
      }
      return '#3A4250';
    }

    if (mapMode === 'alliances') {
      if (simC?.alliances && simC.alliances.length > 0) {
        return '#C5A059'; // Gold for allied
      }
      return '#282C34';
    }

    if (mapMode === 'conflict') {
      const isConflicted = conflicts.some(cf => cf.partiesInvolved?.includes(cGeo.id) || (cf.location && cf.location.toLowerCase().includes(cGeo.shortName.toLowerCase())));
      return isConflicted ? '#E11D48' : '#22252B';
    }

    if (mapMode === 'economy') {
      const gdp = simC?.economicStrength || cGeo.gdpIndex;
      if (gdp > 88) return '#52B788';
      if (gdp > 75) return '#3B82F6';
      return '#2B3340';
    }

    if (mapMode === 'technology') {
      const tech = simC?.technologyLevel || cGeo.techIndex;
      if (tech > 90) return '#8B5CF6';
      if (tech > 80) return '#06B6D4';
      return '#262930';
    }

    if (mapMode === 'population') {
      return '#475569';
    }

    return '#2D323C';
  };

  // World Power Structure Top Powers Ranking
  const topPowers = simulatedCountries.length > 0
    ? [...simulatedCountries].sort((a, b) => (b.economicStrength + b.militaryStrength) - (a.economicStrength + a.militaryStrength)).slice(0, 4)
    : REAL_WORLD_COUNTRIES.slice(0, 4).map(c => ({ id: c.id, name: c.name, economicStrength: c.gdpIndex, militaryStrength: c.militaryIndex }));

  // Related timeline events for currently selected country
  const targetShortName = (activeCountryGeo?.shortName || activeCountryGeo?.name || '').toLowerCase();
  const relatedTimelineEvents = sortedTimeline.filter(ev => 
    (ev?.primaryRegion && ev.primaryRegion.toLowerCase().includes(targetShortName)) ||
    (ev?.description && ev.description.toLowerCase().includes(targetShortName)) ||
    (ev?.title && ev.title.toLowerCase().includes(targetShortName))
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-8 space-y-6">
      {/* 1. Geopolitical Summary: World Power Structure Banner */}
      <div className="bg-[#121417] border border-[#2A2D32] rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D32]/70 pb-3.5">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] block font-bold">
              Global Intelligence Overview • Year {currentYear} AD
            </span>
            <h2 className="text-xl sm:text-2xl font-serif italic text-white mt-0.5">
              World Power Structure & Geopolitics
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[#8E8B82]">Major Alliances:</span>
              <span className="text-white font-bold">{alliances.length || 3}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[#8E8B82]">Major Conflicts:</span>
              <span className="text-white font-bold">{conflicts.length || 2}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[#8E8B82]">Dominant Hub:</span>
              <span className="text-[#52B788] font-bold">Eurasia & Indo-Pacific</span>
            </div>

            <button
              onClick={() => setShowCoverArtModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#1D1B13] border border-[#C5A059]/60 hover:border-[#C5A059] text-[#C5A059] hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md font-bold"
              title="Open Cover Art Studio for this simulated world"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>🎨 Atlas Cover Art Studio</span>
            </button>
          </div>
        </div>

        {/* Top 4 Powers Ranking Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {topPowers.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => setSelectedCountryId(p.id)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedCountryId === p.id 
                  ? 'bg-[#1D1B13] border-[#C5A059] ring-1 ring-[#C5A059]' 
                  : 'bg-[#0A0B0D] border-[#2A2D32] hover:border-[#3E4249]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8B82] mb-1">
                <span>RANK 0{idx + 1} POWER</span>
                <span className="text-[#C5A059] font-bold">Score: {Math.round((p.economicStrength + (p.militaryStrength || 80)) / 2)}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate">{p.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Map Modes Selector Bar */}
      <div className="bg-[#15171A] border border-[#2A2D32] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8B82] mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#C5A059]" /> Mode:
          </span>

          {[
            { id: 'political', label: '1. Political', icon: Globe, desc: 'Countries, Borders & Blocs' },
            { id: 'alliances', label: '2. Alliances', icon: Handshake, desc: 'Treaties & Coalitions' },
            { id: 'conflict', label: '3. Conflict', icon: Swords, desc: 'Active Wars & Disputes' },
            { id: 'economy', label: '4. Economy', icon: TrendingUp, desc: 'Trade & Industrial Hubs' },
            { id: 'population', label: '5. Population', icon: Users, desc: 'Cities & Migration' },
            { id: 'technology', label: '6. Technology', icon: Cpu, desc: 'Tech & Research Hubs' }
          ].map(m => {
            const Icon = m.icon;
            const isActive = mapMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMapMode(m.id as MapMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C5A059] text-black font-bold shadow-md'
                    : 'bg-[#0D0E10] border border-[#2A2D32] text-[#8E8B82] hover:text-white'
                }`}
                title={m.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search Country / Faction */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search state or region..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* 3. Interactive SVG Geopolitical Map Canvas + Country Click Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns SVG Map */}
        <div className="lg:col-span-2 bg-[#0A0B0D] border border-[#2A2D32] rounded-xl p-5 shadow-2xl relative flex flex-col justify-between min-h-[500px] overflow-hidden">
          {/* Map Top Status Banner */}
          <div className="flex items-center justify-between text-xs font-mono border-b border-[#2A2D32]/60 pb-3 mb-2 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              <span className="text-white font-bold">{worldState.finalWorldName || 'Alternate Earth Cartography'}</span>
              <span className="text-[#8E8B82]">({mapMode.toUpperCase()} VIEW)</span>
            </div>

            <span className="text-[#C5A059] font-bold bg-[#14120B] px-2.5 py-0.5 rounded border border-[#C5A059]/40">
              Year: {currentYear} AD
            </span>
          </div>

          {/* Active Story Event Banner (If playing or active) */}
          {activeTimelineEvent && (
            <div className="bg-[#121418]/95 border border-[#C5A059]/40 rounded-lg p-3 my-2 text-xs flex items-start justify-between gap-3 shadow-lg z-10 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C5A059] text-black font-bold shrink-0 mt-0.5">
                  {activeTimelineEvent.year} AD
                </span>
                <div>
                  <h4 className="font-bold text-white text-xs">{activeTimelineEvent.title}</h4>
                  <p className="text-[#D8D5CD] text-[11px] mt-0.5 leading-relaxed">
                    {activeTimelineEvent.description}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#52B788] shrink-0 uppercase border border-[#52B788]/30 px-2 py-0.5 rounded">
                {activeTimelineEvent.primaryRegion || 'Global'}
              </span>
            </div>
          )}

          {/* SVG Map Canvas */}
          <div className="w-full h-full my-auto flex items-center justify-center relative py-4">
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-auto max-h-[440px] select-none"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.95))' }}
            >
              <defs>
                <pattern id="noir-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                </pattern>
                
                {/* Glow filter */}
                <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Grid */}
              <rect width="1000" height="500" fill="#0A0B0D" />
              <rect width="1000" height="500" fill="url(#noir-grid)" />

              {/* Lat/Long Equator & Tropic Gridlines */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />

              {/* 1. Countries Base Layer */}
              {REAL_WORLD_COUNTRIES.map((c) => {
                const isSelected = selectedCountryId === c.id;
                const fillClr = getCountryColor(c);
                const isSimulated = c.isSimulatedBorder || c.id === 'USA' || c.id === 'DEU' || c.id === 'CHN';

                return (
                  <g 
                    key={c.id} 
                    onClick={() => {
                      setSelectedCountryId(c.id);
                      if (isSimulated) setSelectedSimBorderId(c.id);
                    }}
                    className="cursor-pointer group"
                  >
                    <path
                      d={c.path}
                      fill={fillClr}
                      fillOpacity={isSelected ? 0.95 : 0.75}
                      stroke={
                        isSelected 
                          ? '#C5A059' 
                          : isSimulated 
                          ? '#E5C384' 
                          : '#4A5160'
                      }
                      strokeWidth={isSelected ? 2.5 : isSimulated ? 1.8 : 1}
                      strokeDasharray={isSimulated ? '4 2' : 'none'}
                      className="transition-all duration-200 hover:fill-opacity-100 hover:stroke-[#C5A059]"
                    />
                    
                    {/* Country Centroid Marker */}
                    {(() => {
                      const pos = projectLatLng(c.lat, c.lng);
                      return (
                        <g transform={`translate(${pos.x}, ${pos.y})`}>
                          <circle
                            r={isSelected ? 4.5 : 3}
                            fill={isSelected ? '#C5A059' : '#FFFFFF'}
                            className="transition-transform duration-200 group-hover:scale-125"
                          />
                          <text
                            y="-6"
                            textAnchor="middle"
                            fill={isSelected ? '#C5A059' : '#8E8B82'}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            className="pointer-events-none select-none"
                          >
                            {c.shortName}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}

              {/* 2. Trade Routes Layer (Economy / Trade Mode) */}
              {(mapMode === 'economy' || mapMode === 'political') && GLOBAL_TRADE_ROUTES.map(tr => {
                // Generate SVG path for route
                const pathStr = tr.points.map((pt, idx) => {
                  const pos = projectLatLng(pt[1], pt[0]);
                  return `${idx === 0 ? 'M' : 'L'} ${pos.x},${pos.y}`;
                }).join(' ');

                return (
                  <g key={tr.id} className="cursor-pointer" onClick={() => setSelectedTradeRoute(tr as any)}>
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="#52B788"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      strokeOpacity="0.8"
                      className="animate-pulse hover:stroke-white hover:stroke-width-3"
                    />
                  </g>
                );
              })}

              {/* 3. Conflict Flashpoints Layer (Conflict Mode) */}
              {(mapMode === 'conflict' || mapMode === 'political') && DEFAULT_CONFLICT_FLASHPOINTS.map(cf => {
                const pos = projectLatLng(cf.lat, cf.lng);
                return (
                  <g 
                    key={cf.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedConflict(cf as any)}
                  >
                    <circle r="8" fill="#E11D48" fillOpacity="0.3" className="animate-ping" />
                    <circle r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text
                      y="14"
                      textAnchor="middle"
                      fill="#FDA4AF"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      ⚔ {cf.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* 4. Tech Hubs Layer (Technology Mode) */}
              {mapMode === 'technology' && REAL_WORLD_COUNTRIES.flatMap(c => c.techHubs || []).map((th, idx) => {
                const pos = projectLatLng(th.lat, th.lng);
                return (
                  <g key={`tech_${idx}`} transform={`translate(${pos.x}, ${pos.y})`} className="cursor-pointer">
                    <polygon points="0,-6 5,3 -5,3" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1" />
                    <text y="12" textAnchor="middle" fill="#C084FC" fontSize="7" fontFamily="monospace">
                      ★ {th.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* 5. Cities Layer (Population Mode) */}
              {mapMode === 'population' && REAL_WORLD_COUNTRIES.flatMap(c => c.cities || []).map((cty, idx) => {
                const pos = projectLatLng(cty.lat, cty.lng);
                return (
                  <g key={`city_${idx}`} transform={`translate(${pos.x}, ${pos.y})`}>
                    <circle r="3.5" fill="#38BDF8" stroke="#000000" strokeWidth="1" />
                    <text y="-5" textAnchor="middle" fill="#BAE6FD" fontSize="7" fontFamily="monospace">
                      ● {cty.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 5. Map Legend Bar */}
          <div className="bg-[#121417] border border-[#2A2D32] rounded-lg p-2.5 mt-2 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-[#8E8B82]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-4 h-0.5 bg-[#4A5160]" /> Real Border
              </span>
              <span className="flex items-center gap-1.5 text-[#C5A059] font-bold">
                <span className="w-4 h-0.5 bg-[#C5A059] border-b border-dashed border-[#C5A059]" /> Simulated Border
              </span>
              <span className="flex items-center gap-1 text-[#38BDF8]">
                ● Major City
              </span>
              <span className="flex items-center gap-1 text-[#52B788]">
                ◆ Economic Center
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                ⚔ Conflict Zone
              </span>
              <span className="flex items-center gap-1 text-[#C5A059]">
                🤝 Alliance Bloc
              </span>
              <span className="flex items-center gap-1 text-[#52B788]">
                → Trade Route
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                ★ Tech Center
              </span>
            </div>

            <span className="text-[#5A5D64]">Click any country, border, or zone to inspect</span>
          </div>

          {/* 6. Map Time Slider & Story Mode Controls */}
          <div className="bg-[#121417] border border-[#2A2D32] rounded-lg p-3.5 mt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Play/Pause Story Mode */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPlayingStory(!isPlayingStory)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#C5A059] text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:bg-[#D4AF37]"
              >
                {isPlayingStory ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingStory ? 'Pause Story' : 'Play Simulation Story'}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlayingStory(false);
                  setCurrentYear(startYear);
                }}
                className="p-2 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-[#8E8B82] hover:text-white cursor-pointer"
                title="Reset to Start Year"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Slider */}
            <div className="flex-1 w-full flex items-center gap-3">
              <span className="text-xs font-mono text-[#8E8B82]">{startYear} AD</span>
              <input
                type="range"
                min={startYear}
                max={targetEndYear}
                value={currentYear}
                onChange={(e) => {
                  setIsPlayingStory(false);
                  setCurrentYear(Number(e.target.value));
                }}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
              <span className="text-xs font-mono text-white font-bold">{targetEndYear} AD</span>
            </div>
          </div>
        </div>

        {/* Right: Country Click Panel & Simulated Border Inspector */}
        <div className="bg-[#15171A] border border-[#2A2D32] rounded-xl p-6 shadow-2xl flex flex-col justify-between space-y-5">
          {/* Top: Country Identity */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2D32]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059] block font-bold">
                  Sovereign Entity Dossier
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {activeCountrySimState?.name || activeCountryGeo.name}
                </h3>
                <p className="text-xs text-[#8E8B82]">{activeCountryGeo.region} • Capital: {activeCountryGeo.capital}</p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#0D0E10] border border-[#2A2D32] flex items-center justify-center text-[#C5A059] font-bold text-sm">
                {activeCountryGeo.id}
              </div>
            </div>

            {/* Simulated Border Notice (If applicable) */}
            <div className="mt-3.5 p-3 rounded-lg bg-[#1D1B13] border border-[#C5A059]/40 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#C5A059] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulated Border — Alternate-World Model</span>
              </div>
              <p className="text-[#D8D5CD] text-[11px] leading-relaxed">
                {activeCountrySimState?.simulatedBorderChanges || 
                  'Divergent historical treaties and resource shifts restructured this territory.'}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#8E8B82]">
                <span>Confidence: <strong className="text-white">{activeCountrySimState?.confidence || 84}%</strong></span>
                <span>Supported: <strong className="text-[#52B788]">Historian, Geopolitician</strong></span>
              </div>
            </div>

            {/* Core Stats Progress Gauges */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-2.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs">
                <span className="text-[#8E8B82] text-[10px] font-mono block mb-1">Economic Strength</span>
                <div className="flex items-center justify-between font-mono">
                  <div className="w-full bg-[#1F2227] h-2 rounded-full mr-2 overflow-hidden">
                    <div 
                      className="bg-[#52B788] h-full rounded-full" 
                      style={{ width: `${activeCountrySimState?.economicStrength || activeCountryGeo.gdpIndex}%` }} 
                    />
                  </div>
                  <span className="text-[#52B788] font-bold">{activeCountrySimState?.economicStrength || activeCountryGeo.gdpIndex}%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs">
                <span className="text-[#8E8B82] text-[10px] font-mono block mb-1">Military Strength</span>
                <div className="flex items-center justify-between font-mono">
                  <div className="w-full bg-[#1F2227] h-2 rounded-full mr-2 overflow-hidden">
                    <div 
                      className="bg-blue-400 h-full rounded-full" 
                      style={{ width: `${activeCountrySimState?.militaryStrength || activeCountryGeo.militaryIndex}%` }} 
                    />
                  </div>
                  <span className="text-blue-400 font-bold">{activeCountrySimState?.militaryStrength || activeCountryGeo.militaryIndex}%</span>
                </div>
              </div>
            </div>

            {/* Government & Ideology */}
            <div className="mt-3 p-3 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#8E8B82] font-mono text-[10px] uppercase">Government Model:</span>
                <span className="text-white font-medium">{activeCountrySimState?.government || activeCountryGeo.defaultIdeology}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8E8B82] font-mono text-[10px] uppercase">Population:</span>
                <span className="text-white font-mono">{activeCountrySimState?.populationEstimate || activeCountryGeo.populationEstimate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8E8B82] font-mono text-[10px] uppercase">Alliances:</span>
                <span className="text-[#C5A059] font-medium truncate max-w-[160px]">
                  {activeCountrySimState?.alliances?.join(', ') || 'Independent Compact'}
                </span>
              </div>
            </div>

            {/* Major Changes & Why It Matters (1-3 Short Sentences in Hinglish/English) */}
            <div className="mt-3 space-y-2">
              <div className="p-3 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs">
                <span className="text-[10px] uppercase font-mono text-[#C5A059] font-bold block mb-1">
                  Major Changes in this Alternate World:
                </span>
                <p className="text-[#D8D5CD] text-[11px] leading-relaxed">
                  {activeCountrySimState?.statusNotes || 
                    `${activeCountryGeo.shortName} underwent key political and economic transformations due to the altered divergence trajectory.`}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0D0E10] border border-[#2A2D32] text-xs">
                <span className="text-[10px] uppercase font-mono text-[#52B788] font-bold block mb-1">
                  Why It Matters (Sabse Bada Effect):
                </span>
                <p className="text-[#D8D5CD] text-[11px] leading-relaxed">
                  Is country ka role global balance aur trade corridors ko stabilize ya disrupt karne mein sabse critical raha hai.
                </p>
              </div>
            </div>
          </div>

          {/* Related Timeline Milestones for this Country */}
          {relatedTimelineEvents.length > 0 && (
            <div className="border-t border-[#2A2D32] pt-3">
              <span className="text-[10px] uppercase font-mono text-[#8E8B82] block mb-2 font-bold">
                Related Historical Milestones ({relatedTimelineEvents.length}):
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {relatedTimelineEvents.slice(0, 3).map(ev => (
                  <div 
                    key={ev.id} 
                    onClick={() => {
                      setCurrentYear(ev.year);
                      if (onSelectTimelineEvent) onSelectTimelineEvent(ev.id);
                    }}
                    className="p-2 rounded bg-[#0D0E10] hover:bg-[#1A1D21] border border-[#2A2D32] text-[11px] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span className="font-mono text-[#C5A059] font-bold">{ev.year} AD</span>
                    <span className="text-white truncate max-w-[180px]">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cover Art Studio Modal */}
      {showCoverArtModal && (
        <CoverArtGenerator
          isModal={true}
          scenarioTitle={worldState.finalWorldName || 'Counterfactual World Atlas'}
          scenarioDescription={worldState.scenarioSummary || worldState.executiveSummary || ''}
          startingYear={worldState.divergencePoint?.year || 1800}
          endYear={targetEndYear}
          initialStyle={worldState.coverArtStyle || 'imperial_gold'}
          onApplyCoverArt={(url, style, prompt) => {
            worldState.coverArtUrl = url;
            worldState.coverArtStyle = style;
            worldState.coverArtPrompt = prompt;
          }}
          onClose={() => setShowCoverArtModal(false)}
        />
      )}
    </div>
  );
};
