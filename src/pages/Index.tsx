
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Zap, GitBranch, Code2, Terminal, Eye, Brain, Atom } from 'lucide-react';
import EvolutionGraph from '@/components/EvolutionGraph';
import MetricsPanel from '@/components/MetricsPanel';
import IntentParser from '@/components/IntentParser';
import CollapseVisualizer from '@/components/CollapseVisualizer';
import ArchiveExplorer from '@/components/ArchiveExplorer';

const Index = () => {
  const [isEvolutionRunning, setIsEvolutionRunning] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [activeIntent, setActiveIntent] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-cyan-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  DARWIN-FORGE IDE
                </h1>
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">
                  v0.3-alpha
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-slate-400">
                Gen {currentGeneration} • Archive: 1,247 nodes
              </div>
              <Button 
                onClick={() => setIsEvolutionRunning(!isEvolutionRunning)}
                className={`${isEvolutionRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
              >
                {isEvolutionRunning ? (
                  <>⏹ Stop Evolution</>
                ) : (
                  <>▶ Start Evolution</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column - Intent & Control */}
          <div className="xl:col-span-1 space-y-6">
            <IntentParser onIntentParsed={setActiveIntent} />
            <ArchiveExplorer />
          </div>

          {/* Center Column - Evolution Visualization */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <GitBranch className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Evolution Tree</h3>
                {isEvolutionRunning && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                )}
              </div>
              <EvolutionGraph isRunning={isEvolutionRunning} />
            </Card>

            <CollapseVisualizer activeIntent={activeIntent} />
          </div>

          {/* Right Column - Metrics & Terminal */}
          <div className="xl:col-span-1 space-y-6">
            <MetricsPanel />
            
            <Card className="bg-slate-900/50 border-slate-700 p-6">
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
            </Card>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur border-t border-slate-800 px-6 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Firecracker VM: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>gVisor Sandbox: Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Neo4j Archive: Connected</span>
            </div>
          </div>
          <div className="text-slate-400">
            Memory: 487MB/512MB • CPU: 23% • Network: 1.2MB/s
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
