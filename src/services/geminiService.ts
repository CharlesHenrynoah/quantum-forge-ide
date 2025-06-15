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
Génère un composant React appelé "GeneratedApp" pour: ${intent.name}

Règles STRICTES:
- Code React/JSX uniquement
- Commence par: const GeneratedApp = () => {
- Termine par: };
- Utilise Tailwind CSS
- Pas d'imports, pas d'exports
- Interface interactive avec des boutons et formulaires
- Fonctionnalités: ${intent.features?.join(', ') || 'Interface basique'}

Exemple de structure:
const GeneratedApp = () => {
  const [data, setData] = useState([]);
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">${intent.name}</h1>
      {/* Interface interactive ici */}
    </div>
  );
};
`;

  try {
    const response = await generateWithGemini(prompt);
    let cleanCode = response.trim();
    
    // Nettoyage plus agressif
    cleanCode = cleanCode.replace(/```[\s\S]*?```/g, '');
    cleanCode = cleanCode.replace(/import\s+.*?;?/g, '');
    cleanCode = cleanCode.replace(/export\s+.*?;?/g, '');
    cleanCode = cleanCode.trim();
    
    // Vérification et fallback
    if (!cleanCode || !cleanCode.includes('const GeneratedApp')) {
      console.log('Gemini n\'a pas généré de code valide, utilisation du fallback');
      return generateFallbackUI(intent);
    }
    
    console.log('Generated UI code:', cleanCode.substring(0, 200) + '...');
    return cleanCode;
  } catch (error) {
    console.error('UI generation error:', error);
    return generateFallbackUI(intent);
  }
};

// Fonction de fallback qui génère toujours une UI valide
const generateFallbackUI = (intent: any) => {
  return `const GeneratedApp = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), text: newItem, status: 'active' }]);
      setNewItem('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          ${intent.name || 'Application Générée'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Ajouter un élément</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Tapez quelque chose..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addItem}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Liste des éléments</h3>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-gray-500">Aucun élément ajouté</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded border">
                    {item.text}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">{items.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: Math.min(100, items.length * 10) + '%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setItems([])}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Vider la liste
              </button>
              <button 
                onClick={() => console.log('Données:', items)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Afficher dans la console
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Fonctionnalités: ${intent.features?.join(', ') || 'Interface interactive de base'}
          </p>
        </div>
      </div>
    </div>
  );
};`;
};
