
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Zap, Monitor, Smartphone, Tablet, GitBranch, Database, Sparkles, RotateCcw, BarChart3, Terminal } from 'lucide-react';
import EvolutionGraph from './EvolutionGraph';
import ArchiveExplorer from './ArchiveExplorer';
import GeneratedAppPreview from './GeneratedAppPreview';
import MetricsPanel from './MetricsPanel';
import { generateAppCodeWithGemini, evolveAppWithGemini } from '@/services/geminiService';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const CollapseVisualizer = ({ activeIntent, shouldAutoGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('idle');
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [generatedAppCode, setGeneratedAppCode] = useState('');
  const [isEvolutionRunning, setIsEvolutionRunning] = useState(false);
  const [generationHistory, setGenerationHistory] = useState([]);

  // Auto-generate when triggered from IntentParser
  useEffect(() => {
    if (shouldAutoGenerate && activeIntent && !isGenerating) {
      generatePreview();
    }
  }, [shouldAutoGenerate, activeIntent]);

  const generatePreview = async () => {
    if (!activeIntent) return;
    
    setIsGenerating(true);
    setGenerationPhase('analyzing');
    
    try {
      setTimeout(() => setGenerationPhase('connecting_gemini'), 1000);
      
      setTimeout(() => setGenerationPhase('generating_code'), 2000);
      
      const appCode = await generateAppCodeWithGemini(activeIntent);
      
      setGenerationPhase('rendering');
      setTimeout(() => {
        setGeneratedAppCode(appCode);
        setGenerationHistory(prev => [...prev, {
          id: Date.now(),
          intent: activeIntent,
          code: appCode,
          timestamp: new Date().toISOString()
        }]);
        setGenerationPhase('complete');
        setIsGenerating(false);
      }, 1000);
      
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationPhase('error');
      setIsGenerating(false);
    }
  };

  const evolveApp = async () => {
    if (!generatedAppCode) return;
    
    setIsGenerating(true);
    setGenerationPhase('evolving');
    
    try {
      const evolutionPrompt = "Improve the UI design, add more interactive elements, and enhance the user experience";
      const evolvedCode = await evolveAppWithGemini(generatedAppCode, evolutionPrompt);
      
      setGeneratedAppCode(evolvedCode);
      setGenerationHistory(prev => [...prev, {
        id: Date.now(),
        intent: { ...activeIntent, name: `${activeIntent.name} (Evolved)` },
        code: evolvedCode,
        timestamp: new Date().toISOString()
      }]);
      setGenerationPhase('complete');
      setIsGenerating(false);
    } catch (error) {
      console.error('Evolution failed:', error);
      setGenerationPhase('error');
      setIsGenerating(false);
    }
  };

  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile': return 'w-64 h-96';
      case 'tablet': return 'w-80 h-96';
      default: return 'w-full h-full';
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold">Live Preview</h3>
          <Badge variant="outline" className="border-green-400/30 text-green-400">
            <Sparkles className="h-3 w-3 mr-1" />
            Gemini AI
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Device selector */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice('desktop' as DeviceType)}
              className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
            >
              <Monitor className="h-3 w-3" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet' as DeviceType)}
              className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
            >
              <Tablet className="h-3 w-3" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile' as DeviceType)}
              className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}
            >
              <Smartphone className="h-3 w-3" />
            </button>
          </div>
          
          {generatedAppCode && (
            <Button
              onClick={evolveApp}
              disabled={isGenerating}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Evolve
            </Button>
          )}
          
          <Button
            onClick={generatePreview}
            disabled={!activeIntent || isGenerating}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {generationPhase === 'analyzing' && 'Analyzing...'}
                {generationPhase === 'connecting_gemini' && 'Connecting to Gemini...'}
                {generationPhase === 'generating_code' && 'Generating Code...'}
                {generationPhase === 'rendering' && 'Rendering...'}
                {generationPhase === 'evolving' && 'Evolving App...'}
                {generationPhase === 'error' && 'Error'}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
          <TabsTrigger value="preview" className="data-[state=active]:bg-cyan-600">
            <Eye className="h-4 w-4 mr-2" />
            Preview
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
          <div className="relative h-96 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
            {!generatedAppCode && generationPhase === 'idle' && (
              <div className="text-center text-slate-400">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Parse an intent to generate app with Gemini AI</p>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
                  <div className="text-sm text-cyan-400 capitalize">
                    {generationPhase === 'connecting_gemini' && '🧠 Connecting to Gemini AI...'}
                    {generationPhase === 'generating_code' && '⚡ Generating React Code...'}
                    {generationPhase === 'analyzing' && '🔍 Analyzing Intent...'}
                    {generationPhase === 'rendering' && '🎨 Rendering App...'}
                    {generationPhase === 'evolving' && '🔄 Evolving Application...'}
                  </div>
                </div>
              </div>
            )}

            {generatedAppCode && !isGenerating && (
              <GeneratedAppPreview 
                appCode={generatedAppCode} 
                deviceType={previewDevice}
              />
            )}
            
            {/* Status indicator */}
            <div className="absolute bottom-4 left-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  generationPhase === 'idle' ? 'bg-slate-500' :
                  generationPhase === 'error' ? 'bg-red-400' :
                  generationPhase === 'complete' ? 'bg-green-400' :
                  'bg-cyan-400 animate-pulse'
                }`}></div>
                <span className="text-slate-300 capitalize">
                  {generationPhase === 'idle' ? 'Ready' : 
                   generationPhase === 'complete' ? 'App Generated by Gemini AI' : 
                   generationPhase === 'error' ? 'Generation Failed' :
                   generationPhase}
                </span>
              </div>
            </div>

            {/* Generation counter */}
            {generationHistory.length > 0 && (
              <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                Generations: {generationHistory.length}
              </div>
            )}
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
                {isEvolutionRunning && (
                  <>
                    <span className="text-cyan-400">
                      [EVOLUTION] Selecting parent node via fitness roulette...<br/>
                      [EVOLUTION] Parent: node_7a3f • fitness: 0.847<br/>
                      [EVOLUTION] Generating mutation patch...<br/>
                      <span className="animate-pulse">⚡ LLM.invoke(role=PROPOSE_PATCH) ...</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="evolution" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-purple-400" />
              <h4 className="text-lg font-semibold">Evolution Tree</h4>
              {isEvolutionRunning && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Active</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => setIsEvolutionRunning(!isEvolutionRunning)}
              size="sm"
              className={`${isEvolutionRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isEvolutionRunning ? '⏹ Stop' : '▶ Start'}
            </Button>
          </div>
          <EvolutionGraph isRunning={isEvolutionRunning} />
        </TabsContent>
        
        <TabsContent value="archive" className="mt-4">
          <ArchiveExplorer />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CollapseVisualizer;
