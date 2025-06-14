
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
Generate ONLY executable React TypeScript code for this app specification:

App Name: ${intent.name}
Features: ${intent.features?.join(', ')}
Components needed: ${intent.components?.join(', ')}
UI Spec: ${intent.ui_spec}

IMPORTANT RULES:
1. Return ONLY valid TypeScript React code, NO explanations or markdown
2. Component must be named "GeneratedApp" 
3. Must export as default
4. Use Tailwind CSS classes for styling
5. Include all necessary imports (React, useState, etc.)
6. Create a complete, functional component

Example format:
import React, { useState } from 'react';

const GeneratedApp = () => {
  // Component logic here
  return (
    <div>
      // JSX content
    </div>
  );
};

export default GeneratedApp;
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
