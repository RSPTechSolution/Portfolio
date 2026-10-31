import { z } from 'zod';

export const ROLE_KEYS = ['all', 'drupal', 'php', 'backend', 'ai'] as const;
export const RoleKeySchema = z.enum(ROLE_KEYS);
export type RoleKey = z.infer<typeof RoleKeySchema>;

export const SKILL_KEYS = ['drupal', 'search', 'php', 'python', 'js', 'api', 'redis', 'postgres', 'mysql', 'docker', 'aws', 'ai'] as const;
export const SkillKeySchema = z.enum(SKILL_KEYS);
export type SkillKey = z.infer<typeof SkillKeySchema>;

export const ProfileSchema = z.object({
  name: z.string(),
  location: z.string(),
  email: z.string().email(),
  linkedin: z.string().url(),
  phone: z.string(),
  showPhone: z.boolean(),
  years: z.number().int().positive(),
  languages: z.array(z.string()).min(1),
  availability: z.string(),
  pitch: z.string(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ResumeSchema = z.object({ href: z.string().startsWith('/resumes/'), label: z.string() });

export const RoleSchema = z.object({
  key: RoleKeySchema,
  label: z.string(),
  title: z.string(),
  resumes: z.array(ResumeSchema).min(1),
  skillOrder: z.array(SkillKeySchema),
});
export type Role = z.infer<typeof RoleSchema>;

export const SkillSchema = z.object({
  key: SkillKeySchema,
  name: z.string(),
  group: z.enum(['Drupal', 'Languages', 'Backend', 'Data', 'DevOps', 'Tools']),
  level: z.number().min(0).max(100),
  spec: z.string(),
  roles: z.array(RoleKeySchema),
});
export type Skill = z.infer<typeof SkillSchema>;

export const AiToolSchema = z.object({ name: z.string(), use: z.string(), verify: z.boolean() });
export type AiTool = z.infer<typeof AiToolSchema>;

export const ExperienceSchema = z.object({
  org: z.string(),
  title: z.union([z.string(), z.record(RoleKeySchema, z.string())]),
  start: z.string(),
  end: z.string().nullable(),
  points: z.array(z.string()),
});
export type Experience = z.infer<typeof ExperienceSchema>;

export const ServiceSchema = z.object({
  key: z.string(),
  title: z.string(),
  summary: z.string(),
  details: z.string(),
  roles: z.array(RoleKeySchema),
});
export type Service = z.infer<typeof ServiceSchema>;

export const AwardSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.number().int().optional(),
  kind: z.enum(['award', 'cert']),
  note: z.string(),
});
export type Award = z.infer<typeof AwardSchema>;

export const MoreWorkSchema = z.object({ title: z.string(), summary: z.string(), tag: z.string(), roles: z.array(RoleKeySchema) });
export type MoreWork = z.infer<typeof MoreWorkSchema>;
