import type { Skill } from '../schemas';

export const skills: Skill[] = [
  { key: 'drupal', name: 'Drupal 7–11', group: 'Drupal', level: 95, spec: 'Custom modules · Views · Webform · Layout Builder · Entity, Plugin, Queue & Cache API · Twig', roles: ['drupal', 'php'] },
  { key: 'search', name: 'Search API · Solr / OpenSearch', group: 'Drupal', level: 80, spec: 'Enterprise search relevance and performance', roles: ['drupal'] },
  { key: 'php', name: 'PHP (OOP)', group: 'Languages', level: 92, spec: 'Services, event subscribers, Composer, Drush', roles: ['php', 'drupal'] },
  { key: 'python', name: 'Python', group: 'Languages', level: 82, spec: 'FastAPI · Django · NumPy · Pandas', roles: ['backend', 'ai'] },
  { key: 'js', name: 'JavaScript · React', group: 'Languages', level: 62, spec: 'jQuery, AJAX, Node.js, working React', roles: ['php'] },
  { key: 'api', name: 'REST · JSON:API · Microservices', group: 'Backend', level: 88, spec: 'API design, headless Drupal, payment, CRM and AI integrations', roles: ['backend', 'drupal', 'php', 'ai'] },
  { key: 'redis', name: 'Redis', group: 'Data', level: 85, spec: 'Caching · queues · real-time processing', roles: ['backend'] },
  { key: 'postgres', name: 'PostgreSQL', group: 'Data', level: 78, spec: 'Event storage and analytics schemas', roles: ['backend'] },
  { key: 'mysql', name: 'MySQL', group: 'Data', level: 86, spec: 'Schema design and query optimisation', roles: ['php', 'drupal'] },
  { key: 'docker', name: 'Docker · CI/CD', group: 'DevOps', level: 76, spec: 'Local environments · Bitbucket Pipelines', roles: ['backend'] },
  { key: 'aws', name: 'AWS', group: 'DevOps', level: 68, spec: 'Deploying and running backend services', roles: ['backend'] },
  { key: 'ai', name: 'AI-assisted development', group: 'Tools', level: 80, spec: 'AI coding tools with review, tests and ownership of every line', roles: ['ai'] },
];
