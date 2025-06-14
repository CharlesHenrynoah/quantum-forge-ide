
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Code2, Sparkles } from 'lucide-react';
import { parseIntentWithGemini } from '@/services/geminiService';

const IntentParser = ({ onIntentParsed, onAutoGenerateApp }) => {
  const [prompt, setPrompt] = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);
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
      
      setProcessingStep('Finalizing intent parsing...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setParsedIntent(intent);
      onIntentParsed?.(intent);
      console.log('Parsed Intent:', intent);
      
      // Automatically trigger app generation after parsing
      setProcessingStep('Generating app preview...');
      await new Promise(resolve => setTimeout(resolve, 500));
      onAutoGenerateApp?.(intent);
      
    } catch (error) {
      console.error('Intent parsing failed:', error);
      // Fallback to basic parsing if Gemini fails
      const fallbackIntent = {
        name: 'Generated App',
        entities: ['User', 'Data'],
        features: ['CRUD Operations', 'Authentication'],
        ui_spec: 'Modern interface with dark theme',
        performance_budget: '< 250ms TTFB',
        security_level: 'standard',
        estimated_complexity: 5,
        components: ['Dashboard', 'Form'],
        tech_stack: ['React', 'Tailwind', 'TypeScript']
      };
      setParsedIntent(fallbackIntent);
      onIntentParsed?.(fallbackIntent);
      onAutoGenerateApp?.(fallbackIntent);
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
              {processingStep || 'Generating App...'}
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
              <span className="text-sm font-medium text-green-400">Intent DSL Generated</span>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">App Name:</span>
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 text-xs">
                  {parsedIntent.name}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Complexity:</span>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < parsedIntent.estimated_complexity 
                          ? 'bg-gradient-to-r from-green-400 to-yellow-400' 
                          : 'bg-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-2">
                    {parsedIntent.estimated_complexity}/10
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-slate-300">Features:</span>
                <div className="flex flex-wrap gap-1">
                  {parsedIntent.features?.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-purple-900/30 text-purple-300">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-slate-300">Components:</span>
                <div className="flex flex-wrap gap-1">
                  {parsedIntent.components?.map((component, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-blue-900/30 text-blue-300">
                      {component}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntentParser;
