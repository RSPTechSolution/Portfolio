import type { MoreWork } from '../schemas';

export const moreWork: MoreWork[] = [
  { title: 'Drupal 7 → 9/10 migrations', summary: 'Led legacy upgrades: module ports, content models, config management.', tag: 'Drupal', roles: ['drupal'] },
  { title: 'Headless Drupal APIs', summary: 'JSON:API backends feeding decoupled front-ends and microservices.', tag: 'API', roles: ['drupal', 'backend', 'php'] },
  { title: 'Payment, CRM & AI integrations', summary: 'Third-party services wired into Drupal and FastAPI applications.', tag: 'Integrations', roles: ['php', 'backend', 'ai'] },
  { title: 'Drupal Commerce', summary: 'Commerce features on enterprise CMS solutions.', tag: 'Drupal', roles: ['drupal', 'php'] },
];
