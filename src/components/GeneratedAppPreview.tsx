
import React, { useState, useEffect } from 'react';

interface GeneratedAppPreviewProps {
  appCode: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

const GeneratedAppPreview: React.FC<GeneratedAppPreviewProps> = ({ appCode, deviceType }) => {
  const [AppComponent, setAppComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('Attempting to render code:', appCode.substring(0, 200) + '...');
      
      // Clean the code before execution
      let cleanCode = appCode.trim();
      
      // Remove any markdown code blocks if they exist
      cleanCode = cleanCode.replace(/```(?:typescript|tsx|jsx|javascript)?\s*/g, '');
      cleanCode = cleanCode.replace(/```\s*$/g, '');
      
      // Ensure we have a proper React component
      if (!cleanCode.includes('GeneratedApp')) {
        throw new Error('No GeneratedApp component found in code');
      }
      
      // Create a function that returns the component
      const createComponent = new Function('React', `
        ${cleanCode}
        return GeneratedApp;
      `);
      
      const Component = createComponent(React);
      setAppComponent(() => Component);
      setError(null);
    } catch (err) {
      console.error('Failed to create component:', err);
      setError(`Failed to render: ${err.message}`);
      setAppComponent(null);
    }
  }, [appCode]);

  const getDeviceClass = () => {
    switch (deviceType) {
      case 'mobile': return 'w-64 h-96';
      case 'tablet': return 'w-80 h-96';
      default: return 'w-full h-full';
    }
  };

  if (error) {
    return (
      <div className={`${getDeviceClass()} bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center`}>
        <div className="text-center text-red-400 p-4">
          <p className="text-sm">⚠ Render Error</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!AppComponent) {
    return (
      <div className={`${getDeviceClass()} bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center`}>
        <div className="text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
          <p className="text-sm">Rendering...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getDeviceClass()} bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300`}>
      <div className="h-full overflow-auto">
        <AppComponent />
      </div>
    </div>
  );
};

export default GeneratedAppPreview;
