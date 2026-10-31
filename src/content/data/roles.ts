import type { Role } from '../schemas';

const PHP = { href: '/resumes/Subodh_Kant_PHP_Developer.pdf', label: 'PHP Developer résumé' };
const DRUPAL = { href: '/resumes/Subodh_Kant_Drupal_developer.pdf', label: 'Drupal Developer résumé' };
const BACKEND = { href: '/resumes/Subodh_Kant_FullStack_Developer.pdf', label: 'Full-Stack Backend résumé' };

export const roles: Role[] = [
  {
    key: 'all', label: 'All', title: 'Backend & Drupal Engineer · AI-assisted builder', resumes: [DRUPAL, PHP, BACKEND],
    skillOrder: ['drupal', 'php', 'python', 'api', 'redis', 'postgres', 'mysql', 'search', 'docker', 'aws', 'js', 'ai'],
  },
  {
    key: 'drupal', label: 'Drupal', title: 'Drupal Developer · D7 → D11', resumes: [DRUPAL],
    skillOrder: ['drupal', 'search', 'php', 'mysql', 'api', 'redis', 'js', 'docker', 'python', 'postgres', 'aws', 'ai'],
  },
  {
    key: 'php', label: 'PHP', title: 'PHP Developer', resumes: [PHP],
    skillOrder: ['php', 'drupal', 'mysql', 'api', 'redis', 'js', 'search', 'docker', 'python', 'postgres', 'aws', 'ai'],
  },
  {
    key: 'backend', label: 'Backend', title: 'Full-Stack Backend Developer · Python / FastAPI', resumes: [BACKEND],
    skillOrder: ['python', 'api', 'redis', 'postgres', 'docker', 'aws', 'php', 'mysql', 'drupal', 'search', 'js', 'ai'],
  },
  {
    key: 'ai', label: 'AI Builder', title: 'AI-assisted Builder · Backend & Drupal', resumes: [BACKEND],
    skillOrder: ['ai', 'python', 'api', 'drupal', 'php', 'redis', 'postgres', 'docker', 'aws', 'mysql', 'search', 'js'],
  },
];
