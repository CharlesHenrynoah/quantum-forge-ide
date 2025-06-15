
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Code2, Sparkles } from 'lucide-react';
import { parseIntentWithGemini } from '@/services/geminiService';
import { AgentFactory } from '@/services/AgentFactory';
import { Agent, AgentIntent } from '@/types/Agent';

interface IntentParserProps {
  onAgentCreated: (agent: Agent) => void;
}

const IntentParser: React.FC<IntentParserProps> = ({ onAgentCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [parsedIntent, setParsedIntent] = useState<AgentIntent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handleGenerateApp = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setProcessingStep('Connecting to Gemini AI...');
    
    try {
      setProcessingStep('Analyzing intent structure...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStep('Generating DSL with Gemini...');
      const intent = await parseIntentWithGemini(prompt);
      
      setProcessingStep('Creating Agent object...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setParsedIntent(intent);
      
      // Création de l'objet Agent
      const agent = AgentFactory.createAgent(intent, prompt);
      console.log('Agent created:', agent);
      
      setProcessingStep('Agent ready for generation...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Transmission de l'Agent au CollapseVisualizer
      onAgentCreated(agent);
      
    } catch (error) {
      console.error('Intent parsing failed:', error);
      // Fallback Agent
      const fallbackIntent: AgentIntent = {
        name: 'Generated App',
        entities: ['User', 'Data'],
        features: ['CRUD Operations', 'Dashboard'],
        ui_spec: 'Modern interface with dark theme',
        performance_budget: '< 250ms TTFB',
        security_level: 'standard',
        estimated_complexity: 5,
        components: ['Dashboard', 'Form'],
        tech_stack: ['React', 'Tailwind', 'TypeScript']
      };
      
      const fallbackAgent = AgentFactory.createAgent(fallbackIntent, prompt);
      setParsedIntent(fallbackIntent);
      onAgentCreated(fallbackAgent);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold">Intent Parser</h3>
        <Badge variant="outline" className="border-green-400/30 text-green-400">
          <Sparkles className="h-3 w-3 mr-1" />
          Gemini AI
        </Badge>
      </div>
      
      <div className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décrivez l'application que vous voulez créer... ex: 'Créer un dashboard de gestion de tâches avec collaboration en temps réel'"
          className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 min-h-32 resize-none"
        />
        
        <Button 
          onClick={handleGenerateApp}
          disabled={!prompt.trim() || isProcessing}
          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {processingStep || 'Creating Agent...'}
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate App
            </>
          )}
        </Button>

        {parsedIntent && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Agent structuré généré</span>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Agent Name:</span>
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 text-xs">
                  {parsedIntent.name}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-slate-300">UI Components:</span>
                <div className="flex flex-wrap gap-1">
                  {parsedIntent.components?.map((component, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-blue-900/30 text-blue-300">
                      {component}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-400 mt-2">
                Layout: {parsedIntent.estimated_complexity > 7 ? 'Complex' : 'Simple'} • 
                Contexte métier: AI chat
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntentParser;
