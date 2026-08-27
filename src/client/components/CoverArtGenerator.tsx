import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  RefreshCw, 
  Sliders, 
  X, 
  Compass, 
  Globe, 
  Layers, 
  Feather, 
  Eye, 
  Palette, 
  Share2, 
  Maximize2
} from 'lucide-react';
import { 
  generateCoverArtSVG, 
  exportCoverArtToDataUrl, 
  COVER_ART_THEMES, 
  CoverArtOptions,
  StyleTheme
} from '../utils/coverArtRenderer.ts';

interface CoverArtGeneratorProps {
  scenarioTitle: string;
  scenarioDescription: string;
  startingYear?: number;
  endYear?: number;
  geographicScope?: string;
  initialStyle?: string;
  onApplyCoverArt?: (dataUrl: string, style: string, prompt?: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const CoverArtGenerator: React.FC<CoverArtGeneratorProps> = ({
  scenarioTitle,
  scenarioDescription,
  startingYear = 1888,
  endYear = 1950,
  geographicScope = 'global',
  initialStyle = 'imperial_gold',
  onApplyCoverArt,
  onClose,
  isModal = false
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(initialStyle);
  const [showCompass, setShowCompass] = useState<boolean>(true);
  const [showTradeArcs, setShowTradeArcs] = useState<boolean>(true);
  const [showCartouche, setShowCartouche] = useState<boolean>(true);
  const [showConflictZones, setShowConflictZones] = useState<boolean>(true);
  
  const [aiMetadata, setAiMetadata] = useState<{
    latinMotto?: string;
    cartographicTheme?: string;
    artisticPrompt?: string;
    prominentGeographicFeatures?: string[];
  } | null>(null);

  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const currentOptions: CoverArtOptions = {
    scenarioTitle: scenarioTitle || 'Untitled Alternate Reality',
    scenarioDescription: scenarioDescription || 'Counterfactual geopolitical simulation.',
    startingYear,
    endYear,
    geographicScope,
    style: (selectedStyle as any) || 'imperial_gold',
    showCompass,
    showTradeArcs,
    showCartouche,
    showConflictZones
  };

  const svgContent = generateCoverArtSVG(currentOptions);

  // Fetch AI prompt metadata on initial mount or title change
  const fetchAIMetadata = async () => {
    if (!scenarioTitle) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/simulations/generate-cover-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle,
          scenarioDescription,
          startingYear,
          endYear,
          style: selectedStyle
        })
      });
      const data = await res.json();
      if (data.success && data.metadata) {
        setAiMetadata(data.metadata);
        if (data.metadata.recommendedStyle && COVER_ART_THEMES[data.metadata.recommendedStyle]) {
          setSelectedStyle(data.metadata.recommendedStyle);
        }
      }
    } catch (err) {
      console.warn('Failed to load AI cover metadata:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    fetchAIMetadata();
  }, [scenarioTitle]);

  // Update preview data URL
  useEffect(() => {
    let active = true;
    exportCoverArtToDataUrl(currentOptions, 'png', 1200, 675).then(url => {
      if (active) setPreviewDataUrl(url);
    }).catch(err => console.warn(err));
    return () => { active = false; };
  }, [selectedStyle, showCompass, showTradeArcs, showCartouche, showConflictZones, scenarioTitle, scenarioDescription, startingYear, endYear]);

  const handleDownloadPNG = async () => {
    try {
      setIsDownloading(true);
      const dataUrl = await exportCoverArtToDataUrl(currentOptions, 'png', 1920, 1080);
      const link = document.createElement('a');
      link.download = `${scenarioTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_world_map_cover.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSVG = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${scenarioTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_world_map_vector.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyImage = async () => {
    try {
      const dataUrl = await exportCoverArtToDataUrl(currentOptions, 'png', 1200, 675);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.warn('Copy to clipboard failed:', err);
    }
  };

  const handleApply = async () => {
    try {
      const dataUrl = await exportCoverArtToDataUrl(currentOptions, 'png', 1200, 675);
      if (onApplyCoverArt) {
        onApplyCoverArt(dataUrl, selectedStyle, aiMetadata?.artisticPrompt);
      }
      setApplied(true);
      setTimeout(() => setApplied(false), 2500);
      if (isModal && onClose) {
        setTimeout(onClose, 600);
      }
    } catch (err) {
      console.error('Apply cover art failed:', err);
    }
  };

  const content = (
    <div className="bg-[#0F1012] border border-[#2A2D32] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2D32] bg-[#141619]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                Conceptual World Map Cover Art Studio
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[9px] font-mono uppercase tracking-widest font-bold">
                AI Speculative Cartography
              </span>
            </div>
            <p className="text-xs text-[#8E8B82] font-mono">
              Generates high-resolution cartographic cover art and visual thumbnails for "{scenarioTitle}".
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAIMetadata}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D1F23] border border-[#2A2D32] text-xs font-mono text-[#D8D5CD] hover:text-[#C5A059] hover:border-[#C5A059]/40 transition-colors cursor-pointer"
            title="Re-generate AI visual director concept"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin text-[#C5A059]' : ''}`} />
            <span className="hidden sm:inline">AI Concept</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E8B82] hover:text-white hover:bg-[#2A2D32] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Artwork Preview + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
        {/* Left 7 Cols: Artwork Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Frame */}
          <div className="relative rounded-xl overflow-hidden border border-[#C5A059]/30 shadow-2xl bg-black aspect-video flex items-center justify-center group">
            {/* SVG Render */}
            <div 
              ref={svgContainerRef}
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />

            {/* Quick Action Overlay on Hover */}
            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#C5A059]/40 shadow-xl">
              <button
                onClick={handleCopyImage}
                className="text-xs font-mono text-[#C5A059] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <span className="text-[#3A3D42]">|</span>
              <button
                onClick={handleDownloadPNG}
                className="text-xs font-mono text-[#C5A059] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>
            </div>

            {/* Bottom Style Badge */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-md border border-[#C5A059]/30 text-[10px] font-mono text-[#C5A059]">
              {COVER_ART_THEMES[selectedStyle]?.name} • 16:9 4K Vector Master
            </div>
          </div>

          {/* AI Concept & Cartographic Prompt Box */}
          <div className="bg-[#141619] border border-[#2A2D32] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#C5A059] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Cartographer's Conceptual Prompt & Latin Motto
              </span>
              {aiMetadata?.latinMotto && (
                <span className="text-[10px] font-serif italic text-[#D8D5CD] bg-[#1E2024] px-2 py-0.5 rounded border border-[#2A2D32]">
                  "{aiMetadata.latinMotto}"
                </span>
              )}
            </div>

            <p className="text-xs text-[#A8A59D] font-mono leading-relaxed bg-[#0D0E10] p-3 rounded-lg border border-[#2A2D32]">
              {aiMetadata?.artisticPrompt || `A dramatic high-contrast antique conceptual world map cover art for "${scenarioTitle}", featuring illuminated golden cartographic boundaries, intricate astrolabe compass rose, deep textured slate parchment, rich gold leaf highlights, glowing trade routes, and cinematic historical atmosphere.`}
            </p>
          </div>
        </div>

        {/* Right 5 Cols: Customization Controls */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Style Preset Selector */}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold block mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Cartographic Art Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(COVER_ART_THEMES).map(theme => {
                  const isSelected = selectedStyle === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedStyle(theme.id)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#1D1B16] border-[#C5A059] text-white shadow-md' 
                          : 'bg-[#141619] border-[#2A2D32] text-[#8E8B82] hover:text-white hover:border-[#3E4249]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full border border-white/20" 
                          style={{ backgroundColor: theme.accentGold }} 
                        />
                        <span className="font-bold truncate text-[11px]">{theme.name}</span>
                      </div>
                      <p className="text-[9px] text-[#8E8B82] truncate mt-1">
                        {theme.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Cartographic Layers */}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-[#C5A059] font-bold block mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Cartographic Elements
              </label>
              <div className="space-y-1.5 bg-[#141619] p-3 rounded-lg border border-[#2A2D32]">
                <label className="flex items-center justify-between text-xs text-[#D8D5CD] cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>32-Point Compass Astrolabe</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showCompass}
                    onChange={(e) => setShowCompass(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-[#D8D5CD] cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Geodesic Trade Corridors</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showTradeArcs}
                    onChange={(e) => setShowTradeArcs(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-[#D8D5CD] cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <Feather className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Grand Title Cartouche Plate</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showCartouche}
                    onChange={(e) => setShowCartouche(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-[#D8D5CD] cursor-pointer hover:text-white">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>Divergence Flashpoint Epicenters</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showConflictZones}
                    onChange={(e) => setShowConflictZones(e.target.checked)}
                    className="accent-[#C5A059] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="space-y-2 pt-4 border-t border-[#2A2D32]">
            {onApplyCoverArt && (
              <button
                onClick={handleApply}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-black font-serif font-bold text-sm shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {applied ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{applied ? 'Applied to Simulation!' : 'Set as Simulation Cover Art & Thumbnail'}</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadPNG}
                disabled={isDownloading}
                className="py-2.5 px-3 rounded-lg bg-[#141619] border border-[#2A2D32] hover:border-[#C5A059]/40 text-white font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{isDownloading ? 'Exporting...' : 'Download PNG (4K)'}</span>
              </button>

              <button
                onClick={handleDownloadSVG}
                className="py-2.5 px-3 rounded-lg bg-[#141619] border border-[#2A2D32] hover:border-[#C5A059]/40 text-white font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Vector SVG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
        <div className="w-full max-w-5xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
