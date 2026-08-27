import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Code, 
  Check, 
  X, 
  Copy, 
  Sparkles, 
  Share2,
  FileCode,
  Layers,
  BookOpen
} from 'lucide-react';
import { Simulation, WorldState } from '../../shared/types.ts';

interface ExportModalProps {
  simulation: Simulation;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  simulation,
  isOpen,
  onClose
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const world = simulation.worldState;
  const config = simulation.config || {} as any;

  // 1. Generate Markdown Report
  const generateMarkdownReport = (): string => {
    let md = `# COUNTERFACTUAL SIMULATION REPORT: ${world?.finalWorldName || config.scenarioTitle || 'Simulation'}\n\n`;
    md += `**Scenario:** ${config.scenarioTitle || 'N/A'}\n`;
    md += `**Inflection Year:** ${config.startingYear || 'N/A'} AD\n`;
    md += `**Horizon Target Year:** ${config.endYear || 'N/A'} AD\n`;
    md += `**Scope:** ${config.geographicScope || 'global'}\n`;
    md += `**Rigor Level:** ${config.realismLevel || 'standard'} | **Creativity:** ${config.creativityLevel || 'balanced'}\n`;
    md += `**Communication Style:** ${config.communicationStyle || 'general'}\n\n`;

    md += `## 1. Executive Summary\n\n${world?.executiveSummary || 'N/A'}\n\n`;

    if (world?.parsedScenario) {
      md += `## 2. Foundational Axioms & Causal Bounds\n\n`;
      md += `### Required Assumptions:\n`;
      world.parsedScenario.requiredAssumptions.forEach(a => md += `- ${a}\n`);
      md += `\n### Unaffected Invariant Systems:\n`;
      world.parsedScenario.unaffectedDomains.forEach(u => md += `- ${u}\n`);
      md += `\n### Causal Propagation Hierarchy:\n`;
      md += `- **Direct 1st-Order:** ${world.parsedScenario.causalPropagation.directEffects.join('; ')}\n`;
      md += `- **2nd-Order Structural:** ${world.parsedScenario.causalPropagation.secondOrderEffects.join('; ')}\n`;
      md += `- **3rd-Order Evolutionary:** ${world.parsedScenario.causalPropagation.thirdOrderEffects.join('; ')}\n`;
      md += `- **Long-Term Equilibrium:** ${world.parsedScenario.causalPropagation.longTermEquilibrium.join('; ')}\n\n`;
    }

    if (world?.countries && world.countries.length > 0) {
      md += `## 3. Sovereign Factions & Balance of Power\n\n`;
      world.countries.forEach(c => {
        md += `### ${c.name} (${c.government})\n`;
        md += `- **Ideology:** ${c.ideology}\n`;
        md += `- **Capital:** ${c.capital}\n`;
        md += `- **Population:** ${c.populationEstimate}\n`;
        md += `- **Status Notes:** ${c.statusNotes}\n\n`;
      });
    }

    if (world?.timeline && world.timeline.length > 0) {
      md += `## 4. Alternate Historical Timeline\n\n`;
      world.timeline.forEach(t => {
        md += `- **${t.year} AD - ${t.title}** (${t.category}): ${t.description}\n`;
      });
      md += `\n`;
    }

    if (world?.technologyState) {
      md += `## 5. Technology & Discovery Matrix\n\n`;
      md += `**Advanced Ahead of Baseline:**\n`;
      world.technologyState.advancedAheadOfHistory.forEach(a => md += `- ${a}\n`);
      md += `\n**Alternative Technological Solutions:**\n`;
      world.technologyState.alternativeTechnologicalPaths.forEach(p => md += `- ${p}\n`);
      md += `\n`;
    }

    return md;
  };

