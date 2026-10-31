import { expect, test } from 'vitest';
import { filterProjects } from '../../src/scripts/projects';

const items = [{ tags: ['drupal'] }, { tags: ['backend', 'ai'] }, { tags: ['vibe-coded', 'ai'] }];

test('filterProjects', () => {
  expect(filterProjects(items, 'all')).toHaveLength(3);
  expect(filterProjects(items, 'ai')).toHaveLength(2);
  expect(filterProjects(items, 'drupal')).toHaveLength(1);
  expect(filterProjects(items, 'vibe-coded')).toEqual([items[2]]);
});
