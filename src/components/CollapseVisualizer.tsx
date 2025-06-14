
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Zap, Monitor, Smartphone, Tablet } from 'lucide-react';

const CollapseVisualizer = ({ activeIntent }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('idle');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [appPreview, setAppPreview] = useState(null);

  const generatePreview = () => {
    if (!activeIntent) return;
    
    setIsGenerating(true);
    setGenerationPhase('analyzing');
    
    setTimeout(() => setGenerationPhase('designing'), 1000);
    setTimeout(() => setGenerationPhase('rendering'), 2500);
    setTimeout(() => {
      setGenerationPhase('complete');
      setIsGenerating(false);
      
      // Generate mock preview based on intent
      const mockPreview = {
        title: activeIntent.name || 'Generated App',
        components: generateMockComponents(activeIntent),
        theme: 'dark'
      };
      setAppPreview(mockPreview);
    }, 4000);
  };

  const generateMockComponents = (intent) => {
    const components = [];
    
    // Header
    components.push({
      type: 'header',
      content: intent.name || 'App Dashboard'
    });
    
    // Navigation based on features
    if (intent.features?.includes('Authentication')) {
      components.push({
        type: 'nav',
        items: ['Dashboard', 'Profile', 'Settings', 'Logout']
      });
    }
    
    // Main content based on entities
    if (intent.entities?.includes('Dashboard')) {
      components.push({
        type: 'dashboard',
        widgets: ['Stats', 'Charts', 'Recent Activity']
      });
    }
    
    if (intent.features?.includes('CRUD Operations')) {
      components.push({
        type: 'table',
        columns: ['ID', 'Name', 'Status', 'Actions']
      });
    }
    
    return components;
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
          
          <Button
            onClick={generatePreview}
            disabled={!activeIntent || isGenerating}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Preview
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative h-52 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
        {!appPreview && generationPhase === 'idle' && (
          <div className="text-center text-slate-400">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Parse an intent to see live preview</p>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
              <div className="text-sm text-cyan-400 capitalize">
                {generationPhase}...
              </div>
            </div>
          </div>
        )}

        {appPreview && (
          <div className={`${getDeviceClass()} bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300`}>
            {/* Mock App Interface */}
            <div className="h-full flex flex-col">
              {/* Header */}
              {appPreview.components.find(c => c.type === 'header') && (
                <div className="bg-slate-800 text-white p-3 text-sm font-semibold">
                  {appPreview.components.find(c => c.type === 'header').content}
                </div>
              )}
              
              {/* Navigation */}
              {appPreview.components.find(c => c.type === 'nav') && (
                <div className="bg-slate-700 text-white p-2 flex space-x-2 text-xs">
                  {appPreview.components.find(c => c.type === 'nav').items.map((item, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-600 rounded">
                      {item}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Main Content */}
              <div className="flex-1 p-3 bg-slate-50 overflow-hidden">
                {/* Dashboard widgets */}
                {appPreview.components.find(c => c.type === 'dashboard') && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {appPreview.components.find(c => c.type === 'dashboard').widgets.map((widget, i) => (
                      <div key={i} className="bg-white p-2 rounded shadow text-xs">
                        <div className="font-semibold text-slate-800">{widget}</div>
                        <div className="h-4 bg-gradient-to-r from-cyan-200 to-purple-200 rounded mt-1"></div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Table */}
                {appPreview.components.find(c => c.type === 'table') && (
                  <div className="bg-white rounded shadow">
                    <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 text-xs font-semibold">
                      {appPreview.components.find(c => c.type === 'table').columns.map((col, i) => (
                        <div key={i}>{col}</div>
                      ))}
                    </div>
                    {[1, 2, 3].map(row => (
                      <div key={row} className="grid grid-cols-4 gap-1 p-2 text-xs border-t">
                        <div>#{row}</div>
                        <div>Item {row}</div>
                        <div className="text-green-600">Active</div>
                        <div>••</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Status indicator */}
        <div className="absolute bottom-4 left-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              generationPhase === 'idle' ? 'bg-slate-500' :
              generationPhase === 'analyzing' ? 'bg-yellow-400 animate-pulse' :
              generationPhase === 'designing' ? 'bg-blue-400 animate-pulse' :
              generationPhase === 'rendering' ? 'bg-purple-400 animate-pulse' :
              'bg-green-400'
            }`}></div>
            <span className="text-slate-300 capitalize">
              {generationPhase === 'idle' ? 'Ready' : 
               generationPhase === 'complete' ? 'Live Preview Ready' : 
               generationPhase}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CollapseVisualizer;
