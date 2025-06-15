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
  // Création d'un prompt dynamique basé sur l'intention
  const getSpecificPrompt = (intent: any) => {
    const appName = intent.name || 'Application';
    const features = intent.features || [];
    const components = intent.components || [];
    
    // Détection du type d'application pour adapter le prompt
    const appType = detectAppType(features, components, appName);
    
    switch (appType) {
      case 'dashboard':
        return `Génère un composant React dashboard pour "${appName}".
STRUCTURE REQUISE:
- En-tête avec titre "${appName}" et navigation
- Grille de cartes métriques avec données dynamiques
- Graphiques ou barres de progression
- Tableau de données avec actions
- Sidebar avec menu de navigation
FONCTIONNALITÉS: ${features.join(', ')}
Utilise des couleurs vives, des icônes, et des animations subtiles.`;

      case 'ecommerce':
        return `Génère un composant React e-commerce pour "${appName}".
STRUCTURE REQUISE:
- Header avec logo, recherche, panier
- Grille de produits avec images, prix, boutons
- Filtres sur le côté (catégories, prix)
- Système de notation par étoiles
- Boutons d'ajout au panier fonctionnels
FONCTIONNALITÉS: ${features.join(', ')}
Design moderne avec cards produits attractives.`;

      case 'social':
        return `Génère un composant React réseau social pour "${appName}".
STRUCTURE REQUISE:
- Feed de publications avec avatars
- Système de likes/commentaires
- Sidebar avec profil utilisateur
- Zone de création de post
- Liste d'amis ou contacts
FONCTIONNALITÉS: ${features.join(', ')}
Interface moderne type Instagram/Twitter.`;

      case 'productivity':
        return `Génère un composant React productivité pour "${appName}".
STRUCTURE REQUISE:
- Interface de gestion avec formulaires
- Listes interactives avec drag & drop
- Barres de progression pour suivi
- Calendrier ou timeline
- Outils de collaboration
FONCTIONNALITÉS: ${features.join(', ')}
Design épuré et fonctionnel.`;

      case 'finance':
        return `Génère un composant React finance pour "${appName}".
STRUCTURE REQUISE:
- Tableau de bord financier
- Graphiques de performance
- Calculateurs intégrés
- Historique des transactions
- Alertes et notifications
FONCTIONNALITÉS: ${features.join(', ')}
Design professionnel avec couleurs finance (vert/rouge).`;

      default:
        return `Génère un composant React personnalisé pour "${appName}".
CRÉER UNE INTERFACE ADAPTÉE À CES SPÉCIFICATIONS:
- Nom: ${appName}
- Fonctionnalités demandées: ${features.join(', ') || 'Interface de base'}
- Composants: ${components.join(', ') || 'Interface simple'}
- Spécification UI: ${intent.ui_spec || 'Design moderne'}
Crée une interface UNIQUE qui correspond exactement à ces besoins.`;
    }
  };

  const specificPrompt = getSpecificPrompt(intent);

  const prompt = `${specificPrompt}

RÈGLES TECHNIQUES STRICTES:
- Code React/JSX uniquement
- Commence par: const GeneratedApp = () => {
- Termine par: };
- Utilise useState pour la logique interactive
- Utilise Tailwind CSS pour tous les styles
- Pas d'imports, pas d'exports
- Interface 100% interactive avec boutons fonctionnels
- Simule les données avec des arrays d'objets réalistes
- Ajoute des animations avec Tailwind (hover:, transition-)

IMPÉRATIF: L'interface doit être COMPLÈTEMENT DIFFÉRENTE selon le type d'application demandé.
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
      console.log('Gemini n\'a pas généré de code valide, utilisation du fallback contextualisé');
      return generateContextualizedFallback(intent);
    }
    
    console.log('Generated UI code:', cleanCode.substring(0, 200) + '...');
    return cleanCode;
  } catch (error) {
    console.error('UI generation error:', error);
    return generateContextualizedFallback(intent);
  }
};

// Fonction pour détecter le type d'application
const detectAppType = (features: string[], components: string[], appName: string): string => {
  const allText = [...features, ...components, appName].join(' ').toLowerCase();
  
  if (allText.includes('dashboard') || allText.includes('métriques') || allText.includes('statistiques') || allText.includes('analytics')) {
    return 'dashboard';
  }
  if (allText.includes('e-commerce') || allText.includes('boutique') || allText.includes('produit') || allText.includes('panier') || allText.includes('shop')) {
    return 'ecommerce';
  }
  if (allText.includes('social') || allText.includes('réseau') || allText.includes('chat') || allText.includes('message') || allText.includes('ami')) {
    return 'social';
  }
  if (allText.includes('tâche') || allText.includes('todo') || allText.includes('projet') || allText.includes('calendrier') || allText.includes('planning')) {
    return 'productivity';
  }
  if (allText.includes('finance') || allText.includes('banque') || allText.includes('budget') || allText.includes('argent') || allText.includes('compte')) {
    return 'finance';
  }
  
  return 'custom';
};

// Fonction de fallback contextualisée qui génère une UI adaptée au contexte
const generateContextualizedFallback = (intent: any) => {
  const appName = intent.name || 'Application Générée';
  const features = intent.features || ['Interface de base'];
  const appType = detectAppType(intent.features || [], intent.components || [], intent.name || '');
  
  // Génération d'UI différente selon le type détecté
  switch (appType) {
    case 'dashboard':
      return generateDashboardFallback(appName, features);
    case 'ecommerce':
      return generateEcommerceFallback(appName, features);
    case 'social':
      return generateSocialFallback(appName, features);
    case 'productivity':
      return generateProductivityFallback(appName, features);
    case 'finance':
      return generateFinanceFallback(appName, features);
    default:
      return generateCustomFallback(appName, features, intent);
  }
};

const generateDashboardFallback = (appName: string, features: string[]) => {
  return `const GeneratedApp = () => {
  const [metrics, setMetrics] = useState([
    { name: 'Utilisateurs Actifs', value: 1247, change: '+12%', color: 'bg-blue-500' },
    { name: 'Revenus', value: '€45,230', change: '+8%', color: 'bg-green-500' },
    { name: 'Commandes', value: 892, change: '+15%', color: 'bg-purple-500' },
    { name: 'Conversion', value: '3.2%', change: '-2%', color: 'bg-orange-500' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">${appName}</h1>
          <p className="text-gray-600 mt-2">Tableau de bord analytique en temps réel</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className={\`w-12 h-12 \${metric.color} rounded-lg flex items-center justify-center\`}>
                  <div className="w-6 h-6 bg-white rounded opacity-80"></div>
                </div>
              </div>
              <div className="mt-4">
                <span className={\`text-sm font-medium \${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}\`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Activité Récente</h3>
            <div className="space-y-4">
              {['Nouvelle commande #1234', 'Utilisateur inscrit', 'Paiement reçu €230', 'Support ticket résolu'].map((activity, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">{activity}</span>
                  <span className="text-xs text-gray-500 ml-auto">il y a {i + 1}h</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Fonctionnalités</h3>
            <div className="grid grid-cols-2 gap-3">
              ${features.map(feature => `
                <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                  <div className="text-sm font-medium text-blue-900">${feature}</div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`;
};

const generateEcommerceFallback = (appName: string, features: string[]) => {
  return `const GeneratedApp = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'MacBook Air M2', price: 1299, image: '💻', rating: 4.8, category: 'Électronique' },
    { id: 2, name: 'iPhone 15 Pro', price: 1199, image: '📱', rating: 4.9, category: 'Téléphones' },
    { id: 3, name: 'AirPods Pro', price: 279, image: '🎧', rating: 4.7, category: 'Audio' },
    { id: 4, name: 'iPad Pro', price: 899, image: '📱', rating: 4.6, category: 'Tablettes' }
  ]);
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">${appName}</h1>
          <div className="flex items-center space-x-4">
            <input placeholder="Rechercher..." className="px-4 py-2 rounded-lg text-black" />
            <div className="relative">
              <span className="text-lg">🛒</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-2 py-1">{cart.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Produits Populaires</h2>
          <div className="flex space-x-4 mb-6">
            {['Tous', 'Électronique', 'Téléphones', 'Audio'].map(cat => (
              <button key={cat} className="px-4 py-2 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div className="text-6xl text-center mb-4">{product.image}</div>
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <div className="flex items-center mb-2">
                <span className="text-yellow-400">{'⭐'.repeat(Math.floor(product.rating))}</span>
                <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-3">€{product.price}</p>
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter au panier
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Fonctionnalités</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            ${features.map(feature => `
              <div className="text-center p-3 bg-white rounded-lg">
                <span className="text-sm font-medium">${feature}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  );
};`;
};

const generateSocialFallback = (appName: string, features: string[]) => {
  return `const GeneratedApp = () => {
  const [posts, setPosts] = useState([
    { id: 1, user: 'Alice Martin', avatar: '👩‍💼', content: 'Superbe journée pour coder ! 💻', likes: 24, time: '2h' },
    { id: 2, user: 'Bob Chen', avatar: '👨‍💻', content: 'Nouveau projet React lancé aujourd\\'hui 🚀', likes: 15, time: '4h' },
    { id: 3, user: 'Claire Dubois', avatar: '👩‍🎨', content: 'Design thinking workshop était fantastique ✨', likes: 31, time: '6h' }
  ]);
  const [newPost, setNewPost] = useState('');

  const addPost = () => {
    if (newPost.trim()) {
      setPosts([{
        id: Date.now(),
        user: 'Vous',
        avatar: '😊',
        content: newPost,
        likes: 0,
        time: 'maintenant'
      }, ...posts]);
      setNewPost('');
    }
  };

  const likePost = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">${appName}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-2xl">🔔</span>
            <span className="text-2xl">💬</span>
            <span className="text-2xl">😊</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">😊</span>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Que se passe-t-il ?"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex space-x-4 text-2xl">
                  <span>📸</span>
                  <span>🎥</span>
                  <span>📊</span>
                </div>
                <button
                  onClick={addPost}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors font-semibold"
                >
                  Publier
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{post.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold">{post.user}</span>
                    <span className="text-gray-500 text-sm">• {post.time}</span>
                  </div>
                  <p className="text-gray-800 mb-3">{post.content}</p>
                  <div className="flex items-center space-x-6 text-gray-500">
                    <button 
                      onClick={() => likePost(post.id)}
                      className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                    >
                      <span>❤️</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                      <span>💬</span>
                      <span>Commenter</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                      <span>↗️</span>
                      <span>Partager</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold mb-3">Fonctionnalités Sociales</h3>
          <div className="grid grid-cols-2 gap-2">
            ${features.map(feature => `
              <div className="p-2 bg-blue-50 rounded-lg text-center text-sm font-medium text-blue-800">
                ${feature}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  );
};`;
};

const generateProductivityFallback = (appName: string, features: string[]) => {
  return `const GeneratedApp = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Réunion équipe projet', completed: false, priority: 'high', due: '2024-01-15' },
    { id: 2, title: 'Révision code frontend', completed: true, priority: 'medium', due: '2024-01-14' },
    { id: 3, title: 'Documentation API', completed: false, priority: 'low', due: '2024-01-16' }
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        title: newTask,
        completed: false,
        priority: 'medium',
        due: new Date().toISOString().split('T')[0]
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">${appName}</h1>
          <p className="text-gray-600 mt-2">Gestionnaire de productivité intelligent</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Mes Tâches</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {tasks.filter(t => t.completed).length}/{tasks.length} terminées
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Ajouter une nouvelle tâche..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTask}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className={\`\${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}\`}>
                        {task.title}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={\`text-xs px-2 py-1 rounded-full border \${getPriorityColor(task.priority)}\`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">📅 {task.due}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tâches complétées</span>
                  <span className="font-bold text-green-600">{tasks.filter(t => t.completed).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">En cours</span>
                  <span className="font-bold text-blue-600">{tasks.filter(t => !t.completed).length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: \`\${(tasks.filter(t => t.completed).length / tasks.length) * 100}%\` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Fonctionnalités</h3>
              <div className="space-y-2">
                ${features.map(feature => `
                  <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                    ✓ ${feature}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`;
};

const generateFinanceFallback = (appName: string, features: string[]) => {
  return `const GeneratedApp = () => {
  const [balance, setBalance] = useState(15420.50);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'credit', amount: 2500, description: 'Salaire', date: '2024-01-15', category: 'Revenus' },
    { id: 2, type: 'debit', amount: -45.30, description: 'Supermarché', date: '2024-01-14', category: 'Alimentation' },
    { id: 3, type: 'debit', amount: -120, description: 'Facture électricité', date: '2024-01-13', category: 'Factures' }
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">${appName}</h1>
          <p className="text-gray-300 mt-2">Gestion financière personnelle</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Solde Total</h3>
            <p className="text-3xl font-bold">€{balance.toFixed(2)}</p>
            <p className="text-green-200 text-sm mt-2">+2.5% ce mois</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Revenus</h3>
            <p className="text-2xl font-bold">€2,500.00</p>
            <p className="text-blue-200 text-sm mt-2">Ce mois</p>
          </div>
          
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Dépenses</h3>
            <p className="text-2xl font-bold">€1,245.80</p>
            <p className="text-red-200 text-sm mt-2">Ce mois</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Transactions Récentes</h3>
            <div className="space-y-3">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                      transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                    }\`}>
                      <span className="text-white font-bold">
                        {transaction.type === 'credit' ? '+' : '-'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-400">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <span className={\`font-bold \${
                    transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }\`}>
                    €{Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Répartition des Dépenses</h3>
            <div className="space-y-4">
              {[
                { category: 'Alimentation', amount: 450, percentage: 36, color: 'bg-blue-500' },
                { category: 'Transport', amount: 280, percentage: 22, color: 'bg-green-500' },
                { category: 'Factures', amount: 320, percentage: 26, color: 'bg-yellow-500' },
                { category: 'Loisirs', amount: 195, percentage: 16, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-gray-400">€{item.amount}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={\`\${item.color} h-2 rounded-full transition-all duration-300\`}
                      style={{ width: \`\${item.percentage}%\` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Outils Financiers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${features.map(feature => `
              <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-center">
                <span className="text-sm font-medium">${feature}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  );
};`;
};

const generateCustomFallback = (appName: string, features: string[], intent: any) => {
  return `const GeneratedApp = () => {
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      setData([...data, { 
        id: Date.now(), 
        content: inputValue, 
        timestamp: new Date().toLocaleString(),
        status: 'active'
      }]);
      setInputValue('');
    }
  };

  const handleRemove = (id) => {
    setData(data.filter(item => item.id !== id));
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Saisissez votre contenu ici..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleAdd}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg"
            >
              Ajouter
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Éléments Ajoutés</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun élément ajouté</p>
                ) : (
                  data.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{item.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
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
                  <span className="font-bold text-2xl text-purple-600">{data.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">Activité</span>
                  <span className="font-bold text-green-600">{data.length > 0 ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: Math.min(100, data.length * 10) + '%' }}
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
            <h3 className="text-xl font-semibold mb-4">Liste des éléments</h3>
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
            <h3 className="text-xl font-semibold mb-4">Statistiques</h3>
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
            <h3 className="text-xl font-semibold mb-4">Actions</h3>
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
