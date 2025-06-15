
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

export const generateUIWithGemini = async (intent: any) => {
  const appName = intent.name || 'Application';
  const features = intent.features || [];
  const components = intent.components || [];
  
  const prompt = `Génère UNIQUEMENT le code d'un composant React pour "${appName}".

RÈGLES STRICTES:
- Code React/JSX uniquement
- Commence par: const GeneratedApp = () => {
- Termine par: };
- Utilise useState pour la logique interactive
- Utilise Tailwind CSS pour tous les styles
- Pas d'imports, pas d'exports
- Interface 100% interactive avec boutons fonctionnels

SPÉCIFICATIONS:
- Nom: ${appName}
- Fonctionnalités: ${features.join(', ') || 'Interface de base'}
- Composants: ${components.join(', ') || 'Interface simple'}
- UI: ${intent.ui_spec || 'Design moderne'}

Crée une interface UNIQUE et DIFFÉRENTE à chaque fois selon ces spécifications.`;

  try {
    const response = await generateWithGemini(prompt);
    let cleanCode = response.trim();
    
    // Nettoyage du code
    cleanCode = cleanCode.replace(/```[\s\S]*?```/g, '');
    cleanCode = cleanCode.replace(/import\s+.*?;?/g, '');
    cleanCode = cleanCode.replace(/export\s+.*?;?/g, '');
    cleanCode = cleanCode.trim();
    
    // Vérification et fallback si nécessaire
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
  const appName = intent.name || 'Application Générée';
  const features = intent.features || ['Interface de base'];
  
  return `const GeneratedApp = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { 
        id: Date.now(), 
        text: newItem, 
        timestamp: new Date().toLocaleString(),
        status: 'active'
      }]);
      setNewItem('');
    }
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            ${appName}
          </h1>
          <p className="text-gray-600 text-lg">
            ${intent.ui_spec || 'Interface personnalisée générée par IA'}
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Interface Principale</h2>
          
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Saisissez votre contenu ici..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={addItem}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg"
            >
              Ajouter
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Éléments Ajoutés</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun élément ajouté</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{item.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Total d'éléments</span>
                  <span className="font-bold text-2xl text-purple-600">{items.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Activité</span>
                  <span className="font-bold text-green-600">{items.length > 0 ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: Math.min(100, items.length * 10) + '%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Fonctionnalités Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${features.map(feature => `
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl hover:from-purple-200 hover:to-blue-200 transition-all duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <span className="font-medium text-gray-800">${feature}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Complexité estimée: ${intent.estimated_complexity || 5}/10 • 
            Sécurité: ${intent.security_level || 'standard'}
          </p>
        </div>
      </div>
    </div>
  );
};`;
};
