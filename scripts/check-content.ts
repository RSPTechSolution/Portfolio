// Guards production builds against unconfirmed content (spec §2, §9).
// verify: true AI tools would render, so they block; drafts never render in
// production (Projects filters them), so they are reported as info only.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AiTool } from '../src/content/schemas';

export function findUnconfirmed(input: { aiTools: AiTool[]; projects: { id: string; draft: boolean }[] }) {
  return {
    blocking: input.aiTools.filter((t) => t.verify).map((t) => `ai-tools: "${t.name}" is unverified`),
    info: input.projects.filter((p) => p.draft).map((p) => `projects: "${p.id}" is a draft (hidden in production)`),
  };
}

function readProjects(dir: string) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ id: f.replace(/\.md$/, ''), draft: /^draft:\s*true\s*$/m.test(readFileSync(join(dir, f), 'utf8')) }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { aiTools } = await import('../src/content/data/ai-tools');
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { blocking, info } = findUnconfirmed({ aiTools, projects: readProjects(join(root, 'src/content/projects')) });
  info.forEach((l) => console.log(`info  ${l}`));
  blocking.forEach((l) => console.warn(`block ${l}`));
  if (blocking.length && process.env.NODE_ENV === 'production') {
    console.error(`\n${blocking.length} unconfirmed item(s) would ship. Confirm them in src/content/data/ai-tools.ts.`);
    process.exit(1);
  }
}
