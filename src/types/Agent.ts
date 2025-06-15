
export interface AgentIntent {
  name: string;
  entities: string[];
  features: string[];
  ui_spec: string;
  performance_budget: string;
  security_level: 'enterprise' | 'standard' | 'basic';
  estimated_complexity: number;
  components: string[];
  tech_stack: string[];
}

export interface Agent {
  id: string;
  rawIntent: AgentIntent;
  originalPrompt: string;
  uiParams: {
    theme: 'dark' | 'light';
    layout: 'simple' | 'complex';
    components: string[];
  };
  context: {
    businessLogic: string;
    simulatedBackend: string;
    generatedUI: string;
  };
  timestamp: string;
}

export interface GenerationPhase {
  phase: 'idle' | 'analyzing' | 'connecting_gemini' | 'generating_code' | 'rendering' | 'complete' | 'error';
  message: string;
}