  // 2. Generate Debate Transcript
  const generateDebateTranscript = (): string => {
    let transcript = `# MULTI-AGENT DEBATE TRANSCRIPT: ${config.scenarioTitle}\n\n`;
    transcript += `Total Rounds: ${simulation.debateRounds.length || config.debateRounds}\n`;
    transcript += `Total Messages: ${simulation.debateMessages.length}\n\n`;

    let currentR = 0;
    simulation.debateMessages.forEach(msg => {
      if (msg.round !== currentR) {
        currentR = msg.round;
        transcript += `\n========================================\n`;
        transcript += `ROUND 0${currentR}\n`;
        transcript += `========================================\n\n`;
      }
      transcript += `[${msg.agentName.toUpperCase()} - ${msg.status?.toUpperCase() || 'DEBATE'} | Confidence: ${msg.confidence}%]\n`;
      transcript += `Claim: "${msg.claim}"\n`;
      if (msg.position) transcript += `Position: ${msg.position}\n`;
      if (msg.challenge) transcript += `Challenge: ${msg.challenge}\n`;
      if (msg.response) transcript += `Response: ${msg.response}\n`;
      if (msg.evidence) transcript += `Domain Evidence: ${msg.evidence}\n`;
      transcript += `\n---\n\n`;
    });

    return transcript;
  };

  // Download helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#15171A] border border-[#C5A059]/50 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8E8B82] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] uppercase tracking-widest-plus text-[#C5A059] block font-semibold mb-1">
            Zero-Token Instant Export
          </span>
          <h3 className="text-2xl font-serif italic text-white">
            Export Simulation Package
          </h3>
          <p className="text-xs text-[#8E8B82] mt-1">
            Download complete simulation data, dossiers, and dialectic transcripts. No model requests are triggered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Final Intelligence Report */}
          <div className="p-4 rounded-xl bg-[#0D0E10] border border-[#2A2D32] space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] mb-2.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Final World Report</h4>
              <p className="text-[11px] text-[#8E8B82] mt-1">
                Executive summary, factions, timeline, causal hierarchy, and technology matrix.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <button
                onClick={() => downloadFile(generateMarkdownReport(), `${config.scenarioTitle.slice(0, 30)}_Report.md`, 'text/markdown')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#1F2227] hover:bg-[#2A2D32] border border-[#2A2D32] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                Markdown (.md)
              </button>
              <button
                onClick={() => copyToClipboard(generateMarkdownReport(), 'report_md')}
                className="w-full py-1 px-2.5 rounded-lg text-[#8E8B82] hover:text-white text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                {copiedType === 'report_md' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedType === 'report_md' ? 'Copied to Clipboard' : 'Copy Text'}
              </button>
            </div>
          </div>

          {/* Card 2: Full Debate Transcript */}
          <div className="p-4 rounded-xl bg-[#0D0E10] border border-[#2A2D32] space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] mb-2.5">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Debate Transcript</h4>
              <p className="text-[11px] text-[#8E8B82] mt-1">
                All multi-agent rounds, structured positions, challenges, responses, and confidence shifts.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <button
                onClick={() => downloadFile(generateDebateTranscript(), `${config.scenarioTitle.slice(0, 30)}_Debate.txt`, 'text/plain')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#1F2227] hover:bg-[#2A2D32] border border-[#2A2D32] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                Plain Text (.txt)
              </button>
              <button
                onClick={() => copyToClipboard(generateDebateTranscript(), 'debate_txt')}
                className="w-full py-1 px-2.5 rounded-lg text-[#8E8B82] hover:text-white text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                {copiedType === 'debate_txt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedType === 'debate_txt' ? 'Copied Transcript' : 'Copy Transcript'}
              </button>
            </div>
          </div>

          {/* Card 3: Complete Simulation Archive (JSON) */}
          <div className="p-4 rounded-xl bg-[#0D0E10] border border-[#2A2D32] space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] mb-2.5">
                <Code className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Full JSON State</h4>
              <p className="text-[11px] text-[#8E8B82] mt-1">
                Raw simulation snapshot including config, research dossiers, causal graphs, and stats.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <button
                onClick={() => downloadFile(JSON.stringify(simulation, null, 2), `${config.scenarioTitle.slice(0, 30)}_Full.json`, 'application/json')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                Raw JSON (.json)
              </button>
              <button
                onClick={() => copyToClipboard(JSON.stringify(simulation, null, 2), 'json_raw')}
                className="w-full py-1 px-2.5 rounded-lg text-[#8E8B82] hover:text-white text-[11px] flex items-center justify-center gap-1 transition-all"
              >
                {copiedType === 'json_raw' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedType === 'json_raw' ? 'Copied JSON' : 'Copy JSON'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
