import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { RoleKeySchema } from './content/schemas';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.enum(['drupal', 'backend', 'ai', 'vibe-coded'])),
    vibeCoded: z.boolean(),
    links: z.object({ live: z.string().url().optional(), github: z.string().url().optional() }),
    roles: z.array(RoleKeySchema),
    draft: z.boolean(),
    order: z.number(),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    roles: z.array(RoleKeySchema),
    order: z.number(),
  }),
});

export const collections = { projects, caseStudies };
