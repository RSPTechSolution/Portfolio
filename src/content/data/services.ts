import type { Service } from '../schemas';

export const services: Service[] = [
  {
    key: 'drupal', title: 'Drupal platforms', summary: 'Enterprise sites on Drupal 10 and 11.',
    details: 'Custom modules, Views, Webforms, Layout Builder, Search API and Twig theming.', roles: ['drupal', 'php'],
  },
  {
    key: 'api', title: 'APIs & microservices', summary: 'FastAPI and REST/JSON:API backends.',
    details: 'Event-driven Redis queues, plus payment, CRM and AI integrations.', roles: ['backend', 'php', 'ai'],
  },
  {
    key: 'migrate', title: 'Upgrades & migrations', summary: 'Drupal 7 to 10 and 11.',
    details: 'Ported modules, mapped content models, config management and clean cut-overs.', roles: ['drupal'],
  },
  {
    key: 'perf', title: 'Performance rescue', summary: 'Make slow sites fast again.',
    details: 'Redis and the Drupal Cache API, MySQL/PostgreSQL query tuning and Solr/OpenSearch.', roles: ['backend', 'drupal', 'php'],
  },
];

export const howIWork = ['Discover', 'Build', 'Ship', 'Support'] as const;
