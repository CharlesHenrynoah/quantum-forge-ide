
import { Agent, AgentIntent } from '@/types/Agent';

export class AgentFactory {
  static createAgent(rawIntent: AgentIntent, originalPrompt: string): Agent {
    return {
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rawIntent,
      originalPrompt,
      uiParams: {
        theme: 'dark',
        layout: rawIntent.estimated_complexity > 7 ? 'complex' : 'simple',
        components: rawIntent.components || []
      },
      context: {
        businessLogic: '',
        simulatedBackend: '',
        generatedUI: ''
      },
      timestamp: new Date().toISOString()
    };
  }

  static updateAgentContext(agent: Agent, context: Partial<Agent['context']>): Agent {
    return {
      ...agent,
      context: {
        ...agent.context,
        ...context
      }
    };
  }
}
