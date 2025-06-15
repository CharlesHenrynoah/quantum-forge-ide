
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Zap, Monitor, Smartphone, Tablet, GitBranch, Database, Sparkles, RotateCcw, BarChart3, Terminal, Code2 } from 'lucide-react';
import EvolutionGraph from './EvolutionGraph';
import ArchiveExplorer from './ArchiveExplorer';
import GeneratedAppPreview from './GeneratedAppPreview';
import MetricsPanel from './MetricsPanel';
import { generateContentWithGemini, generateBackendWithGemini, generateUIWithGemini, evolveAppWithGemini } from '@/services/geminiService';
import { Agent, GenerationPhase } from '@/types/Agent';
import { AgentFactory } from '@/services/AgentFactory';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface CollapseVisualizerProps {
  activeAgent: Agent | null;
}

const CollapseVisualizer: React.FC<CollapseVisualizerProps> = ({ activeAgent }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>({ phase: 'idle', message: 'Ready' });
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Agent[]>([]);

  // Auto-generate when new Agent is received
  useEffect(() => {
    if (activeAgent && !isGenerating) {
      setCurrentAgent(activeAgent);
      generateFromAgent(activeAgent);
    }
  }, [activeAgent]);

  const generateFromAgent = async (agent: Agent) => {
    if (!agent) return;
    
    setIsGenerating(true);
    setGenerationPhase({ phase: 'analyzing', message: 'Analyzing Agent structure...' });
    
    try {
      setTimeout(() => setGenerationPhase({ phase: 'connecting_gemini', message: 'Connecting to Gemini AI...' }), 1000);
      setTimeout(() => setGenerationPhase({ phase: 'generating_code', message: 'Generating with specialized agents...' }), 2000);
      
      // Orchestration des trois agents Gemini spécialisés
      const [businessLogic, simulatedBackend, generatedUI] = await Promise.all([
        generateContentWithGemini(agent.rawIntent),
        generateBackendWithGemini(agent.rawIntent),
        generateUIWithGemini(agent.rawIntent)
      ]);
      
      setGenerationPhase({ phase: 'rendering', message: 'Updating Agent context...' });
      
      // Mise à jour du contexte de l'Agent
      const updatedAgent = AgentFactory.updateAgentContext(agent, {
        businessLogic,
        simulatedBackend,
        generatedUI
      });
      
      setTimeout(() => {
        setCurrentAgent(updatedAgent);
        setGenerationHistory(prev => [...prev, updatedAgent]);
        setGenerationPhase({ phase: 'complete', message: 'Agent context generated' });
        setIsGenerating(false);
      }, 1000);
      
    } catch (error) {
      console.error('Agent generation failed:', error);
      setGenerationPhase({ phase: 'error', message: 'Generation failed' });
      setIsGenerating(false);
    }
  };

  const evolveAgent = async () => {
    if (!currentAgent?.context.generatedUI) return;
    
    setIsGenerating(true);
    setGenerationPhase({ phase: 'analyzing', message: 'Evolving Agent...' });
    
    try {
      const evolutionPrompt = "Improve the UI design, add more interactive elements, and enhance the user experience";
      const evolvedUI = await evolveAppWithGemini(currentAgent.context.generatedUI, evolutionPrompt);
      
      const evolvedAgent = AgentFactory.updateAgentContext(currentAgent, {
        generatedUI: evolvedUI
      });
      
      setCurrentAgent(evolvedAgent);
      setGenerationHistory(prev => [...prev, evolvedAgent]);
      setGenerationPhase({ phase: 'complete', message: 'Agent evolved' });
      setIsGenerating(false);
    } catch (error) {
      console.error('Agent evolution failed:', error);
      setGenerationPhase({ phase: 'error', message: 'Evolution failed' });
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold">Live Preview</h3>
          {currentAgent && (
            <Badge variant="outline" className="border-purple-400/30 text-purple-400">
              Agent: {currentAgent.id.split('_')[1]}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Device selector */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
            >
              <Monitor className="h-3 w-3" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
            >
              <Tablet className="h-3 w-3" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
            >
              <Smartphone className="h-3 w-3" />
            </button>
          </div>
          
          {currentAgent?.context.generatedUI && (
            <Button
              onClick={evolveAgent}
              disabled={isGenerating}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Evolve
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
          <TabsTrigger value="preview" className="data-[state=active]:bg-cyan-600">
            <Eye className="h-4 w-4 mr-2" />
            Preview visuel
          </TabsTrigger>
          <TabsTrigger value="code" className="data-[state=active]:bg-blue-600">
            <Code2 className="h-4 w-4 mr-2" />
            Code généré
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-green-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="terminal" className="data-[state=active]:bg-green-600">
            <Terminal className="h-4 w-4 mr-2" />
            Terminal
          </TabsTrigger>
          <TabsTrigger value="evolution" className="data-[state=active]:bg-purple-600">
            <GitBranch className="h-4 w-4 mr-2" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-orange-600">
            <Database className="h-4 w-4 mr-2" />
            Archive
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-4">
          <div className="relative h-[480px] bg-slate-950 rounded-lg overflow-auto flex items-center justify-center">
            <div className="h-full w-full max-h-full flex items-center justify-center">
              {!currentAgent && generationPhase.phase === 'idle' && (
                <div className="text-center text-slate-400">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Parse an intent to create Agent with Gemini AI</p>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
                    <div className="text-sm text-cyan-400">
                      {generationPhase.message}
                    </div>
                  </div>
                </div>
              )}

              {currentAgent?.context.generatedUI && !isGenerating && (
                <GeneratedAppPreview 
                  appCode={currentAgent.context.generatedUI} 
                  deviceType={previewDevice}
                />
              )}
              
              {/* Status indicator */}
              <div className="absolute bottom-4 left-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    generationPhase.phase === 'idle' ? 'bg-slate-500' :
                    generationPhase.phase === 'error' ? 'bg-red-400' :
                    generationPhase.phase === 'complete' ? 'bg-green-400' :
                    'bg-cyan-400 animate-pulse'
                  }`}></div>
                  <span className="text-slate-300">
                    {generationPhase.message}
                  </span>
                </div>
              </div>

              {/* Generation counter */}
              {generationHistory.length > 0 && (
                <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                  Agents: {generationHistory.length}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <div className="bg-slate-900 border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Code2 className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold">Agent Context</h3>
                <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                  React + JSX
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => currentAgent?.context.generatedUI && navigator.clipboard.writeText(currentAgent.context.generatedUI)}
              >
                Copy UI to Clipboard
              </Button>
            </div>
            <div className="px-4 pt-2 pb-0 text-xs text-slate-400">
              Ce contexte agentique est utilisé pour piloter l'agent Gemini : toute la logique métier et le backend sont simulés, l'UI sert d'interface à l'agent.
            </div>
            <div className="relative grid grid-cols-1 gap-0">
              <div className="p-4">
                <h4 className="text-blue-300 font-bold mb-2">Contexte métier</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap break-words text-slate-300 max-h-[300px] overflow-auto bg-slate-950 rounded-lg p-2">
                  {currentAgent?.context.businessLogic || '// Pas de contenu généré'}
                </pre>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <MetricsPanel />
        </TabsContent>

        <TabsContent value="terminal" className="mt-4">
          <div className="bg-slate-900 border-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Terminal className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold">Sandbox Terminal</h3>
            </div>
            <div className="bg-black rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
              <div className="text-green-400">
                darwin-forge@sandbox:~$ mount_tmpfs("/workspace")<br/>
                Mounted tmpfs at /workspace (512MiB)<br/>
                <br/>
                darwin-forge@sandbox:~$ start_firecracker_vm()<br/>
                ✓ VM initialized • gVisor sandbox active<br/>
                ✓ Tools loaded: [git, pytest, lighthouse-ci, vite, bandit]<br/>
                <br/>
                darwin-forge@sandbox:~$ load_archive_from_neo4j()<br/>
                ✓ Loaded 1,247 nodes from evolutionary archive<br/>
                ✓ Archive size: 487MB / 512MB budget<br/>
                <br/>
                {currentAgent && (
                  <>
                    <span className="text-cyan-400">
                      [AGENT] {currentAgent.id} • Status: Active<br/>
                      [AGENT] Context loaded: UI={currentAgent.context.generatedUI ? '✓' : '✗'} Backend={currentAgent.context.simulatedBackend ? '✓' : '✗'}<br/>
                      [AGENT] Theme: {currentAgent.uiParams.theme} • Layout: {currentAgent.uiParams.layout}<br/>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="evolution" className="mt-4">
          <EvolutionGraph isRunning={false} />
        </TabsContent>
        
        <TabsContent value="archive" className="mt-4">
          <ArchiveExplorer />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CollapseVisualizer;
