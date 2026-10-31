// Guards production builds (spec §2, §9, §12):
// - verify: true AI tools would render, so they block;
// - missing résumé PDFs or an unset Formspree id would ship broken CTAs, so they block;
// - drafts never render in production (Projects filters them), so they are info only.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AiTool } from '../src/content/schemas';

export function findUnconfirmed(input: { aiTools: AiTool[]; projects: { id: string; draft: boolean }[] }) {
  return {
    blocking: input.aiTools.filter((t) => t.verify).map((t) => `ai-tools: "${t.name}" is unverified`),
    info: input.projects.filter((p) => p.draft).map((p) => `projects: "${p.id}" is a draft (hidden in production)`),
  };
}

export function findDeployGaps(input: { resumes: string[]; exists: (publicPath: string) => boolean; formspreeId: string }): string[] {
  const gaps = [...new Set(input.resumes)].filter((r) => !input.exists(r)).map((r) => `resumes: ${r} is missing from public/`);
  if (!input.formspreeId.trim()) gaps.push('contact: PUBLIC_FORMSPREE_ID is not set');
  return gaps;
}

function readProjects(dir: string) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ id: f.replace(/\.md$/, ''), draft: /^draft:\s*true\s*$/m.test(readFileSync(join(dir, f), 'utf8')) }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { aiTools } = await import('../src/content/data/ai-tools');
  const { roles } = await import('../src/content/data/roles');
  const root = fileURLToPath(new URL('..', import.meta.url));
  const unconfirmed = findUnconfirmed({ aiTools, projects: readProjects(join(root, 'src/content/projects')) });
  const gaps = findDeployGaps({
    resumes: roles.flatMap((r) => r.resumes.map((x) => x.href)),
    exists: (p) => existsSync(join(root, 'public', p)),
    formspreeId: process.env.PUBLIC_FORMSPREE_ID ?? '',
  });
  const blocking = [...unconfirmed.blocking, ...gaps];
  unconfirmed.info.forEach((l) => console.log(`info  ${l}`));
  blocking.forEach((l) => console.warn(`block ${l}`));
  if (blocking.length && process.env.NODE_ENV === 'production') {
    console.error(`\n${blocking.length} item(s) must be fixed before a production deploy.`);
    process.exit(1);
  }
}
