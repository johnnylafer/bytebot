import { BytebotAgentModel } from 'src/agent/agent.types';

export const OPENAI_MODELS: BytebotAgentModel[] = [
  {
    provider: 'openai',
    name: 'gpt-5.2',
    title: 'GPT-5.2',
    contextWindow: 200000,
  },
  {
    provider: 'openai',
    name: 'gpt-5.2-pro',
    title: 'GPT-5.2 Pro',
    contextWindow: 200000,
  },
  {
    provider: 'openai',
    name: 'gpt-5',
    title: 'GPT-5',
    contextWindow: 200000,
  },
  {
    provider: 'openai',
    name: 'gpt-5-mini',
    title: 'GPT-5 mini',
    contextWindow: 200000,
  },
  {
    provider: 'openai',
    name: 'gpt-5-nano',
    title: 'GPT-5 nano',
    contextWindow: 128000,
  },
  {
    provider: 'openai',
    name: 'o3',
    title: 'o3 (Reasoning)',
    contextWindow: 200000,
  },
  {
    provider: 'openai',
    name: 'o4-mini',
    title: 'o4-mini (Fast Reasoning)',
    contextWindow: 200000,
  },
  {
    provider: 'openai',
    name: 'o3-mini',
    title: 'o3-mini (Small Reasoning)',
    contextWindow: 200000,
  },
  {
    provider: 'openai',
    name: 'gpt-4.1',
    title: 'GPT-4.1',
    contextWindow: 1047576,
  },
];

export const DEFAULT_MODEL = OPENAI_MODELS[0];
