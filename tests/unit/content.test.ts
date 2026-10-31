import { describe, expect, test } from 'vitest';
import {
  ProfileSchema, RoleSchema, SkillSchema, AiToolSchema, ExperienceSchema, ServiceSchema, AwardSchema,
} from '../../src/content/schemas';
import { profile } from '../../src/content/data/profile';
import { roles } from '../../src/content/data/roles';
import { skills } from '../../src/content/data/skills';
import { aiTools } from '../../src/content/data/ai-tools';
import { experience } from '../../src/content/data/experience';
import { services } from '../../src/content/data/services';
import { awards } from '../../src/content/data/awards';
import { learning } from '../../src/content/data/learning';
import { moreWork } from '../../src/content/data/more-work';

describe('content data', () => {
  test('every data file parses', () => {
    expect(() => ProfileSchema.parse(profile)).not.toThrow();
    roles.forEach((r) => expect(() => RoleSchema.parse(r)).not.toThrow());
    skills.forEach((s) => expect(() => SkillSchema.parse(s)).not.toThrow());
    aiTools.forEach((t) => expect(() => AiToolSchema.parse(t)).not.toThrow());
    experience.forEach((e) => expect(() => ExperienceSchema.parse(e)).not.toThrow());
    services.forEach((s) => expect(() => ServiceSchema.parse(s)).not.toThrow());
    awards.forEach((a) => expect(() => AwardSchema.parse(a)).not.toThrow());
    expect(learning.length).toBeGreaterThan(0);
    expect(moreWork.length).toBeGreaterThan(0);
  });

  test('roles cover exactly the five keys', () =>
    expect(roles.map((r) => r.key).sort()).toEqual(['ai', 'all', 'backend', 'drupal', 'php']));

  test('each role skillOrder is a permutation of all skill keys', () =>
    roles.forEach((r) => expect([...r.skillOrder].sort()).toEqual(skills.map((s) => s.key).sort())));

  test('phone hidden by default', () => expect(profile.showPhone).toBe(false));

  test('the all role offers all three résumés', () =>
    expect(roles.find((r) => r.key === 'all')!.resumes).toHaveLength(3));

  test('drupal role points at the Drupal résumé', () =>
    expect(roles.find((r) => r.key === 'drupal')!.resumes[0].href).toBe('/resumes/Subodh_Kant_Drupal_developer.pdf'));
});
