
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Code2 } from 'lucide-react';

const IntentParser = ({ onIntentParsed }) => {
  const [prompt, setPrompt] = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParseIntent = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate intent parsing
    setTimeout(() => {
      const mockIntent = {
        name: extractAppName(prompt),
        entities: ['User', 'Task', 'Dashboard'],
        features: ['Authentication', 'CRUD Operations', 'Real-time Updates'],
        ui_spec: 'Modern dashboard with dark theme',
        performance_budget: '< 250ms TTFB',
        security_level: 'enterprise',
        estimated_complexity: Math.floor(Math.random() * 10) + 1
      };
      
      setParsedIntent(mockIntent);
      setIsProcessing(false);
      onIntentParsed?.(mockIntent);
    }, 2000);
  };

  const extractAppName = (text) => {
    const words = text.toLowerCase().split(' ');
    const appWords = words.filter(w => w.includes('app') || w.includes('dashboard') || w.includes('platform'));
    return appWords.length > 0 ? appWords[0] : 'Generated App';
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold">Intent Parser</h3>
      </div>
      
      <div className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the app you want to build... e.g., 'Create a task management dashboard with real-time collaboration features'"
          className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 min-h-24"
        />
        
        <Button 
          onClick={handleParseIntent}
          disabled={!prompt.trim() || isProcessing}
          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Parsing Intent...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Parse Intent → DSL
            </>
          )}
        </Button>

        {parsedIntent && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Intent DSL Generated</span>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">App Name:</span>
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">
                  {parsedIntent.name}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Complexity:</span>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
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
              
              <div className="space-y-1">
                <span className="text-sm text-slate-300">Features:</span>
                <div className="flex flex-wrap gap-1">
                  {parsedIntent.features.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-purple-900/30 text-purple-300">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default IntentParser;
