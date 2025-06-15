import React, { useState, useEffect } from 'react';
import * as Babel from '@babel/standalone';

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
      
      // Nettoyage du code généré
      let cleanCode = appCode.trim();
      // Supprimer les balises markdown
      cleanCode = cleanCode.replace(/```[\s\S]*?```/g, '');
      // Supprimer les imports/exports
      cleanCode = cleanCode.replace(/import\s+.*?;?/g, '');
      cleanCode = cleanCode.replace(/export\s+default\s+.*?;?/g, '');
      // Supprimer les blocs JSON (ex: { ... }) qui ne sont pas du code React
      cleanCode = cleanCode.replace(/^[{\[].*[}\]]$/gms, '');
      // Supprimer les lignes vides en début/fin
      cleanCode = cleanCode.replace(/^\s+|\s+$/g, '');
      // Robustesse
      const trimmed = cleanCode.trimStart();
      if (!trimmed || (!trimmed.startsWith('const GeneratedApp') && !/^<([\s\S]*)>/.test(trimmed))) {
        // Si le code est vide ou non exploitable, on affiche une UI de test par défaut
        setAppComponent(() => () => (
          <div className="flex flex-col items-center justify-center h-full w-full text-slate-400">
            <span className="text-2xl mb-2">✨</span>
            <span>UI de test par défaut : Gemini n'a rien généré.<br/>Essayez de régénérer ou de modifier votre prompt.</span>
            <div className="mt-4 p-4 bg-slate-800 rounded-lg text-left text-xs text-slate-300 max-w-xs">
              <b>Exemple :</b>
              <pre className="whitespace-pre-wrap break-words">Dashboard
- Liste de tâches
- Statistiques
- Utilisateurs</pre>
            </div>
          </div>
        ));
        setError(null);
        return;
      }
      if (trimmed.startsWith('const GeneratedApp')) {
        // OK
      } else if (/^<([\s\S]*)>/.test(trimmed)) {
        cleanCode = `const GeneratedApp = () => (${trimmed});`;
      }
      // Transpile avec Babel
      let transpiled = '';
      try {
        transpiled = Babel.transform(cleanCode, { presets: ['react'] }).code;
      } catch (babelErr) {
        throw new Error('Erreur Babel lors de la transpilation JSX : ' + babelErr.message);
      }
      // Exécution du code transpilé avec les hooks React dans le scope
      const createComponent = new Function(
        'React',
        `
          const { useState, useEffect, useRef, useContext, useMemo, useCallback, useReducer } = React;
          ${transpiled};
          return GeneratedApp;
        `
      );
      const Component = createComponent(React);
      setAppComponent(() => Component);
      setError(null);
    } catch (err) {
      console.error('Failed to create component:', err, '\nCode nettoyé :', appCode);
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
