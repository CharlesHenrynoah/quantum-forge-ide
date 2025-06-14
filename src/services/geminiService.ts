
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

Return a JSON object with this exact structure:
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
Generate a complete React TypeScript component for this app specification:

App Name: ${intent.name}
Features: ${intent.features?.join(', ')}
Components needed: ${intent.components?.join(', ')}
UI Spec: ${intent.ui_spec}

Create a single React component that includes:
1. Modern Tailwind CSS styling with dark theme
2. Responsive design
3. Interactive elements
4. Mock data where needed
5. TypeScript interfaces

Return only the complete component code, no explanations.
Component should be named "GeneratedApp" and export as default.
`;

  try {
    const response = await generateWithGemini(prompt);
    return response;
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
${currentCode.substring(0, 2000)}...

Evolution request: ${evolutionPrompt}

Generate an improved version of this React component that:
1. Keeps existing functionality
2. Adds the requested improvements
3. Maintains TypeScript and Tailwind styling
4. Improves performance and UX

Return only the complete updated component code.
`;

  try {
    const response = await generateWithGemini(prompt);
    return response;
  } catch (error) {
    console.error('App evolution error:', error);
    return currentCode; // Return original if evolution fails
  }
};
