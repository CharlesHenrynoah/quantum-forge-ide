const GEMINI_API_KEY = 'AIzaSyB_lBRH0ja-p9-8Xzvzv8RfTU6z5QHKRWs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const generateWithGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

const extractCodeFromResponse = (response: string): string => {
  // Try to extract code between ```typescript, ```jsx, or ```javascript blocks
  const codeBlockRegex = /```(?:typescript|tsx|jsx|javascript)?\s*([\s\S]*?)```/g;
  const matches = [...response.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    return matches[0][1].trim();
  }
  
  // Try to find code that starts with import or const/function
  const codeStartRegex = /(import[\s\S]*?export default \w+;?)/;
  const codeMatch = response.match(codeStartRegex);
  
  if (codeMatch) {
    return codeMatch[1].trim();
  }
  
  // If no clear code blocks found, return the response as-is
  return response.trim();
};

export const parseIntentWithGemini = async (userPrompt: string) => {
  const prompt = `
Analyze this user request and extract structured information for app generation:
"${userPrompt}"

Return ONLY a JSON object with this exact structure (no explanations, no markdown):
{
  "name": "App name",
  "entities": ["Entity1", "Entity2"],
  "features": ["Feature1", "Feature2"],
  "ui_spec": "UI description",
  "performance_budget": "< 250ms TTFB",
  "security_level": "enterprise|standard|basic",
  "estimated_complexity": 1-10,
  "components": ["Component1", "Component2"],
  "tech_stack": ["React", "Tailwind", "TypeScript"]
}

Focus on extracting concrete, actionable information.
`;

  try {
    const response = await generateWithGemini(prompt);
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Intent parsing error:', error);
    // Fallback to mock data
    return {
      name: 'Generated App',
      entities: ['User', 'Data'],
      features: ['CRUD Operations', 'Authentication'],
      ui_spec: 'Modern interface with dark theme',
      performance_budget: '< 250ms TTFB',
      security_level: 'standard',
      estimated_complexity: 5,
      components: ['Dashboard', 'Form', 'Table'],
      tech_stack: ['React', 'Tailwind', 'TypeScript']
    };
  }
};

export const generateAppCodeWithGemini = async (intent: any) => {
  const prompt = `
Génère UNIQUEMENT le code d'un composant React fonctionnel nommé "GeneratedApp".
Règles strictes :
- Pas d'import, pas d'export, pas de markdown, pas de JSON, pas d'explications, pas de commentaires.
- Le code doit être autonome, tout doit être dans le composant.
- Utilise uniquement les hooks React natifs (useState, useEffect si besoin).
- Utilise Tailwind CSS pour le style.
- Le code doit commencer par : const GeneratedApp = () => { ... } et finir par };.
- Retourne seulement ce code, rien d'autre.
- Ne génère pas d'écran de login, d'authentification ou d'inscription. L'application doit être directement utilisable, sans étape d'identification.
- L'application doit être intelligente et interactive : elle doit utiliser les entrées de l'utilisateur pour générer des résultats pertinents et dynamiques.
- Considère que le backend est un agent intelligent généré par Gemini, capable de répondre à toutes les requêtes de l'application de façon pertinente et contextuelle.
- Simule les appels backend avec des fonctions asynchrones fictives (async function) qui retournent des résultats intelligents adaptés à l'intention de l'utilisateur.

Spécification de l'application :
Nom : ${intent.name}
Fonctionnalités : ${intent.features?.join(', ')}
Composants nécessaires : ${intent.components?.join(', ')}
UI : ${intent.ui_spec}
`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanCode = extractCodeFromResponse(response);
    console.log('Generated code:', cleanCode);
    return cleanCode;
  } catch (error) {
    console.error('App generation error:', error);
    return `
import React from 'react';

const GeneratedApp = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          ${intent.name || 'Generated App'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded"></div>
              <div className="h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
            </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2">
              ${intent.features?.map((f: string) => `<li className="text-slate-300">• ${f}</li>`).join('\n              ') || ''}
            </ul>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedApp;
    `;
  }
};

export const evolveAppWithGemini = async (currentCode: string, evolutionPrompt: string) => {
  const prompt = `
Current app code:
${currentCode}

Evolution request: ${evolutionPrompt}

IMPORTANT RULES:
1. Return ONLY valid TypeScript React code, NO explanations or markdown
2. Keep existing functionality intact
3. Add the requested improvements
4. Maintain component name "GeneratedApp"
5. Use Tailwind CSS for styling
6. Include all necessary imports

Generate the improved version:
`;

  try {
    const response = await generateWithGemini(prompt);
    const cleanCode = extractCodeFromResponse(response);
    console.log('Evolved code:', cleanCode);
    return cleanCode;
  } catch (error) {
    console.error('App evolution error:', error);
    return currentCode; // Return original if evolution fails
  }
};

// AGENT 1 : Génération du contenu (logique métier, structure des données)
export const generateContentWithGemini = async (intent: any) => {
  const prompt = `
Analyse la spécification suivante et génère uniquement la logique métier et la structure des données nécessaires à l'application. Ne génère pas d'UI ni de backend ici.

Spécification :
Nom : ${intent.name}
Fonctionnalités : ${intent.features?.join(', ')}
Composants nécessaires : ${intent.components?.join(', ')}
UI : ${intent.ui_spec}
`;
  return await generateWithGemini(prompt);
};

// AGENT 2 : Génération du backend (API intelligente simulée)
export const generateBackendWithGemini = async (intent: any) => {
  const prompt = `
Génère uniquement la logique backend simulée pour cette application :
- Utilise des fonctions asynchrones (async function) pour simuler les appels API.
- Le backend est un agent intelligent généré par Gemini, il répond toujours de façon pertinente et contextuelle.
- Ne génère pas d'UI ici.

Spécification :
Nom : ${intent.name}
Fonctionnalités : ${intent.features?.join(', ')}
Composants nécessaires : ${intent.components?.join(', ')}
UI : ${intent.ui_spec}
`;
  return await generateWithGemini(prompt);
};

// AGENT 3 : Génération de l'UI (moderne, simple, ergonomique)
export const generateUIWithGemini = async (intent: any) => {
  const prompt = `
Génère UNIQUEMENT du code JSX/TSX pour une interface React de type ${intent.name} (ex : dashboard, gestionnaire de tâches, CRM, etc.) qui délègue toute la logique métier à un agent Gemini.
Règles strictes :
- Toutes les actions utilisateur (clics, formulaires, etc.) doivent appeler une fonction fictive sendToGemini qui envoie la demande à l'agent Gemini.
- Les réponses de Gemini sont affichées dans l'UI (tableaux, cartes, notifications, etc.).
- N'inclus AUCUN texte explicatif, AUCUN markdown, AUCUN import/export, AUCUN backend en dur.
- Utilise Tailwind CSS pour le style.
- Le code doit être immédiatement exécutable dans un projet React.
- L'UI doit ressembler à un vrai logiciel moderne, avec une bonne hiérarchie visuelle, des espacements harmonieux, et au moins un titre, une zone de contenu, et une interaction utilisateur.
- Ne génère jamais de page vide.

Spécification :
Nom : ${intent.name}
Fonctionnalités : ${intent.features?.join(', ')}
Composants nécessaires : ${intent.components?.join(', ')}
UI : ${intent.ui_spec}
`;
  return await generateWithGemini(prompt);
};
