
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare } from 'lucide-react';
import IntentParser from '@/components/IntentParser';
import CollapseVisualizer from '@/components/CollapseVisualizer';
import { Agent } from '@/types/Agent';

const Index = () => {
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);

  const handleAgentCreated = (agent: Agent) => {
    setActiveAgent(agent);
    setCurrentGeneration(prev => prev + 1);
    console.log('New Agent received:', agent);
  };

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
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex h-[calc(100vh-120px)]">
        
        {/* Left Sidebar - Agent Creation */}
        <div className="w-80 bg-slate-950/30 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <Badge variant="outline" className="border-green-400/30 text-green-400">
                Online
              </Badge>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <IntentParser onAgentCreated={handleAgentCreated} />
          </div>
        </div>

        {/* Right Side - Agent Visualization */}
        <div className="flex-1 p-6">
          <CollapseVisualizer activeAgent={activeAgent} />
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
            {activeAgent && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Agent: {activeAgent.id.split('_')[1]}</span>
              </div>
            )}
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
