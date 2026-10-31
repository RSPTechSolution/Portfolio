import type { AiTool } from '../schemas';

// verify: true until Subodh confirms each tool and its description (spec §2).
export const aiTools: AiTool[] = [
  { name: 'Claude Code', use: 'Agentic coding in the terminal: planning, refactors and tests', verify: true },
  { name: 'Cursor', use: 'AI-first editor for day-to-day coding and quick edits', verify: true },
  { name: 'ChatGPT', use: 'Research, debugging conversations and drafting docs', verify: true },
  { name: 'GitHub Copilot', use: 'Inline completions while writing PHP and Python', verify: true },
];
